import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPatientInfo, PatientData } from '../services/incidentService';
import { COLORS } from '../constants';

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function PatientInfoScreen() {
  const { patientId, incidentId } = useLocalSearchParams<{
    patientId: string;
    incidentId: string;
  }>();
  const router = useRouter();

  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    getPatientInfo(patientId)
      .then(setPatient)
      .catch(() => Alert.alert('Error', 'Failed to load patient information.'))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.alert} />
        <Text style={styles.loadingText}>Loading patient info...</Text>
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Patient information unavailable.</Text>
      </View>
    );
  }

  const age = calculateAge(patient.dob);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Blood type — 48sp, most critical info */}
      <View style={styles.bloodTypeCard}>
        <Text style={styles.bloodTypeLabel}>BLOOD TYPE</Text>
        <Text style={styles.bloodTypeValue}>{patient.bloodType}</Text>
      </View>

      {/* Patient identity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patient</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>{patient.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Age</Text>
          <Text style={styles.infoValue}>{age} years old</Text>
        </View>
        {patient.phone ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${patient.phone}`)}>
              <Text style={[styles.infoValue, styles.phoneLink]}>{patient.phone}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* Allergies */}
      {patient.allergies.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.alert }]}>⚠️ Allergies</Text>
          <View style={styles.chipContainer}>
            {patient.allergies.map((item, i) => (
              <View key={i} style={styles.allergyChip}>
                <Text style={styles.allergyChipText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Conditions */}
      {patient.conditions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Conditions</Text>
          <View style={styles.chipContainer}>
            {patient.conditions.map((item, i) => (
              <View key={i} style={styles.conditionChip}>
                <Text style={styles.conditionChipText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Medications */}
      {patient.medications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Medications</Text>
          {patient.medications.map((item, i) => (
            <Text key={i} style={styles.medicationItem}>💊 {item}</Text>
          ))}
        </View>
      )}

      {/* Emergency Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contact</Text>
        <View style={styles.emergencyContactCard}>
          <Text style={styles.contactName}>{patient.emergencyContact.name}</Text>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => Linking.openURL(`tel:${patient.emergencyContact.phone}`)}
          >
            <Text style={styles.callBtnText}>📞 {patient.emergencyContact.phone}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Open Map */}
      <TouchableOpacity
        style={styles.mapBtn}
        onPress={() => router.push({
          pathname: '/(tabs)/map',
          params: { incidentId },
        })}
      >
        <Text style={styles.mapBtnText}>🗺️ Open Navigation Map</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 15, color: COLORS.gray600 },
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
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.alert,
    letterSpacing: 2,
    marginBottom: 4,
  },
  bloodTypeValue: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.alert,
    lineHeight: 56,
  },
  section: {
    marginBottom: 20,
    backgroundColor: COLORS.gray100,
    borderRadius: 14,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray600,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  infoLabel: { fontSize: 14, color: COLORS.gray600 },
  infoValue: { fontSize: 15, fontWeight: '600', color: COLORS.black900 },
  phoneLink: { color: COLORS.primary, textDecorationLine: 'underline' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  allergyChip: {
    backgroundColor: COLORS.alertLight,
    borderWidth: 1,
    borderColor: COLORS.alert,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  allergyChipText: { color: COLORS.alert, fontWeight: '700', fontSize: 13 },
  conditionChip: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#1565C0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  conditionChipText: { color: '#1565C0', fontWeight: '600', fontSize: 13 },
  medicationItem: { fontSize: 14, color: COLORS.black900, paddingVertical: 4, lineHeight: 22 },
  emergencyContactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactName: { fontSize: 16, fontWeight: '600', color: COLORS.black900 },
  callBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  callBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  mapBtn: {
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    elevation: 3,
  },
  mapBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
});