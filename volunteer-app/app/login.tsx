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
import { signInVolunteer } from "../services/authService";

const ACCENT = "#E53935";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");

  const validate = () => {
    setEmailError("");
    setPasswordError("");
    let ok = true;
    if (!email.trim()) {
      setEmailError("Vui lòng nhập email");
      ok = false;
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setEmailError("Email không hợp lệ");
      ok = false;
    }
    if (!password) {
      setPasswordError("Vui lòng nhập mật khẩu");
      ok = false;
    }
    return ok;
  };

  const handleLogin = async () => {
    setLoginError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await signInVolunteer(email.trim(), password);
      router.replace("/(tabs)/home");
    } catch (err: unknown) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code?: string }).code)
          : "";
      if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        setLoginError("Email hoặc mật khẩu không đúng");
      } else {
        setLoginError("Đăng nhập thất bại, thử lại nhé");
      }
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
        <Text style={styles.orgTitle}>Hội thập chữ thập đỏ</Text>
        <Text style={styles.subtitle}>Tình nguyện viên</Text>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputShell}>
          <TextInput
            style={styles.inputField}
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setEmailError("");
              setLoginError("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            underlineColorAndroid="transparent"
          />
        </View>
        {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

        <Text style={[styles.label, styles.labelPassword]}>Mật khẩu</Text>
        <View style={[styles.inputShell, styles.passwordShell]}>
          <TextInput
            style={[styles.inputField, styles.inputFieldWithIcon]}
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setPasswordError("");
              setLoginError("");
            }}
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
              color={ACCENT}
            />
          </Pressable>
        </View>
        {passwordError ? (
          <Text style={styles.fieldError}>{passwordError}</Text>
        ) : null}
        {loginError ? <Text style={styles.fieldError}>{loginError}</Text> : null}

        <TouchableOpacity
          style={[styles.btnPrimary, loading && styles.btnPrimaryDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.btnPrimaryText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          Không có tài khoản? Liên hệ quản trị viên
        </Text>
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
    paddingBottom: 32,
  },
  orgTitle: {
    color: ACCENT,
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 60,
    letterSpacing: 1,
  },
  subtitle: {
    color: "#212121",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  label: {
    color: ACCENT,
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
    borderColor: ACCENT,
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
  fieldError: {
    color: "red",
    fontSize: 13,
    marginTop: 8,
  },
  btnPrimary: {
    backgroundColor: ACCENT,
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
  note: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 14,
    color: "#9E9E9E",
  },
});
