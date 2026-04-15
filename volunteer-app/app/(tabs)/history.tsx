import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { getVolunteerHistory, IncidentData } from '../../services/incidentService';
import { getCurrentUser } from '../../services/authService';

const PRIMARY = '#D4494F';

function formatDate(ts: any): string {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; text: string; label: string }> = {
    completed: { bg: '#E8F5E9', text: '#2E7D32', label: '✓ Hoàn thành' },
    accepted:  { bg: '#E3F2FD', text: '#1565C0', label: '● Đang xử lý' },
    expired:   { bg: '#F5F5F5', text: '#757575', label: '✕ Hết hạn' },
    pending:   { bg: '#FFF8E1', text: '#F57F17', label: '⏳ Chờ xử lý' },
  };
  const c = cfg[status] || cfg.expired;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

export default function HistoryScreen() {
  const user = getCurrentUser();
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getVolunteerHistory(user.uid);
      setIncidents(data);
    } catch (err) { console.error(err); }
  }, [user]);

  useEffect(() => {
    loadHistory().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch sử sự cố</Text>
        <Text style={styles.headerSub}>{incidents.length} sự cố</Text>
      </View>

      <FlatList
        data={incidents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await loadHistory();
              setRefreshing(false);
            }}
            colors={[PRIMARY]}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Chưa có sự cố nào</Text>
            <Text style={styles.emptySub}>Lịch sử các sự cố bạn đã tiếp nhận sẽ hiển thị ở đây.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.cardLocation}>
              📍 {item.reporterLocation?.lat?.toFixed(4)}, {item.reporterLocation?.lng?.toFixed(4)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    backgroundColor: PRIMARY, borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#F5F5F5', borderRadius: 14,
    padding: 16, borderLeftWidth: 4, borderLeftColor: PRIMARY,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardDate: { fontSize: 14, fontWeight: '600', color: '#212121' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  cardLocation: { fontSize: 13, color: '#757575' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#212121', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#757575', textAlign: 'center', paddingHorizontal: 40 },
});