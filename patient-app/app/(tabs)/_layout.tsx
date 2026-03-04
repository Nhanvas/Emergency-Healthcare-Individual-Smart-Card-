import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#D32F2F" }}>
      <Tabs.Screen name="profile" options={{ title: "Hồ sơ" }} />
      <Tabs.Screen name="qr-code" options={{ title: "Mã QR" }} />
    </Tabs>
  );
}