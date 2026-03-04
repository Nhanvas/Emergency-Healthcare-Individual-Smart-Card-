import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Share, ScrollView
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { auth } from "../../services/firebase";
import { getPatient } from "../../services/patientService";

const BYSTANDER_DOMAIN = "https://emergency-qr-medical.vercel.app";

export default function QRCodeScreen() {
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrValue, setQrValue] = useState("");

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
      message: `Mã QR khẩn cấp của ${patient?.fullName}: ${qrValue}`,
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
        />
      </View>

      {/* Thông tin bên dưới QR */}
      <Text style={styles.patientName}>{patient.fullName}</Text>
      <View style={styles.bloodBadge}>
        <Text style={styles.bloodText}>{patient.bloodType}</Text>
      </View>

      {/* Nút chia sẻ */}
      <TouchableOpacity style={styles.btnShare} onPress={handleShare}>
        <Text style={styles.btnShareText}>📤 Chia sẻ mã QR</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        ℹ️ Mã QR này dẫn đến trang web khẩn cấp.{"\n"}
        Thông tin y tế chỉ được chia sẻ với tình nguyện viên được xác nhận.
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
    padding: 24, backgroundColor: "#fff",
    borderRadius: 16, elevation: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, marginBottom: 24
  },
  patientName: { fontSize: 20, fontWeight: "bold", color: "#212121", marginBottom: 12 },
  bloodBadge: {
    backgroundColor: "#D32F2F", paddingHorizontal: 24,
    paddingVertical: 8, borderRadius: 20, marginBottom: 32
  },
  bloodText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  btnShare: {
    backgroundColor: "#D32F2F", height: 56, borderRadius: 8,
    justifyContent: "center", alignItems: "center",
    width: "100%", marginBottom: 24
  },
  btnShareText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#212121", marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: "#757575" },
  note: {
    fontSize: 12, color: "#757575", textAlign: "center",
    lineHeight: 18, backgroundColor: "#F5F5F5",
    padding: 16, borderRadius: 8
  },
});