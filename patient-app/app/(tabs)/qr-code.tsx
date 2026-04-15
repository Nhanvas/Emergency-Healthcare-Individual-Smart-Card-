import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Share,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system/legacy";
import { captureRef } from "react-native-view-shot";
import { router } from "expo-router";
import { auth } from "../../services/firebase";
import { getPatient } from "../../services/patientService";
import { BYSTANDER_DOMAIN } from "../../constants/config";

// ─── Types ────────────────────────────────────────────────────
type PatientDoc = {
  fullName?: string;
};

// QRCode SVG ref type — dùng inline thay vì MutableRefObject vì React 19
// đã thay đổi cách export các generic ref types
type QrSvgRef = { toDataURL: (cb: (data: string) => void) => void } | null;

// ─── Helper: lưu QR vào gallery qua base64 data URL ──────────
function saveQrPngViaDataUrl(svgRef: React.RefObject<QrSvgRef>): Promise<void> {
  return new Promise((resolve, reject) => {
    const ref = svgRef.current;
    if (!ref?.toDataURL) {
      reject(new Error("QR ref unavailable"));
      return;
    }
    ref.toDataURL(async (dataURL: string) => {
      try {
        const base = FileSystem.cacheDirectory ?? "";
        const tempUri = `${base}qr_${Date.now()}.png`;
        await FileSystem.writeAsStringAsync(tempUri, dataURL, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await MediaLibrary.saveToLibraryAsync(tempUri);
        Alert.alert("Đã lưu", "Mã QR đã được lưu vào thư viện ảnh.");
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  });
}

// ─── Main component ───────────────────────────────────────────
export default function QRCodeScreen() {
  const [patient, setPatient] = useState<PatientDoc | null>(null);
  const [loading, setLoading]  = useState(true);
  const [saving,  setSaving]   = useState(false);

  const shotRef  = useRef<View>(null);
  // useRef<T>(null) trong React 19 trả về RefObject<T> — không cần MutableRefObject
  const qrSvgRef = useRef<QrSvgRef>(null);

  const uid = auth.currentUser?.uid ?? "";

  // ── Build QR URL từ BYSTANDER_DOMAIN + uid ──────────────────
  // Luôn tự build thay vì lấy qrUrl từ Firestore:
  //   - Đảm bảo URL luôn đúng kể cả khi user đăng ký từ lúc chưa có field qrUrl
  //   - Domain thay đổi chỉ cần sửa 1 chỗ (constants/config.ts)
  const qrUrl = uid ? `${BYSTANDER_DOMAIN}/patient/${uid}` : "";

  const profileIncomplete = !uid || !patient || !patient.fullName?.trim();

  useEffect(() => {
    const load = async () => {
      try {
        const data = (await getPatient()) as PatientDoc | null;
        setPatient(data);
      } catch {
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Download QR ──────────────────────────────────────────────
  const handleDownload = async () => {
    if (!qrUrl) return;
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Cần quyền truy cập", "Vui lòng cho phép truy cập thư viện ảnh.");
      return;
    }
    setSaving(true);
    try {
      // Ưu tiên: chụp screenshot view chứa QR (bao gồm cả bracket corners)
      if (shotRef.current && Platform.OS !== "web") {
        try {
          const uri = await captureRef(shotRef, { format: "png", quality: 1 });
          await MediaLibrary.saveToLibraryAsync(uri);
          Alert.alert("Đã lưu", "Mã QR đã được lưu vào thư viện ảnh.");
          return;
        } catch {
          // Fallback sang SVG export nếu captureRef thất bại
        }
      }
      await saveQrPngViaDataUrl(qrSvgRef);
    } catch {
      Alert.alert("Lỗi", "Không thể lưu ảnh. Thử lại.");
    } finally {
      setSaving(false);
    }
  };

  // ── Share QR URL ─────────────────────────────────────────────
  const handleShare = async () => {
    if (!qrUrl) return;
    try {
      await Share.share({ message: qrUrl });
    } catch {
      /* user dismissed */
    }
  };

  // ── Loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safeRoot} edges={["top"]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#1892BE" />
        </View>
      </SafeAreaView>
    );
  }

  // ── Profile chưa hoàn thiện ───────────────────────────────────
  if (profileIncomplete) {
    return (
      <SafeAreaView style={styles.safeRoot} edges={["top"]}>
        <View style={styles.incompleteWrap}>
          <Text style={styles.incompleteText}>
            Vui lòng hoàn thiện hồ sơ trước
          </Text>
          <TouchableOpacity
            style={styles.incompleteBtn}
            onPress={() => router.push("/patient-form")}
            activeOpacity={0.85}
          >
            <Text style={styles.incompleteBtnText}>Điền hồ sơ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main QR screen ────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeRoot} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerSide}>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Quay lại"
            >
              <Ionicons name="arrow-back" size={24} color="#212121" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerTitle}>Mã QR của bạn</Text>
          <View style={[styles.headerSide, styles.headerSideRight]}>
            <TouchableOpacity
              onPress={() => router.push("/patient-form")}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Chỉnh sửa hồ sơ"
            >
              <Ionicons name="pencil-outline" size={22} color="#212121" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* QR code với bracket corners — view này sẽ được chụp khi Download */}
        <View ref={shotRef} style={styles.qrCapture} collapsable={false}>
          <View style={[styles.bracket, styles.bracketTL]} />
          <View style={[styles.bracket, styles.bracketTR]} />
          <View style={[styles.bracket, styles.bracketBL]} />
          <View style={[styles.bracket, styles.bracketBR]} />
          <View style={styles.qrInner}>
            <QRCode
              value={qrUrl}
              size={220}
              color="#000000"
              backgroundColor="#FFFFFF"
              getRef={(c) => {
                qrSvgRef.current = c;
              }}
            />
          </View>
        </View>

        <Text style={styles.description}>
          Người xung quanh có thể quét mã này để truy cập hồ sơ y tế và điều phối hỗ trợ khẩn cấp.
        </Text>

        {/* Nút Tải mã QR */}
        <TouchableOpacity
          style={[styles.btnPrimary, saving && styles.btnDisabled]}
          onPress={handleDownload}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.btnDownloadInner}>
              <Ionicons name="download-outline" size={20} color="#FFFFFF" />
              <Text style={styles.btnPrimaryText}>Tải mã QR</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Nút Ghi thẻ NFC */}
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push("/nfc-write")}
          activeOpacity={0.85}
        >
          <Text style={styles.btnNfcText}>Ghi thẻ NFC</Text>
        </TouchableOpacity>

        {/* Nút Chia sẻ */}
        <TouchableOpacity
          style={styles.btnShare}
          onPress={handleShare}
          activeOpacity={0.85}
        >
          <Text style={styles.btnShareText}>Chia sẻ mã QR</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeRoot: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  incompleteWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  incompleteText: {
    fontSize: 16,
    color: "#212121",
    textAlign: "center",
    marginBottom: 20,
  },
  incompleteBtn: {
    backgroundColor: "#1892BE",
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  incompleteBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSide: {
    width: 40,
    justifyContent: "center",
  },
  headerSideRight: {
    alignItems: "flex-end",
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#212121",
    textAlign: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: "center",
    paddingBottom: 32,
  },
  qrCapture: {
    width: 260,
    height: 260,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    position: "relative",
  },
  bracket: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "#212121",
  },
  bracketTL: { top: 0,    left: 0,  borderTopWidth: 3,    borderLeftWidth: 3  },
  bracketTR: { top: 0,    right: 0, borderTopWidth: 3,    borderRightWidth: 3 },
  bracketBL: { bottom: 0, left: 0,  borderBottomWidth: 3, borderLeftWidth: 3  },
  bracketBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  qrInner: {
    ...StyleSheet.absoluteFillObject,
    margin: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  description: {
    fontSize: 14,
    color: "#757575",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 20,
    marginBottom: 32,
    width: "100%",
  },
  btnPrimary: {
    backgroundColor: "#1892BE",
    height: 52,
    borderRadius: 8,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  btnDownloadInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  btnNfcText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  btnShare: {
    backgroundColor: "#EEEEEE",
    height: 52,
    borderRadius: 8,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  btnShareText: {
    color: "#9E9E9E",
    fontSize: 16,
    fontWeight: "600",
  },
});
