import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { User } from 'firebase/auth';
import { subscribeAuthState } from '../services/authService';

export default function RootLayout() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsub = subscribeAuthState((firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (user === undefined) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const inLogin = segments[0] === 'login';

    if (!user && !inLogin) {
      router.replace('/login');
    } else if (user && !inTabsGroup) {
      router.replace('/(tabs)/home');
    }
  }, [user, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="patient-info"
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Patient Information',
          headerStyle: { backgroundColor: '#C00000' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: true,
          title: 'Profile & Settings',
          headerStyle: { backgroundColor: '#2E7D32' },
          headerTintColor: '#FFFFFF',
        }}
      />
    </Stack>
  );
}