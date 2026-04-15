import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getPatientPublicProfileUrl } from "../constants/config";
import { auth } from "../services/firebase";
import NfcManager, { NfcTech, Ndef } from "react-native-nfc-manager";

type NfcState = "ready" | "writing" | "error" | "success";

const BG_READY   = "#1892BE";
const BG_ERROR   = "#E53935";
const BG_SUCCESS = "#43A047";

const SUBTITLE_READY         = "Giữ điện thoại của bạn\ngần thẻ hoặc nhãn NFC.";
const SUBTITLE_WRITING       = "Giữ điện thoại ở vị trí cố định.";
const SUBTITLE_SUCCESS       = "URL hồ sơ y tế của bạn\nđã được lưu vào thẻ NFC.";
const SUBTITLE_WRITE_ERROR   = "Vui lòng thử lại và giữ\nđiện thoại gần thẻ hơn.";
const SUBTITLE_UNSUPPORTED   = "Thiết bị không hỗ trợ NFC.";

export default function NFCWrite() {
  const [nfcState, setNfcState]         = useState<NfcState>("ready");
  const [errorSubtitle, setErrorSubtitle] = useState("");
  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Hàm ghi NFC ─────────────────────────────────────────────
  const writeNFC = useCallback(async () => {
    setNfcState("writing");

    const uid = auth.currentUser?.uid;
    if (!uid) {
      setErrorSubtitle("Không xác định được tài khoản. Vui lòng đăng nhập lại.");
      setNfcState("error");
      return;
    }

    const url = getPatientPublicProfileUrl(uid);

    try {
      // Chờ user đưa điện thoại vào gần thẻ NFC
      await NfcManager.requestTechnology(NfcTech.Ndef);

      // Tạo NDEF message chứa URI record
      const bytes = Ndef.encodeMessage([Ndef.uriRecord(url)]);
      if (!bytes || bytes.length === 0) {
        throw new Error("Không tạo được NDEF payload.");
      }

      await NfcManager.ndefHandler.writeNdefMessage(bytes);
      setNfcState("success");

    } catch (err: any) {
      // Lỗi "cancelled" là do user thoát — không hiện lỗi
      const msg: string = err?.message ?? "";
      if (msg.includes("cancelled") || msg.includes("UserCancel")) {
        setNfcState("ready");
      } else {
        setErrorSubtitle(SUBTITLE_WRITE_ERROR);
        setNfcState("error");
      }
    } finally {
      // QUAN TRỌNG: luôn cancel technology request sau khi xong
      NfcManager.cancelTechnologyRequest();
    }
  }, []);

  // ─── Bootstrap khi mount ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      // Kiểm tra thiết bị có hỗ trợ NFC không
      const supported = await NfcManager.isSupported();
      if (cancelled) return;

      if (!supported) {
        setErrorSubtitle(SUBTITLE_UNSUPPORTED);
        setNfcState("error");
        return;
      }

      // Khởi động NFC manager — chỉ gọi 1 lần khi mount
      try {
        await NfcManager.start();
      } catch (err: any) {
        if (!cancelled) {
          // Nếu đã start rồi (AlreadyStarted) thì bỏ qua lỗi này
          const msg: string = err?.message ?? "";
          if (!msg.includes("already") && !msg.includes("Already")) {
            setErrorSubtitle(SUBTITLE_WRITE_ERROR);
            setNfcState("error");
            return;
          }
        }
      }

      if (cancelled) return;

      setNfcState("ready");
      // Tự động bắt đầu ghi sau 800ms (cho phép UI render xong)
      startTimerRef.current = setTimeout(() => {
        if (!cancelled) void writeNFC();
      }, 800);
    };

    void bootstrap();

    // Cleanup khi unmount
    return () => {
      cancelled = true;
      if (startTimerRef.current) {
        clearTimeout(startTimerRef.current);
        startTimerRef.current = null;
      }
      // Hủy request technology nếu đang chờ
      NfcManager.cancelTechnologyRequest();
    };
  }, [writeNFC]);

  // ─── Thử lại ─────────────────────────────────────────────────
  const handleRetry = async () => {
    setErrorSubtitle("");
    setNfcState("ready");

    const supported = await NfcManager.isSupported();
    if (!supported) {
      setErrorSubtitle(SUBTITLE_UNSUPPORTED);
      setNfcState("error");
      return;
    }

    // FIX: KHÔNG gọi NfcManager.start() lần 2.
    // Manager đã được start() trong useEffect bootstrap.
    // Chỉ cần gọi writeNFC() lại là đủ.
    setTimeout(() => void writeNFC(), 100);
  };

  // ─── Màu nền và nội dung theo state ──────────────────────────
  const shellBg =
    nfcState === "error"   ? BG_ERROR :
    nfcState === "success" ? BG_SUCCESS :
    BG_READY;

  const title =
    nfcState === "ready"   ? "Sẵn sàng" :
    nfcState === "writing" ? "Đang ghi ..." :
    nfcState === "error"   ? "Lỗi" :
    "Thành công";

  const subtitle =
    nfcState === "ready"   ? SUBTITLE_READY :
    nfcState === "writing" ? SUBTITLE_WRITING :
    nfcState === "error"   ? (errorSubtitle || SUBTITLE_WRITE_ERROR) :
    SUBTITLE_SUCCESS;

  return (
    <View style={[styles.shell, { backgroundColor: shellBg }]}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>

        {/* Nút quay lại */}
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        {/* Nội dung trung tâm */}
        <View style={styles.centerWrap}>
          {nfcState === "ready" && (
            <Image
              source={require("../assets/images/Patient-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          )}
          {nfcState === "writing" && (
            <ActivityIndicator size={64} color="#FFFFFF" />
          )}
          {nfcState === "error" && (
            <Ionicons name="warning-outline" size={90} color="#FFFFFF" />
          )}
          {nfcState === "success" && (
            <Ionicons name="checkmark-circle-outline" size={90} color="#FFFFFF" />
          )}

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {/* Nút Thử lại (chỉ hiện khi lỗi) */}
        {nfcState === "error" && (
          <TouchableOpacity
            style={styles.bottomBtn}
            onPress={() => void handleRetry()}
            activeOpacity={0.9}
          >
            <Text style={styles.bottomBtnTextError}>Thử lại</Text>
          </TouchableOpacity>
        )}

        {/* Nút Hoàn tất (chỉ hiện khi thành công) */}
        {nfcState === "success" && (
          <TouchableOpacity
            style={styles.bottomBtn}
            onPress={() => router.back()}
            activeOpacity={0.9}
          >
            <Text style={styles.bottomBtnTextSuccess}>Hoàn tất</Text>
          </TouchableOpacity>
        )}

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell:      { flex: 1 },
  safe:       { flex: 1 },
  backBtn: {
    position: "absolute",
    top: 16,
    left: 20,
    zIndex: 10,
    padding: 4,
  },
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  logo: { width: 120, height: 120 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 24,
  },
  subtitle: {
    fontSize: 15,
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 10,
  },
  bottomBtn: {
    position: "absolute",
    bottom: 48,
    left: 24,
    right: 24,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomBtnTextError:   { color: BG_ERROR,   fontSize: 16, fontWeight: "bold" },
  bottomBtnTextSuccess: { color: BG_SUCCESS, fontSize: 16, fontWeight: "bold" },
});
