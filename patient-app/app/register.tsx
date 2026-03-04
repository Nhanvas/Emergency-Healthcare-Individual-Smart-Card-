import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from "react-native";
import { router } from "expo-router";
import { register } from "../services/authService";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    if (!email || !password || !confirm) {
      setError("Vui lòng điền đầy đủ thông tin"); return;
    }
    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp"); return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự"); return;
    }
    try {
      setLoading(true);
      await register(email, password);
      router.replace("/patient-form");
    } catch (e: any) {
      if (e.code === "auth/email-already-in-use") {
        setError("Email này đã được đăng ký");
      } else {
        setError("Đăng ký thất bại, thử lại nhé");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Tạo hồ sơ</Text>
      <Text style={styles.subtitle}>Đăng ký để lưu thông tin y tế</Text>

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
        placeholder="Ít nhất 6 ký tự"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>Xác nhận mật khẩu</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập lại mật khẩu"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={styles.btnPrimary}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Đăng ký</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
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