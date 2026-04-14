import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Linking, Alert, ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { subscribeIncident, completeIncident } from '../services/incidentService';
import { getCurrentUser } from '../services/authService';
import { updateLocation } from '../services/volunteerService';
import { useIncident } from '../context/IncidentContext';
import { COLORS, LOCATION_INTERVAL_ACTIVE_MS } from '../constants';

interface PatientData {
  fullName: string;
  dateOfBirth: string;
  gender?: string;
  phoneNumber?: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  medications?: string[];
  emergencyContact?: string | {
    name?: string;
    phone?: string;
    relationship?: string;
  };
}

interface IncidentData {
  status: string;
  reporterLocation: { lat: number; lng: number };
  bystanderPhone?: string;
  bystanderNote?: string;
}

function calcAge(dob: string): number {
  const b = new Date(dob);
  const t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--;
  return age;
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function IncidentTabsScreen() {
  const router = useRouter();
  const user = getCurrentUser();
  const { setActiveIncidentId } = useIncident();

  const { incidentId, patientData: patientDataRaw } = useLocalSearchParams<{
    incidentId: string;
    patientData: string;
  }>();

  const [incidentLocation, setIncidentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [incidentData, setIncidentData] = useState<IncidentData | null>(null);
  const [volunteerLoc, setVolunteerLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [completing, setCompleting] = useState(false);
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [patient, setPatient] = useState<PatientData | null>(null);

  useEffect(() => {
    if (!incidentId) return;
    const unsub = subscribeIncident(incidentId, (data: any) => {
      if (!data) return;
      setIncidentLocation(data.reporterLocation);
      setIncidentData(data);
      if (data.status === 'completed') {
        setActiveIncidentId(null);
        router.replace('/(tabs)/home');
      }
    });
    return unsub;
  }, [incidentId]);

  useEffect(() => {
    if (!patientDataRaw) return;
    try {
      const parsed = JSON.parse(patientDataRaw);
      if (parsed && (parsed.fullName || parsed.name)) {
        if (!parsed.fullName && parsed.name) parsed.fullName = parsed.name;
        if (!parsed.dateOfBirth && parsed.dob) parsed.dateOfBirth = parsed.dob;
        if (!parsed.phoneNumber && parsed.phone) parsed.phoneNumber = parsed.phone;
        setPatient(parsed as PatientData);
      }
    } catch {
      Alert.alert('Loi', 'Khong doc duoc thong tin benh nhan.');
    }
  }, [patientDataRaw]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setVolunteerLoc({ lat: loc.coords.latitude, lng: loc.coords.longitude });

      locationIntervalRef.current = setInterval(async () => {
        if (!user) return;
        const l = await Location.getCurrentPositionAsync({});
        const coords = { lat: l.coords.latitude, lng: l.coords.longitude };
        setVolunteerLoc(coords);
        await updateLocation(user.uid, coords.lat, coords.lng);
      }, LOCATION_INTERVAL_ACTIVE_MS);
    })();
    return () => {
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, []);

  const distance =
    incidentLocation && volunteerLoc
      ? getDistanceKm(volunteerLoc.lat, volunteerLoc.lng, incidentLocation.lat, incidentLocation.lng)
      : null;

  const handleGetDirections = () => {
    if (!incidentLocation) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${incidentLocation.lat},${incidentLocation.lng}&travelmode=driving`;
    Linking.openURL(url);
  };

  const handleComplete = () => {
    Alert.alert(
      'Hoan thanh?',
      'Xac nhan ban da ho tro benh nhan va su co da duoc xu ly.',
      [
        { text: 'Huy', style: 'cancel' },
        {
          text: 'Hoan thanh',
          onPress: async () => {
            setCompleting(true);
            try {
              await completeIncident(incidentId!);
              setActiveIncidentId(null);
              router.replace('/(tabs)/home');
            } catch (err: any) {
              Alert.alert('Loi', err.message || 'Khong the hoan thanh.');
              setCompleting(false);
            }
          },
        },
      ]
    );
  };

  const renderEmergencyContact = () => {
    if (!patient?.emergencyContact) return null;
    const ec = patient.emergencyContact;

    if (typeof ec === 'string') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lien he khan cap</Text>
          <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${ec}`)}>
            <Text style={styles.callBtnText}>{ec}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (ec.phone) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lien he khan cap</Text>
          <View style={styles.contactRow}>
            <View>
              <Text style={styles.contactName}>{ec.name || 'Lien he'}</Text>
              {ec.relationship ? <Text style={styles.contactRel}>{ec.relationship}</Text> : null}
            </View>
            <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${ec.phone}`)}>
              <Text style={styles.callBtnText}>{ec.phone}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ho so benh nhan</Text>
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceText}>
            {distance !== null ? `${distance.toFixed(1)} km` : '...'}
          </Text>
        </View>
      </View>

      {/* Patient info - scrollable */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {patient ? (
          <>
            {/* Nhom mau */}
            <View style={styles.bloodCard}>
              <Text style={styles.bloodLabel}>NHOM MAU</Text>
              <Text style={styles.bloodValue}>{patient.bloodType || '?'}</Text>
            </View>

            {/* Thong tin ca nhan */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Benh nhan</Text>
              <InfoRow label="Ho ten" value={patient.fullName} />
              {patient.dateOfBirth && (
                <InfoRow label="Tuoi" value={`${calcAge(patient.dateOfBirth)} tuoi`} />
              )}
              {patient.gender && <InfoRow label="Gioi tinh" value={patient.gender} />}
              {patient.phoneNumber ? (
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${patient.phoneNumber}`)}>
                  <InfoRow label="Dien thoai" value={patient.phoneNumber!} highlight />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Di ung */}
            {patient.allergies?.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: COLORS.alert }]}>⚠️ Di ung</Text>
                <View style={styles.chips}>
                  {patient.allergies.map((a, i) => (
                    <View key={i} style={styles.allergyChip}>
                      <Text style={styles.allergyChipText}>{a}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Benh nen */}
            {patient.conditions?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Benh nen</Text>
                <View style={styles.chips}>
                  {patient.conditions.map((c, i) => (
                    <View key={i} style={styles.conditionChip}>
                      <Text style={styles.conditionChipText}>{c}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Thuoc */}
            {patient.medications && patient.medications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thuoc dang dung</Text>
                <View style={styles.chips}>
                  {patient.medications.map((m, i) => (
                    <View key={i} style={styles.medChip}>
                      <Text style={styles.medChipText}>{m}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Lien he khan cap */}
            {renderEmergencyContact()}

            {/* Thong tin bystander */}
            {(incidentData?.bystanderPhone || incidentData?.bystanderNote) && (
              <View style={styles.bystanderSection}>
                <Text style={styles.bystanderTitle}>Thong tin nguoi bao</Text>
                {incidentData.bystanderPhone ? (
                  <TouchableOpacity onPress={() => Linking.openURL(`tel:${incidentData!.bystanderPhone}`)}>
                    <InfoRow label="So dien thoai" value={incidentData.bystanderPhone!} highlight />
                  </TouchableOpacity>
                ) : null}
                {incidentData.bystanderNote ? (
                  <InfoRow label="Mo ta" value={incidentData.bystanderNote} />
                ) : null}
              </View>
            )}
          </>
        ) : (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Dang tai thong tin...</Text>
          </View>
        )}

      </ScrollView>

      {/* Bottom buttons - co dinh */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.directionsBtn} onPress={handleGetDirections}>
          <Text style={styles.directionsBtnText}>🧭 Chi duong</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.completeBtn, completing && styles.btnDisabled]}
          onPress={handleComplete}
          disabled={completing}
        >
          {completing
            ? <ActivityIndicator color={COLORS.white} size="small" />
            : <Text style={styles.completeBtnText}>✓ Hoan thanh</Text>
          }
        </TouchableOpacity>
      </View>

    </View>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && { color: COLORS.primary, textDecorationLine: 'underline' }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16,
    backgroundColor: COLORS.primary, elevation: 4,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  distanceBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12,
    paddingVertical: 4, borderRadius: 20,
  },
  distanceText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 20 },
  bloodCard: {
    backgroundColor: COLORS.alertLight, borderWidth: 2, borderColor: COLORS.alert,
    borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16,
  },
  bloodLabel: { fontSize: 12, fontWeight: '700', color: COLORS.alert, letterSpacing: 2, marginBottom: 4 },
  bloodValue: { fontSize: 48, fontWeight: '900', color: COLORS.alert, lineHeight: 56 },
  section: { marginBottom: 16, backgroundColor: COLORS.gray100, borderRadius: 14, padding: 16 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: COLORS.gray600,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
  },
  infoLabel: { fontSize: 14, color: COLORS.gray600 },
  infoValue: { fontSize: 15, fontWeight: '600', color: COLORS.black900 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  contactRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contactName: { fontSize: 15, fontWeight: '600', color: COLORS.black900 },
  contactRel: { fontSize: 12, color: COLORS.gray600, marginTop: 2 },
  callBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  callBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  bystanderSection: {
    marginBottom: 16, backgroundColor: '#E3F2FD',
    borderRadius: 14, padding: 16, borderLeftWidth: 4, borderLeftColor: '#1565C0',
  },
  bystanderTitle: {
    fontSize: 12, fontWeight: '700', color: '#1565C0',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10,
  },
  bottomBar: {
    flexDirection: 'row', gap: 12, padding: 16,
    backgroundColor: COLORS.white, elevation: 12,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  directionsBtn: {
    flex: 1, height: 56, backgroundColor: '#E3F2FD',
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#1565C0',
  },
  directionsBtnText: { color: '#1565C0', fontSize: 15, fontWeight: '700' },
  completeBtn: {
    flex: 1, height: 56, backgroundColor: COLORS.primary,
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },
  completeBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingTop: 100 },
  loadingText: { fontSize: 15, color: COLORS.gray600 },
});