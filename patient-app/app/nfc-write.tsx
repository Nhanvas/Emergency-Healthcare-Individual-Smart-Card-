import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator
} from "react-native";
import { router } from "expo-router";
import { BYSTANDER_DOMAIN } from "../constants/config";
import { auth } from "../services/firebase";
import NfcManager, { NfcTech, Ndef } from "react-native-nfc-manager";

type NFCState = "checking" | "ready" | "writing" | "success" | "error" | "unsupported";

export default function NFCWrite() {
  const [nfcState, setNfcState] = useState<NFCState>("checking");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    checkNFC();
    return () => { NfcManager.cancelTechnologyRequest(); };
  }, []);

  const checkNFC = async () => {
    const supported = await NfcManager.isSupported();
    if (!supported) {
      setNfcState("unsupported");
      return;
    }
    await NfcManager.start();
    setNfcState("ready");
  };

  const handleWrite = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const url = `${BYSTANDER_DOMAIN}/patient/${uid}`;

    try {
      setNfcState("writing");
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const bytes = Ndef.encodeMessage([Ndef.uriRecord(url)]);
      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
      }
      setNfcState("success");
    } catch (e: any) {
      setErrorMsg("Ghi thất bại. Thử lại nhé.");
      setNfcState("error");
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Quay lại</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Ghi thẻ NFC</Text>

      {/* State: checking */}
      {nfcState === "checking" && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#D32F2F" />
          <Text style={styles.stateText}>Đang kiểm tra NFC...</Text>
        </View>
      )}

      {/* State: ready */}
      {nfcState === "ready" && (
        <View style={styles.center}>
          <Text style={styles.nfcIcon}>📡</Text>
          <Text style={styles.stateText}>Sẵn sàng ghi thẻ NFC</Text>
          <Text style={styles.stateSubtext}>
            Nhấn nút bên dưới rồi chạm điện thoại vào thẻ NFC
          </Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={handleWrite}>
            <Text style={styles.btnText}>Bắt đầu ghi</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* State: writing */}
      {nfcState === "writing" && (
        <View style={styles.center}>
          <View style={styles.pulseContainer}>
            <Text style={styles.nfcIcon}>📡</Text>
          </View>
          <Text style={styles.stateText}>Đang ghi...</Text>
          <Text style={styles.stateSubtext}>
            Giữ điện thoại gần thẻ NFC cho đến khi hoàn tất
          </Text>
        </View>
      )}

      {/* State: success */}
      {nfcState === "success" && (
        <View style={styles.center}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.stateText}>Ghi thẻ thành công!</Text>
          <Text style={styles.stateSubtext}>
            Thẻ NFC đã được lập trình với thông tin khẩn cấp của bạn
          </Text>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.replace("/(tabs)/qr-code" as any)}
          >
            <Text style={styles.btnText}>Xem mã QR</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* State: error */}
      {nfcState === "error" && (
        <View style={styles.center}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.stateText}>Ghi thất bại</Text>
          <Text style={styles.stateSubtext}>{errorMsg}</Text>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => setNfcState("ready")}
          >
            <Text style={styles.btnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* State: unsupported */}
      {nfcState === "unsupported" && (
        <View style={styles.center}>
          <Text style={styles.errorIcon}>📵</Text>
          <Text style={styles.stateText}>Thiết bị không hỗ trợ NFC</Text>
          <Text style={styles.stateSubtext}>
            Bạn vẫn có thể dùng mã QR thay thế
          </Text>
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.replace("/(tabs)/qr-code" as any)}
          >
            <Text style={styles.btnSecondaryText}>Dùng mã QR</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 24, paddingTop: 48 },
  backBtn: { marginBottom: 16 },
  backText: { color: "#D32F2F", fontSize: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#D32F2F", marginBottom: 32 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  nfcIcon: { fontSize: 80 },
  successIcon: { fontSize: 80 },
  errorIcon: { fontSize: 80 },
  stateText: { fontSize: 20, fontWeight: "bold", color: "#212121", textAlign: "center" },
  stateSubtext: { fontSize: 15, color: "#757575", textAlign: "center", lineHeight: 22, paddingHorizontal: 16 },
  pulseContainer: { alignItems: "center", justifyContent: "center" },
  btnPrimary: {
    backgroundColor: "#D32F2F", height: 56, borderRadius: 8,
    justifyContent: "center", alignItems: "center",
    width: "100%", marginTop: 8
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  btnSecondary: {
    height: 56, borderRadius: 8, borderWidth: 2, borderColor: "#D32F2F",
    justifyContent: "center", alignItems: "center", width: "100%", marginTop: 8
  },
  btnSecondaryText: { color: "#D32F2F", fontSize: 16, fontWeight: "bold" },
});