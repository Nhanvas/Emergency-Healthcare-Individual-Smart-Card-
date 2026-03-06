import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { getVolunteerHistory, IncidentData } from '../../services/incidentService';
import { getCurrentUser } from '../../services/authService';
import { COLORS } from '../../constants';

function formatDate(ts: any): string {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    completed: { bg: COLORS.primaryLight, text: COLORS.primary, label: '✓ Completed' },
    accepted:  { bg: '#E3F2FD', text: '#1565C0', label: '● Active' },
    expired:   { bg: COLORS.gray100, text: COLORS.gray600, label: '✕ Expired' },
    pending:   { bg: '#FFF8E1', text: '#F57F17', label: '⏳ Pending' },
  };
  const c = config[status] || config.expired;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

function IncidentCard({ item }: { item: IncidentData }) {
  const lat = item.reporterLocation?.lat?.toFixed(4) ?? '—';
  const lng = item.reporterLocation?.lng?.toFixed(4) ?? '—';
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.cardLocation}>📍 {lat}, {lng}</Text>
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
    } catch (err) {
      console.error('History load error:', err);
    }
  }, [user]);

  useEffect(() => {
    loadHistory().finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Incident History</Text>
        <Text style={styles.headerSubtitle}>{incidents.length} total</Text>
      </View>

      <FlatList
        data={incidents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <IncidentCard item={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No incidents yet</Text>
            <Text style={styles.emptySubtitle}>
              Your accepted incident history will appear here.
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  listContent: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: COLORS.gray100,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardDate: { fontSize: 14, fontWeight: '600', color: COLORS.black900 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  cardLocation: { fontSize: 13, color: COLORS.gray600 },
  separator: { height: 10 },
  emptyContainer: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black900, marginBottom: 8 },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});