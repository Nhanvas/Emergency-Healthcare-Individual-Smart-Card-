import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { login } from "../services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    try {
      setLoading(true);
      await login(email.trim(), password);
      router.replace("/(tabs)/profile");
    } catch {
      setError("Email hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.mainColumn}>
          <Text style={styles.appName}>EHIS CARD</Text>
          <Text style={styles.pageTitle}>Tài khoản bệnh nhân</Text>

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputShell}>
            <TextInput
              style={styles.inputField}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              underlineColorAndroid="transparent"
            />
          </View>

          <Text style={[styles.label, styles.labelPassword]}>Mật khẩu</Text>
          <View style={[styles.inputShell, styles.passwordShell]}>
            <TextInput
              style={[styles.inputField, styles.inputFieldWithIcon]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              underlineColorAndroid="transparent"
            />
            <Pressable
              style={styles.eyePressable}
              onPress={() => setShowPassword((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
              }
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={22}
                color="#1892BE"
              />
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnPrimaryDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.btnPrimaryText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Hoặc</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push("/register")}
            activeOpacity={0.85}
          >
            <Text style={styles.btnSecondaryText}>Tạo tài khoản</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.scrollBottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  mainColumn: {
    width: "100%",
  },
  scrollBottomSpacer: {
    minHeight: 24,
  },
  appName: {
    color: "#1892BE",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 60,
    letterSpacing: 4,
  },
  pageTitle: {
    color: "#212121",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  label: {
    color: "#1892BE",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  labelPassword: {
    marginTop: 20,
  },
  inputShell: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#1892BE",
    borderRadius: 8,
    height: 52,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
  },
  passwordShell: {
    position: "relative",
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: "#212121",
    paddingVertical: 0,
    margin: 0,
  },
  inputFieldWithIcon: {
    paddingRight: 44,
  },
  eyePressable: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  error: {
    color: "red",
    fontSize: 13,
    marginTop: 8,
  },
  btnPrimary: {
    backgroundColor: "#1892BE",
    height: 52,
    borderRadius: 8,
    width: "100%",
    marginTop: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  btnPrimaryDisabled: {
    opacity: 0.7,
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    color: "#757575",
    fontSize: 14,
    marginHorizontal: 12,
  },
  btnSecondary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#1892BE",
    height: 52,
    borderRadius: 8,
    width: "100%",
    marginTop: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  btnSecondaryText: {
    color: "#1892BE",
    fontSize: 16,
    fontWeight: "600",
  },
});
