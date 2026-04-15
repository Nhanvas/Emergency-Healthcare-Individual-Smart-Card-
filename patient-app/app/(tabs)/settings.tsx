import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { signOut } from "../../services/authService";

const ABOUT_BODY =
  "Dự án được phát triển bởi nhóm sinh viên Kỹ thuật Y sinh, Trường Đại học Quốc tế, ĐHQG TP.HCM. Hệ thống hỗ trợ cấp cứu khẩn cấp, kết nối nhanh chóng giữa người qua đường, bệnh nhân và tình nguyện viên thông qua QR/NFC, giúp rút ngắn thời gian phản ứng trong tình huống nguy cấp.";

const PRIVACY_BODY =
  "Thông tin y tế của bạn được mã hóa và chỉ chia sẻ với tình nguyện viên được xác nhận khi có sự cố khẩn cấp. Chúng tôi không bán hay chia sẻ dữ liệu của bạn cho bên thứ ba.";

export default function Settings() {
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = async () => {
    try {
      setSigningOut(true);
      await signOut();
      router.replace("/login");
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeRoot} edges={["top"]}>
      <View style={styles.flexCol}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cài đặt</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Về dự án</Text>
            <Text style={styles.sectionBody}>{ABOUT_BODY}</Text>
          </View>

          <View style={styles.sectionSpaced}>
            <Text style={styles.sectionTitle}>Quyền riêng tư</Text>
            <Text style={styles.sectionBody}>{PRIVACY_BODY}</Text>
          </View>
        </ScrollView>

        <View style={styles.logoutWrap}>
          <TouchableOpacity
            style={[styles.btnLogout, signingOut && styles.btnLogoutDisabled]}
            onPress={handleLogout}
            disabled={signingOut}
            activeOpacity={0.85}
          >
            {signingOut ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.btnLogoutText}>Đăng xuất</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeRoot: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  flexCol: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    backgroundColor: "#1892BE",
    paddingVertical: 16,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  section: {},
  sectionSpaced: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    color: "#424242",
    lineHeight: 22,
    textAlign: "justify",
  },
  logoutWrap: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  btnLogout: {
    backgroundColor: "#D32F2F",
    height: 52,
    borderRadius: 8,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  btnLogoutDisabled: {
    opacity: 0.75,
  },
  btnLogoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
