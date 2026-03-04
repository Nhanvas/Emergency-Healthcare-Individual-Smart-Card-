import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.icon}>🚨</Text>
        <Text style={styles.title}>Emergency QR</Text>
        <Text style={styles.subtitle}>
          Lưu thông tin y tế của bạn.{"\n"}
          Sẵn sàng cho mọi tình huống khẩn cấp.
        </Text>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.btnPrimaryText}>Tạo hồ sơ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.btnSecondaryText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 24 },
  top: { flex: 1, justifyContent: "center", alignItems: "center" },
  icon: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: "bold", color: "#D32F2F", marginBottom: 12 },
  subtitle: { fontSize: 16, color: "#757575", textAlign: "center", lineHeight: 24 },
  bottom: { paddingBottom: 48, gap: 12 },
  btnPrimary: {
    backgroundColor: "#D32F2F",
    height: 56,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  btnPrimaryText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  btnSecondary: {
    height: 56,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#D32F2F",
    justifyContent: "center",
    alignItems: "center",
  },
  btnSecondaryText: { color: "#D32F2F", fontSize: 16, fontWeight: "bold" },
});