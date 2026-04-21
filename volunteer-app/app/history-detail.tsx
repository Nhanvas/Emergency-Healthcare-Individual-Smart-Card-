import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity, Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { IncidentData } from '../services/incidentService';

const PRIMARY = '#D4494F';
const GREEN = '#2E7D32';

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

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ChipList({ label, items, color = PRIMARY }: { label: string; items?: string[]; color?: string }) {
  if (!items || items.length === 0) return null;
  return (
    <View style={styles.chipSection}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.chipRow}>
        {items.map((item, i) => (
          <View key={i} style={[styles.chip, { backgroundColor: color === PRIMARY ? '#FFEBEE' : '#F3E5F5' }]}>
            <Text style={[styles.chipText, { color }]}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function HistoryDetailScreen() {
  const params = useLocalSearchParams<{ incidentId: string | string[] }>();
  const incidentId = Array.isArray(params.incidentId) ? params.incidentId[0] : params.incidentId;
  const router = useRouter();
  const [incident, setIncident] = useState<IncidentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!incidentId) return;
    // Fetch incident document từ Firestore — patientData đã được lưu vào đây lúc accept
    getDoc(doc(db, 'incidents', incidentId))
      .then((snap) => {
        if (snap.exists()) {
          setIncident({ id: snap.id, ...snap.data() } as IncidentData);
        }
      })
      .finally(() => setLoading(false));
  }, [incidentId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (!incident) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#757575' }}>Không tìm thấy sự cố</Text>
      </View>
    );
  }

  const p = incident.patientData;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết sự cố</Text>
        <StatusBadge status={incident.status} />
      </View>

      {/* Thời gian & vị trí */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Thông tin sự cố</Text>
        <InfoRow label="Thời gian" value={formatDate(incident.createdAt)} />
        <InfoRow
          label="Vị trí"
          value={
            incident.reporterLocation
              ? `${incident.reporterLocation.lat.toFixed(5)}, ${incident.reporterLocation.lng.toFixed(5)}`
              : undefined
          }
        />
        <InfoRow label="Tiếp nhận lúc" value={formatDate(incident.acceptedAt)} />
      </View>

      {/* Thông tin bystander */}
      {(incident.bystanderPhone || incident.bystanderNote) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧑‍💼 Thông tin người báo cáo</Text>
          {incident.bystanderPhone ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số điện thoại</Text>
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${incident.bystanderPhone}`)}>
                <Text style={[styles.infoValue, styles.phoneLink]}>{incident.bystanderPhone}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          <InfoRow label="Mô tả tình trạng" value={incident.bystanderNote ?? undefined} />
        </View>
      )}

      {/* Thông tin bệnh nhân */}
      {p ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏥 Thông tin bệnh nhân</Text>

          {/* Nhóm máu — hiển thị nổi bật nhất */}
          <View style={styles.bloodTypeBox}>
            <Text style={styles.bloodTypeLabel}>Nhóm máu</Text>
            <Text style={styles.bloodTypeValue}>{p.bloodType || '—'}</Text>
          </View>

          <InfoRow label="Họ và tên" value={p.fullName} />
          <InfoRow label="Ngày sinh" value={p.dateOfBirth} />
          <InfoRow label="Giới tính" value={p.gender} />
          <InfoRow label="Số điện thoại" value={p.phoneNumber} />

          <ChipList label="Dị ứng" items={p.allergies} color={PRIMARY} />
          <ChipList label="Bệnh nền" items={p.conditions} color="#6A1B9A" />

          {/* Liên hệ khẩn cấp */}
          {p.emergencyContact && (
            <View style={styles.emergencyBox}>
              <Text style={styles.infoLabel}>Liên hệ khẩn cấp</Text>
              {typeof p.emergencyContact === 'object' ? (
                <>
                  <Text style={styles.infoValue}>{(p.emergencyContact as any).name}</Text>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${(p.emergencyContact as any).phone}`)}
                  >
                    <Text style={[styles.infoValue, styles.phoneLink]}>
                      {(p.emergencyContact as any).phone}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.infoValue}>{p.emergencyContact}</Text>
              )}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={{ color: '#757575', fontSize: 14 }}>
            Không có thông tin bệnh nhân (sự cố hết hạn trước khi được tiếp nhận)
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20,
    backgroundColor: PRIMARY, borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    gap: 8,
  },
  backBtn: { marginBottom: 4 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 14 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  section: {
    margin: 16, marginBottom: 0, padding: 16,
    backgroundColor: '#F5F5F5', borderRadius: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#212121', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap' },
  infoLabel: { fontSize: 13, color: '#757575', fontWeight: '500' },
  infoValue: { fontSize: 14, color: '#212121', fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  phoneLink: { color: PRIMARY, textDecorationLine: 'underline' },
  bloodTypeBox: {
    backgroundColor: PRIMARY, borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 16,
  },
  bloodTypeLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  bloodTypeValue: { fontSize: 36, fontWeight: '900', color: '#fff' },
  chipSection: { marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  chipText: { fontSize: 13, fontWeight: '600' },
  emergencyBox: { marginTop: 8, padding: 12, backgroundColor: '#fff', borderRadius: 10 },
});