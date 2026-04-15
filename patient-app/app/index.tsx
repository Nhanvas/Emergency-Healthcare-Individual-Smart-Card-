import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../services/firebase";

const SPLASH_MIN_MS = 2000;

export default function Index() {
  const [minSplashElapsed, setMinSplashElapsed] = useState(false);
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => setMinSplashElapsed(true), SPLASH_MIN_MS);
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
    });
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!minSplashElapsed || user === undefined) return;
    if (user) {
      router.replace("/(tabs)/profile");
    } else {
      router.replace("/login");
    }
  }, [minSplashElapsed, user]);

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1892BE"
        translucent={false}
      />
      <Image
        source={require("../assets/images/Patient-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.appName}>EHIS CARD</Text>
      <ActivityIndicator
        color="white"
        size="large"
        style={styles.spinner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#1892BE",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 180,
  },
  appName: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 6,
    marginTop: 16,
  },
  spinner: {
    marginTop: 40,
  },
});
