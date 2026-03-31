import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Switch,
  ScrollView, FlatList, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { logout } from '../../services/authService';
import { getVolunteerHistory, IncidentData } from '../../services/incidentService';
import { getCurrentUser } from '../../services/authService';
import { setOffline } from '../../services/volunteerService';
import { useIncident } from '../../context/IncidentContext';
import { COLORS } from '../../constants';

function formatDate(ts: any): string {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    completed: { bg: COLORS.primaryLight, text: COLORS.primary, label: 'Hoàn thành' },
    accepted:  { bg: '#E3F2FD', text: '#1565C0', label: 'Đang xử lý' },
    expired:   { bg: COLORS.gray100, text: COLORS.gray600, label: 'Hết hạn' },
    pending:   { bg: '#FFF8E1', text: '#F57F17', label: 'Chờ xử lý' },
  };
  const c = config[status] || config.expired;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const user = getCurrentUser();
  const { setActiveIncidentId } = useIncident();

  const [isVietnamese, setIsVietnamese] = useState(true);
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getVolunteerHistory(user.uid);
      setIncidents(data);
    } catch (err) {
      console.error('History load error:', err);
    }
  }, [user]);

  useEffect(() => {
    loadHistory().finally(() => setLoadingHistory(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleLanguageToggle = async (value: boolean) => {
    setIsVietnamese(value);
    await AsyncStorage.setItem('language', value ? 'vi' : 'en');
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất không?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            if (user) await setOffline(user.uid);
            setActiveIncidentId(null);
            await logout();
            router.replace('/login' as any);
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
      }
    >
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
            trackColor={{ false: '#E0E0E0', true: '#C8E6C9' }}
            thumbColor={isVietnamese ? COLORS.primary : '#9E9E9E'}
          />
        </View>
      </View>

      {/* Lịch sử sự cố */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setShowHistory(!showHistory)}
        >
          <Text style={styles.sectionTitle}>LỊCH SỬ SỰ CỐ</Text>
          <Text style={styles.sectionCount}>
            {incidents.length} sự cố  {showHistory ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {showHistory && (
          loadingHistory ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 16 }} />
          ) : incidents.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyText}>Chưa có sự cố nào</Text>
            </View>
          ) : (
            incidents.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
                  <StatusBadge status={item.status} />
                </View>
                <Text style={styles.cardLocation}>
                  {item.reporterLocation?.lat?.toFixed(4) ?? '—'},  {item.reporterLocation?.lng?.toFixed(4) ?? '—'}
                </Text>
              </View>
            ))
          )
        )}
      </View>

      {/* Thông tin dự án */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>VỀ DỰ ÁN</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Hệ thống Cấp cứu Khẩn cấp</Text>
          <Text style={styles.infoText}>Capstone Design — Kỹ thuật Y sinh</Text>
          <Text style={styles.infoText}>Đại học Quốc tế (IU), TP. Hồ Chí Minh</Text>
          <View style={styles.divider} />
          <Text style={styles.infoLabel}>Nhóm thực hiện</Text>
          <Text style={styles.infoText}>Member 1 — UX/UI & Frontend</Text>
          <Text style={styles.infoText}>Member 2 — Backend & Firebase</Text>
          <Text style={styles.infoText}>Member 3 — Báo cáo & Kiến trúc</Text>
          <Text style={styles.infoText}>Member 4 — Tài liệu & Kiểm thử</Text>
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
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: 20, paddingBottom: 48 },
  pageTitle: {
    fontSize: 26, fontWeight: '700', color: COLORS.primary,
    marginBottom: 24, marginTop: 48,
  },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: '#9E9E9E', letterSpacing: 1.5,
  },
  sectionCount: { fontSize: 13, color: COLORS.gray600, fontWeight: '600' },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.gray100, borderRadius: 12, padding: 16,
  },
  rowLabel: { fontSize: 16, fontWeight: '600', color: COLORS.black900 },
  rowSub: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  card: {
    backgroundColor: COLORS.gray100, borderRadius: 12, padding: 14,
    borderLeftWidth: 4, borderLeftColor: COLORS.primary, marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  cardDate: { fontSize: 13, fontWeight: '600', color: COLORS.black900 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  cardLocation: { fontSize: 12, color: COLORS.gray600 },
  emptyHistory: { padding: 16, alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.gray600 },
  infoCard: { backgroundColor: COLORS.gray100, borderRadius: 12, padding: 16, gap: 4 },
  infoTitle: { fontSize: 15, fontWeight: '700', color: COLORS.black900, marginBottom: 4 },
  infoLabel: { fontSize: 13, fontWeight: '700', color: COLORS.gray600, marginTop: 8 },
  infoText: { fontSize: 14, color: '#424242', lineHeight: 20 },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 8 },
  logoutBtn: {
    height: 56, borderRadius: 12, borderWidth: 2, borderColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  logoutText: { color: COLORS.primary, fontSize: 16, fontWeight: '700' },
});