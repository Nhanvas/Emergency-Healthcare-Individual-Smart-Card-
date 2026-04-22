import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Linking, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { COLORS } from '../constants';

const PRIMARY = '#D4494F';

function calcAge(dob: string): number {
  const b = new Date(dob);
  const t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--;
  return age;
}

function formatDate(ts: any): string {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function HistoryDetailScreen() {
  const { incidentId } = useLocalSearchParams<{ incidentId: string }>();
  const router = useRouter();
  const [incident, setIncident] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!incidentId) return;
      try {
        // Load incident
        const incSnap = await getDoc(doc(db, 'incidents', incidentId));
        if (!incSnap.exists()) return;
        const incData = { id: incSnap.id, ...incSnap.data() };
        setIncident(incData);

        // Load patient
        if ((incData as any).patientData) {
          setPatient((incData as any).patientData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
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
        <Text style={styles.errorText}>Không tìm thấy sự cố</Text>
      </View>
    );
  }

  const renderEmergencyContact = () => {
    if (!patient?.emergencyContact) return null;
    const ec = patient.emergencyContact;
    if (typeof ec === 'string') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liên hệ khẩn cấp</Text>
          <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${ec}`)}>
            <Text style={styles.callBtnText}>📞 {ec}</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (ec.phone) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liên hệ khẩn cấp</Text>
          <View style={styles.contactRow}>
            <View>
              <Text style={styles.contactName}>{ec.name || 'Liên hệ'}</Text>
              {ec.relationship ? <Text style={styles.contactRel}>{ec.relationship}</Text> : null}
            </View>
            <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${ec.phone}`)}>
              <Text style={styles.callBtnText}>📞 {ec.phone}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.headerCard}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết sự cố</Text>
        <Text style={styles.headerDate}>{formatDate(incident.createdAt)}</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusText}>
            {incident.status === 'completed' ? '✓ Hoàn thành' :
             incident.status === 'accepted' ? '● Đang xử lý' :
             incident.status === 'expired' ? '✕ Hết hạn' : incident.status}
          </Text>
        </View>
      </View>

      {/* Incident info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin sự cố</Text>
        <InfoRow label="Vị trí" value={`${incident.reporterLocation?.lat?.toFixed(5)}, ${incident.reporterLocation?.lng?.toFixed(5)}`} />
        <InfoRow label="Thời gian tạo" value={formatDate(incident.createdAt)} />
        {incident.acceptedAt && <InfoRow label="Thời gian accept" value={formatDate(incident.acceptedAt)} />}
        {incident.bystanderPhone && (
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${incident.bystanderPhone}`)}>
            <InfoRow label="SĐT người báo" value={incident.bystanderPhone} highlight />
          </TouchableOpacity>
        )}
        {incident.bystanderNote && <InfoRow label="Mô tả" value={incident.bystanderNote} />}
      </View>

      {/* Patient info */}
      {patient ? (
        <>
          <View style={styles.bloodCard}>
            <Text style={styles.bloodLabel}>NHÓM MÁU</Text>
            <Text style={styles.bloodValue}>{patient.bloodType || '?'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bệnh nhân</Text>
            <InfoRow label="Họ tên" value={patient.fullName} />
            {patient.dateOfBirth && (
              <InfoRow label="Tuổi" value={`${calcAge(patient.dateOfBirth)} tuổi`} />
            )}
            {patient.gender && <InfoRow label="Giới tính" value={patient.gender} />}
            {patient.phoneNumber ? (
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${patient.phoneNumber}`)}>
                <InfoRow label="Điện thoại" value={patient.phoneNumber} highlight />
              </TouchableOpacity>
            ) : null}
          </View>

          {patient.allergies?.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: PRIMARY }]}>⚠️ Dị ứng</Text>
              <View style={styles.chips}>
                {patient.allergies.map((a: string, i: number) => (
                  <View key={i} style={styles.allergyChip}>
                    <Text style={styles.allergyChipText}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {patient.conditions?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bệnh nền</Text>
              <View style={styles.chips}>
                {patient.conditions.map((c: string, i: number) => (
                  <View key={i} style={styles.conditionChip}>
                    <Text style={styles.conditionChipText}>{c}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {renderEmergencyContact()}
        </>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bệnh nhân</Text>
          <Text style={{ color: COLORS.gray600, fontSize: 14 }}>Không có thông tin</Text>
        </View>
      )}

    </ScrollView>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && { color: '#1565C0', textDecorationLine: 'underline' }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 15, color: PRIMARY },
  headerCard: {
    backgroundColor: PRIMARY, padding: 20,
    paddingTop: 52, borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    marginBottom: 16,
  },
  backBtn: { marginBottom: 12 },
  backText: { color: 'rgba(255,255,255,0.8)', fontSize: 15 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  headerDate: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 8 },
  statusRow: { alignSelf: 'flex-start' },
  statusText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  section: { marginHorizontal: 20, marginBottom: 16, backgroundColor: '#F5F5F5', borderRadius: 14, padding: 16 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: '#757575',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
  },
  infoLabel: { fontSize: 14, color: '#757575' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#212121', maxWidth: '60%', textAlign: 'right' },
  bloodCard: {
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: '#FFEBEE', borderWidth: 2, borderColor: PRIMARY,
    borderRadius: 16, padding: 20, alignItems: 'center',
  },
  bloodLabel: { fontSize: 12, fontWeight: '700', color: PRIMARY, letterSpacing: 2, marginBottom: 4 },
  bloodValue: { fontSize: 48, fontWeight: '900', color: PRIMARY, lineHeight: 56 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  allergyChip: {
    backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: PRIMARY,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  allergyChipText: { color: PRIMARY, fontWeight: '700', fontSize: 13 },
  conditionChip: {
    backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: '#1565C0',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  conditionChipText: { color: '#1565C0', fontWeight: '600', fontSize: 13 },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contactName: { fontSize: 15, fontWeight: '600', color: '#212121' },
  contactRel: { fontSize: 12, color: '#757575', marginTop: 2 },
  callBtn: { backgroundColor: '#D4494F', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  callBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});