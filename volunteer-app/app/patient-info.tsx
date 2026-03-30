import React, { useState, useEffect } from 'react';
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

// Kieu du lieu khop voi Firestore schema thuc te
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
    // Parse patientData tu route params
    // KHONG doc Firestore truc tiep vi Security Rules chi cho patient tu doc data cua minh
    if (!patientDataRaw) return;
    try {
      const parsed = JSON.parse(patientDataRaw) as PatientData;
      if (parsed && parsed.name) {
        setPatient(parsed);
      }
    } catch (e) {
      Alert.alert('Loi', 'Khong doc duoc thong tin benh nhan.');
    }
  }, [patientDataRaw]);

  if (!patient) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Dang tai thong tin benh nhan...</Text>
      </View>
    );
  }

  const age = patient.dob ? calculateAge(patient.dob) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Nhom mau - thong tin quan trong nhat */}
      <View style={styles.bloodTypeCard}>
        <Text style={styles.bloodTypeLabel}>NHOM MAU</Text>
        <Text style={styles.bloodTypeValue}>{patient.bloodType || '?'}</Text>
      </View>

      {/* Thong tin ca nhan */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Benh nhan</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ho ten</Text>
          <Text style={styles.infoValue}>{patient.name}</Text>
        </View>
        {age !== null && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tuoi</Text>
            <Text style={styles.infoValue}>{age} tuoi</Text>
          </View>
        )}
        {patient.phone ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dien thoai</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${patient.phone}`)}>
              <Text style={[styles.infoValue, styles.phoneLink]}>{patient.phone}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* Di ung */}
      {patient.allergies && patient.allergies.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.alert }]}>Di ung</Text>
          <View style={styles.chipContainer}>
            {patient.allergies.map((item, i) => (
              <View key={i} style={styles.allergyChip}>
                <Text style={styles.allergyChipText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Benh nen */}
      {patient.conditions && patient.conditions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benh nen</Text>
          <View style={styles.chipContainer}>
            {patient.conditions.map((item, i) => (
              <View key={i} style={styles.conditionChip}>
                <Text style={styles.conditionChipText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Thuoc dang dung */}
      {patient.medications && patient.medications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thuoc dang dung</Text>
          <View style={styles.chipContainer}>
            {patient.medications.map((item, i) => (
              <View key={i} style={styles.medChip}>
                <Text style={styles.medChipText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Lien he khan cap */}
      {patient.emergencyContact && patient.emergencyContact.phone ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lien he khan cap</Text>
          <View style={styles.emergencyContactCard}>
            <Text style={styles.contactName}>
              {patient.emergencyContact.name || 'Lien he khan cap'}
            </Text>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => Linking.openURL(`tel:${patient.emergencyContact!.phone}`)}
            >
              <Text style={styles.callBtnText}>{patient.emergencyContact.phone}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* Nut mo ban do */}
      <TouchableOpacity
        style={styles.mapBtn}
        onPress={() => router.push({
          pathname: '/(tabs)/map',
          params: { incidentId },
        })}
      >
        <Text style={styles.mapBtnText}>Mo ban do dieu huong</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { fontSize: 15, color: COLORS.alert },
  bloodTypeCard: {
    backgroundColor: COLORS.alertLight,
    borderWidth: 2,
    borderColor: COLORS.alert,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  bloodTypeLabel: {
    fontSize: 12, fontWeight: '700', color: COLORS.alert,
    letterSpacing: 2, marginBottom: 4,
  },
  bloodTypeValue: {
    fontSize: 48, fontWeight: '900', color: COLORS.alert, lineHeight: 56,
  },
  section: {
    marginBottom: 20, backgroundColor: COLORS.gray100,
    borderRadius: 14, padding: 16,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: COLORS.gray600,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
  },
  infoLabel: { fontSize: 14, color: COLORS.gray600 },
  infoValue: { fontSize: 15, fontWeight: '600', color: COLORS.black900 },
  phoneLink: { color: COLORS.primary, textDecorationLine: 'underline' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  allergyChip: {
    backgroundColor: COLORS.alertLight, borderWidth: 1, borderColor: COLORS.alert,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  allergyChipText: { color: COLORS.alert, fontWeight: '700', fontSize: 13 },
  conditionChip: {
    backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: '#1565C0',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  conditionChipText: { color: '#1565C0', fontWeight: '600', fontSize: 13 },
  medChip: {
    backgroundColor: '#F3E5F5', borderWidth: 1, borderColor: '#7B1FA2',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  medChipText: { color: '#7B1FA2', fontWeight: '600', fontSize: 13 },
  emergencyContactCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  contactName: { fontSize: 16, fontWeight: '600', color: COLORS.black900 },
  callBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 10,
  },
  callBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  mapBtn: {
    height: 56, backgroundColor: COLORS.primary, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginTop: 8, elevation: 3,
  },
  mapBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
});