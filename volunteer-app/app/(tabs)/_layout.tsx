import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { COLORS } from '../../constants';
import { useIncident } from '../../context/IncidentContext';

export default function TabsLayout() {
  const { activeIncidentId } = useIncident();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray600,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
          borderTopColor: '#E0E0E0',
          backgroundColor: COLORS.white,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🗺️</Text>,
          // Ẩn tab Map khi không có active incident
          tabBarItemStyle: activeIncidentId ? {} : { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>📋</Text>,
        }}
      />
    </Tabs>
  );
}