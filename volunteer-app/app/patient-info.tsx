import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Linking, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const PRIMARY = '#D4494F';

interface PatientData {
  name: string;
  dob: string;
  phone?: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  emergencyContact?: { name: string; phone: string };
}

function calcAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function PatientInfoScreen() {
  const { patientData: raw, incidentId } = useLocalSearchParams<{
    patientData: string; incidentId: string;
  }>();
  const router = useRouter();
  const [patient, setPatient] = useState<PatientData | null>(null);

  useEffect(() => {
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as PatientData;
      if (parsed?.name) setPatient(parsed);
    } catch {
      Alert.alert('Lỗi', 'Không đọc được thông tin bệnh nhân.');
    }
  }, [raw]);

  if (!patient) {
    return (
      <View style={s.center}>
        <Text style={s.loadingText}>Đang tải thông tin bệnh nhân...</Text>
      </View>
    );
  }

  const age = patient.dob ? calcAge(patient.dob) : null;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Nhóm máu — thông tin quan trọng nhất */}
      <View style={s.bloodCard}>
        <Text style={s.bloodLabel}>NHÓM MÁU</Text>
        <Text style={s.bloodValue}>{patient.bloodType || '?'}</Text>
      </View>

      {/* Thông tin cá nhân */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Bệnh nhân</Text>
        <View style={s.divider} />
        <Row label="Họ tên" value={patient.name} />
        {age !== null && <Row label="Tuổi" value={`${age} tuổi`} />}
        {patient.phone && (
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Điện thoại</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${patient.phone}`)}>
              <Text style={[s.infoValue, s.phoneLink]}>{patient.phone}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Dị ứng */}
      {patient.allergies?.length > 0 && (
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: PRIMARY }]}>⚠️ Dị ứng</Text>
          <View style={s.divider} />
          <View style={s.chipRow}>
            {patient.allergies.map((a, i) => (
              <View key={i} style={s.allergyChip}>
                <Text style={s.allergyChipText}>{a}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Bệnh nền */}
      {patient.conditions?.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Bệnh lý nền</Text>
          <View style={s.divider} />
          <View style={s.chipRow}>
            {patient.conditions.map((c, i) => (
              <View key={i} style={s.conditionChip}>
                <Text style={s.conditionChipText}>{c}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Thuốc đang dùng */}
      {patient.medications?.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Thuốc đang dùng</Text>
          <View style={s.divider} />
          <View style={s.chipRow}>
            {patient.medications.map((m, i) => (
              <View key={i} style={s.medChip}>
                <Text style={s.medChipText}>{m}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Liên hệ khẩn cấp */}
      {patient.emergencyContact?.phone && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Liên hệ khẩn cấp</Text>
          <View style={s.divider} />
          <View style={s.contactRow}>
            <Text style={s.contactName}>{patient.emergencyContact.name || 'Liên hệ'}</Text>
            <TouchableOpacity
              style={s.callBtn}
              onPress={() => Linking.openURL(`tel:${patient.emergencyContact!.phone}`)}
            >
              <Text style={s.callBtnText}>📞 {patient.emergencyContact.phone}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Nút mở bản đồ */}
      <TouchableOpacity
        style={s.mapBtn}
        onPress={() => router.push({ pathname: '/(tabs)/map', params: { incidentId } })}
      >
        <Text style={s.mapBtnText}>🗺️ Mở bản đồ điều hướng</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 15, color: PRIMARY },
  bloodCard: {
    backgroundColor: '#FFEBEE', borderWidth: 2, borderColor: PRIMARY,
    borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20,
  },
  bloodLabel: { fontSize: 12, fontWeight: '700', color: PRIMARY, letterSpacing: 2, marginBottom: 4 },
  bloodValue: { fontSize: 52, fontWeight: '900', color: PRIMARY },
  section: {
    backgroundColor: '#F5F5F5', borderRadius: 14,
    padding: 16, marginBottom: 16,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#757575', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  infoLabel: { fontSize: 14, color: '#757575' },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#212121' },
  phoneLink: { color: PRIMARY, textDecorationLine: 'underline' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  allergyChip: { backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: PRIMARY, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  allergyChipText: { color: PRIMARY, fontWeight: '700', fontSize: 13 },
  conditionChip: { backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: '#1565C0', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  conditionChipText: { color: '#1565C0', fontWeight: '600', fontSize: 13 },
  medChip: { backgroundColor: '#F3E5F5', borderWidth: 1, borderColor: '#7B1FA2', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  medChipText: { color: '#7B1FA2', fontWeight: '600', fontSize: 13 },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contactName: { fontSize: 15, fontWeight: '600', color: '#212121' },
  callBtn: { backgroundColor: PRIMARY, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  callBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  mapBtn: { height: 56, backgroundColor: PRIMARY, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 8, elevation: 3 },
  mapBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});