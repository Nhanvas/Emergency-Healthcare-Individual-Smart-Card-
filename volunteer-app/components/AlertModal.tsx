import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
} from 'react-native';
import { COLORS, ALERT_COUNTDOWN_S } from '../constants';

const AnimatedView = Animated.View as any;

export interface AlertData {
  incidentId: string;
  distance: number;
  neighborhoodHint?: string;
  createdAt: number;
}

interface Props {
  visible: boolean;
  data: AlertData | null;
  onAccept: () => Promise<void>;
  onDecline: () => void;
}

export default function AlertModal({ visible, data, onAccept, onDecline }: Props) {
  const [countdown, setCountdown] = useState(ALERT_COUNTDOWN_S);
  const [loading, setLoading] = useState(false);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;
    setCountdown(ALERT_COUNTDOWN_S);
    setLoading(false);

    Vibration.vibrate([500, 500, 500, 500, 500], true);

    progressAnim.setValue(1);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: ALERT_COUNTDOWN_S * 1000,
      useNativeDriver: false,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    intervalRef.current = setInterval(() => {
      setCountdown((prev: number) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          Vibration.cancel();
          onDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalRef.current!);
      Vibration.cancel();
      pulseAnim.stopAnimation();
    };
  }, [visible]);

  const handleAccept = async () => {
    clearInterval(intervalRef.current!);
    Vibration.cancel();
    setLoading(true);
    await onAccept();
    setLoading(false);
  };

  const handleDecline = () => {
    clearInterval(intervalRef.current!);
    Vibration.cancel();
    onDecline();
  };

  if (!data) return null;

  const elapsedSeconds = Math.floor((Date.now() - data.createdAt) / 1000);
  const elapsedText =
    elapsedSeconds < 60
      ? `${elapsedSeconds}s ago`
      : `${Math.floor(elapsedSeconds / 60)}m ago`;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>🚨 EMERGENCY ALERT</Text>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <AnimatedView style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.icon}>🏥</Text>
            </AnimatedView>

            <Text style={styles.distanceText}>
              📍 {data.distance.toFixed(1)} km away
            </Text>

            {data.neighborhoodHint ? (
              <Text style={styles.neighborhoodText}>{data.neighborhoodHint}</Text>
            ) : null}

            <Text style={styles.elapsedText}>Reported {elapsedText}</Text>

            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>
                Respond in{' '}
                <Text style={[styles.countdownNumber, countdown <= 10 && styles.countdownUrgent]}>
                  {countdown}s
                </Text>
              </Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <AnimatedView
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: countdown <= 10 ? COLORS.alert : COLORS.primary,
                  },
                ]}
              />
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.declineBtn}
              onPress={handleDecline}
              disabled={loading}
            >
              <Text style={styles.declineBtnText}>DECLINE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.acceptBtn, loading && styles.btnDisabled]}
              onPress={handleAccept}
              disabled={loading}
            >
              <Text style={styles.acceptBtnText}>
                {loading ? 'Accepting...' : '✓ ACCEPT'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(192, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 20,
  },
  header: {
    backgroundColor: COLORS.alert,
    paddingVertical: 16,
    alignItems: 'center',
  },
  headerText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  body: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: { marginBottom: 12 },
  icon: { fontSize: 56 },
  distanceText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.black900,
    marginBottom: 4,
  },
  neighborhoodText: {
    fontSize: 16,
    color: COLORS.gray600,
    marginBottom: 4,
  },
  elapsedText: {
    fontSize: 14,
    color: COLORS.gray600,
    marginBottom: 16,
  },
  countdownContainer: { marginBottom: 8 },
  countdownText: { fontSize: 16, color: COLORS.black900 },
  countdownNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
  },
  countdownUrgent: { color: COLORS.alert },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.gray100,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  declineBtn: {
    flex: 1,
    paddingVertical: 18,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.gray100,
  },
  declineBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray600,
  },
  acceptBtn: {
    flex: 1,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  acceptBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
  },
  btnDisabled: { opacity: 0.6 },
});