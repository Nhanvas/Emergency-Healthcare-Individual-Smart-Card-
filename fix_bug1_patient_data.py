import os

print("=" * 55)
print("FIX BUG 1 — Patient Data Flow (home.tsx + patient-info.tsx)")
print("=" * 55)

# ============================================================
# PATCH home.tsx — thêm patientData vào route params
# ============================================================
path = 'volunteer-app/app/(tabs)/home.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_push = '''        router.push({
          pathname: '/patient-info',
          params: { patientId: result.patientId, incidentId: alertData.incidentId },
        });'''

new_push = '''        // Truyền patientData qua params để patient-info.tsx
        // không cần đọc Firestore trực tiếp (Security Rules chặn)
        router.push({
          pathname: '/patient-info',
          params: {
            patientId: result.patientId,
            incidentId: alertData.incidentId,
            patientData: JSON.stringify(result.patientData ?? {}),
          },
        });'''

if old_push in content:
    content = content.replace(old_push, new_push)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ home.tsx: thêm patientData vào route params")
else:
    print(f"⚠️  home.tsx: không tìm thấy đoạn router.push cần sửa — kiểm tra thủ công")

# ============================================================
# VIẾT LẠI patient-info.tsx hoàn toàn
# Lý do: (1) không còn fetch Firestore trực tiếp
#        (2) fix tên field (fullName→name, dateOfBirth→dob, phoneNumber→phone)
#        (3) emergencyContact là object {name, phone} không phải string
# ============================================================
patient_info_content = '''import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../constants';

// Kiểu dữ liệu khớp với Firestore schema thực tế
interface PatientData {
  name: string;
  dob: string;
  phone?: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function PatientInfoScreen() {
  const { patientData: patientDataRaw, incidentId } = useLocalSearchParams<{
    patientData: string;
    incidentId: string;
  }>();
  const router = useRouter();

  const [patient, setPatient] = useState<PatientData | null>(null);

  useEffect(() => {
    // Parse patientData từ route params — không đọc Firestore trực tiếp
    // vì Security Rules chỉ cho patient tự đọc data của mình
    if (!patientDataRaw) return;
    try {
      const parsed = JSON.parse(patientDataRaw) as PatientData;
      if (parsed && parsed.name) {
        setPatient(parsed);
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không đọc được thông tin bệnh nhân.');
    }
  }, [patientDataRaw]);

  if (!patient) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Đang tải thông tin bệnh nhân...</Text>
      </View>
    );
  }

  const age = patient.dob ? calculateAge(patient.dob) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Nhóm máu — thông tin quan trọng nhất */}
      <View style={styles.bloodTypeCard}>
        <Text style={styles.bloodTypeLabel}>NHÓM MÁU</Text>
        <Text style={styles.bloodTypeValue}>{patient.bloodType || '?'}</Text>
      </View>

      {/* Thông tin cá nhân */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bệnh nhân</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Họ tên</Text>
          <Text style={styles.infoValue}>{patient.name}</Text>
        </View>
        {age !== null && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tuổi</Text>
            <Text style={styles.infoValue}>{age} tuổi</Text>
          </View>
        )}
        {patient.phone ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Điện thoại</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${patient.phone}`)}>
              <Text style={[styles.infoValue, styles.phoneLink]}>{patient.phone}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* Dị ứng */}
      {patient.allergies && patient.allergies.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.alert }]}>⚠️ Dị ứng</Text>
          <View style={styles.chipContainer}>
            {patient.allergies.map((item, i) => (
              <View key={i} style={styles.allergyChip}>
                <Text style={styles.allergyChipText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Bệnh nền */}
      {patient.conditions && patient.conditions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bệnh nền</Text>
          <View style={styles.chipContainer}>
            {patient.conditions.map((item, i) => (
              <View key={i} style={styles.conditionChip}>
                <Text style={styles.conditionChipText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Thuốc đang dùng */}
      {patient.medications && patient.medications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thuốc đang dùng</Text>
          <View style={styles.chipContainer}>
            {patient.medications.map((item, i) => (
              <View key={i} style={styles.medChip}>
                <Text style={styles.medChipText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Liên hệ khẩn cấp */}
      {patient.emergencyContact && patient.emergencyContact.phone ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liên hệ khẩn cấp</Text>
          <View style={styles.emergencyContactCard}>
            <Text style={styles.contactName}>
              {patient.emergencyContact.name || 'Liên hệ khẩn cấp'}
            </Text>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => Linking.openURL(`tel:${patient.emergencyContact!.phone}`)}
            >
              <Text style={styles.callBtnText}>��� {patient.emergencyContact.phone}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* Nút mở bản đồ */}
      <TouchableOpacity
        style={styles.mapBtn}
        onPress={() => router.push({
          pathname: '/(tabs)/map',
          params: { incidentId },
        })}
      >
        <Text style={styles.mapBtnText}>���️ Mở bản đồ điều hướng</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: \'center\', alignItems: \'center\', gap: 12 },
  errorText: { fontSize: 15, color: COLORS.alert },
  bloodTypeCard: {
    backgroundColor: COLORS.alertLight,
    borderWidth: 2,
    borderColor: COLORS.alert,
    borderRadius: 16,
    padding: 20,
    alignItems: \'center\',
    marginBottom: 20,
  },
  bloodTypeLabel: {
    fontSize: 12, fontWeight: \'700\', color: COLORS.alert,
    letterSpacing: 2, marginBottom: 4,
  },
  bloodTypeValue: {
    fontSize: 48, fontWeight: \'900\', color: COLORS.alert, lineHeight: 56,
  },
  section: {
    marginBottom: 20, backgroundColor: COLORS.gray100,
    borderRadius: 14, padding: 16,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: \'700\', color: COLORS.gray600,
    letterSpacing: 1, textTransform: \'uppercase\', marginBottom: 12,
  },
  infoRow: {
    flexDirection: \'row\', justifyContent: \'space-between\', alignItems: \'center\',
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: \'#E0E0E0\',
  },
  infoLabel: { fontSize: 14, color: COLORS.gray600 },
  infoValue: { fontSize: 15, fontWeight: \'600\', color: COLORS.black900 },
  phoneLink: { color: COLORS.primary, textDecorationLine: \'underline\' },
  chipContainer: { flexDirection: \'row\', flexWrap: \'wrap\', gap: 8 },
  allergyChip: {
    backgroundColor: COLORS.alertLight, borderWidth: 1, borderColor: COLORS.alert,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  allergyChipText: { color: COLORS.alert, fontWeight: \'700\', fontSize: 13 },
  conditionChip: {
    backgroundColor: \'#E3F2FD\', borderWidth: 1, borderColor: \'#1565C0\',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  conditionChipText: { color: \'#1565C0\', fontWeight: \'600\', fontSize: 13 },
  medChip: {
    backgroundColor: \'#F3E5F5\', borderWidth: 1, borderColor: \'#7B1FA2\',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  medChipText: { color: \'#7B1FA2\', fontWeight: \'600\', fontSize: 13 },
  emergencyContactCard: {
    flexDirection: \'row\', justifyContent: \'space-between\', alignItems: \'center\',
  },
  contactName: { fontSize: 16, fontWeight: \'600\', color: COLORS.black900 },
  callBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 10,
  },
  callBtnText: { color: COLORS.white, fontWeight: \'700\', fontSize: 14 },
  mapBtn: {
    height: 56, backgroundColor: COLORS.primary, borderRadius: 14,
    justifyContent: \'center\', alignItems: \'center\', marginTop: 8, elevation: 3,
  },
  mapBtnText: { color: COLORS.white, fontSize: 17, fontWeight: \'700\' },
});
'''

with open('volunteer-app/app/patient-info.tsx', 'w', encoding='utf-8') as f:
    f.write(patient_info_content)
print("✅ patient-info.tsx: viết lại hoàn toàn — parse patientData từ params, fix tên field")

print("\n" + "=" * 55)
print("XONG Bug 1! Kiểm tra ⚠️ nếu có")
print("=" * 55)
