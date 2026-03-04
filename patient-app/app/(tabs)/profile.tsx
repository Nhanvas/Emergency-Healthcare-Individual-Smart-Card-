import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert
} from "react-native";
import { router } from "expo-router";
import { getPatient } from "../../services/patientService";
import { logout } from "../../services/authService";

export default function Profile() {
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPatient();
        setPatient(data);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Đăng xuất", style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/");
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D32F2F" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Hồ sơ của tôi</Text>

      {patient ? (
        <>
          {/* Thẻ thông tin chính */}
          <View style={styles.card}>
            <Text style={styles.name}>{patient.fullName}</Text>
            <View style={styles.bloodBadge}>
              <Text style={styles.bloodText}>{patient.bloodType}</Text>
            </View>
          </View>

          {/* Chi tiết */}
          <View style={styles.section}>
            <Row label="Ngày sinh" value={patient.dateOfBirth} />
            <Row label="Giới tính" value={patient.gender} />
            <Row label="Số điện thoại" value={patient.phoneNumber} />
            <Row label="Liên hệ khẩn cấp" value={patient.emergencyContact} />
          </View>

          {/* Dị ứng */}
          {patient.allergies?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚠️ Dị ứng</Text>
              <View style={styles.chipContainer}>
                {patient.allergies.map((a: string, i: number) => (
                  <View key={i} style={styles.chip}>
                    <Text style={styles.chipText}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Bệnh lý */}
          {patient.conditions?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏥 Bệnh lý nền</Text>
              <View style={styles.chipContainer}>
                {patient.conditions.map((c: string, i: number) => (
                  <View key={i} style={[styles.chip, styles.chipGray]}>
                    <Text style={styles.chipTextGray}>{c}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Chưa có thông tin y tế</Text>
        </View>
      )}

      {/* Buttons */}
      <TouchableOpacity
        style={styles.btnEdit}
        onPress={() => router.push("/patient-form")}
      >
        <Text style={styles.btnEditText}>✏️ Chỉnh sửa thông tin</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnQR}
        onPress={() => router.push("/(tabs)/qr-code")}
      >
        <Text style={styles.btnQRText}>📱 Xem mã QR</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
        <Text style={styles.btnLogoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Component hàng thông tin
function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 48 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "#D32F2F", marginBottom: 24 },
  card: {
    backgroundColor: "#FFEBEE", borderRadius: 12, padding: 20,
    alignItems: "center", marginBottom: 16
  },
  name: { fontSize: 22, fontWeight: "bold", color: "#212121", marginBottom: 12 },
  bloodBadge: {
    backgroundColor: "#D32F2F", width: 64, height: 64,
    borderRadius: 32, justifyContent: "center", alignItems: "center"
  },
  bloodText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  section: {
    backgroundColor: "#F5F5F5", borderRadius: 12,
    padding: 16, marginBottom: 12
  },
  sectionTitle: { fontSize: 14, fontWeight: "bold", color: "#212121", marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  rowLabel: { fontSize: 13, color: "#757575" },
  rowValue: { fontSize: 13, color: "#212121", fontWeight: "500", maxWidth: "60%" },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: "#FFEBEE", paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 20
  },
  chipText: { color: "#D32F2F", fontSize: 13, fontWeight: "500" },
  chipGray: { backgroundColor: "#E0E0E0" },
  chipTextGray: { color: "#424242", fontSize: 13 },
  empty: { alignItems: "center", paddingVertical: 32 },
  emptyText: { color: "#757575", fontSize: 14 },
  btnEdit: {
    borderWidth: 2, borderColor: "#D32F2F", height: 56, borderRadius: 8,
    justifyContent: "center", alignItems: "center", marginTop: 16
  },
  btnEditText: { color: "#D32F2F", fontSize: 15, fontWeight: "bold" },
  btnQR: {
    backgroundColor: "#D32F2F", height: 56, borderRadius: 8,
    justifyContent: "center", alignItems: "center", marginTop: 12
  },
  btnQRText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  btnLogout: {
    height: 56, borderRadius: 8, justifyContent: "center",
    alignItems: "center", marginTop: 12
  },
  btnLogoutText: { color: "#757575", fontSize: 15 },
});