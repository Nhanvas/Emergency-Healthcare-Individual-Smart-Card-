# EMERGENCY RESPONSE SYSTEM — AUDIT REPORT

> Tự động tạo bởi `run_audit.sh`
> Mục tiêu debug:
> - **Bug 1:** NFC ghi profile từ Patient App không hoạt động
> - **Bug 2:** History không hiện sau khi Complete Incident (Volunteer App)

Wed, Apr 15, 2026  9:13:57 AM

# PHẦN 1: PACKAGE.JSON (kiểm tra NFC + media-library + Firestore packages)

---
## 📄 Patient App — package.json
`patient-app/package.json`

```
{
  "name": "patient-app",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "reset-project": "node ./scripts/reset-project.js",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint"
  },
  "dependencies": {
    "@expo/vector-icons": "^15.0.3",
    "@react-native-async-storage/async-storage": "2.2.0",
    "@react-native-community/datetimepicker": "8.4.4",
    "@react-navigation/bottom-tabs": "^7.4.0",
    "@react-navigation/elements": "^2.6.3",
    "@react-navigation/native": "^7.1.8",
    "expo": "~54.0.33",
    "expo-constants": "~18.0.13",
    "expo-file-system": "~19.0.21",
    "expo-font": "~14.0.11",
    "expo-haptics": "~15.0.8",
    "expo-image": "~3.0.11",
    "expo-linking": "~8.0.11",
    "expo-media-library": "~18.2.1",
    "expo-router": "~6.0.23",
    "expo-sharing": "~14.0.8",
    "expo-splash-screen": "~31.0.13",
    "expo-status-bar": "~3.0.9",
    "expo-symbols": "~1.0.8",
    "expo-system-ui": "~6.0.9",
    "expo-web-browser": "~15.0.10",
    "firebase": "^12.10.0",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-nfc-manager": "^3.17.2",
    "react-native-qrcode-svg": "^6.3.21",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-svg": "15.12.1",
    "react-native-view-shot": "4.0.3",
    "react-native-web": "~0.21.0",
    "react-native-worklets": "0.5.1"
  },
  "devDependencies": {
    "@types/react": "~19.1.0",
    "eslint": "^9.25.0",
    "eslint-config-expo": "~10.0.0",
    "typescript": "~5.9.2"
  },
  "private": true
}

```

---
## 📄 Volunteer App — package.json
`volunteer-app/package.json`

```
{
  "name": "volunteer-app",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "reset-project": "node ./scripts/reset-project.js",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint"
  },
  "dependencies": {
    "@expo/vector-icons": "^15.0.3",
    "@react-native-async-storage/async-storage": "2.2.0",
    "@react-navigation/bottom-tabs": "^7.4.0",
    "@react-navigation/elements": "^2.6.3",
    "@react-navigation/native": "^7.1.8",
    "expo": "~54.0.33",
    "expo-constants": "~18.0.13",
    "expo-dev-client": "~6.0.20",
    "expo-font": "~14.0.11",
    "expo-haptics": "~15.0.8",
    "expo-image": "~3.0.11",
    "expo-linking": "~8.0.11",
    "expo-location": "^55.1.2",
    "expo-notifications": "~0.32.16",
    "expo-router": "~6.0.23",
    "expo-splash-screen": "~31.0.13",
    "expo-status-bar": "~3.0.9",
    "expo-symbols": "~1.0.8",
    "expo-system-ui": "~6.0.9",
    "expo-web-browser": "~15.0.10",
    "firebase": "^12.10.0",
    "geofire-common": "^6.0.0",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-maps": "1.20.1",
    "react-native-pager-view": "6.9.1",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-web": "~0.21.0",
    "react-native-worklets": "0.5.1"
  },
  "devDependencies": {
    "@types/react": "~19.1.0",
    "@types/react-native": "^0.72.8",
    "eslint": "^9.25.0",
    "eslint-config-expo": "~10.0.0",
    "typescript": "~5.9.2"
  },
  "private": true
}

```

# PHẦN 2: CẤU TRÚC FOLDER

---
## 🗂️ CẤU TRÚC THƯ MỤC: patient-app/app
```
patient-app/app
patient-app/app/(tabs)
patient-app/app/(tabs)/_layout.tsx
patient-app/app/(tabs)/profile.tsx
patient-app/app/(tabs)/qr-code.tsx
patient-app/app/(tabs)/settings.tsx
patient-app/app/_layout.tsx
patient-app/app/index.tsx
patient-app/app/login.tsx
patient-app/app/nfc-write.tsx
patient-app/app/patient-form.tsx
patient-app/app/register.tsx
```

---
## 🗂️ CẤU TRÚC THƯ MỤC: patient-app/components (nếu có)
```
patient-app/components
```

---
## 🗂️ CẤU TRÚC THƯ MỤC: patient-app/services (nếu có)
```
patient-app/services
patient-app/services/authService.ts
patient-app/services/firebase.ts
patient-app/services/patientService.ts
```

---
## 🗂️ CẤU TRÚC THƯ MỤC: patient-app/constants (nếu có)
```
patient-app/constants
patient-app/constants/colors.js
patient-app/constants/config.ts
```


---
## 🗂️ CẤU TRÚC THƯ MỤC: volunteer-app/app
```
volunteer-app/app
volunteer-app/app/(tabs)
volunteer-app/app/(tabs)/_layout.tsx
volunteer-app/app/(tabs)/history.tsx
volunteer-app/app/(tabs)/home.tsx
volunteer-app/app/(tabs)/map.tsx
volunteer-app/app/(tabs)/settings.tsx
volunteer-app/app/_layout.tsx
volunteer-app/app/history.tsx
volunteer-app/app/incident-tabs.tsx
volunteer-app/app/index.tsx
volunteer-app/app/login.tsx
volunteer-app/app/patient-info.tsx
volunteer-app/app/profile.tsx
```

---
## 🗂️ CẤU TRÚC THƯ MỤC: volunteer-app/components (nếu có)
```
volunteer-app/components
volunteer-app/components/AlertModal.tsx
volunteer-app/components/ui
```

---
## 🗂️ CẤU TRÚC THƯ MỤC: volunteer-app/services (nếu có)
```
volunteer-app/services
volunteer-app/services/authService.ts
volunteer-app/services/firebase.ts
volunteer-app/services/incidentService.ts
volunteer-app/services/volunteerService.ts
```

---
## 🗂️ CẤU TRÚC THƯ MỤC: volunteer-app/context (nếu có)
```
volunteer-app/context
volunteer-app/context/IncidentContext.tsx
```

---
## 🗂️ CẤU TRÚC THƯ MỤC: volunteer-app/constants (nếu có)
```
volunteer-app/constants
volunteer-app/constants/colors.js
volunteer-app/constants/index.ts
volunteer-app/constants/theme.ts
```

---
## 🗂️ CẤU TRÚC THƯ MỤC: functions (Cloud Functions)
```
functions
functions/.gitignore
functions/index.js
functions/node_modules
functions/package.json
functions/package-lock.json
```

# PHẦN 3: BUG 1 — NFC (Patient App)
> Cần xem: màn hình QR, màn hình NFC, app.json (permissions), plugin config

---
## 📄 QR Code Screen (tabs)
`patient-app/app/(tabs)/qr-code.tsx`

```
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

```

---
## ❌ KHÔNG TÌM THẤY: QR Code Screen JSX (tabs)
`patient-app/app/(tabs)/qr-code.jsx` — file không tồn tại

---
## ❌ KHÔNG TÌM THẤY: QR Code Screen (root)
`patient-app/app/qr-code.tsx` — file không tồn tại

---
## ❌ KHÔNG TÌM THẤY: QR Code Screen JSX (root)
`patient-app/app/qr-code.jsx` — file không tồn tại

---
## 📄 NFC Write Screen (.tsx)
`patient-app/app/nfc-write.tsx`

```
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

const BG_READY = "#1892BE";
const BG_ERROR = "#E53935";
const BG_SUCCESS = "#43A047";

const SUBTITLE_READY =
  "Giữ điện thoại của bạn\ngần thẻ hoặc nhãn NFC.";
const SUBTITLE_WRITING = "Giữ điện thoại ở vị trí cố định.";
const SUBTITLE_SUCCESS =
  "URL hồ sơ y tế của bạn\nđã được lưu vào thẻ NFC.";
const SUBTITLE_WRITE_ERROR =
  "Vui lòng thử lại và giữ\nđiện thoại gần thẻ hơn.";
const SUBTITLE_UNSUPPORTED = "Thiết bị không hỗ trợ NFC.";

export default function NFCWrite() {
  const [nfcState, setNfcState] = useState<NfcState>("ready");
  const [errorSubtitle, setErrorSubtitle] = useState("");
  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const bytes = Ndef.encodeMessage([Ndef.uriRecord(url)]);
      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
      }
      setNfcState("success");
    } catch {
      setErrorSubtitle(SUBTITLE_WRITE_ERROR);
      setNfcState("error");
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const supported = await NfcManager.isSupported();
      if (cancelled) return;
      if (!supported) {
        setErrorSubtitle(SUBTITLE_UNSUPPORTED);
        setNfcState("error");
        return;
      }
      try {
        await NfcManager.start();
      } catch {
        if (!cancelled) {
          setErrorSubtitle(SUBTITLE_WRITE_ERROR);
          setNfcState("error");
        }
        return;
      }
      if (cancelled) return;
      setNfcState("ready");
      startTimerRef.current = setTimeout(() => {
        if (!cancelled) void writeNFC();
      }, 800);
    };

    void bootstrap();

    return () => {
      cancelled = true;
      if (startTimerRef.current) {
        clearTimeout(startTimerRef.current);
        startTimerRef.current = null;
      }
      NfcManager.cancelTechnologyRequest();
    };
  }, [writeNFC]);

  const handleRetry = async () => {
    const supported = await NfcManager.isSupported();
    if (!supported) {
      setErrorSubtitle(SUBTITLE_UNSUPPORTED);
      setNfcState("error");
      return;
    }
    try {
      await NfcManager.start();
    } catch {
      setErrorSubtitle(SUBTITLE_WRITE_ERROR);
      setNfcState("error");
      return;
    }
    setErrorSubtitle("");
    setNfcState("ready");
    setTimeout(() => void writeNFC(), 100);
  };

  const shellBg =
    nfcState === "error"
      ? BG_ERROR
      : nfcState === "success"
        ? BG_SUCCESS
        : BG_READY;

  const title =
    nfcState === "ready"
      ? "Sẵn sàng"
      : nfcState === "writing"
        ? "Đang ghi ..."
        : nfcState === "error"
          ? "Lỗi"
          : "Thành công";

  const subtitle =
    nfcState === "ready"
      ? SUBTITLE_READY
      : nfcState === "writing"
        ? SUBTITLE_WRITING
        : nfcState === "error"
          ? errorSubtitle || SUBTITLE_WRITE_ERROR
          : SUBTITLE_SUCCESS;

  return (
    <View style={[styles.shell, { backgroundColor: shellBg }]}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        <View style={styles.centerWrap}>
          {nfcState === "ready" ? (
            <Image
              source={require("../assets/images/Patient-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : null}
          {nfcState === "writing" ? (
            <ActivityIndicator size={64} color="#FFFFFF" />
          ) : null}
          {nfcState === "error" ? (
            <Ionicons name="warning-outline" size={90} color="#FFFFFF" />
          ) : null}
          {nfcState === "success" ? (
            <Ionicons name="checkmark-circle-outline" size={90} color="#FFFFFF" />
          ) : null}

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {nfcState === "error" ? (
          <TouchableOpacity
            style={styles.bottomBtn}
            onPress={() => void handleRetry()}
            activeOpacity={0.9}
          >
            <Text style={styles.bottomBtnTextError}>Thử lại</Text>
          </TouchableOpacity>
        ) : null}

        {nfcState === "success" ? (
          <TouchableOpacity
            style={styles.bottomBtn}
            onPress={() => router.back()}
            activeOpacity={0.9}
          >
            <Text style={styles.bottomBtnTextSuccess}>Hoàn tất</Text>
          </TouchableOpacity>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
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
  logo: {
    width: 120,
    height: 120,
  },
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
  bottomBtnTextError: {
    color: "#E53935",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomBtnTextSuccess: {
    color: "#43A047",
    fontSize: 16,
    fontWeight: "bold",
  },
});

```

---
## ❌ KHÔNG TÌM THẤY: NFC Write Screen (.jsx)
`patient-app/app/nfc-write.jsx` — file không tồn tại

---
## ❌ KHÔNG TÌM THẤY: NFC Write Screen (.js)
`patient-app/app/nfc-write.js` — file không tồn tại

---
## 🔎 TÌM KIẾM: Tất cả file liên quan NFC trong patient-app
```
patient-app/app/(tabs)/qr-code.tsx
patient-app/app/nfc-write.tsx
```

---
## 🔎 GREP: Files dùng react-native-nfc-manager
```
patient-app/app/nfc-write.tsx
--- nội dung grep ---
patient-app/app/nfc-write.tsx:16:import NfcManager, { NfcTech, Ndef } from "react-native-nfc-manager";
patient-app/app/nfc-write.tsx:48:      await NfcManager.requestTechnology(NfcTech.Ndef);
patient-app/app/nfc-write.tsx:49:      const bytes = Ndef.encodeMessage([Ndef.uriRecord(url)]);
patient-app/app/nfc-write.tsx:51:        await NfcManager.ndefHandler.writeNdefMessage(bytes);
patient-app/app/nfc-write.tsx:58:      NfcManager.cancelTechnologyRequest();
patient-app/app/nfc-write.tsx:66:      const supported = await NfcManager.isSupported();
patient-app/app/nfc-write.tsx:74:        await NfcManager.start();
patient-app/app/nfc-write.tsx:97:      NfcManager.cancelTechnologyRequest();
patient-app/app/nfc-write.tsx:102:    const supported = await NfcManager.isSupported();
patient-app/app/nfc-write.tsx:109:      await NfcManager.start();
```

---
## 🔎 GREP: Files dùng expo-media-library
```
patient-app/app/(tabs)/qr-code.tsx:16:import * as MediaLibrary from "expo-media-library";
patient-app/app/(tabs)/qr-code.tsx:48:        await MediaLibrary.saveToLibraryAsync(tempUri);
patient-app/app/(tabs)/qr-code.tsx:95:    const { status } = await MediaLibrary.requestPermissionsAsync();
patient-app/app/(tabs)/qr-code.tsx:106:          await MediaLibrary.saveToLibraryAsync(uri);
```

---
## 📄 Patient App — app.json (permissions, NFC plugin)
`patient-app/app.json`

```
{
  "expo": {
    "name": "EHIS Card",
    "slug": "patient-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/Patient-logo.png",
    "scheme": "patientapp",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/images/Patient-logo.png",
      "resizeMode": "contain",
      "backgroundColor": "#1892BE"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.ehiscard.patientapp"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/Patient-logo.png",
        "backgroundColor": "#1892BE"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false,
      "package": "com.ehiscard.patientapp",
      "permissions": [
        "android.permission.NFC"
      ]
    },
    "web": {
      "output": "static",
      "favicon": "./assets/images/Patient-logo.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/Patient-logo.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#1892BE"
        }
      ],
      "react-native-nfc-manager",
      "@react-native-community/datetimepicker"
    ],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    },
    "extra": {
      "router": {},
      "eas": {
        "projectId": "5ac54139-db3b-455b-91c2-eb7df13bd40a"
      }
    }
  }
}

```

---
## ❌ KHÔNG TÌM THẤY: Patient App — app.config.js
`patient-app/app.config.js` — file không tồn tại

---
## ❌ KHÔNG TÌM THẤY: Patient App — app.config.ts
`patient-app/app.config.ts` — file không tồn tại

# PHẦN 4: BUG 2 — HISTORY SAU KHI COMPLETE INCIDENT (Volunteer App)
> Cần xem: map.tsx (nơi complete), history.tsx, incidentService, Cloud Function

---
## 📄 Volunteer — Map Tab / Patient Report (.tsx)
`volunteer-app/app/(tabs)/map.tsx`

```
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, SafeAreaView, ActivityIndicator,
  Alert, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { completeIncident } from '../../services/incidentService';
import { useIncident } from '../../context/IncidentContext';

// Tính khoảng cách giữa 2 toạ độ (km)
function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Tính tuổi từ ngày sinh ISO "YYYY-MM-DD"
function calcAge(dob: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function MapScreen() {
  const router = useRouter();

  // FIX 4: đọc cả patientData từ context — không cần Firestore read trực tiếp
  const { activeIncidentId, setActiveIncidentId, activePatientData, setActivePatientData } = useIncident();

  const [loading, setLoading]     = useState(false);
  const [completing, setCompleting] = useState(false);
  const [incident, setIncident]   = useState<any>(null);
  const [distance, setDistance]   = useState<number | null>(null);

  // activePatientData đến từ Cloud Function qua context
  // → field names đã được normalize trong functions/index.js
  const patient = activePatientData;

  // Fetch incident doc khi có activeIncidentId
  // (cần bystanderPhone, bystanderNote, reporterLocation)
  useEffect(() => {
    if (!activeIncidentId) {
      setIncident(null);
      setDistance(null);
      return;
    }
    fetchIncident();
  }, [activeIncidentId]);

  const fetchIncident = async () => {
    if (!activeIncidentId) return;
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'incidents', activeIncidentId));
      if (!snap.exists()) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin sự cố.');
        return;
      }
      const data = snap.data();
      setIncident(data);

      // Tính khoảng cách từ vị trí hiện tại đến incident
      try {
        const loc = await Location.getCurrentPositionAsync({});
        if (data?.reporterLocation) {
          const d = calcDistance(
            loc.coords.latitude,
            loc.coords.longitude,
            data.reporterLocation.lat,
            data.reporterLocation.lng
          );
          setDistance(d);
        }
      } catch (_) { /* GPS không khả dụng — bỏ qua */ }

    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirections = () => {
    if (!incident?.reporterLocation) return;
    const { lat, lng } = incident.reporterLocation;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    Linking.openURL(url);
  };

  const handleComplete = async () => {
    if (!activeIncidentId) return;
    Alert.alert(
      'Hoàn thành sự cố?',
      'Xác nhận bạn đã hỗ trợ bệnh nhân xong.',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Hoàn thành',
          onPress: async () => {
            setCompleting(true);
            try {
              await completeIncident(activeIncidentId);
              setActiveIncidentId(null);
              setActivePatientData(null); // xoá data sau khi hoàn thành
              router.replace('/(tabs)/home');
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể hoàn thành sự cố.');
            } finally {
              setCompleting(false);
            }
          },
        },
      ]
    );
  };

  // ── EMPTY STATE ──
  if (!activeIncidentId) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="map-outline" size={64} color="#BDBDBD" />
        <Text style={styles.emptyText}>Không có sự cố nào</Text>
      </View>
    );
  }

  // ── LOADING ──
  if (loading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.emptyText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  const age = patient?.dateOfBirth ? calcAge(patient.dateOfBirth) : null;
  const distanceText = distance !== null ? `${distance.toFixed(1)} km` : '-- km';

  // Emergency contact
  const ec = patient?.emergencyContact;
  const ecName = typeof ec === 'string' ? '' :
    (ec?.name && ec?.relationship ? `${ec.name} - ${ec.relationship}` : ec?.name || '');
  const ecPhone = typeof ec === 'string' ? ec : ec?.phone || '';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ sơ bệnh nhân</Text>
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceBadgeText}>{distanceText}</Text>
        </View>
      </View>

      {/* ── SCROLL CONTENT ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CARD 1: Thông tin cơ bản */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin</Text>
          <View style={styles.divider} />
          <Text style={styles.infoText}>
            Họ tên: <Text style={styles.infoValue}>{patient?.fullName || '—'}</Text>
          </Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>
              Giới tính: <Text style={styles.infoValue}>{patient?.gender || '—'}</Text>
            </Text>
            <View style={styles.vertDivider} />
            <Text style={styles.infoText}>
              Tuổi: <Text style={styles.infoValue}>{age ?? '—'}</Text>
            </Text>
            <View style={styles.vertDivider} />
            <Text style={styles.infoText}>
              Nhóm máu: <Text style={[styles.infoValue, styles.bold]}>{patient?.bloodType || '—'}</Text>
            </Text>
          </View>
          <Text style={[styles.infoText, { marginTop: 6 }]}>
            Số điện thoại: <Text style={styles.infoValue}>{patient?.phoneNumber || '—'}</Text>
          </Text>
        </View>

        {/* CARD 2: Bệnh lý */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bệnh lý</Text>
          <View style={styles.divider} />
          <Text style={styles.subLabel}>Dị ứng</Text>
          <View style={styles.chipRow}>
            {patient?.allergies?.length > 0
              ? patient.allergies.map((a: string, i: number) => (
                  <View key={i} style={styles.chip}>
                    <Text style={styles.chipText}>{a}</Text>
                  </View>
                ))
              : <Text style={styles.emptyField}>-</Text>
            }
          </View>
          <Text style={[styles.subLabel, { marginTop: 12 }]}>Bệnh nền</Text>
          <View style={styles.chipRow}>
            {patient?.conditions?.length > 0
              ? patient.conditions.map((c: string, i: number) => (
                  <View key={i} style={styles.chip}>
                    <Text style={styles.chipText}>{c}</Text>
                  </View>
                ))
              : <Text style={styles.emptyField}>-</Text>
            }
          </View>
        </View>

        {/* CARD 3: Liên hệ khẩn cấp */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Liên hệ khẩn cấp</Text>
          <View style={styles.divider} />
          <View style={styles.contactRow}>
            <Text style={styles.contactName}>{ecName || '—'}</Text>
            {ecPhone ? (
              <TouchableOpacity
                style={styles.callPill}
                onPress={() => Linking.openURL(`tel:${ecPhone}`)}
              >
                <Ionicons name="call-outline" size={16} color="#fff" />
                <Text style={styles.callPillText}>{ecPhone}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.emptyField}>—</Text>
            )}
          </View>
        </View>

        {/* CARD 4: Thông tin người báo (vàng) */}
        {(incident?.bystanderPhone || incident?.bystanderNote) && (
          <View style={styles.bystanderCard}>
            <Text style={styles.bystanderTitle}>Thông tin người báo</Text>
            {incident.bystanderPhone ? (
              <Text style={styles.bystanderText}>
                Liên lạc: {incident.bystanderPhone}
              </Text>
            ) : null}
            {incident.bystanderNote ? (
              <Text style={styles.bystanderText}>
                Mô tả: <Text style={styles.bold}>{incident.bystanderNote}</Text>
              </Text>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* ── FIXED BOTTOM BUTTONS ── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.btnDirections}
          onPress={handleDirections}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Chỉ đường</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnComplete, completing && styles.btnDisabled]}
          onPress={handleComplete}
          disabled={completing}
          activeOpacity={0.85}
        >
          {completing
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.btnText}>Hoàn thành</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5', gap: 12 },
  emptyText: { fontSize: 16, color: '#9E9E9E', marginTop: 4 },
  header: {
    backgroundColor: '#E53935', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  distanceBadge: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  distanceBadgeText: { color: '#E53935', fontSize: 14, fontWeight: 'bold' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1,
    borderColor: '#E0E0E0', padding: 16, marginTop: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginBottom: 10 },
  infoText: { fontSize: 14, color: '#757575', marginBottom: 4 },
  infoValue: { color: '#212121' },
  bold: { fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  vertDivider: { width: 1, height: 14, backgroundColor: '#E0E0E0', marginHorizontal: 4 },
  subLabel: { fontSize: 13, color: '#757575', marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#E53935', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  chipText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptyField: { fontSize: 14, color: '#BDBDBD' },
  contactRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  contactName: { fontSize: 14, color: '#212121', flex: 1 },
  callPill: {
    backgroundColor: '#4CAF50', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  callPillText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  bystanderCard: {
    backgroundColor: '#FFFDE7', borderRadius: 12, borderWidth: 1,
    borderColor: '#F9A825', padding: 16, marginTop: 12,
  },
  bystanderTitle: { fontSize: 16, fontWeight: 'bold', color: '#F57F17', marginBottom: 10 },
  bystanderText: { fontSize: 14, color: '#212121', marginTop: 2 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#E0E0E0', flexDirection: 'row', gap: 12,
  },
  btnDirections: { flex: 1, height: 52, borderRadius: 8, backgroundColor: '#E53935', justifyContent: 'center', alignItems: 'center' },
  btnComplete: { flex: 1, height: 52, borderRadius: 8, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  btnDisabled: { opacity: 0.6 },
});

```

---
## ❌ KHÔNG TÌM THẤY: Volunteer — Map Tab / Patient Report (.jsx)
`volunteer-app/app/(tabs)/map.jsx` — file không tồn tại

---
## ❌ KHÔNG TÌM THẤY: Volunteer — Map Tab / Patient Report (.js)
`volunteer-app/app/(tabs)/map.js` — file không tồn tại

---
## 📄 Volunteer — Incident Tabs (.tsx)
`volunteer-app/app/incident-tabs.tsx`

```
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { useLocalSearchParams } from 'expo-router';

// Import 2 màn hình con
import MapScreen from './(tabs)/map';
import PatientInfoScreen from './patient-info';

const PRIMARY = '#D4494F';
const { width } = Dimensions.get('window');

export default function IncidentTabsScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const pagerRef = React.useRef<PagerView>(null);
  const params = useLocalSearchParams();

  const goToTab = (index: number) => {
    setActiveTab(index);
    pagerRef.current?.setPage(index);
  };

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 0 && styles.tabActive]}
          onPress={() => goToTab(0)}
        >
          <Text style={[styles.tabText, activeTab === 0 && styles.tabTextActive]}>
            🗺️ Bản đồ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 1 && styles.tabActive]}
          onPress={() => goToTab(1)}
        >
          <Text style={[styles.tabText, activeTab === 1 && styles.tabTextActive]}>
            📋 Hồ sơ
          </Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable content */}
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setActiveTab(e.nativeEvent.position)}
      >
        {/* Tab 0: Map */}
        <View key="map" style={styles.page}>
          <MapScreen />
        </View>

        {/* Tab 1: Patient Info */}
        <View key="patient" style={styles.page}>
          <PatientInfoScreen />
        </View>
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 4,
    gap: 8,
  },
  tab: {
    flex: 1, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  tabActive: { backgroundColor: PRIMARY },
  tabText: { fontSize: 14, fontWeight: '600', color: '#757575' },
  tabTextActive: { color: '#fff' },
  pager: { flex: 1 },
  page: { flex: 1 },
});
```

---
## ❌ KHÔNG TÌM THẤY: Volunteer — Incident Tabs (.jsx)
`volunteer-app/app/incident-tabs.jsx` — file không tồn tại

---
## ❌ KHÔNG TÌM THẤY: Volunteer — Incident Tabs (.js)
`volunteer-app/app/incident-tabs.js` — file không tồn tại

---
## 📄 Volunteer — Patient Info Screen (.tsx)
`volunteer-app/app/patient-info.tsx`

```
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Linking, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const PRIMARY = '#D4494F';

interface PatientData {
  name: string;
  dob: string;
  phone?: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  emergencyContact?: { name: string; phone: string };
}

function calcAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function PatientInfoScreen() {
  const { patientData: raw, incidentId } = useLocalSearchParams<{
    patientData: string; incidentId: string;
  }>();
  const router = useRouter();
  const [patient, setPatient] = useState<PatientData | null>(null);

  useEffect(() => {
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as PatientData;
      if (parsed?.name) setPatient(parsed);
    } catch {
      Alert.alert('Lỗi', 'Không đọc được thông tin bệnh nhân.');
    }
  }, [raw]);

  if (!patient) {
    return (
      <View style={s.center}>
        <Text style={s.loadingText}>Đang tải thông tin bệnh nhân...</Text>
      </View>
    );
  }

  const age = patient.dob ? calcAge(patient.dob) : null;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Nhóm máu — thông tin quan trọng nhất */}
      <View style={s.bloodCard}>
        <Text style={s.bloodLabel}>NHÓM MÁU</Text>
        <Text style={s.bloodValue}>{patient.bloodType || '?'}</Text>
      </View>

      {/* Thông tin cá nhân */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Bệnh nhân</Text>
        <View style={s.divider} />
        <Row label="Họ tên" value={patient.name} />
        {age !== null && <Row label="Tuổi" value={`${age} tuổi`} />}
        {patient.phone && (
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Điện thoại</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${patient.phone}`)}>
              <Text style={[s.infoValue, s.phoneLink]}>{patient.phone}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Dị ứng */}
      {patient.allergies?.length > 0 && (
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: PRIMARY }]}>⚠️ Dị ứng</Text>
          <View style={s.divider} />
          <View style={s.chipRow}>
            {patient.allergies.map((a, i) => (
              <View key={i} style={s.allergyChip}>
                <Text style={s.allergyChipText}>{a}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Bệnh nền */}
      {patient.conditions?.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Bệnh lý nền</Text>
          <View style={s.divider} />
          <View style={s.chipRow}>
            {patient.conditions.map((c, i) => (
              <View key={i} style={s.conditionChip}>
                <Text style={s.conditionChipText}>{c}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Thuốc đang dùng */}
      {patient.medications?.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Thuốc đang dùng</Text>
          <View style={s.divider} />
          <View style={s.chipRow}>
            {patient.medications.map((m, i) => (
              <View key={i} style={s.medChip}>
                <Text style={s.medChipText}>{m}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Liên hệ khẩn cấp */}
      {patient.emergencyContact?.phone && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Liên hệ khẩn cấp</Text>
          <View style={s.divider} />
          <View style={s.contactRow}>
            <Text style={s.contactName}>{patient.emergencyContact.name || 'Liên hệ'}</Text>
            <TouchableOpacity
              style={s.callBtn}
              onPress={() => Linking.openURL(`tel:${patient.emergencyContact!.phone}`)}
            >
              <Text style={s.callBtnText}>📞 {patient.emergencyContact.phone}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Nút mở bản đồ */}
      <TouchableOpacity
        style={s.mapBtn}
        onPress={() => router.push({ pathname: '/(tabs)/map', params: { incidentId } })}
      >
        <Text style={s.mapBtnText}>🗺️ Mở bản đồ điều hướng</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 15, color: PRIMARY },
  bloodCard: {
    backgroundColor: '#FFEBEE', borderWidth: 2, borderColor: PRIMARY,
    borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20,
  },
  bloodLabel: { fontSize: 12, fontWeight: '700', color: PRIMARY, letterSpacing: 2, marginBottom: 4 },
  bloodValue: { fontSize: 52, fontWeight: '900', color: PRIMARY },
  section: {
    backgroundColor: '#F5F5F5', borderRadius: 14,
    padding: 16, marginBottom: 16,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#757575', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  infoLabel: { fontSize: 14, color: '#757575' },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#212121' },
  phoneLink: { color: PRIMARY, textDecorationLine: 'underline' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  allergyChip: { backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: PRIMARY, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  allergyChipText: { color: PRIMARY, fontWeight: '700', fontSize: 13 },
  conditionChip: { backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: '#1565C0', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  conditionChipText: { color: '#1565C0', fontWeight: '600', fontSize: 13 },
  medChip: { backgroundColor: '#F3E5F5', borderWidth: 1, borderColor: '#7B1FA2', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  medChipText: { color: '#7B1FA2', fontWeight: '600', fontSize: 13 },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contactName: { fontSize: 15, fontWeight: '600', color: '#212121' },
  callBtn: { backgroundColor: PRIMARY, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  callBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  mapBtn: { height: 56, backgroundColor: PRIMARY, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 8, elevation: 3 },
  mapBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
```

---
## ❌ KHÔNG TÌM THẤY: Volunteer — Patient Info Screen (.jsx)
`volunteer-app/app/patient-info.jsx` — file không tồn tại

---
## 📄 Volunteer — History Screen (.tsx)
`volunteer-app/app/history.tsx`

```
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUser } from '../services/authService';
import { getVolunteerHistory, IncidentData } from '../services/incidentService';

function formatDate(ts: any): string {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function formatLocation(loc: { lat: number; lng: number } | undefined): string {
  if (!loc) return 'Không rõ vị trí';
  return `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
}

function StatusBadge({ status }: { status: string }) {
  const isCompleted = status === 'completed';
  return (
    <View style={[styles.badge, isCompleted ? styles.badgeCompleted : styles.badgeDeclined]}>
      <Ionicons
        name={isCompleted ? 'checkmark-circle-outline' : 'close-circle-outline'}
        size={16}
        color={isCompleted ? '#4CAF50' : '#9E9E9E'}
      />
      <Text style={[styles.badgeText, isCompleted ? styles.badgeTextCompleted : styles.badgeTextDeclined]}>
        {isCompleted ? 'Hoàn thành' : 'Từ chối'}
      </Text>
    </View>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const user = getCurrentUser();
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getVolunteerHistory(user.uid);
      setIncidents(data);
    } catch (err) {
      console.error('History load error:', err);
    }
  }, [user]);

  useEffect(() => {
    loadHistory().finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* SUBTITLE */}
      <View style={styles.subtitleWrap}>
        <Text style={styles.subtitle}>Lịch sử sự cố</Text>
      </View>

      {/* LOADING */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E53935" />
        </View>
      ) : (
        <FlatList
          data={incidents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#E53935']}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyText}>Chưa có lịch sử sự cố</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
                <StatusBadge status={item.status} />
              </View>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={18} color="#E53935" />
                <Text style={styles.locationText}>
                  {formatLocation(item.reporterLocation)}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#E53935',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { padding: 2 },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  subtitleWrap: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 14,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: { fontSize: 13, color: '#757575' },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '500',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeCompleted: { borderColor: '#4CAF50' },
  badgeDeclined: { borderColor: '#9E9E9E' },
  badgeText: { fontSize: 13, fontWeight: '600' },
  badgeTextCompleted: { color: '#4CAF50' },
  badgeTextDeclined: { color: '#9E9E9E' },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 15,
    color: '#9E9E9E',
    marginTop: 12,
  },
});
```

---
## ❌ KHÔNG TÌM THẤY: Volunteer — History Screen (.jsx)
`volunteer-app/app/history.jsx` — file không tồn tại

---
## ❌ KHÔNG TÌM THẤY: Volunteer — History Screen (.js)
`volunteer-app/app/history.js` — file không tồn tại

---
## 📄 Volunteer — History Tab (.tsx)
`volunteer-app/app/(tabs)/history.tsx`

```
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { getVolunteerHistory, IncidentData } from '../../services/incidentService';
import { getCurrentUser } from '../../services/authService';

const PRIMARY = '#D4494F';

function formatDate(ts: any): string {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; text: string; label: string }> = {
    completed: { bg: '#E8F5E9', text: '#2E7D32', label: '✓ Hoàn thành' },
    accepted:  { bg: '#E3F2FD', text: '#1565C0', label: '● Đang xử lý' },
    expired:   { bg: '#F5F5F5', text: '#757575', label: '✕ Hết hạn' },
    pending:   { bg: '#FFF8E1', text: '#F57F17', label: '⏳ Chờ xử lý' },
  };
  const c = cfg[status] || cfg.expired;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

export default function HistoryScreen() {
  const user = getCurrentUser();
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getVolunteerHistory(user.uid);
      setIncidents(data);
    } catch (err) { console.error(err); }
  }, [user]);

  useEffect(() => {
    loadHistory().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch sử sự cố</Text>
        <Text style={styles.headerSub}>{incidents.length} sự cố</Text>
      </View>

      <FlatList
        data={incidents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await loadHistory();
              setRefreshing(false);
            }}
            colors={[PRIMARY]}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Chưa có sự cố nào</Text>
            <Text style={styles.emptySub}>Lịch sử các sự cố bạn đã tiếp nhận sẽ hiển thị ở đây.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.cardLocation}>
              📍 {item.reporterLocation?.lat?.toFixed(4)}, {item.reporterLocation?.lng?.toFixed(4)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    backgroundColor: PRIMARY, borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#F5F5F5', borderRadius: 14,
    padding: 16, borderLeftWidth: 4, borderLeftColor: PRIMARY,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardDate: { fontSize: 14, fontWeight: '600', color: '#212121' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  cardLocation: { fontSize: 13, color: '#757575' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#212121', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#757575', textAlign: 'center', paddingHorizontal: 40 },
});
```

---
## ❌ KHÔNG TÌM THẤY: Volunteer — History Tab (.jsx)
`volunteer-app/app/(tabs)/history.jsx` — file không tồn tại

---
## 📄 Volunteer — Settings Tab (.tsx)
`volunteer-app/app/(tabs)/settings.tsx`

```
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getCurrentUser, signOutVolunteer } from '../../services/authService';
import { setOffline } from '../../services/volunteerService';

export default function SettingsScreen() {
  const router = useRouter();
  const user = getCurrentUser();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              if (user) await setOffline(user.uid);
              await signOutVolunteer();
              router.replace('/login');
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể đăng xuất.');
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cài đặt</Text>
      </View>

      {/* ── CONTENT ── */}
      <View style={styles.content}>
        {/* Về dự án */}
        <Text style={styles.sectionTitle}>Về dự án</Text>
        <Text style={styles.sectionBody}>
          Dự án được phát triển bởi nhóm sinh viên Kỹ thuật Y sinh, Trường Đại
          học Quốc tế, ĐHQG TP.HCM. Hệ thống hỗ trợ cấp cứu khẩn cấp, kết nối
          nhanh chóng giữa người qua đường, bệnh nhân và tình nguyện viên thông
          qua QR/NFC, giúp rút ngắn thời gian phản ứng trong tình huống nguy cấp.
        </Text>

        {/* Lịch sử sự cố */}
        <TouchableOpacity
          style={styles.btnHistory}
          onPress={() => router.push('/history')}
          activeOpacity={0.7}
        >
          <Text style={styles.btnHistoryText}>Lịch sử sự cố</Text>
        </TouchableOpacity>
      </View>

      {/* ── BOTTOM: Đăng xuất ── */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.btnLogout, loggingOut && styles.btnDisabled]}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.85}
        >
          {loggingOut
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.btnLogoutText}>Đăng xuất</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'space-between',
  },
  header: {
    backgroundColor: '#E53935',
    paddingVertical: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 22,
    textAlign: 'justify',
  },
  btnHistory: {
    marginTop: 32,
    height: 52,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#212121',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnHistoryText: {
    color: '#212121',
    fontSize: 16,
    fontWeight: '600',
  },
  bottom: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
  },
  btnLogout: {
    height: 52,
    borderRadius: 8,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnLogoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
```

---
## ❌ KHÔNG TÌM THẤY: Volunteer — Settings Tab (.jsx)
`volunteer-app/app/(tabs)/settings.jsx` — file không tồn tại

---
## ❌ KHÔNG TÌM THẤY: Volunteer — Settings Tab (.js)
`volunteer-app/app/(tabs)/settings.js` — file không tồn tại

---
## 📄 Volunteer — Home Screen (.tsx)
`volunteer-app/app/(tabs)/home.tsx`

```
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { getCurrentUser } from '../../services/authService';
import {
  getVolunteerData,
  setOnline,
  setOffline,
  updateLocation,
  saveFCMToken,
  VolunteerData,
} from '../../services/volunteerService';
import { acceptIncident } from '../../services/incidentService';
import AlertModal, { AlertData } from '../../components/AlertModal';
import { useIncident } from '../../context/IncidentContext';
import {
  LOCATION_INTERVAL_IDLE_MS,
  LOCATION_INTERVAL_ACTIVE_MS,
} from '../../constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function HomeScreen() {
  const router = useRouter();
  const user = getCurrentUser();

  // FIX 4: lấy thêm setActivePatientData từ context
  const { setActiveIncidentId, setActivePatientData } = useIncident();

  const [volunteer, setVolunteer] = useState<VolunteerData | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState<AlertData | null>(null);

  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load thông tin volunteer
  useEffect(() => {
    if (!user) return;
    getVolunteerData(user.uid).then((data) => {
      if (data) { setVolunteer(data); setIsOnline(data.isOnline); }
    });
  }, [user]);

  // Lấy FCM token khi mount
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return;
        const tokenData = await Notifications.getDevicePushTokenAsync();
        await saveFCMToken(user.uid, tokenData.data);
      } catch (err) {
        console.warn('FCM token error:', err);
      }
    })();
  }, [user]);

  // Lắng nghe FCM — foreground + background
  useEffect(() => {
    const fgSub = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data as any;
      if (data?.type === 'incident') {
        setAlertData({
          incidentId: data.incidentId,
          distance: parseFloat(data.distance) || 0,
          createdAt: Date.now(),
        });
        setAlertVisible(true);
      }
    });

    const bgSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as any;
      if (data?.type === 'incident') {
        setAlertData({
          incidentId: data.incidentId,
          distance: parseFloat(data.distance) || 0,
          createdAt: Date.now(),
        });
        setAlertVisible(true);
      }
    });

    return () => { fgSub.remove(); bgSub.remove(); };
  }, []);

  // Location interval management
  const startLocationInterval = (isActive: boolean) => {
    stopLocationInterval();
    const interval = isActive ? LOCATION_INTERVAL_ACTIVE_MS : LOCATION_INTERVAL_IDLE_MS;
    locationIntervalRef.current = setInterval(async () => {
      if (!user) return;
      try {
        const loc = await Location.getCurrentPositionAsync({});
        await updateLocation(user.uid, loc.coords.latitude, loc.coords.longitude);
      } catch (_) {}
    }, interval);
  };

  const stopLocationInterval = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
  };

  useEffect(() => () => stopLocationInterval(), []);

  // Toggle Online/Offline
  const handleToggle = async () => {
    if (!user || toggling) return;
    setToggling(true);
    try {
      if (!isOnline) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Cần quyền vị trí', 'Vui lòng bật quyền vị trí trong Cài đặt.');
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const tokenData = await Notifications.getDevicePushTokenAsync();
        await setOnline(user.uid, loc.coords.latitude, loc.coords.longitude, tokenData.data);
        setIsOnline(true);
        startLocationInterval(false);
      } else {
        stopLocationInterval();
        await setOffline(user.uid);
        setIsOnline(false);
        setActiveIncidentId(null);
        setActivePatientData(null);
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể cập nhật trạng thái.');
    } finally {
      setToggling(false);
    }
  };

  // FIX 4: handleAccept — lưu patientData vào context, navigate thẳng đến map
  const handleAccept = async () => {
    if (!alertData || !user) return;
    try {
      const result = await acceptIncident(alertData.incidentId, user.uid);

      if (result.success) {
        setAlertVisible(false);
        setAlertData(null);

        // Lưu cả incidentId lẫn patientData vào context
        setActiveIncidentId(alertData.incidentId);
        setActivePatientData(result.patientData ?? null);

        startLocationInterval(true);

        // Navigate thẳng đến tab Bản đồ (= Patient Report screen)
        // Không cần incident-tabs.tsx nữa
        router.replace('/(tabs)/map');

      } else if (result.error === 'already_taken') {
        setAlertVisible(false);
        setAlertData(null);
        Alert.alert('Đã có người nhận', 'Sự cố này đã được tình nguyện viên khác tiếp nhận.');
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể tiếp nhận sự cố.');
    }
  };

  const initial = volunteer?.name?.[0]?.toUpperCase() ?? 'T';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trang chủ</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <Text style={styles.volunteerName} numberOfLines={1}>
              {volunteer?.name ?? 'Tình nguyện viên'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.togglePill, isOnline ? styles.pillOnline : styles.pillOffline]}
            onPress={handleToggle}
            disabled={toggling}
            activeOpacity={0.8}
          >
            <View style={[styles.pillDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
            <Text style={styles.pillText}>{isOnline ? 'Online' : 'Offline'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── BIG CIRCLE ── */}
      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.bigCircle, isOnline ? styles.circleOnline : styles.circleOffline]}
          onPress={handleToggle}
          disabled={toggling}
          activeOpacity={0.85}
        >
          {toggling ? (
            <ActivityIndicator color={isOnline ? '#fff' : '#757575'} size="large" />
          ) : isOnline ? (
            <>
              <Text style={styles.circleTextOnline}>ONLINE</Text>
              <Text style={styles.circleSubOnline}>Sẵn sàng</Text>
            </>
          ) : (
            <>
              <Text style={styles.circleTextOffline}>OFFLINE</Text>
              <Text style={styles.circleSubOffline}>Chạm để Online</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── ALERT MODAL ── */}
      <AlertModal
        visible={alertVisible}
        data={alertData}
        onAccept={handleAccept}
        onDecline={() => { setAlertVisible(false); setAlertData(null); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#E53935', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  avatarText: { color: '#E53935', fontSize: 18, fontWeight: 'bold' },
  volunteerName: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1 },
  togglePill: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, flexShrink: 0 },
  pillOffline: { backgroundColor: 'rgba(255,255,255,0.25)' },
  pillOnline: { backgroundColor: '#4CAF50' },
  pillDot: { width: 10, height: 10, borderRadius: 5 },
  dotOffline: { backgroundColor: '#9E9E9E' },
  dotOnline: { backgroundColor: '#fff' },
  pillText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bigCircle: { width: 220, height: 220, borderRadius: 110, justifyContent: 'center', alignItems: 'center' },
  circleOffline: { backgroundColor: '#E0E0E0' },
  circleOnline: { backgroundColor: '#4CAF50' },
  circleTextOffline: { color: '#757575', fontSize: 28, fontWeight: 'bold', letterSpacing: 2 },
  circleSubOffline: { color: '#9E9E9E', fontSize: 14, marginTop: 8 },
  circleTextOnline: { color: '#fff', fontSize: 28, fontWeight: 'bold', letterSpacing: 2 },
  circleSubOnline: { color: '#fff', fontSize: 14, marginTop: 8, opacity: 0.9 },
});

```

---
## ❌ KHÔNG TÌM THẤY: Volunteer — Home Screen (.jsx)
`volunteer-app/app/(tabs)/home.jsx` — file không tồn tại

---
## ❌ KHÔNG TÌM THẤY: Volunteer — Home Screen (.js)
`volunteer-app/app/(tabs)/home.js` — file không tồn tại

---
## 📄 Volunteer — Root Layout (.tsx)
`volunteer-app/app/_layout.tsx`

```
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
```

---
## ❌ KHÔNG TÌM THẤY: Volunteer — Root Layout (.jsx)
`volunteer-app/app/_layout.jsx` — file không tồn tại

---
## 📄 Volunteer — incidentService (.ts)
`volunteer-app/services/incidentService.ts`

```
import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const CREATE_INCIDENT_URL = 'https://createincident-63u7no4kya-as.a.run.app';
const ACCEPT_INCIDENT_URL = 'https://acceptincident-63u7no4kya-as.a.run.app';

export interface IncidentData {
  id: string;
  patientId: string;
  reporterLocation: { lat: number; lng: number };
  status: 'pending' | 'accepted' | 'completed' | 'expired';
  acceptedBy?: string;
  acceptedAt?: any;
  createdAt?: any;
  expiresAt?: any;
}

export interface PatientData {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  emergencyContact: string;
}

export async function acceptIncident(
  incidentId: string,
  volunteerId: string
): Promise<{ success: boolean; patientId?: string; patientData?: PatientData; volunteerName?: string; error?: string }> {
  const res = await fetch(ACCEPT_INCIDENT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ incidentId, volunteerId }),
  });
  return res.json();
}

export async function completeIncident(incidentId: string) {
  await updateDoc(doc(db, 'incidents', incidentId), {
    status: 'completed',
    completedAt: serverTimestamp(),
  });
}

export function subscribeIncident(
  incidentId: string,
  callback: (data: IncidentData | null) => void
) {
  return onSnapshot(doc(db, 'incidents', incidentId), (snap) => {
    callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as IncidentData) : null);
  });
}

export async function getVolunteerHistory(volunteerId: string): Promise<IncidentData[]> {
  const q = query(
    collection(db, 'incidents'),
    where('acceptedBy', '==', volunteerId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IncidentData));
}
```

---
## ❌ KHÔNG TÌM THẤY: Volunteer — incidentService (.js)
`volunteer-app/services/incidentService.js` — file không tồn tại

---
## 📄 Volunteer — volunteerService (.ts)
`volunteer-app/services/volunteerService.ts`

```
import {
    doc,
    updateDoc,
    onSnapshot,
    serverTimestamp,
    getDoc,
  } from 'firebase/firestore';
  import { db } from './firebase';
  import { geohashForLocation } from 'geofire-common';
  
  export interface VolunteerData {
    name: string;
    phone: string;
    organization: string;
    isOnline: boolean;
    location?: { lat: number; lng: number };
    geohash?: string;
    locationUpdatedAt?: any;
    fcmToken?: string;
    createdAt?: any;
  }
  
  export async function getVolunteerData(volunteerId: string): Promise<VolunteerData | null> {
    const ref = doc(db, 'volunteers', volunteerId);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as VolunteerData) : null;
  }
  
  export async function setOnline(
    volunteerId: string,
    lat: number,
    lng: number,
    fcmToken: string
  ) {
    const geohash = geohashForLocation([lat, lng]);
    await updateDoc(doc(db, 'volunteers', volunteerId), {
      isOnline: true,
      location: { lat, lng },
      geohash,
      locationUpdatedAt: serverTimestamp(),
      fcmToken,
    });
  }
  
  export async function setOffline(volunteerId: string) {
    await updateDoc(doc(db, 'volunteers', volunteerId), {
      isOnline: false,
    });
  }
  
  export async function updateLocation(volunteerId: string, lat: number, lng: number) {
    const geohash = geohashForLocation([lat, lng]);
    await updateDoc(doc(db, 'volunteers', volunteerId), {
      location: { lat, lng },
      geohash,
      locationUpdatedAt: serverTimestamp(),
    });
  }
  
  export async function saveFCMToken(volunteerId: string, token: string) {
    await updateDoc(doc(db, 'volunteers', volunteerId), {
      fcmToken: token,
    });
  }
  
  export function subscribeVolunteer(
    volunteerId: string,
    callback: (data: VolunteerData) => void
  ) {
    return onSnapshot(doc(db, 'volunteers', volunteerId), (snap) => {
      if (snap.exists()) callback(snap.data() as VolunteerData);
    });
  }
```

---
## ❌ KHÔNG TÌM THẤY: Volunteer — volunteerService (.js)
`volunteer-app/services/volunteerService.js` — file không tồn tại

---
## 📄 Volunteer — IncidentContext (.tsx)
`volunteer-app/context/IncidentContext.tsx`

```
import React, { createContext, useContext, useState } from 'react';

// FIX 4: Thêm activePatientData vào context
// Lý do: map.tsx không thể đọc patients/ trực tiếp (bị block bởi Security Rules)
// Flow mới: home.tsx nhận patientData từ acceptIncident Cloud Function
//           → lưu vào context → map.tsx đọc từ context
interface IncidentContextType {
  activeIncidentId: string | null;
  setActiveIncidentId: (id: string | null) => void;
  activePatientData: any | null;
  setActivePatientData: (data: any | null) => void;
}

const IncidentContext = createContext<IncidentContextType>({
  activeIncidentId: null,
  setActiveIncidentId: () => {},
  activePatientData: null,
  setActivePatientData: () => {},
});

export function IncidentProvider({ children }: { children: React.ReactNode }) {
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
  const [activePatientData, setActivePatientData] = useState<any | null>(null);

  return (
    <IncidentContext.Provider
      value={{
        activeIncidentId,
        setActiveIncidentId,
        activePatientData,
        setActivePatientData,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
}

export const useIncident = () => useContext(IncidentContext);

```

---
## ❌ KHÔNG TÌM THẤY: Volunteer — IncidentContext (.jsx)
`volunteer-app/context/IncidentContext.jsx` — file không tồn tại

---
## ❌ KHÔNG TÌM THẤY: Volunteer — IncidentContext (.js)
`volunteer-app/context/IncidentContext.js` — file không tồn tại

---
## 📄 Volunteer — AlertModal (.tsx)
`volunteer-app/components/AlertModal.tsx`

```
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COUNTDOWN_S = 30;

export interface AlertData {
  incidentId: string;
  distance: number;
  neighborhoodHint?: string;
  createdAt: number;
}

interface Props {
  visible: boolean;
  data: AlertData | null;
  onAccept: () => Promise<void>;
  onDecline: () => void;
}

export default function AlertModal({ visible, data, onAccept, onDecline }: Props) {
  const [countdown, setCountdown] = useState(COUNTDOWN_S);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(false);

  // Animated value cho progress bar: 1 = đầy, 0 = hết
  const progressAnim = useRef(new Animated.Value(1)).current;
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const clearAll = () => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
    if (elapsedInterval.current) {
      clearInterval(elapsedInterval.current);
      elapsedInterval.current = null;
    }
    if (animRef.current) {
      animRef.current.stop();
      animRef.current = null;
    }
  };

  useEffect(() => {
    if (!visible) {
      clearAll();
      setCountdown(COUNTDOWN_S);
      setElapsed(0);
      setLoading(false);
      progressAnim.setValue(1);
      return;
    }

    // Rung khi modal xuất hiện
    Vibration.vibrate([0, 400, 200, 400, 200, 400]);

    // Reset state
    setCountdown(COUNTDOWN_S);
    setLoading(false);
    progressAnim.setValue(1);

    // Tính elapsed dựa vào createdAt
    if (data?.createdAt) {
      const initial = Math.floor((Date.now() - data.createdAt) / 1000);
      setElapsed(initial);
      elapsedInterval.current = setInterval(() => {
        setElapsed((s) => s + 1);
      }, 1000);
    }

    // Progress bar animation: 30s từ 1 → 0
    animRef.current = Animated.timing(progressAnim, {
      toValue: 0,
      duration: COUNTDOWN_S * 1000,
      useNativeDriver: false,
    });
    animRef.current.start();

    // Countdown số đếm ngược
    countdownInterval.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearAll();
          Vibration.cancel();
          onDecline(); // timeout → tự decline
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      clearAll();
      Vibration.cancel();
    };
  }, [visible]);

  // Cleanup khi unmount
  useEffect(() => () => { clearAll(); Vibration.cancel(); }, []);

  const handleAccept = async () => {
    setLoading(true);
    clearAll();
    Vibration.cancel();
    try {
      await onAccept();
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    clearAll();
    Vibration.cancel();
    onDecline();
  };

  // Progress bar width: animated % string
  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const distance = data?.distance?.toFixed(1) ?? '?';

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      {/* Backdrop */}
      <View style={styles.backdrop}>
        {/* Card */}
        <View style={styles.card}>

          {/* ── HEADER ── */}
          <View style={styles.header}>
            <Ionicons name="warning-outline" size={44} color="#fff" style={styles.icon} />
            <Text style={styles.headerTitle}>SỰ CỐ KHẨN CẤP</Text>
            <Text style={styles.headerSub}>
              Báo khẩn cấp {elapsed}s trước
            </Text>
          </View>

          {/* ── PROGRESS BAR ── */}
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: barWidth }]} />
          </View>

          {/* ── BODY ── */}
          <View style={styles.body}>
            <Text style={styles.distance}>
              Khoảng cách: {distance} km
            </Text>
            <Text style={styles.responseLabel}>Thời gian phản hồi</Text>
            <Text style={styles.countdown}>{countdown}s</Text>

            {/* ── BUTTONS ── */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.btnDecline}
                onPress={handleDecline}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.btnDeclineText}>Từ chối</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnAccept, loading && styles.btnDisabled]}
                onPress={handleAccept}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.btnAcceptText}>Tiếp nhận</Text>
                }
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Backdrop
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Card
  card: {
    marginHorizontal: 24,
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 8,
  },

  // Header
  header: {
    backgroundColor: '#E53935',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
  headerSub: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.9,
    marginTop: 4,
    textAlign: 'center',
  },

  // Progress bar
  progressTrack: {
    height: 6,
    backgroundColor: '#FFCDD2',
    width: '100%',
  },
  progressFill: {
    height: 6,
    backgroundColor: '#E53935',
  },

  // Body
  body: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  distance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
  },
  responseLabel: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginTop: 8,
  },
  countdown: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#E53935',
    textAlign: 'center',
    marginTop: 4,
  },

  // Buttons
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  btnDecline: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#BDBDBD',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDeclineText: {
    color: '#757575',
    fontSize: 15,
    fontWeight: '600',
  },
  btnAccept: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnAcceptText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
```

---
## ❌ KHÔNG TÌM THẤY: Volunteer — AlertModal (.jsx)
`volunteer-app/components/AlertModal.jsx` — file không tồn tại

---
## ❌ KHÔNG TÌM THẤY: Volunteer — AlertModal (.js)
`volunteer-app/components/AlertModal.js` — file không tồn tại

---
## 🔎 GREP: Tìm completeIncident trong volunteer-app
```
volunteer-app/app/(tabs)/map.tsx:12:import { completeIncident } from '../../services/incidentService';
volunteer-app/app/(tabs)/map.tsx:118:              await completeIncident(activeIncidentId);
volunteer-app/app/history.tsx:34:  const isCompleted = status === 'completed';
volunteer-app/services/incidentService.ts:22:  status: 'pending' | 'accepted' | 'completed' | 'expired';
volunteer-app/services/incidentService.ts:52:export async function completeIncident(incidentId: string) {
volunteer-app/services/incidentService.ts:54:    status: 'completed',
```

---
## 🔎 GREP: Tìm getVolunteerHistory / query incidents trong volunteer-app
```
volunteer-app/app/(tabs)/history.tsx:6:import { getVolunteerHistory, IncidentData } from '../../services/incidentService';
volunteer-app/app/(tabs)/history.tsx:44:      const data = await getVolunteerHistory(user.uid);
volunteer-app/app/history.tsx:15:import { getVolunteerHistory, IncidentData } from '../services/incidentService';
volunteer-app/app/history.tsx:59:      const data = await getVolunteerHistory(user.uid);
volunteer-app/services/incidentService.ts:23:  acceptedBy?: string;
volunteer-app/services/incidentService.ts:68:export async function getVolunteerHistory(volunteerId: string): Promise<IncidentData[]> {
volunteer-app/services/incidentService.ts:71:    where('acceptedBy', '==', volunteerId),
```

---
## 🔎 GREP: Tìm router.push history hoặc router.replace
```
volunteer-app/app/(tabs)/home.tsx:46:  const { setActiveIncidentId, setActivePatientData } = useIncident();
volunteer-app/app/(tabs)/home.tsx:150:        setActiveIncidentId(null);
volunteer-app/app/(tabs)/home.tsx:171:        setActiveIncidentId(alertData.incidentId);
volunteer-app/app/(tabs)/map.tsx:44:  const { activeIncidentId, setActiveIncidentId, activePatientData, setActivePatientData } = useIncident();
volunteer-app/app/(tabs)/map.tsx:119:              setActiveIncidentId(null);
volunteer-app/app/(tabs)/map.tsx:121:              router.replace('/(tabs)/home');
volunteer-app/app/(tabs)/settings.tsx:66:          onPress={() => router.push('/history')}
volunteer-app/app/index.tsx:35:      router.replace("/(tabs)/home");
volunteer-app/app/login.tsx:53:      router.replace("/(tabs)/home");
volunteer-app/context/IncidentContext.tsx:9:  setActiveIncidentId: (id: string | null) => void;
volunteer-app/context/IncidentContext.tsx:16:  setActiveIncidentId: () => {},
volunteer-app/context/IncidentContext.tsx:22:  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
volunteer-app/context/IncidentContext.tsx:29:        setActiveIncidentId,
```

# PHẦN 5: CLOUD FUNCTIONS

---
## 📄 Cloud Functions — index.js
`functions/index.js`

```
const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const { geohashQueryBounds, distanceBetween } = require("geofire-common");

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ region: "asia-southeast1" });

// ==========================================
// 1. createIncident (HTTP)
// ==========================================
exports.createIncident = onRequest(
  {
    cors: true,
    // FIX 3: minInstances: 1 giữ function luôn warm → không bị cold start ~2 phút
    minInstances: 1,
  },
  async (req, res) => {
    try {
      const { patientId, lat, lng, bystanderPhone, bystanderNote } = req.body;

      if (!patientId || lat === undefined || lng === undefined) {
        return res.status(400).json({ error: "Thiếu patientId, lat hoặc lng" });
      }

      const patientDoc = await db.collection("patients").doc(patientId).get();
      if (!patientDoc.exists) {
        return res.status(404).json({ error: "Không tìm thấy patient" });
      }

      const now = admin.firestore.Timestamp.now();
      const expiresAt = admin.firestore.Timestamp.fromMillis(
        now.toMillis() + 2 * 60 * 1000 // 2 phút
      );

      const incidentRef = await db.collection("incidents").add({
        patientId,
        reporterLocation: { lat, lng },
        bystanderPhone: bystanderPhone || null,
        bystanderNote: bystanderNote || null,
        status: "pending",
        acceptedBy: null,
        acceptedAt: null,
        notifiedVolunteers: [],
        createdAt: now,
        expiresAt,
      });

      await findAndNotifyVolunteers(incidentRef.id, { lat, lng });

      return res.status(200).json({ incidentId: incidentRef.id });
    } catch (err) {
      console.error("createIncident error:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }
  }
);

// ==========================================
// 2. findAndNotifyVolunteers (internal)
// ==========================================
async function findAndNotifyVolunteers(incidentId, reporterLocation) {
  const { lat, lng } = reporterLocation;
  const radiusKm = 5;
  const bounds = geohashQueryBounds([lat, lng], radiusKm * 1000);

  let eligibleVolunteers = [];

  for (const b of bounds) {
    const snap = await db
      .collection("volunteers")
      .where("isOnline", "==", true)
      .orderBy("geohash")
      .startAt(b[0])
      .endAt(b[1])
      .get();

    snap.docs.forEach((doc) => {
      const data = doc.data();
      const distance = distanceBetween(
        [data.location.lat, data.location.lng],
        [lat, lng]
      );
      if (distance <= radiusKm) {
        eligibleVolunteers.push({
          id: doc.id,
          fcmToken: data.fcmToken,
          distance: Math.round(distance * 10) / 10,
        });
      }
    });
  }

  if (eligibleVolunteers.length === 0) {
    console.log("Không có volunteer nào trong bán kính 5km");
    return;
  }

  const tokens = eligibleVolunteers.filter((v) => v.fcmToken).map((v) => v.fcmToken);
  const notifiedIds = eligibleVolunteers.map((v) => v.id);

  if (tokens.length > 0) {
    await admin.messaging().sendEachForMulticast({
      tokens,
      data: {
        type: "incident",
        incidentId,
        distance: String(eligibleVolunteers[0]?.distance ?? 0),
      },
      notification: {
        title: "Co su co khan cap gan ban!",
        body: `Cach ban khoang ${eligibleVolunteers[0]?.distance ?? "?"} km`,
      },
      android: {
        priority: "high",
        notification: { channelId: "incident_alerts" },
      },
    });
  }

  await db.collection("incidents").doc(incidentId).update({
    notifiedVolunteers: notifiedIds,
  });
}

// ==========================================
// 3. acceptIncident (HTTP)
// ==========================================
exports.acceptIncident = onRequest(
  {
    cors: true,
    // FIX 3: minInstances: 1 giữ function luôn warm
    minInstances: 1,
  },
  async (req, res) => {
    try {
      const { incidentId, volunteerId } = req.body;

      if (!incidentId || !volunteerId) {
        return res.status(400).json({ error: "Thiếu incidentId hoặc volunteerId" });
      }

      const incidentRef = db.collection("incidents").doc(incidentId);

      const result = await db.runTransaction(async (transaction) => {
        const snap = await transaction.get(incidentRef);
        if (!snap.exists) throw new Error("incident_not_found");

        const data = snap.data();
        if (data.status !== "pending") {
          return { success: false, error: "already_taken" };
        }

        const volunteerDoc = await db.collection("volunteers").doc(volunteerId).get();
        const volunteerName = volunteerDoc.exists
          ? volunteerDoc.data().name
          : "Tình nguyện viên";

        transaction.update(incidentRef, {
          status: "accepted",
          acceptedBy: volunteerId,
          acceptedAt: admin.firestore.Timestamp.now(),
          volunteerName: volunteerName,
        });

        return { success: true, patientId: data.patientId, volunteerName };
      });

      if (!result.success) {
        return res.status(409).json({ error: result.error });
      }

      // FIX 4: Fetch patient data server-side + normalize field names
      // Patient App lưu: fullName, dateOfBirth, phoneNumber, emergencyContact
      // Volunteer App map.tsx đọc: fullName, dateOfBirth, phoneNumber, emergencyContact
      // → field names đã khớp, trả về nguyên raw data
      const patientSnap = await db.collection("patients").doc(result.patientId).get();
      const rawPatient = patientSnap.exists ? patientSnap.data() : null;

      // Normalize để đảm bảo field names nhất quán
      const patientData = rawPatient ? {
        fullName:         rawPatient.fullName || rawPatient.name || "",
        dateOfBirth:      rawPatient.dateOfBirth || rawPatient.dob || "",
        gender:           rawPatient.gender || "",
        phoneNumber:      rawPatient.phoneNumber || rawPatient.phone || "",
        bloodType:        rawPatient.bloodType || "",
        allergies:        rawPatient.allergies || [],
        conditions:       rawPatient.conditions || [],
        medications:      rawPatient.medications || [],
        emergencyContact: rawPatient.emergencyContact || null,
      } : null;

      return res.status(200).json({
        success: true,
        patientId: result.patientId,
        volunteerName: result.volunteerName,
        patientData: patientData,
      });
    } catch (err) {
      console.error("acceptIncident error:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }
  }
);

// ==========================================
// 4. expireIncidents (Scheduled — mỗi 1 phút)
// ==========================================
exports.expireIncidents = onSchedule(
  { schedule: "every 1 minutes", region: "asia-southeast1" },
  async () => {
    const now = admin.firestore.Timestamp.now();
    const snap = await db
      .collection("incidents")
      .where("status", "==", "pending")
      .where("expiresAt", "<=", now)
      .get();

    if (snap.empty) return null;

    const batch = db.batch();
    snap.docs.forEach((doc) => {
      batch.update(doc.ref, { status: "expired" });
    });

    await batch.commit();
    console.log(`Đã expire ${snap.docs.length} incidents`);
    return null;
  }
);

```

---
## ❌ KHÔNG TÌM THẤY: Cloud Functions — src/index.js
`functions/src/index.js` — file không tồn tại

---
## ❌ KHÔNG TÌM THẤY: Cloud Functions — index.ts
`functions/index.ts` — file không tồn tại

---
## 📄 Cloud Functions — package.json
`functions/package.json`

```
{
  "name": "functions",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "firebase-admin": "^13.7.0",
    "firebase-functions": "^7.2.5",
    "geofire-common": "^6.0.0"
  }
}

```

---
## 🔎 GREP: acceptIncident + completeIncident trong functions
```
functions/index.js:130:// 3. acceptIncident (HTTP)
functions/index.js:132:exports.acceptIncident = onRequest(
functions/index.js:158:        const volunteerName = volunteerDoc.exists
functions/index.js:166:          volunteerName: volunteerName,
functions/index.js:169:        return { success: true, patientId: data.patientId, volunteerName };
functions/index.js:199:        volunteerName: result.volunteerName,
functions/index.js:203:      console.error("acceptIncident error:", err);
```

# PHẦN 6: FIREBASE CONFIG

---
## 📄 Patient — firebase config (.ts)
`patient-app/services/firebase.ts`

```
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBEsGI80bMWxJC4rL8wWU80WVZhscG1Ews",
  authDomain: "emergency-qr-medical.firebaseapp.com",
  projectId: "emergency-qr-medical",
  storageBucket: "emergency-qr-medical.firebasestorage.app",
  messagingSenderId: "867493842983",
  appId: "1:867493842983:web:98ceb88518ffae5512fe02"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
```

---
## ❌ KHÔNG TÌM THẤY: Patient — firebase config (.js)
`patient-app/services/firebase.js` — file không tồn tại

---
## ❌ KHÔNG TÌM THẤY: Patient — firebase config (config/)
`patient-app/config/firebase.ts` — file không tồn tại

---
## ❌ KHÔNG TÌM THẤY: Patient — firebase config (config/)
`patient-app/config/firebase.js` — file không tồn tại

---
## ❌ KHÔNG TÌM THẤY: Patient — firebase config (root)
`patient-app/firebase.ts` — file không tồn tại

---
## ❌ KHÔNG TÌM THẤY: Patient — firebase config (root)
`patient-app/firebase.js` — file không tồn tại

---
## 📄 Volunteer — firebase config (.ts)
`volunteer-app/services/firebase.ts`

```
import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBEsGI80bMWxJC4rL8wWU80WVZhscG1Ews",
  authDomain: "emergency-qr-medical.firebaseapp.com",
  projectId: "emergency-qr-medical",
  storageBucket: "emergency-qr-medical.firebasestorage.app",
  messagingSenderId: "867493842983",
  appId: "1:867493842983:web:98ceb88518ffae5512fe02"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export default app;
```

---
## ❌ KHÔNG TÌM THẤY: Volunteer — firebase config (.js)
`volunteer-app/services/firebase.js` — file không tồn tại

---
## ❌ KHÔNG TÌM THẤY: Volunteer — firebase config (config/)
`volunteer-app/config/firebase.ts` — file không tồn tại

---
## ❌ KHÔNG TÌM THẤY: Volunteer — firebase config (config/)
`volunteer-app/config/firebase.js` — file không tồn tại

---
## ❌ KHÔNG TÌM THẤY: Volunteer — firebase config (root)
`volunteer-app/firebase.ts` — file không tồn tại

---
## ❌ KHÔNG TÌM THẤY: Volunteer — firebase config (root)
`volunteer-app/firebase.js` — file không tồn tại

# PHẦN 7: FIRESTORE SECURITY RULES

---
## 📄 Firestore Rules (root)
`firestore.rules`

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /patients/{patientId} {
      allow read, write: if request.auth != null && request.auth.uid == patientId;
    }

    match /volunteers/{volunteerId} {
      allow read, write: if request.auth != null && request.auth.uid == volunteerId;
    }

    match /incidents/{incidentId} {
      // Bystander web (unauthenticated) can read for onSnapshot
      allow read: if true;
      // Volunteer co the update incident cua minh (mark complete)
      allow update: if request.auth != null &&
        resource.data.acceptedBy == request.auth.uid;
      // Chi Cloud Function moi create/delete
      allow create, delete: if false;
    }
  }
}

```

---
## ❌ KHÔNG TÌM THẤY: Firestore Rules (trong functions/)
`functions/firestore.rules` — file không tồn tại

---
## 🔎 TÌM: Tất cả file .rules
```
./firestore.rules
```

---

# PHẦN 8: CHECKLIST ĐỂ AI REVIEW

## Bug 1 — NFC ghi profile không hoạt động
- [ ] `app.json` có khai báo `react-native-nfc-manager` trong `plugins`?
- [ ] `app.json` có `android.permissions` bao gồm `android.permission.NFC`?
- [ ] `nfc-write.tsx` có `NfcManager.start()` trong `useEffect`?
- [ ] Có `await NfcManager.requestTechnology(NfcTech.Ndef)` trước khi ghi?
- [ ] Có `NfcManager.cancelTechnologyRequest()` trong finally block?
- [ ] Payload được tạo đúng với `Ndef.uriRecord(url)` hay `Ndef.encodeMessage()`?
- [ ] `qr-code.tsx` navigate đúng sang `/nfc-write` và truyền `patientId`/`qrUrl` qua params?
- [ ] Screen `nfc-write` nhận params đúng từ router?

## Bug 2 — History trống sau khi Complete Incident
- [ ] `completeIncident()` có update Firestore field `status = 'completed'`?
- [ ] `completeIncident()` có update field `acceptedBy = uid` (cần cho query)?
- [ ] `getVolunteerHistory()` query đúng collection `incidents` (không phải `emergencies`)?
- [ ] Query dùng `where('acceptedBy', '==', uid)` hay field khác?
- [ ] Firestore Security Rules cho phép volunteer query incidents với `acceptedBy == uid`?
- [ ] `history.tsx` có pull-to-refresh hay chỉ load 1 lần khi mount?
- [ ] Sau khi `completeIncident()` có `router.replace('/(tabs)/home')` không? — nếu có, khi vào History sau đó data có được refetch không?
- [ ] Cloud Function `acceptIncident` có lưu `acceptedBy` vào Firestore không?

