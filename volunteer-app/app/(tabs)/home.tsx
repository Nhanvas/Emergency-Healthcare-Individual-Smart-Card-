import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { getCurrentUser } from '../../services/authService';
import {
  getVolunteerData,
  setOnline,
  setOffline,
  updateLocation,
  saveFCMToken,
  VolunteerData,
} from '../../services/volunteerService';
import { acceptIncident } from '../../services/incidentService';
import AlertModal, { AlertData } from '../../components/AlertModal';
import { useIncident } from '../../context/IncidentContext';
import {
  LOCATION_INTERVAL_IDLE_MS,
  LOCATION_INTERVAL_ACTIVE_MS,
} from '../../constants';

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

  // FIX 4: lấy thêm setActivePatientData từ context
  const { setActiveIncidentId, setActivePatientData } = useIncident();

  const [volunteer, setVolunteer] = useState<VolunteerData | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState<AlertData | null>(null);

  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load thông tin volunteer
  useEffect(() => {
    if (!user) return;
    getVolunteerData(user.uid).then((data) => {
      if (data) { setVolunteer(data); setIsOnline(data.isOnline); }
    });
  }, [user]);

  // Lấy FCM token khi mount
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return;
        const tokenData = await Notifications.getDevicePushTokenAsync();
        await saveFCMToken(user.uid, tokenData.data);
      } catch (err) {
        console.warn('FCM token error:', err);
      }
    })();
  }, [user]);

  // Lắng nghe FCM — foreground + background
  useEffect(() => {
    const fgSub = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data as any;
      if (data?.type === 'incident') {
        setAlertData({
          incidentId: data.incidentId,
          distance: parseFloat(data.distance) || 0,
          createdAt: Date.now(),
        });
        setAlertVisible(true);
      }
    });

    const bgSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as any;
      if (data?.type === 'incident') {
        setAlertData({
          incidentId: data.incidentId,
          distance: parseFloat(data.distance) || 0,
          createdAt: Date.now(),
        });
        setAlertVisible(true);
      }
    });

    return () => { fgSub.remove(); bgSub.remove(); };
  }, []);

  // Location interval management
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

  // Toggle Online/Offline
  const handleToggle = async () => {
    if (!user || toggling) return;
    setToggling(true);
    try {
      if (!isOnline) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Cần quyền vị trí', 'Vui lòng bật quyền vị trí trong Cài đặt.');
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
        setActiveIncidentId(null);
        setActivePatientData(null);
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể cập nhật trạng thái.');
    } finally {
      setToggling(false);
    }
  };

  // FIX 4: handleAccept — lưu patientData vào context, navigate thẳng đến map
  const handleAccept = async () => {
    if (!alertData || !user) return;
    try {
      const result = await acceptIncident(alertData.incidentId, user.uid);

      if (result.success) {
        setAlertVisible(false);
        setAlertData(null);

        // Lưu cả incidentId lẫn patientData vào context
        setActiveIncidentId(alertData.incidentId);
        setActivePatientData(result.patientData ?? null);

        startLocationInterval(true);
<<<<<<< HEAD

        // Navigate thẳng đến tab Bản đồ (= Patient Report screen)
        // Không cần incident-tabs.tsx nữa
        router.replace('/(tabs)/map');

=======
        // Dung replace de tranh tab navigator chen ngang
        router.push({
          pathname: '/incident-tabs',
          params: {
            incidentId: alertData.incidentId,
            patientData: JSON.stringify(result.patientData ?? {}),
          },
        });
>>>>>>> a69939ef88a13c9e04e846f016ccd2bf8097e9df
      } else if (result.error === 'already_taken') {
        setAlertVisible(false);
        setAlertData(null);
        Alert.alert('Đã có người nhận', 'Sự cố này đã được tình nguyện viên khác tiếp nhận.');
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể tiếp nhận sự cố.');
    }
  };

  const initial = volunteer?.name?.[0]?.toUpperCase() ?? 'T';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trang chủ</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <Text style={styles.volunteerName} numberOfLines={1}>
              {volunteer?.name ?? 'Tình nguyện viên'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.togglePill, isOnline ? styles.pillOnline : styles.pillOffline]}
            onPress={handleToggle}
            disabled={toggling}
            activeOpacity={0.8}
          >
            <View style={[styles.pillDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
            <Text style={styles.pillText}>{isOnline ? 'Online' : 'Offline'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── BIG CIRCLE ── */}
      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.bigCircle, isOnline ? styles.circleOnline : styles.circleOffline]}
          onPress={handleToggle}
          disabled={toggling}
          activeOpacity={0.85}
        >
          {toggling ? (
            <ActivityIndicator color={isOnline ? '#fff' : '#757575'} size="large" />
          ) : isOnline ? (
            <>
              <Text style={styles.circleTextOnline}>ONLINE</Text>
              <Text style={styles.circleSubOnline}>Sẵn sàng</Text>
            </>
          ) : (
            <>
              <Text style={styles.circleTextOffline}>OFFLINE</Text>
              <Text style={styles.circleSubOffline}>Chạm để Online</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── ALERT MODAL ── */}
      <AlertModal
        visible={alertVisible}
        data={alertData}
        onAccept={handleAccept}
        onDecline={() => { setAlertVisible(false); setAlertData(null); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#E53935', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  avatarText: { color: '#E53935', fontSize: 18, fontWeight: 'bold' },
  volunteerName: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1 },
  togglePill: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, flexShrink: 0 },
  pillOffline: { backgroundColor: 'rgba(255,255,255,0.25)' },
  pillOnline: { backgroundColor: '#4CAF50' },
  pillDot: { width: 10, height: 10, borderRadius: 5 },
  dotOffline: { backgroundColor: '#9E9E9E' },
  dotOnline: { backgroundColor: '#fff' },
  pillText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bigCircle: { width: 220, height: 220, borderRadius: 110, justifyContent: 'center', alignItems: 'center' },
  circleOffline: { backgroundColor: '#E0E0E0' },
  circleOnline: { backgroundColor: '#4CAF50' },
  circleTextOffline: { color: '#757575', fontSize: 28, fontWeight: 'bold', letterSpacing: 2 },
  circleSubOffline: { color: '#9E9E9E', fontSize: 14, marginTop: 8 },
  circleTextOnline: { color: '#fff', fontSize: 28, fontWeight: 'bold', letterSpacing: 2 },
  circleSubOnline: { color: '#fff', fontSize: 14, marginTop: 8, opacity: 0.9 },
});
