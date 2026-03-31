import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logout } from "../../services/authService";

export default function SettingsScreen() {
  const [isVietnamese, setIsVietnamese] = useState(true);

  const handleLanguageToggle = async (value: boolean) => {
    setIsVietnamese(value);
    await AsyncStorage.setItem("language", value ? "vi" : "en");
  };

  const handleLogout = async () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc muốn đăng xuất không?",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/login" as any);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Cài đặt</Text>

      {/* Ngôn ngữ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NGÔN NGỮ</Text>
        <View style={styles.row}>
          <View>
            <Text style={styles.rowLabel}>Tiếng Việt</Text>
            <Text style={styles.rowSub}>Mặc định</Text>
          </View>
          <Switch
            value={isVietnamese}
            onValueChange={handleLanguageToggle}
            trackColor={{ false: "#E0E0E0", true: "#FFCDD2" }}
            thumbColor={isVietnamese ? "#D32F2F" : "#9E9E9E"}
          />
        </View>
      </View>

      {/* Thông tin dự án */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>VỀ DỰ ÁN</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Hệ thống Cấp cứu Khẩn cấp</Text>
          <Text style={styles.infoText}>
            Dự án Capstone Design — Kỹ thuật Y sinh
          </Text>
          <Text style={styles.infoText}>
            Đại học Quốc tế (IU), TP. Hồ Chí Minh
          </Text>
          <View style={styles.divider} />
          <Text style={styles.infoLabel}>Nhóm thực hiện</Text>
          <Text style={styles.infoText}>Member 1 — UX/UI & Frontend</Text>
          <Text style={styles.infoText}>Member 2 — Backend & Firebase</Text>
          <Text style={styles.infoText}>Member 3 — Báo cáo & Kiến trúc</Text>
          <Text style={styles.infoText}>Member 4 — Tài liệu & Kiểm thử</Text>
          <View style={styles.divider} />
          <Text style={styles.infoLabel}>Phiên bản</Text>
          <Text style={styles.infoText}>v2.0 — Post-Midterm (Tháng 3/2026)</Text>
        </View>
      </View>

      {/* Chính sách */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>QUYỀN RIÊNG TƯ</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Thông tin y tế của bạn được mã hoá và chỉ chia sẻ với tình nguyện viên
            được xác nhận khi có sự cố khẩn cấp. Chúng tôi không bán hay chia sẻ
            dữ liệu của bạn với bên thứ ba.
          </Text>
        </View>
      </View>

      {/* Đăng xuất */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 24, paddingBottom: 48 },
  pageTitle: {
    fontSize: 28, fontWeight: "bold", color: "#D32F2F",
    marginBottom: 24, marginTop: 16,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 11, fontWeight: "700", color: "#9E9E9E",
    letterSpacing: 1.5, marginBottom: 8,
  },
  row: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#F5F5F5", borderRadius: 12, padding: 16,
  },
  rowLabel: { fontSize: 16, fontWeight: "600", color: "#212121" },
  rowSub: { fontSize: 12, color: "#9E9E9E", marginTop: 2 },
  infoCard: { backgroundColor: "#F5F5F5", borderRadius: 12, padding: 16, gap: 4 },
  infoTitle: { fontSize: 16, fontWeight: "700", color: "#212121", marginBottom: 4 },
  infoLabel: { fontSize: 13, fontWeight: "700", color: "#757575", marginTop: 8 },
  infoText: { fontSize: 14, color: "#424242", lineHeight: 20 },
  divider: { height: 1, backgroundColor: "#E0E0E0", marginVertical: 8 },
  logoutBtn: {
    height: 56, borderRadius: 12, borderWidth: 2, borderColor: "#D32F2F",
    justifyContent: "center", alignItems: "center", marginTop: 8,
  },
  logoutText: { color: "#D32F2F", fontSize: 16, fontWeight: "700" },
});