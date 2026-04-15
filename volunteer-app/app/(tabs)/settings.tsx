import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getCurrentUser, signOutVolunteer } from '../../services/authService';
import { setOffline } from '../../services/volunteerService';

export default function SettingsScreen() {
  const router = useRouter();
  const user = getCurrentUser();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              if (user) await setOffline(user.uid);
              await signOutVolunteer();
              router.replace('/login');
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể đăng xuất.');
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cài đặt</Text>
      </View>

      {/* ── CONTENT ── */}
      <View style={styles.content}>
        {/* Về dự án */}
        <Text style={styles.sectionTitle}>Về dự án</Text>
        <Text style={styles.sectionBody}>
          Dự án được phát triển bởi nhóm sinh viên Kỹ thuật Y sinh, Trường Đại
          học Quốc tế, ĐHQG TP.HCM. Hệ thống hỗ trợ cấp cứu khẩn cấp, kết nối
          nhanh chóng giữa người qua đường, bệnh nhân và tình nguyện viên thông
          qua QR/NFC, giúp rút ngắn thời gian phản ứng trong tình huống nguy cấp.
        </Text>

        {/* Lịch sử sự cố */}
        <TouchableOpacity
          style={styles.btnHistory}
          onPress={() => router.push('/history')}
          activeOpacity={0.7}
        >
          <Text style={styles.btnHistoryText}>Lịch sử sự cố</Text>
        </TouchableOpacity>
      </View>

      {/* ── BOTTOM: Đăng xuất ── */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.btnLogout, loggingOut && styles.btnDisabled]}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.85}
        >
          {loggingOut
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.btnLogoutText}>Đăng xuất</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'space-between',
  },
  header: {
    backgroundColor: '#E53935',
    paddingVertical: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 22,
    textAlign: 'justify',
  },
  btnHistory: {
    marginTop: 32,
    height: 52,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#212121',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnHistoryText: {
    color: '#212121',
    fontSize: 16,
    fontWeight: '600',
  },
  bottom: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
  },
  btnLogout: {
    height: 52,
    borderRadius: 8,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnLogoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});