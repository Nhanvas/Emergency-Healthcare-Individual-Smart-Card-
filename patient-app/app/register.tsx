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
import { FirebaseError } from "firebase/app";
import { register } from "../services/authService";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [firebaseError, setFirebaseError] = useState("");

  const handleRegister = async () => {
    setEmailError("");
    setPasswordError("");
    setConfirmError("");
    setFirebaseError("");

    const trimmed = email.trim();
    let valid = true;
    if (!trimmed) {
      setEmailError("Vui lòng nhập email");
      valid = false;
    }
    if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      valid = false;
    }
    if (password !== confirm) {
      setConfirmError("Mật khẩu xác nhận không khớp");
      valid = false;
    }
    if (!valid) return;

    try {
      setLoading(true);
      await register(trimmed, password);
      router.replace("/patient-form");
    } catch (e) {
      if (
        e instanceof FirebaseError &&
        e.code === "auth/email-already-in-use"
      ) {
        setEmailError("Email này đã được đăng ký");
      } else {
        setFirebaseError("Đăng ký thất bại, thử lại nhé");
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
        <View style={styles.headerRow}>
          <Pressable
            style={styles.backPressable}
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
          >
            <Ionicons name="arrow-back" size={24} color="#212121" />
          </Pressable>
          <Text style={styles.headerTitle}>Tạo tài khoản</Text>
        </View>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputShell}>
          <TextInput
            style={styles.inputField}
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setEmailError("");
              setFirebaseError("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            underlineColorAndroid="transparent"
          />
        </View>
        {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

        <Text style={[styles.label, styles.labelSpaced]}>Mật khẩu</Text>
        <View style={[styles.inputShell, styles.passwordShell]}>
          <TextInput
            style={[styles.inputField, styles.inputFieldWithIcon]}
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setPasswordError("");
              setFirebaseError("");
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
              color="#1892BE"
            />
          </Pressable>
        </View>
        {passwordError ? (
          <Text style={styles.fieldError}>{passwordError}</Text>
        ) : null}

        <Text style={[styles.label, styles.labelSpaced]}>
          Xác nhận mật khẩu
        </Text>
        <View style={[styles.inputShell, styles.passwordShell]}>
          <TextInput
            style={[styles.inputField, styles.inputFieldWithIcon]}
            value={confirm}
            onChangeText={(t) => {
              setConfirm(t);
              setConfirmError("");
              setFirebaseError("");
            }}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            underlineColorAndroid="transparent"
          />
          <Pressable
            style={styles.eyePressable}
            onPress={() => setShowConfirmPassword((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={
              showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
            }
          >
            <Ionicons
              name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
              size={22}
              color="#1892BE"
            />
          </Pressable>
        </View>
        {confirmError ? (
          <Text style={styles.fieldError}>{confirmError}</Text>
        ) : null}

        {firebaseError ? (
          <Text style={styles.fieldError}>{firebaseError}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.btnPrimary, loading && styles.btnPrimaryDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnPrimaryText}>Đăng ký</Text>
          )}
        </TouchableOpacity>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 32,
    position: "relative",
    minHeight: 40,
  },
  backPressable: {
    position: "absolute",
    left: 0,
    zIndex: 1,
    paddingVertical: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#212121",
    fontSize: 20,
    fontWeight: "bold",
  },
  label: {
    color: "#1892BE",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  labelSpaced: {
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
  fieldError: {
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
});
