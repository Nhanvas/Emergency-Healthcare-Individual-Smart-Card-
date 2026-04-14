import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, Linking, ActivityIndicator, Platform,
} from 'react-native';
import MapView, { Marker, UrlTile, AnimatedRegion } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { subscribeIncident, completeIncident, IncidentData } from '../../services/incidentService';
import { getCurrentUser } from '../../services/authService';
import { updateLocation } from '../../services/volunteerService';
import { useIncident } from '../../context/IncidentContext';
import { COLORS, GOONG_MAP_KEY, LOCATION_INTERVAL_ACTIVE_MS } from '../../constants';

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
  const router = useRouter();
  const user = getCurrentUser();
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const { activeIncidentId, setActiveIncidentId } = useIncident();

  const [incident, setIncident] = useState<IncidentData | null>(null);
  const [volunteerLocation, setVolunteerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [completing, setCompleting] = useState(false);

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
  useEffect(() => {
    if (!activeIncidentId) return;
    const unsub = subscribeIncident(activeIncidentId, (data) => {
      setIncident(data);
      if (data?.status === 'completed') {
        setActiveIncidentId(null);
        router.replace('/(tabs)/home');
      }
    });
    return unsub;
  }, [activeIncidentId]);

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
    const { lat, lng } = incident.reporterLocation;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    Linking.openURL(url);
  };

  const handleComplete = async () => {
    if (!activeIncidentId) return;
    Alert.alert(
      'Mark Complete?',
      'Confirm you have assisted the patient.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            setCompleting(true);
            try {
              await completeIncident(activeIncidentId);
              setActiveIncidentId(null);
            } catch (err: any) {
              Alert.alert('Error', err.message);
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
          volunteerLocation.lat, volunteerLocation.lng,
          incident.reporterLocation.lat, incident.reporterLocation.lng
        )
      : null;

  if (!activeIncidentId || !incident) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 48 }}>🗺️</Text>
        <Text style={styles.loadingText}>No active incident</Text>
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
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ✅ Styles (fix lỗi "styles not found")
const styles = StyleSheet.create({
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