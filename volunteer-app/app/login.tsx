import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signInVolunteer } from '../services/authService';
import { COLORS } from '../constants';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email format';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signInVolunteer(email.trim(), password);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      const code = err?.code;
      if (
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential'
      ) {
        Alert.alert('Login Failed', 'Incorrect email or password. Please contact your administrator.');
      } else {
        Alert.alert('Error', err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Branding */}
        <View style={styles.brandContainer}>
          <Text style={styles.logo}>🚑</Text>
          <Text style={styles.appName}>Emergency Response</Text>
          <Text style={styles.subtitle}>Volunteer Portal</Text>
          <View style={styles.orgBadge}>
            <Text style={styles.orgText}>Red Cross Vietnam</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Sign In</Text>
          <Text style={styles.formHint}>
            Use the credentials provided by your administrator.
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              value={email}
              onChangeText={setEmail}
              placeholder="volunteer@redcross.vn"
              placeholderTextColor={COLORS.gray600}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={COLORS.gray600}
              secureTextEntry
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.loginBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          Don't have an account? Contact your Red Cross administrator.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.white },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  brandContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 64, marginBottom: 8 },
  appName: { fontSize: 26, fontWeight: '800', color: COLORS.primary, letterSpacing: 0.5 },
  subtitle: { fontSize: 16, color: COLORS.gray600, marginTop: 4 },
  orgBadge: {
    marginTop: 10,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  orgText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  form: {
    backgroundColor: COLORS.gray100,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: { fontSize: 20, fontWeight: '700', color: COLORS.black900, marginBottom: 4 },
  formHint: { fontSize: 13, color: COLORS.gray600, marginBottom: 20 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.black900, marginBottom: 6 },
  input: {
    height: 48,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.black900,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  inputError: { borderColor: COLORS.alert },
  errorText: { fontSize: 12, color: COLORS.alert, marginTop: 4 },
  loginBtn: {
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    elevation: 3,
  },
  loginBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
  footerNote: { textAlign: 'center', fontSize: 12, color: COLORS.gray600, lineHeight: 18 },
});