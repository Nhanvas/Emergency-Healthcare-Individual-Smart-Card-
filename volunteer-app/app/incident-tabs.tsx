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

// Cast để tránh lỗi TypeScript với react-native-maps
const MapViewC = MapView as any;
const MarkerC = Marker as any;
const UrlTileC = UrlTile as any;

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

  // Nhận params từ home.tsx
  const { incidentId, patientData: patientDataRaw } = useLocalSearchParams<{
    incidentId: string;
    patientData: string;
  }>();

  const [activeTab, setActiveTab] = useState(0);
  const pagerRef = useRef<any>(null);

  // --- Map state ---
  const mapRef = useRef<any>(null);
  const [incidentLocation, setIncidentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [volunteerLoc, setVolunteerLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [completing, setCompleting] = useState(false);
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Patient state ---
  const [patient, setPatient] = useState<PatientData | null>(null);

  // Subscribe incident để lấy vị trí và theo dõi status
  useEffect(() => {
    if (!incidentId) return;
    const unsub = subscribeIncident(incidentId, (data) => {
      if (!data) return;
      setIncidentLocation(data.reporterLocation);
      // Nếu incident đã completed (từ màn hình khác), về home
      if (data.status === 'completed') {
        setActiveIncidentId(null);
        router.replace('/(tabs)/home');
      }
    });
    return unsub;
  }, [incidentId]);

  // Parse patient data từ params — không đọc Firestore trực tiếp
  useEffect(() => {
    if (!patientDataRaw) return;
    try {
      const parsed = JSON.parse(patientDataRaw) as PatientData;
      if (parsed?.name) setPatient(parsed);
    } catch {
      Alert.alert('Lỗi', 'Không đọc được thông tin bệnh nhân.');
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

  // Auto-fit map khi có đủ 2 điểm
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
      'Hoàn thành?',
      'Xác nhận bạn đã hỗ trợ bệnh nhân và sự cố đã được xử lý.',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Hoàn thành',
          onPress: async () => {
            setCompleting(true);
            try {
              await completeIncident(incidentId!);
              setActiveIncidentId(null);
              router.replace('/(tabs)/home');
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể hoàn thành.');
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

  return (
    <View style={styles.container}>

      {/* Tab bar — 2 pill buttons */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 0 && styles.tabBtnActive]}
          onPress={() => switchTab(0)}
        >
          <Text style={[styles.tabBtnText, activeTab === 0 && styles.tabBtnTextActive]}>
            Bản đồ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 1 && styles.tabBtnActive]}
          onPress={() => switchTab(1)}
        >
          <Text style={[styles.tabBtnText, activeTab === 1 && styles.tabBtnTextActive]}>
            Hồ sơ bệnh nhân
          </Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable content */}
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
      >

        {/* ===== TAB 1: BẢN ĐỒ ===== */}
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
                {/* Goong Map tiles */}
                <UrlTileC
                  urlTemplate={`https://mt.goong.io/maps/{z}/{x}/{y}?api_key=${GOONG_MAP_KEY}`}
                  maximumZ={20}
                  flipY={false}
                />
                {/* Pin đỏ — vị trí bệnh nhân */}
                <MarkerC
                  coordinate={{ latitude: incidentLocation.lat, longitude: incidentLocation.lng }}
                  title="Vị trí bệnh nhân"
                  pinColor={COLORS.alert}
                />
                {/* Chấm xanh — vị trí tình nguyện viên */}
                {volunteerLoc && (
                  <MarkerC
                    coordinate={{ latitude: volunteerLoc.lat, longitude: volunteerLoc.lng }}
                    title="Vị trí của bạn"
                  >
                    <View style={styles.volunteerDot} />
                  </MarkerC>
                )}
              </MapViewC>

              {/* Card dưới map */}
              <View style={styles.mapCard}>
                <View style={styles.distanceRow}>
                  <Text style={styles.distanceText}>
                    {distance !== null ? `${distance.toFixed(1)} km` : 'Đang tính...'}
                  </Text>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>ĐANG XỬ LÝ</Text>
                  </View>
                </View>
                <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.directionsBtn} onPress={handleGetDirections}>
                    <Text style={styles.directionsBtnText}>Chỉ đường</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.completeBtn, completing && styles.btnDisabled]}
                    onPress={handleComplete}
                    disabled={completing}
                  >
                    {completing
                      ? <ActivityIndicator color={COLORS.white} size="small" />
                      : <Text style={styles.completeBtnText}>Hoàn thành</Text>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
            </View>
          )}
        </View>

        {/* ===== TAB 2: HỒ SƠ BỆNH NHÂN ===== */}
        <View key="profile" style={styles.page}>
          {patient ? (
            <ScrollView contentContainerStyle={styles.profileContent}>

              {/* Nhóm máu */}
              <View style={styles.bloodCard}>
                <Text style={styles.bloodLabel}>NHÓM MÁU</Text>
                <Text style={styles.bloodValue}>{patient.bloodType || '?'}</Text>
              </View>

              {/* Thông tin cá nhân */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bệnh nhân</Text>
                <InfoRow label="Họ tên" value={patient.name} />
                {patient.dob && <InfoRow label="Tuổi" value={`${calcAge(patient.dob)} tuổi`} />}
                {patient.phone && (
                  <TouchableOpacity onPress={() => Linking.openURL(`tel:${patient.phone}`)}>
                    <InfoRow label="Điện thoại" value={patient.phone} highlight />
                  </TouchableOpacity>
                )}
              </View>

              {/* Dị ứng */}
              {patient.allergies?.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: COLORS.alert }]}>Dị ứng</Text>
                  <View style={styles.chips}>
                    {patient.allergies.map((a, i) => (
                      <View key={i} style={styles.allergyChip}>
                        <Text style={styles.allergyChipText}>{a}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Bệnh nền */}
              {patient.conditions?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Bệnh nền</Text>
                  <View style={styles.chips}>
                    {patient.conditions.map((c, i) => (
                      <View key={i} style={styles.conditionChip}>
                        <Text style={styles.conditionChipText}>{c}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Thuốc đang dùng */}
              {patient.medications?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Thuốc đang dùng</Text>
                  <View style={styles.chips}>
                    {patient.medications.map((m, i) => (
                      <View key={i} style={styles.medChip}>
                        <Text style={styles.medChipText}>{m}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Liên hệ khẩn cấp */}
              {patient.emergencyContact?.phone && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Liên hệ khẩn cấp</Text>
                  <View style={styles.contactRow}>
                    <Text style={styles.contactName}>
                      {patient.emergencyContact.name || 'Liên hệ'}
                    </Text>
                    <TouchableOpacity
                      style={styles.callBtn}
                      onPress={() => Linking.openURL(`tel:${patient.emergencyContact!.phone}`)}
                    >
                      <Text style={styles.callBtnText}>{patient.emergencyContact.phone}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

            </ScrollView>
          ) : (
            <View style={styles.centerLoading}>
              <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
            </View>
          )}
        </View>

      </PagerView>
    </View>
  );
}

// Helper component
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

  // Tab bar
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

  // Map tab
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

  // Patient profile tab
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
  contactName: { fontSize: 16, fontWeight: '600', color: COLORS.black900 },
  callBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  callBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },

  // Shared
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 15, color: COLORS.gray600 },
});