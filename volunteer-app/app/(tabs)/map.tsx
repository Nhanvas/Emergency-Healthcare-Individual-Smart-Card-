import React, { useState, useEffect } from 'react';
import {
<<<<<<< HEAD
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, SafeAreaView, ActivityIndicator,
  Alert, Linking,
} from 'react-native';
=======
  View, Text, TouchableOpacity, StyleSheet,
  Alert, Linking, ActivityIndicator, Platform,
} from 'react-native';
import MapView, { Marker, UrlTile, AnimatedRegion } from 'react-native-maps';
import * as Location from 'expo-location';
>>>>>>> a69939ef88a13c9e04e846f016ccd2bf8097e9df
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { completeIncident } from '../../services/incidentService';
import { useIncident } from '../../context/IncidentContext';

// Tính khoảng cách giữa 2 toạ độ (km)
function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

// Tính tuổi từ ngày sinh ISO "YYYY-MM-DD"
function calcAge(dob: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function MapScreen() {
  const router = useRouter();
<<<<<<< HEAD

  // FIX 4: đọc cả patientData từ context — không cần Firestore read trực tiếp
  const { activeIncidentId, setActiveIncidentId, activePatientData, setActivePatientData } = useIncident();
=======
  const user = getCurrentUser();
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const { activeIncidentId, setActiveIncidentId } = useIncident();
>>>>>>> a69939ef88a13c9e04e846f016ccd2bf8097e9df

  const [loading, setLoading]     = useState(false);
  const [completing, setCompleting] = useState(false);
  const [incident, setIncident]   = useState<any>(null);
  const [distance, setDistance]   = useState<number | null>(null);

<<<<<<< HEAD
  // activePatientData đến từ Cloud Function qua context
  // → field names đã được normalize trong functions/index.js
  const patient = activePatientData;

  // Fetch incident doc khi có activeIncidentId
  // (cần bystanderPhone, bystanderNote, reporterLocation)
=======
  const prevLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  // ✅ Animated coordinate (fix TS lỗi Region)
  const animatedCoordinate: any = useRef(
    new AnimatedRegion({
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  ).current;

  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Subscribe incident
>>>>>>> a69939ef88a13c9e04e846f016ccd2bf8097e9df
  useEffect(() => {
    if (!activeIncidentId) {
      setIncident(null);
      setDistance(null);
      return;
    }
    fetchIncident();
  }, [activeIncidentId]);

<<<<<<< HEAD
  const fetchIncident = async () => {
    if (!activeIncidentId) return;
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'incidents', activeIncidentId));
      if (!snap.exists()) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin sự cố.');
        return;
      }
      const data = snap.data();
      setIncident(data);

      // Tính khoảng cách từ vị trí hiện tại đến incident
      try {
        const loc = await Location.getCurrentPositionAsync({});
        if (data?.reporterLocation) {
          const d = calcDistance(
            loc.coords.latitude,
            loc.coords.longitude,
            data.reporterLocation.lat,
            data.reporterLocation.lng
          );
          setDistance(d);
        }
      } catch (_) { /* GPS không khả dụng — bỏ qua */ }

    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirections = () => {
    if (!incident?.reporterLocation) return;
=======
  // Location tracking
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});
      const first = { lat: loc.coords.latitude, lng: loc.coords.longitude };

      prevLocationRef.current = first;
      setVolunteerLocation(first);

      animatedCoordinate.setValue({
        latitude: first.lat,
        longitude: first.lng,
      });

      locationIntervalRef.current = setInterval(async () => {
        if (!user) return;

        const l = await Location.getCurrentPositionAsync({});
        const coords = { lat: l.coords.latitude, lng: l.coords.longitude };

        // ✅ Filter noise (~5m)
        const prev = prevLocationRef.current;
        if (prev) {
          const dist = getDistance(prev.lat, prev.lng, coords.lat, coords.lng);
          if (dist < 0.005) return;
        }

        prevLocationRef.current = coords;
        setVolunteerLocation(coords);

        // ✅ Smooth animation
        if (Platform.OS === 'android') {
          markerRef.current?.animateMarkerToCoordinate(
            {
              latitude: coords.lat,
              longitude: coords.lng,
            },
            1000
          );
        } else {
          animatedCoordinate.timing({
            toValue: {
              latitude: coords.lat,
              longitude: coords.lng,
            },
            duration: 1000,
            useNativeDriver: false,
          }).start();
        }

        await updateLocation(user.uid, coords.lat, coords.lng);
      }, LOCATION_INTERVAL_ACTIVE_MS);
    })();

    return () => {
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, []);

  // ✅ Fix rung camera (chỉ chạy 1 lần)
  useEffect(() => {
    if (!incident || !volunteerLocation || !mapRef.current) return;

    const { lat, lng } = incident.reporterLocation;

    mapRef.current.fitToCoordinates(
      [
        { latitude: volunteerLocation.lat, longitude: volunteerLocation.lng },
        { latitude: lat, longitude: lng },
      ],
      { edgePadding: { top: 80, right: 80, bottom: 200, left: 80 }, animated: true }
    );
  }, [incident]);

  const handleGetDirections = () => {
    if (!incident) return;
>>>>>>> a69939ef88a13c9e04e846f016ccd2bf8097e9df
    const { lat, lng } = incident.reporterLocation;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    Linking.openURL(url);
  };

  const handleComplete = async () => {
    if (!activeIncidentId) return;
    Alert.alert(
<<<<<<< HEAD
      'Hoàn thành sự cố?',
      'Xác nhận bạn đã hỗ trợ bệnh nhân xong.',
=======
      'Mark Complete?',
      'Confirm you have assisted the patient.',
>>>>>>> a69939ef88a13c9e04e846f016ccd2bf8097e9df
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Hoàn thành',
          onPress: async () => {
            setCompleting(true);
            try {
              await completeIncident(activeIncidentId);
              setActiveIncidentId(null);
<<<<<<< HEAD
              setActivePatientData(null); // xoá data sau khi hoàn thành
              router.replace('/(tabs)/home');
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể hoàn thành sự cố.');
            } finally {
=======
            } catch (err: any) {
              Alert.alert('Error', err.message);
>>>>>>> a69939ef88a13c9e04e846f016ccd2bf8097e9df
              setCompleting(false);
            }
          },
        },
      ]
    );
  };

<<<<<<< HEAD
  // ── EMPTY STATE ──
  if (!activeIncidentId) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="map-outline" size={64} color="#BDBDBD" />
        <Text style={styles.emptyText}>Không có sự cố nào</Text>
=======
  const distance =
    incident && volunteerLocation
      ? getDistance(
          volunteerLocation.lat, volunteerLocation.lng,
          incident.reporterLocation.lat, incident.reporterLocation.lng
        )
      : null;

  if (!activeIncidentId || !incident) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 48 }}>🗺️</Text>
        <Text style={styles.loadingText}>No active incident</Text>
>>>>>>> a69939ef88a13c9e04e846f016ccd2bf8097e9df
      </View>
    );
  }

  // ── LOADING ──
  if (loading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.emptyText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  const age = patient?.dateOfBirth ? calcAge(patient.dateOfBirth) : null;
  const distanceText = distance !== null ? `${distance.toFixed(1)} km` : '-- km';

  // Emergency contact
  const ec = patient?.emergencyContact;
  const ecName = typeof ec === 'string' ? '' :
    (ec?.name && ec?.relationship ? `${ec.name} - ${ec.relationship}` : ec?.name || '');
  const ecPhone = typeof ec === 'string' ? ec : ec?.phone || '';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ sơ bệnh nhân</Text>
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceBadgeText}>{distanceText}</Text>
        </View>
      </View>

      {/* ── SCROLL CONTENT ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
<<<<<<< HEAD
        {/* CARD 1: Thông tin cơ bản */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin</Text>
          <View style={styles.divider} />
          <Text style={styles.infoText}>
            Họ tên: <Text style={styles.infoValue}>{patient?.fullName || '—'}</Text>
          </Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>
              Giới tính: <Text style={styles.infoValue}>{patient?.gender || '—'}</Text>
            </Text>
            <View style={styles.vertDivider} />
            <Text style={styles.infoText}>
              Tuổi: <Text style={styles.infoValue}>{age ?? '—'}</Text>
            </Text>
            <View style={styles.vertDivider} />
            <Text style={styles.infoText}>
              Nhóm máu: <Text style={[styles.infoValue, styles.bold]}>{patient?.bloodType || '—'}</Text>
            </Text>
          </View>
          <Text style={[styles.infoText, { marginTop: 6 }]}>
            Số điện thoại: <Text style={styles.infoValue}>{patient?.phoneNumber || '—'}</Text>
          </Text>
        </View>

        {/* CARD 2: Bệnh lý */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bệnh lý</Text>
          <View style={styles.divider} />
          <Text style={styles.subLabel}>Dị ứng</Text>
          <View style={styles.chipRow}>
            {patient?.allergies?.length > 0
              ? patient.allergies.map((a: string, i: number) => (
                  <View key={i} style={styles.chip}>
                    <Text style={styles.chipText}>{a}</Text>
                  </View>
                ))
              : <Text style={styles.emptyField}>-</Text>
            }
          </View>
          <Text style={[styles.subLabel, { marginTop: 12 }]}>Bệnh nền</Text>
          <View style={styles.chipRow}>
            {patient?.conditions?.length > 0
              ? patient.conditions.map((c: string, i: number) => (
                  <View key={i} style={styles.chip}>
                    <Text style={styles.chipText}>{c}</Text>
                  </View>
                ))
              : <Text style={styles.emptyField}>-</Text>
            }
          </View>
        </View>

        {/* CARD 3: Liên hệ khẩn cấp */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Liên hệ khẩn cấp</Text>
          <View style={styles.divider} />
          <View style={styles.contactRow}>
            <Text style={styles.contactName}>{ecName || '—'}</Text>
            {ecPhone ? (
              <TouchableOpacity
                style={styles.callPill}
                onPress={() => Linking.openURL(`tel:${ecPhone}`)}
              >
                <Ionicons name="call-outline" size={16} color="#fff" />
                <Text style={styles.callPillText}>{ecPhone}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.emptyField}>—</Text>
=======
        <UrlTileComponent
          urlTemplate={`https://mt.goong.io/maps/{z}/{x}/{y}?api_key=${GOONG_MAP_KEY}`}
          maximumZ={20}
        />

        <MarkerComponent
          coordinate={{
            latitude: incident.reporterLocation.lat,
            longitude: incident.reporterLocation.lng,
          }}
          pinColor={COLORS.alert}
        />

        {volunteerLocation && (
          <MarkerComponent
            ref={markerRef}
            coordinate={animatedCoordinate}
          >
            <View style={styles.volunteerDot} />
          </MarkerComponent>
        )}
      </MapViewComponent>

      <View style={styles.infoCard}>
        <Text style={styles.distanceText}>
          {distance !== null ? `${distance.toFixed(1)} km` : 'Calculating...'}
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.directionsBtn} onPress={handleGetDirections}>
            <Text>🧭 Directions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.completeBtn, completing && styles.btnDisabled]}
            onPress={handleComplete}
            disabled={completing}
          >
            {completing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff' }}>Complete</Text>
>>>>>>> a69939ef88a13c9e04e846f016ccd2bf8097e9df
            )}
          </View>
        </View>

        {/* CARD 4: Thông tin người báo (vàng) */}
        {(incident?.bystanderPhone || incident?.bystanderNote) && (
          <View style={styles.bystanderCard}>
            <Text style={styles.bystanderTitle}>Thông tin người báo</Text>
            {incident.bystanderPhone ? (
              <Text style={styles.bystanderText}>
                Liên lạc: {incident.bystanderPhone}
              </Text>
            ) : null}
            {incident.bystanderNote ? (
              <Text style={styles.bystanderText}>
                Mô tả: <Text style={styles.bold}>{incident.bystanderNote}</Text>
              </Text>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* ── FIXED BOTTOM BUTTONS ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.btnDirections}
          onPress={handleDirections}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Chỉ đường</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnComplete, completing && styles.btnDisabled]}
          onPress={handleComplete}
          disabled={completing}
          activeOpacity={0.85}
        >
          {completing
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.btnText}>Hoàn thành</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ✅ Styles (fix lỗi "styles not found")
const styles = StyleSheet.create({
<<<<<<< HEAD
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5', gap: 12 },
  emptyText: { fontSize: 16, color: '#9E9E9E', marginTop: 4 },
  header: {
    backgroundColor: '#E53935', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  distanceBadge: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  distanceBadgeText: { color: '#E53935', fontSize: 14, fontWeight: 'bold' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1,
    borderColor: '#E0E0E0', padding: 16, marginTop: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginBottom: 10 },
  infoText: { fontSize: 14, color: '#757575', marginBottom: 4 },
  infoValue: { color: '#212121' },
  bold: { fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  vertDivider: { width: 1, height: 14, backgroundColor: '#E0E0E0', marginHorizontal: 4 },
  subLabel: { fontSize: 13, color: '#757575', marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#E53935', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  chipText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptyField: { fontSize: 14, color: '#BDBDBD' },
  contactRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  contactName: { fontSize: 14, color: '#212121', flex: 1 },
  callPill: {
    backgroundColor: '#4CAF50', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  callPillText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  bystanderCard: {
    backgroundColor: '#FFFDE7', borderRadius: 12, borderWidth: 1,
    borderColor: '#F9A825', padding: 16, marginTop: 12,
  },
  bystanderTitle: { fontSize: 16, fontWeight: 'bold', color: '#F57F17', marginBottom: 10 },
  bystanderText: { fontSize: 14, color: '#212121', marginTop: 2 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#E0E0E0', flexDirection: 'row', gap: 12,
  },
  btnDirections: { flex: 1, height: 52, borderRadius: 8, backgroundColor: '#E53935', justifyContent: 'center', alignItems: 'center' },
  btnComplete: { flex: 1, height: 52, borderRadius: 8, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  btnDisabled: { opacity: 0.6 },
});
=======
  container: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  loadingText: { fontSize: 16 },
  volunteerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1565C0',
    borderWidth: 3,
    borderColor: '#fff',
  },
  infoCard: {
    padding: 16,
    backgroundColor: '#fff',
  },
  distanceText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  directionsBtn: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  completeBtn: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'blue',
  },
  btnDisabled: { opacity: 0.5 },
});
>>>>>>> a69939ef88a13c9e04e846f016ccd2bf8097e9df
