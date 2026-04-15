import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COUNTDOWN_S = 30;

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
  const [countdown, setCountdown] = useState(COUNTDOWN_S);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(false);

  // Animated value cho progress bar: 1 = đầy, 0 = hết
  const progressAnim = useRef(new Animated.Value(1)).current;
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const clearAll = () => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
    if (elapsedInterval.current) {
      clearInterval(elapsedInterval.current);
      elapsedInterval.current = null;
    }
    if (animRef.current) {
      animRef.current.stop();
      animRef.current = null;
    }
  };

  useEffect(() => {
    if (!visible) {
      clearAll();
      setCountdown(COUNTDOWN_S);
      setElapsed(0);
      setLoading(false);
      progressAnim.setValue(1);
      return;
    }

    // Rung khi modal xuất hiện
    Vibration.vibrate([0, 400, 200, 400, 200, 400]);

    // Reset state
    setCountdown(COUNTDOWN_S);
    setLoading(false);
    progressAnim.setValue(1);

    // Tính elapsed dựa vào createdAt
    if (data?.createdAt) {
      const initial = Math.floor((Date.now() - data.createdAt) / 1000);
      setElapsed(initial);
      elapsedInterval.current = setInterval(() => {
        setElapsed((s) => s + 1);
      }, 1000);
    }

    // Progress bar animation: 30s từ 1 → 0
    animRef.current = Animated.timing(progressAnim, {
      toValue: 0,
      duration: COUNTDOWN_S * 1000,
      useNativeDriver: false,
    });
    animRef.current.start();

    // Countdown số đếm ngược
    countdownInterval.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearAll();
          Vibration.cancel();
          onDecline(); // timeout → tự decline
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      clearAll();
      Vibration.cancel();
    };
  }, [visible]);

  // Cleanup khi unmount
  useEffect(() => () => { clearAll(); Vibration.cancel(); }, []);

  const handleAccept = async () => {
    setLoading(true);
    clearAll();
    Vibration.cancel();
    try {
      await onAccept();
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    clearAll();
    Vibration.cancel();
    onDecline();
  };

  // Progress bar width: animated % string
  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const distance = data?.distance?.toFixed(1) ?? '?';

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      {/* Backdrop */}
      <View style={styles.backdrop}>
        {/* Card */}
        <View style={styles.card}>

          {/* ── HEADER ── */}
          <View style={styles.header}>
            <Ionicons name="warning-outline" size={44} color="#fff" style={styles.icon} />
            <Text style={styles.headerTitle}>SỰ CỐ KHẨN CẤP</Text>
            <Text style={styles.headerSub}>
              Báo khẩn cấp {elapsed}s trước
            </Text>
          </View>

          {/* ── PROGRESS BAR ── */}
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: barWidth }]} />
          </View>

          {/* ── BODY ── */}
          <View style={styles.body}>
            <Text style={styles.distance}>
              Khoảng cách: {distance} km
            </Text>
            <Text style={styles.responseLabel}>Thời gian phản hồi</Text>
            <Text style={styles.countdown}>{countdown}s</Text>

            {/* ── BUTTONS ── */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.btnDecline}
                onPress={handleDecline}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.btnDeclineText}>Từ chối</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnAccept, loading && styles.btnDisabled]}
                onPress={handleAccept}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.btnAcceptText}>Tiếp nhận</Text>
                }
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Backdrop
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Card
  card: {
    marginHorizontal: 24,
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 8,
  },

  // Header
  header: {
    backgroundColor: '#E53935',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
  headerSub: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.9,
    marginTop: 4,
    textAlign: 'center',
  },

  // Progress bar
  progressTrack: {
    height: 6,
    backgroundColor: '#FFCDD2',
    width: '100%',
  },
  progressFill: {
    height: 6,
    backgroundColor: '#E53935',
  },

  // Body
  body: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  distance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
  },
  responseLabel: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginTop: 8,
  },
  countdown: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#E53935',
    textAlign: 'center',
    marginTop: 4,
  },

  // Buttons
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  btnDecline: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#BDBDBD',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDeclineText: {
    color: '#757575',
    fontSize: 15,
    fontWeight: '600',
  },
  btnAccept: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnAcceptText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});