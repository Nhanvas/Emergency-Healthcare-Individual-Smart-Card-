import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { getCurrentUser } from '../../services/authService';
import {
  getVolunteerData, setOnline, setOffline,
  updateLocation, saveFCMToken, VolunteerData,
} from '../../services/volunteerService';
import { acceptIncident } from '../../services/incidentService';
import AlertModal, { AlertData } from '../../components/AlertModal';
import { useIncident } from '../../context/IncidentContext';
import { COLORS, LOCATION_INTERVAL_IDLE_MS, LOCATION_INTERVAL_ACTIVE_MS } from '../../constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function HomeScreen() {
  const router = useRouter();
  const user = getCurrentUser();
  const { setActiveIncidentId } = useIncident();

  const [volunteer, setVolunteer] = useState<VolunteerData | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState<AlertData | null>(null);

  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) return;
    getVolunteerData(user.uid).then((data) => {
      if (data) { setVolunteer(data); setIsOnline(data.isOnline); }
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return;
        const tokenData = await Notifications.getDevicePushTokenAsync();
        await saveFCMToken(user.uid, tokenData.data);
      } catch (err) { console.warn('FCM token error:', err); }
    })();
  }, [user]);

  useEffect(() => {
    const foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data as any;
      if (data?.type === 'incident') {
        setAlertData({
          incidentId: data.incidentId,
          distance: parseFloat(data.distance) || 0,
          neighborhoodHint: data.neighborhoodHint,
          createdAt: Date.now(),
        });
        setAlertVisible(true);
      }
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as any;
      if (data?.type === 'incident') {
        setAlertData({
          incidentId: data.incidentId,
          distance: parseFloat(data.distance) || 0,
          neighborhoodHint: data.neighborhoodHint,
          createdAt: Date.now(),
        });
        setAlertVisible(true);
      }
    });

    return () => { foregroundSub.remove(); responseSub.remove(); };
  }, []);

  const handleToggleOnline = async () => {
    if (!user || toggling) return;
    setToggling(true);
    try {
      if (!isOnline) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Location Required', 'Please enable location permission in Settings.');
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const tokenData = await Notifications.getDevicePushTokenAsync();
        await setOnline(user.uid, loc.coords.latitude, loc.coords.longitude, tokenData.data);
        setIsOnline(true);
        startLocationInterval(false);
      } else {
        stopLocationInterval();
        await setOffline(user.uid);
        setIsOnline(false);
        setActiveIncidentId(null); // clear khi offline
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update status.');
    } finally {
      setToggling(false);
    }
  };

  const startLocationInterval = (isActive: boolean) => {
    stopLocationInterval();
    const interval = isActive ? LOCATION_INTERVAL_ACTIVE_MS : LOCATION_INTERVAL_IDLE_MS;
    locationIntervalRef.current = setInterval(async () => {
      if (!user) return;
      try {
        const loc = await Location.getCurrentPositionAsync({});
        await updateLocation(user.uid, loc.coords.latitude, loc.coords.longitude);
      } catch (_) {}
    }, interval);
  };

  const stopLocationInterval = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
  };

  useEffect(() => () => stopLocationInterval(), []);

  const handleAccept = async () => {
    if (!alertData || !user) return;
    try {
      const result = await acceptIncident(alertData.incidentId, user.uid);
      if (result.success && result.patientId) {
        setAlertVisible(false);
        setActiveIncidentId(alertData.incidentId); // ← set context
        startLocationInterval(true);
        // Dung replace de tranh tab navigator chen ngang
        router.push({
          pathname: '/incident-tabs',
          params: {
            incidentId: alertData.incidentId,
            patientData: JSON.stringify(result.patientData ?? {}),
          },
        });
      } else if (result.error === 'already_taken') {
        setAlertVisible(false);
        Alert.alert('Too Late', 'This incident has already been claimed by another volunteer.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to accept incident.');
    }
  };

  const handleDecline = () => { setAlertVisible(false); setAlertData(null); };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Volunteer Dashboard</Text>
        <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileBtn}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {volunteer && (
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.volunteerName}>{volunteer.name}</Text>
            <Text style={styles.orgText}>{volunteer.organization}</Text>
          </View>
        )}

        <View style={styles.toggleSection}>
          <Text style={styles.toggleLabel}>
            {isOnline ? 'You are ONLINE' : 'You are OFFLINE'}
          </Text>
          <Text style={styles.toggleHint}>
            {isOnline
              ? 'Receiving emergency alerts in your area'
              : 'Tap to start receiving emergency alerts'}
          </Text>

          <TouchableOpacity
            style={[styles.toggleCircle, isOnline ? styles.toggleCircleOnline : styles.toggleCircleOffline]}
            onPress={handleToggleOnline}
            disabled={toggling}
            activeOpacity={0.8}
          >
            {toggling ? (
              <ActivityIndicator color={COLORS.white} size="large" />
            ) : (
              <>
                <Text style={styles.toggleIcon}>{isOnline ? '✓' : '○'}</Text>
                <Text style={styles.toggleStateText}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {!isOnline && (
          <View style={styles.infoNote}>
            <Text style={styles.infoNoteText}>
              ℹ️ Go online to receive emergency alerts from bystanders near you.
            </Text>
          </View>
        )}
      </ScrollView>

      <AlertModal
        visible={alertVisible}
        data={alertData}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    backgroundColor: COLORS.primary, elevation: 4,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  profileBtn: { padding: 4 },
  profileIcon: { fontSize: 26 },
  content: { padding: 20, alignItems: 'center' },
  welcomeCard: {
    width: '100%', backgroundColor: COLORS.primaryLight, borderRadius: 14,
    padding: 16, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: COLORS.primary,
  },
  welcomeText: { fontSize: 13, color: COLORS.gray600 },
  volunteerName: { fontSize: 20, fontWeight: '700', color: COLORS.primary, marginTop: 2 },
  orgText: { fontSize: 13, color: COLORS.gray600, marginTop: 2 },
  toggleSection: { alignItems: 'center', marginBottom: 28 },
  toggleLabel: { fontSize: 18, fontWeight: '700', color: COLORS.black900, marginBottom: 4 },
  toggleHint: {
    fontSize: 13, color: COLORS.gray600, textAlign: 'center',
    marginBottom: 24, paddingHorizontal: 20,
  },
  toggleCircle: {
    width: 160, height: 160, borderRadius: 80,
    justifyContent: 'center', alignItems: 'center', elevation: 6,
  },
  toggleCircleOnline: { backgroundColor: COLORS.primary },
  toggleCircleOffline: { backgroundColor: COLORS.gray600 },
  toggleIcon: { fontSize: 40, color: COLORS.white, marginBottom: 4 },
  toggleStateText: { fontSize: 15, fontWeight: '800', color: COLORS.white, letterSpacing: 2 },
  infoNote: {
    width: '100%', backgroundColor: '#E3F2FD', borderRadius: 10, padding: 12, marginTop: 4,
  },
  infoNoteText: { fontSize: 13, color: '#1565C0', lineHeight: 18 },
});