import { Stack } from 'expo-router';
import { IncidentProvider } from '../context/IncidentContext';

export default function RootLayout() {
  return (
    <IncidentProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="incident-tabs" />
        <Stack.Screen name="patient-info" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="history" />
      </Stack>
    </IncidentProvider>
  );
}