import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { subscribeIncident, completeIncident, IncidentData } from '../../services/incidentService';
import { getCurrentUser } from '../../services/authService';
import { updateLocation } from '../../services/volunteerService';
import { COLORS, GOONG_MAP_KEY, LOCATION_INTERVAL_ACTIVE_MS } from '../../constants';

// Cast để tránh lỗi TypeScript với react-native-maps
const MapViewComponent = MapView as any;
const MarkerComponent = Marker as any;
const UrlTileComponent = UrlTile as any;

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

export default function MapScreen() {
  const { incidentId } = useLocalSearchParams<{ incidentId: string }>();
  const router = useRouter();
  const user = getCurrentUser();
  const mapRef = useRef<any>(null);

  const [incident, setIncident] = useState<IncidentData | null>(null);
  const [volunteerLocation, setVolunteerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [completing, setCompleting] = useState(false);

  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Subscribe incident realtime
  useEffect(() => {
    if (!incidentId) return;
    const unsub = subscribeIncident(incidentId, (data) => {
      setIncident(data);
      if (data?.status === 'completed') {
        router.replace('/(tabs)/home');
      }
    });
    return unsub;
  }, [incidentId]);

  // Location tracking 15s
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});
      setVolunteerLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });

      locationIntervalRef.current = setInterval(async () => {
        if (!user) return;
        const l = await Location.getCurrentPositionAsync({});
        const coords = { lat: l.coords.latitude, lng: l.coords.longitude };
        setVolunteerLocation(coords);
        await updateLocation(user.uid, coords.lat, coords.lng);
      }, LOCATION_INTERVAL_ACTIVE_MS);
    })();

    return () => {
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, []);

  // Auto-fit map khi có cả 2 tọa độ
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
  }, [incident, volunteerLocation]);

  const handleGetDirections = () => {
    if (!incident) return;
    const { lat, lng } = incident.reporterLocation;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    Linking.openURL(url);
  };

  const handleComplete = async () => {
    if (!incidentId) return;
    Alert.alert(
      'Mark Complete?',
      'Confirm you have assisted the patient and the incident is resolved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            setCompleting(true);
            try {
              await completeIncident(incidentId);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to complete incident.');
              setCompleting(false);
            }
          },
        },
      ]
    );
  };

  const distance =
    incident && volunteerLocation
      ? getDistance(
          volunteerLocation.lat,
          volunteerLocation.lng,
          incident.reporterLocation.lat,
          incident.reporterLocation.lng
        )
      : null;

  if (!incident) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapViewComponent
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: incident.reporterLocation.lat,
          longitude: incident.reporterLocation.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Goong Map tiles */}
        <UrlTileComponent
          urlTemplate={`https://mt.goong.io/maps/{z}/{x}/{y}?api_key=${GOONG_MAP_KEY}`}
          maximumZ={20}
          flipY={false}
        />

        {/* Incident pin — đỏ */}
        <MarkerComponent
          coordinate={{
            latitude: incident.reporterLocation.lat,
            longitude: incident.reporterLocation.lng,
          }}
          title="Patient Location"
          pinColor={COLORS.alert}
        />

        {/* Volunteer dot — xanh */}
        {volunteerLocation && (
          <MarkerComponent
            coordinate={{
              latitude: volunteerLocation.lat,
              longitude: volunteerLocation.lng,
            }}
            title="Your Location"
          >
            <View style={styles.volunteerDot} />
          </MarkerComponent>
        )}
      </MapViewComponent>

      {/* Bottom info card */}
      <View style={styles.infoCard}>
        <View style={styles.distanceRow}>
          <Text style={styles.distanceText}>
            {distance !== null ? `${distance.toFixed(1)} km` : 'Calculating...'}
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>ACTIVE</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.directionsBtn} onPress={handleGetDirections}>
            <Text style={styles.directionsBtnText}>🧭 Get Directions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.completeBtn, completing && styles.btnDisabled]}
            onPress={handleComplete}
            disabled={completing}
          >
            {completing ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.completeBtnText}>✓ Mark Complete</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 15, color: COLORS.gray600 },
  volunteerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1565C0',
    borderWidth: 3,
    borderColor: COLORS.white,
    elevation: 4,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 12,
  },
  distanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  distanceText: { fontSize: 24, fontWeight: '700', color: COLORS.black900 },
  statusBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  statusBadgeText: { color: COLORS.primary, fontWeight: '700', fontSize: 12, letterSpacing: 1 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  directionsBtn: {
    flex: 1,
    height: 56,
    backgroundColor: '#E3F2FD',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1565C0',
  },
  directionsBtnText: { color: '#1565C0', fontSize: 15, fontWeight: '700' },
  completeBtn: {
    flex: 1,
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
});