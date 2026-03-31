import { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Share, ScrollView, Alert,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import { auth } from "../../services/firebase";
import { getPatient } from "../../services/patientService";
import { BYSTANDER_DOMAIN } from "../../constants/config";

export default function QRCodeScreen() {
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrValue, setQrValue] = useState("");
  const [saving, setSaving] = useState(false);
  const qrRef = useRef<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const uid = auth.currentUser?.uid;
        const data = await getPatient();
        if (uid && data) {
          setPatient(data);
          setQrValue(`${BYSTANDER_DOMAIN}/patient/${uid}`);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleShare = async () => {
    await Share.share({
      message: `Ma QR khan cap cua ${patient?.fullName}: ${qrValue}`,
    });
  };

  const handleDownload = async () => {
    if (!qrRef.current) return;
    setSaving(true);

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Can quyen truy cap", "Vui long cho phep truy cap thu vien anh.");
      setSaving(false);
      return;
    }

    // toDataURL là callback — không phải Promise nên không dùng await
    qrRef.current.toDataURL(async (dataURL: string) => {
      try {
        const tempUri = FileSystem.cacheDirectory + `qr_${Date.now()}.png`;

        await FileSystem.writeAsStringAsync(tempUri, dataURL, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const asset = await MediaLibrary.createAssetAsync(tempUri);
        await MediaLibrary.createAlbumAsync("Emergency QR", asset, false);

        Alert.alert("Da luu!", "Ma QR da duoc luu vao thu vien anh.");
      } catch (e) {
        console.error("Download QR error:", e);
        Alert.alert("Loi", "Khong the luu anh. Thu lai nhe.");
      } finally {
        setSaving(false);
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D32F2F" />
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Chua co thong tin y te</Text>
        <Text style={styles.emptySubtext}>Vui long dien ho so truoc</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Ma QR khan cap</Text>
      <Text style={styles.subtitle}>
        Cho nguoi xung quanh quet ma nay khi co tinh huong khan cap
      </Text>

      <View style={styles.qrContainer}>
        <QRCode
          value={qrValue}
          size={280}
          color="#212121"
          backgroundColor="#ffffff"
          getRef={(ref) => (qrRef.current = ref)}
        />
      </View>

      <Text style={styles.patientName}>{patient.fullName}</Text>
      <View style={styles.bloodBadge}>
        <Text style={styles.bloodText}>{patient.bloodType}</Text>
      </View>

      <TouchableOpacity
        style={[styles.btnDownload, saving && styles.btnDisabled]}
        onPress={handleDownload}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.btnDownloadText}>Luu QR vao thu vien</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnNfc}
        onPress={() => router.push("/nfc-write" as any)}
      >
        <Text style={styles.btnNfcText}>Ghi the NFC</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnShare} onPress={handleShare}>
        <Text style={styles.btnShareText}>Chia se ma QR</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Ma QR nay dan den trang web khan cap.{"\n"}
        Thong tin y te chi duoc chia se voi tinh nguyen vien duoc xac nhan.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 48, alignItems: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: { fontSize: 24, fontWeight: "bold", color: "#D32F2F", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#757575", textAlign: "center", marginBottom: 32, lineHeight: 20 },
  qrContainer: {
    padding: 24, backgroundColor: "#fff", borderRadius: 16, elevation: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, marginBottom: 24,
  },
  patientName: { fontSize: 20, fontWeight: "bold", color: "#212121", marginBottom: 12 },
  bloodBadge: {
    backgroundColor: "#D32F2F", paddingHorizontal: 24,
    paddingVertical: 8, borderRadius: 20, marginBottom: 32,
  },
  bloodText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  btnDownload: {
    backgroundColor: "#D32F2F", height: 56, borderRadius: 8,
    justifyContent: "center", alignItems: "center",
    width: "100%", marginBottom: 12,
  },
  btnDownloadText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  btnNfc: {
    height: 56, borderRadius: 8, borderWidth: 2, borderColor: "#D32F2F",
    justifyContent: "center", alignItems: "center",
    width: "100%", marginBottom: 12,
  },
  btnNfcText: { color: "#D32F2F", fontSize: 15, fontWeight: "bold" },
  btnShare: {
    height: 56, borderRadius: 8, backgroundColor: "#F5F5F5",
    justifyContent: "center", alignItems: "center",
    width: "100%", marginBottom: 24,
  },
  btnShareText: { color: "#757575", fontSize: 15, fontWeight: "bold" },
  btnDisabled: { opacity: 0.6 },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#212121", marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: "#757575" },
  note: {
    fontSize: 12, color: "#757575", textAlign: "center",
    lineHeight: 18, backgroundColor: "#F5F5F5", padding: 16, borderRadius: 8,
  },
});