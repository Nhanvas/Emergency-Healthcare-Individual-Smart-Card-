import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Linking, Alert, ActivityIndicator,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { subscribeIncident, completeIncident } from '../services/incidentService';
import { getCurrentUser } from '../services/authService';
import { updateLocation } from '../services/volunteerService';
import { useIncident } from '../context/IncidentContext';
import { COLORS, GOONG_MAP_KEY, LOCATION_INTERVAL_ACTIVE_MS } from '../constants';

const MapViewC = MapView as any;
const MarkerC = Marker as any;
const UrlTileC = UrlTile as any;

// Khop voi Firestore schema thuc te
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
  acceptedBy?: string;
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

  const [activeTab, setActiveTab] = useState(0);
  const pagerRef = useRef<any>(null);

  const mapRef = useRef<any>(null);
  const [incidentLocation, setIncidentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [incidentData, setIncidentData] = useState<IncidentData | null>(null);
  const [volunteerLoc, setVolunteerLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [completing, setCompleting] = useState(false);
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [patient, setPatient] = useState<PatientData | null>(null);

  // Subscribe incident
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

  // Parse patient data tu params
  useEffect(() => {
    if (!patientDataRaw) return;
    try {
      const parsed = JSON.parse(patientDataRaw);
      // Ho tro ca 2 format: fullName (moi) va name (cu)
      if (parsed && (parsed.fullName || parsed.name)) {
        // Chuan hoa ve fullName
        if (!parsed.fullName && parsed.name) parsed.fullName = parsed.name;
        if (!parsed.dateOfBirth && parsed.dob) parsed.dateOfBirth = parsed.dob;
        if (!parsed.phoneNumber && parsed.phone) parsed.phoneNumber = parsed.phone;
        setPatient(parsed as PatientData);
      }
    } catch {
      Alert.alert('Loi', 'Khong doc duoc thong tin benh nhan.');
    }
  }, [patientDataRaw]);

  // Location tracking 15s
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

  // Auto-fit map
  useEffect(() => {
    if (!incidentLocation || !volunteerLoc || !mapRef.current) return;
    mapRef.current.fitToCoordinates(
      [
        { latitude: volunteerLoc.lat, longitude: volunteerLoc.lng },
        { latitude: incidentLocation.lat, longitude: incidentLocation.lng },
      ],
      { edgePadding: { top: 80, right: 80, bottom: 220, left: 80 }, animated: true }
    );
  }, [incidentLocation, volunteerLoc]);

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

  const switchTab = (index: number) => {
    setActiveTab(index);
    pagerRef.current?.setPage(index);
  };

  // Render emergency contact linh hoat (string hoac object)
  const renderEmergencyContact = () => {
    if (!patient?.emergencyContact) return null;
    const ec = patient.emergencyContact;

    if (typeof ec === 'string') {
      // Format cu: chi la so dien thoai
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lien he khan cap</Text>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => Linking.openURL(`tel:${ec}`)}
          >
            <Text style={styles.callBtnText}>{ec}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Format moi: object {name, phone, relationship}
    if (ec.phone) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lien he khan cap</Text>
          <View style={styles.contactRow}>
            <View>
              <Text style={styles.contactName}>{ec.name || 'Lien he'}</Text>
              {ec.relationship ? (
                <Text style={styles.contactRel}>{ec.relationship}</Text>
              ) : null}
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => Linking.openURL(`tel:${ec.phone}`)}
            >
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

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 0 && styles.tabBtnActive]}
          onPress={() => switchTab(0)}
        >
          <Text style={[styles.tabBtnText, activeTab === 0 && styles.tabBtnTextActive]}>
            Ban do
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 1 && styles.tabBtnActive]}
          onPress={() => switchTab(1)}
        >
          <Text style={[styles.tabBtnText, activeTab === 1 && styles.tabBtnTextActive]}>
            Ho so benh nhan
          </Text>
        </TouchableOpacity>
      </View>

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
      >

        {/* TAB 1: BAN DO */}
        <View key="map" style={styles.page}>
          {incidentLocation ? (
            <>
              <MapViewC
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                  latitude: incidentLocation.lat,
                  longitude: incidentLocation.lng,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              >
                <UrlTileC
                  urlTemplate={`https://mt.goong.io/maps/{z}/{x}/{y}?api_key=${GOONG_MAP_KEY}`}
                  maximumZ={20}
                  flipY={false}
                />
                <MarkerC
                  coordinate={{ latitude: incidentLocation.lat, longitude: incidentLocation.lng }}
                  title="Vi tri benh nhan"
                  pinColor={COLORS.alert}
                />
                {volunteerLoc && (
                  <MarkerC
                    coordinate={{ latitude: volunteerLoc.lat, longitude: volunteerLoc.lng }}
                    title="Vi tri cua ban"
                  >
                    <View style={styles.volunteerDot} />
                  </MarkerC>
                )}
              </MapViewC>

              <View style={styles.mapCard}>
                <View style={styles.distanceRow}>
                  <Text style={styles.distanceText}>
                    {distance !== null ? `${distance.toFixed(1)} km` : 'Dang tinh...'}
                  </Text>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>DANG XU LY</Text>
                  </View>
                </View>
                <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.directionsBtn} onPress={handleGetDirections}>
                    <Text style={styles.directionsBtnText}>Chi duong</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.completeBtn, completing && styles.btnDisabled]}
                    onPress={handleComplete}
                    disabled={completing}
                  >
                    {completing
                      ? <ActivityIndicator color={COLORS.white} size="small" />
                      : <Text style={styles.completeBtnText}>Hoan thanh</Text>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Dang tai ban do...</Text>
            </View>
          )}
        </View>

        {/* TAB 2: HO SO BENH NHAN */}
        <View key="profile" style={styles.page}>
          {patient ? (
            <ScrollView contentContainerStyle={styles.profileContent}>

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
                {patient.gender && (
                  <InfoRow label="Gioi tinh" value={patient.gender} />
                )}
                {patient.phoneNumber ? (
                  <TouchableOpacity onPress={() => Linking.openURL(`tel:${patient.phoneNumber}`)}>
                    <InfoRow label="Dien thoai" value={patient.phoneNumber!} highlight />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Di ung */}
              {patient.allergies?.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: COLORS.alert }]}>Di ung</Text>
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
                    <TouchableOpacity
                      onPress={() => Linking.openURL(`tel:${incidentData!.bystanderPhone}`)}
                    >
                      <InfoRow label="So dien thoai" value={incidentData.bystanderPhone!} highlight />
                    </TouchableOpacity>
                  ) : null}
                  {incidentData.bystanderNote ? (
                    <InfoRow label="Mo ta" value={incidentData.bystanderNote} />
                  ) : null}
                </View>
              )}

            </ScrollView>
          ) : (
            <View style={styles.centerLoading}>
              <Text style={styles.loadingText}>Dang tai ho so...</Text>
            </View>
          )}
        </View>

      </PagerView>
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
  tabBar: {
    flexDirection: 'row', gap: 8, padding: 12,
    paddingTop: 52, backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  tabBtn: {
    flex: 1, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.gray100,
  },
  tabBtnActive: { backgroundColor: COLORS.primary },
  tabBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.gray600 },
  tabBtnTextActive: { color: COLORS.white },
  pager: { flex: 1 },
  page: { flex: 1 },
  map: { flex: 1 },
  volunteerDot: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#1565C0', borderWidth: 3, borderColor: COLORS.white, elevation: 4,
  },
  mapCard: {
    backgroundColor: COLORS.white, padding: 20,
    borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 12,
  },
  distanceRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  distanceText: { fontSize: 24, fontWeight: '700', color: COLORS.black900 },
  activeBadge: {
    backgroundColor: COLORS.primaryLight, paddingHorizontal: 12,
    paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: COLORS.primary,
  },
  activeBadgeText: { color: COLORS.primary, fontWeight: '700', fontSize: 12, letterSpacing: 1 },
  btnRow: { flexDirection: 'row', gap: 12 },
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
  profileContent: { padding: 20, paddingBottom: 40 },
  bloodCard: {
    backgroundColor: COLORS.alertLight, borderWidth: 2, borderColor: COLORS.alert,
    borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20,
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
    borderRadius: 14, padding: 16,
    borderLeftWidth: 4, borderLeftColor: '#1565C0',
  },
  bystanderTitle: {
    fontSize: 12, fontWeight: '700', color: '#1565C0',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10,
  },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 15, color: COLORS.gray600 },
});