import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#D32F2F",
        headerShown: false,
      }}
    >
      <Tabs.Screen name="profile" options={{ title: "Ho so" }} />
      <Tabs.Screen name="qr-code" options={{ title: "Ma QR" }} />
      <Tabs.Screen name="settings" options={{ title: "Cai dat" }} />
    </Tabs>
  );
}