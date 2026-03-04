import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from "react-native";
import { router } from "expo-router";
import { login } from "../services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Vui lòng điền đầy đủ thông tin"); return;
    }
    try {
      setLoading(true);
      await login(email, password);
      router.replace("/(tabs)/profile");
    } catch (e: any) {
      setError("Email hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Đăng nhập</Text>
      <Text style={styles.subtitle}>Chào mừng bạn trở lại</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="example@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Mật khẩu</Text>
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu của bạn"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={styles.btnPrimary}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Đăng nhập</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={styles.link}>Chưa có tài khoản? Tạo hồ sơ</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: "bold", color: "#D32F2F", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#757575", marginBottom: 32 },
  label: { fontSize: 14, fontWeight: "600", color: "#212121", marginBottom: 6 },
  input: {
    height: 48, borderWidth: 1, borderColor: "#E0E0E0",
    borderRadius: 8, paddingHorizontal: 12, marginBottom: 16,
    fontSize: 14, backgroundColor: "#F5F5F5"
  },
  error: { color: "#D32F2F", fontSize: 13, marginBottom: 12 },
  btnPrimary: {
    backgroundColor: "#D32F2F", height: 56, borderRadius: 8,
    justifyContent: "center", alignItems: "center", marginTop: 8, marginBottom: 16
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  link: { color: "#D32F2F", textAlign: "center", fontSize: 14 },
});