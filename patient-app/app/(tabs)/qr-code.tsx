import { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Share, ScrollView, Alert,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import { auth } from "../../services/firebase";
import { getPatient } from "../../services/patientService";
import { BYSTANDER_DOMAIN } from "../../constants/config";

export default function QRCodeScreen() {
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrValue, setQrValue] = useState("");
  const [saving, setSaving] = useState(false);

  // Ref để lấy SVG data từ QRCode component
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
    try {
      // Xin quyền truy cập thư viện ảnh
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Cần quyền truy cập",
          "Vui lòng cho phép truy cập thư viện ảnh trong Cài đặt."
        );
        setSaving(false);
        return;
      }

      // Lấy base64 PNG từ QRCode component rồi lưu vào gallery
      qrRef.current.toDataURL(async (dataURL: string) => {
        try {
          // dataURL là base64 string — lưu trực tiếp vào MediaLibrary
          const filename = `QR_${auth.currentUser?.uid}_${Date.now()}.png`;
          const fileUri = `${require("expo-file-system") ? "" : ""}`;

          // Dùng expo-file-system để ghi file tạm rồi lưu vào gallery
          const FileSystem = require("expo-file-system");
          const tempUri = FileSystem.cacheDirectory + filename;

          await FileSystem.writeAsStringAsync(tempUri, dataURL, {
            encoding: FileSystem.EncodingType.Base64,
          });

          const asset = await MediaLibrary.createAssetAsync(tempUri);
          await MediaLibrary.createAlbumAsync("Emergency QR", asset, false);

          Alert.alert("Đã lưu!", "Mã QR đã được lưu vào thư viện ảnh.");
        } catch (e) {
          console.error(e);
          Alert.alert("Lỗi", "Không thể lưu ảnh. Thử lại nhé.");
        } finally {
          setSaving(false);
        }
      });
    } catch (e) {
      console.error(e);
      Alert.alert("Lỗi", "Không thể lưu ảnh.");
      setSaving(false);
    }
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
        <Text style={styles.emptyText}>Chưa có thông tin y tế</Text>
        <Text style={styles.emptySubtext}>Vui lòng điền hồ sơ trước</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mã QR khẩn cấp</Text>
      <Text style={styles.subtitle}>
        Cho người xung quanh quét mã này khi có tình huống khẩn cấp
      </Text>

      {/* QR Code */}
      <View style={styles.qrContainer}>
        <QRCode
          value={qrValue}
          size={280}
          color="#212121"
          backgroundColor="#ffffff"
          getRef={(ref) => (qrRef.current = ref)}
        />
      </View>

      {/* Thông tin bên dưới QR */}
      <Text style={styles.patientName}>{patient.fullName}</Text>
      <View style={styles.bloodBadge}>
        <Text style={styles.bloodText}>{patient.bloodType}</Text>
      </View>

      {/* Nút Download QR — lưu vào gallery */}
      <TouchableOpacity
        style={[styles.btnDownload, saving && styles.btnDisabled]}
        onPress={handleDownload}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.btnDownloadText}>Lưu QR vào thư viện</Text>
        )}
      </TouchableOpacity>

      {/* Nút ghi NFC */}
      <TouchableOpacity
        style={styles.btnNfc}
        onPress={() => router.push("/nfc-write" as any)}
      >
        <Text style={styles.btnNfcText}>Ghi thẻ NFC</Text>
      </TouchableOpacity>

      {/* Nút chia sẻ */}
      <TouchableOpacity style={styles.btnShare} onPress={handleShare}>
        <Text style={styles.btnShareText}>Chia sẻ mã QR</Text>
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