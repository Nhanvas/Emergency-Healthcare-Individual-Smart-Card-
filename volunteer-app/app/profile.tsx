import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getCurrentUser, signOutVolunteer } from '../services/authService';
import { getVolunteerData, setOffline, VolunteerData } from '../services/volunteerService';
import { COLORS } from '../constants';

function InfoRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const user = getCurrentUser();
  const [volunteer, setVolunteer] = useState<VolunteerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!user) return;
    getVolunteerData(user.uid)
      .then(setVolunteer)
      .finally(() => setLoading(false));
  }, [user]);

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            // Set offline trước khi logout
            if (user) await setOffline(user.uid);
            await signOutVolunteer();
            router.replace('/login');
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to sign out.');
            setSigningOut(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {volunteer?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.volunteerName}>{volunteer?.name ?? '—'}</Text>
        <Text style={styles.volunteerEmail}>{user?.email ?? '—'}</Text>
      </View>

      {/* Info card */}
      <View style={styles.infoCard}>
        <InfoRow label="Organization" value={volunteer?.organization ?? '—'} />
        <InfoRow label="Phone" value={volunteer?.phone ?? '—'} />
        <InfoRow
          label="Status"
          value={volunteer?.isOnline ? 'Online' : 'Offline'}
          valueColor={volunteer?.isOnline ? COLORS.primary : COLORS.gray600}
        />
        <InfoRow label="Account" value="Red Cross Volunteer" />
      </View>

      {/* Note */}
      <View style={styles.noteBox}>
        <Text style={styles.noteText}>
          ℹ️ To update your profile, contact your Red Cross administrator.
        </Text>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutBtn, signingOut && styles.btnDisabled]}
        onPress={handleLogout}
        disabled={signingOut}
      >
        {signingOut ? (
          <ActivityIndicator color={COLORS.alert} />
        ) : (
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: 24, paddingBottom: 48 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
  },
  avatarText: { fontSize: 36, fontWeight: '800', color: COLORS.white },
  volunteerName: { fontSize: 22, fontWeight: '700', color: COLORS.black900, marginBottom: 4 },
  volunteerEmail: { fontSize: 14, color: COLORS.gray600 },
  infoCard: {
    backgroundColor: COLORS.gray100,
    borderRadius: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  infoLabel: { fontSize: 14, color: COLORS.gray600 },
  infoValue: { fontSize: 15, fontWeight: '600', color: COLORS.black900 },
  noteBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  noteText: { fontSize: 13, color: '#1565C0', lineHeight: 18 },
  logoutBtn: {
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.alert,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtnText: { color: COLORS.alert, fontSize: 16, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
});