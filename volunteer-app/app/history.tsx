import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUser } from '../services/authService';
import { getVolunteerHistory, IncidentData } from '../services/incidentService';

// ─── Helpers ──────────────────────────────────────────────────
function formatDate(ts: any): string {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const yyyy = date.getFullYear();
  const mm   = String(date.getMonth() + 1).padStart(2, '0');
  const dd   = String(date.getDate()).padStart(2, '0');
  const hh   = String(date.getHours()).padStart(2, '0');
  const min  = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function formatLocation(loc: { lat: number; lng: number } | undefined): string {
  if (!loc) return 'Không rõ vị trí';
  return `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
}

function StatusBadge({ status }: { status: string }) {
  const isCompleted = status === 'completed';
  return (
    <View style={[styles.badge, isCompleted ? styles.badgeCompleted : styles.badgeDeclined]}>
      <Ionicons
        name={isCompleted ? 'checkmark-circle-outline' : 'close-circle-outline'}
        size={16}
        color={isCompleted ? '#4CAF50' : '#9E9E9E'}
      />
      <Text style={[styles.badgeText, isCompleted ? styles.badgeTextCompleted : styles.badgeTextDeclined]}>
        {isCompleted ? 'Hoàn thành' : 'Từ chối'}
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────
export default function HistoryScreen() {
  const router    = useRouter();
  const user      = getCurrentUser();
  const [incidents,  setIncidents]  = useState<IncidentData[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');

  // ── Load dữ liệu ─────────────────────────────────────────────
  const loadHistory = useCallback(async (showLoadingSpinner = true) => {
    if (!user) {
      setErrorMsg('Không xác định được tài khoản. Vui lòng đăng xuất và đăng nhập lại.');
      setLoading(false);
      return;
    }
    if (showLoadingSpinner) setLoading(true);
    setErrorMsg('');
    try {
      const data = await getVolunteerHistory(user.uid);
      setIncidents(data);
    } catch (err: any) {
      console.error('History load error:', err);
      // Hiện lỗi rõ ràng thay vì để list trống không giải thích
      const msg: string = err?.message ?? '';
      if (msg.includes('index') || msg.includes('Index')) {
        // Lỗi thiếu Firestore composite index
        setErrorMsg(
          'Cần tạo index trong Firebase Console.\n' +
          'Xem console log để lấy link tạo index tự động.'
        );
      } else {
        setErrorMsg('Không tải được lịch sử. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── FIX: dùng useFocusEffect thay vì useEffect([]) ───────────
  // useFocusEffect chạy lại mỗi khi màn hình này được focus
  // → đảm bảo incident vừa complete sẽ hiện ngay khi vào History
  useFocusEffect(
    useCallback(() => {
      void loadHistory(true);
    }, [loadHistory])
  );

  // ── Pull-to-refresh ───────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory(false);
    setRefreshing(false);
  };

  // ── Render mỗi incident card ──────────────────────────────────
  const renderItem = ({ item }: { item: IncidentData }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        <StatusBadge status={item.status} />
      </View>
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={18} color="#E53935" />
        <Text style={styles.locationText}>
          {formatLocation(item.reporterLocation)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử sự cố</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* LOADING */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E53935" />
        </View>

      /* LỖI */
      ) : errorMsg ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#E53935" />
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => void loadHistory(true)}
          >
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>

      /* EMPTY */
      ) : incidents.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="time-outline" size={48} color="#BDBDBD" />
          <Text style={styles.emptyText}>Chưa có lịch sử sự cố</Text>
        </View>

      /* LIST */
      ) : (
        <FlatList
          data={incidents}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#E53935']}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#E53935',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn:     { padding: 4 },
  headerTitle: { flex: 1, color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText:   { fontSize: 15, color: '#9E9E9E', marginTop: 12, textAlign: 'center' },
  errorText:   { fontSize: 14, color: '#E53935', marginTop: 12, textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    marginTop: 16,
    height: 44,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 14,
    marginBottom: 10,
  },
  cardRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText:    { fontSize: 13, color: '#757575' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  locationText:{ fontSize: 13, color: '#212121' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeCompleted:     { borderColor: '#4CAF50' },
  badgeDeclined:      { borderColor: '#9E9E9E' },
  badgeText:          { fontSize: 12, fontWeight: '600' },
  badgeTextCompleted: { color: '#4CAF50' },
  badgeTextDeclined:  { color: '#9E9E9E' },
});
