#!/bin/bash
# ============================================================
# EMERGENCY RESPONSE SYSTEM — CODE AUDIT SCRIPT
# Mục tiêu: Thu thập toàn bộ code liên quan vào 1 file để debug:
#   Bug 1: NFC ghi profile từ Patient App không hoạt động
#   Bug 2: History không hiện sau khi Complete Incident
#
# CÁCH DÙNG (chạy từ root monorepo):
#   cd ~/Documents/emergency-response-system   (hoặc thư mục monorepo của bạn)
#   bash run_audit.sh
#
# OUTPUT: ./AUDIT_REPORT.md
# ============================================================

AUDIT_FILE="AUDIT_REPORT.md"
MONOREPO_ROOT="$(pwd)"

echo "🔍 Bắt đầu audit tại: $MONOREPO_ROOT"
echo "📄 Output: $AUDIT_FILE"

# Xóa file cũ nếu có
rm -f "$AUDIT_FILE"

# ─────────────────────────────────────────────────────────────
# Helper function: in nội dung file với header
# ─────────────────────────────────────────────────────────────
dump_file() {
  local filepath="$1"
  local label="$2"
  if [ -f "$filepath" ]; then
    echo "" >> "$AUDIT_FILE"
    echo "---" >> "$AUDIT_FILE"
    echo "## 📄 $label" >> "$AUDIT_FILE"
    echo "\`$filepath\`" >> "$AUDIT_FILE"
    echo "" >> "$AUDIT_FILE"
    echo '```' >> "$AUDIT_FILE"
    cat "$filepath" >> "$AUDIT_FILE"
    echo "" >> "$AUDIT_FILE"
    echo '```' >> "$AUDIT_FILE"
  else
    echo "" >> "$AUDIT_FILE"
    echo "---" >> "$AUDIT_FILE"
    echo "## ❌ KHÔNG TÌM THẤY: $label" >> "$AUDIT_FILE"
    echo "\`$filepath\` — file không tồn tại" >> "$AUDIT_FILE"
  fi
}

# ─────────────────────────────────────────────────────────────
# Helper: list cấu trúc thư mục
# ─────────────────────────────────────────────────────────────
dump_tree() {
  local dir="$1"
  local label="$2"
  echo "" >> "$AUDIT_FILE"
  echo "---" >> "$AUDIT_FILE"
  echo "## 🗂️ CẤU TRÚC THƯ MỤC: $label" >> "$AUDIT_FILE"
  echo '```' >> "$AUDIT_FILE"
  if command -v tree &> /dev/null; then
    tree "$dir" -I "node_modules|.expo|.next|.git|__pycache__|*.pyc" --dirsfirst 2>/dev/null >> "$AUDIT_FILE"
  else
    find "$dir" \
      -not -path "*/node_modules/*" \
      -not -path "*/.expo/*" \
      -not -path "*/.next/*" \
      -not -path "*/.git/*" \
      | sort >> "$AUDIT_FILE"
  fi
  echo '```' >> "$AUDIT_FILE"
}

# ============================================================
# HEADER
# ============================================================
cat >> "$AUDIT_FILE" << 'HEADER'
# EMERGENCY RESPONSE SYSTEM — AUDIT REPORT

> Tự động tạo bởi `run_audit.sh`
> Mục tiêu debug:
> - **Bug 1:** NFC ghi profile từ Patient App không hoạt động
> - **Bug 2:** History không hiện sau khi Complete Incident (Volunteer App)

HEADER

echo "$(date)" >> "$AUDIT_FILE"

# ============================================================
# PHẦN 1: PACKAGE.JSON — kiểm tra dependencies
# ============================================================
echo "" >> "$AUDIT_FILE"
echo "# PHẦN 1: PACKAGE.JSON (kiểm tra NFC + media-library + Firestore packages)" >> "$AUDIT_FILE"

dump_file "patient-app/package.json" "Patient App — package.json"
dump_file "volunteer-app/package.json" "Volunteer App — package.json"

# ============================================================
# PHẦN 2: CẤU TRÚC FOLDER
# ============================================================
echo "" >> "$AUDIT_FILE"
echo "# PHẦN 2: CẤU TRÚC FOLDER" >> "$AUDIT_FILE"

dump_tree "patient-app/app" "patient-app/app"
dump_tree "patient-app/components" "patient-app/components (nếu có)"
dump_tree "patient-app/services" "patient-app/services (nếu có)"
dump_tree "patient-app/constants" "patient-app/constants (nếu có)"

echo "" >> "$AUDIT_FILE"
dump_tree "volunteer-app/app" "volunteer-app/app"
dump_tree "volunteer-app/components" "volunteer-app/components (nếu có)"
dump_tree "volunteer-app/services" "volunteer-app/services (nếu có)"
dump_tree "volunteer-app/context" "volunteer-app/context (nếu có)"
dump_tree "volunteer-app/constants" "volunteer-app/constants (nếu có)"

dump_tree "functions" "functions (Cloud Functions)"

# ============================================================
# PHẦN 3: BUG 1 — NFC GHI PROFILE (Patient App)
# ============================================================
echo "" >> "$AUDIT_FILE"
echo "# PHẦN 3: BUG 1 — NFC (Patient App)" >> "$AUDIT_FILE"
echo "> Cần xem: màn hình QR, màn hình NFC, app.json (permissions), plugin config" >> "$AUDIT_FILE"

# QR screen (nơi có nút "Ghi thẻ NFC")
dump_file "patient-app/app/(tabs)/qr-code.tsx" "QR Code Screen (tabs)"
dump_file "patient-app/app/(tabs)/qr-code.jsx" "QR Code Screen JSX (tabs)"
dump_file "patient-app/app/qr-code.tsx" "QR Code Screen (root)"
dump_file "patient-app/app/qr-code.jsx" "QR Code Screen JSX (root)"

# NFC write screen
dump_file "patient-app/app/nfc-write.tsx" "NFC Write Screen (.tsx)"
dump_file "patient-app/app/nfc-write.jsx" "NFC Write Screen (.jsx)"
dump_file "patient-app/app/nfc-write.js" "NFC Write Screen (.js)"

# Tìm bất kỳ file nào chứa "nfc" trong tên (case-insensitive)
echo "" >> "$AUDIT_FILE"
echo "---" >> "$AUDIT_FILE"
echo "## 🔎 TÌM KIẾM: Tất cả file liên quan NFC trong patient-app" >> "$AUDIT_FILE"
echo '```' >> "$AUDIT_FILE"
find patient-app -not -path "*/node_modules/*" -not -path "*/.expo/*" \
  \( -iname "*nfc*" -o -iname "*qr*" \) 2>/dev/null | sort >> "$AUDIT_FILE"
echo '```' >> "$AUDIT_FILE"

# Tìm file nào import nfc-manager
echo "" >> "$AUDIT_FILE"
echo "---" >> "$AUDIT_FILE"
echo "## 🔎 GREP: Files dùng react-native-nfc-manager" >> "$AUDIT_FILE"
echo '```' >> "$AUDIT_FILE"
grep -r "nfc-manager\|NfcManager\|NfcTech\|writeNdef" patient-app/app \
  --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" \
  -l 2>/dev/null >> "$AUDIT_FILE"
echo "--- nội dung grep ---" >> "$AUDIT_FILE"
grep -r "nfc-manager\|NfcManager\|NfcTech\|writeNdef\|Ndef\|nfcManager" patient-app/app \
  --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" \
  -n 2>/dev/null >> "$AUDIT_FILE"
echo '```' >> "$AUDIT_FILE"

# Tìm expo-media-library (liên quan QR download)
echo "" >> "$AUDIT_FILE"
echo "---" >> "$AUDIT_FILE"
echo "## 🔎 GREP: Files dùng expo-media-library" >> "$AUDIT_FILE"
echo '```' >> "$AUDIT_FILE"
grep -r "expo-media-library\|MediaLibrary\|saveToLibrary\|createAssetAsync" patient-app/app \
  --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" \
  -n 2>/dev/null >> "$AUDIT_FILE"
echo '```' >> "$AUDIT_FILE"

# app.json / app.config.js — permissions & plugins
dump_file "patient-app/app.json" "Patient App — app.json (permissions, NFC plugin)"
dump_file "patient-app/app.config.js" "Patient App — app.config.js"
dump_file "patient-app/app.config.ts" "Patient App — app.config.ts"

# ============================================================
# PHẦN 4: BUG 2 — HISTORY SAU KHI COMPLETE INCIDENT (Volunteer App)
# ============================================================
echo "" >> "$AUDIT_FILE"
echo "# PHẦN 4: BUG 2 — HISTORY SAU KHI COMPLETE INCIDENT (Volunteer App)" >> "$AUDIT_FILE"
echo "> Cần xem: map.tsx (nơi complete), history.tsx, incidentService, Cloud Function" >> "$AUDIT_FILE"

# Map tab (có nút "Hoàn thành")
dump_file "volunteer-app/app/(tabs)/map.tsx" "Volunteer — Map Tab / Patient Report (.tsx)"
dump_file "volunteer-app/app/(tabs)/map.jsx" "Volunteer — Map Tab / Patient Report (.jsx)"
dump_file "volunteer-app/app/(tabs)/map.js" "Volunteer — Map Tab / Patient Report (.js)"

# incident-tabs (swipeable tabs post-accept)
dump_file "volunteer-app/app/incident-tabs.tsx" "Volunteer — Incident Tabs (.tsx)"
dump_file "volunteer-app/app/incident-tabs.jsx" "Volunteer — Incident Tabs (.jsx)"
dump_file "volunteer-app/app/incident-tabs.js" "Volunteer — Incident Tabs (.js)"

# patient-info screen
dump_file "volunteer-app/app/patient-info.tsx" "Volunteer — Patient Info Screen (.tsx)"
dump_file "volunteer-app/app/patient-info.jsx" "Volunteer — Patient Info Screen (.jsx)"

# History screen
dump_file "volunteer-app/app/history.tsx" "Volunteer — History Screen (.tsx)"
dump_file "volunteer-app/app/history.jsx" "Volunteer — History Screen (.jsx)"
dump_file "volunteer-app/app/history.js" "Volunteer — History Screen (.js)"
dump_file "volunteer-app/app/(tabs)/history.tsx" "Volunteer — History Tab (.tsx)"
dump_file "volunteer-app/app/(tabs)/history.jsx" "Volunteer — History Tab (.jsx)"

# Settings (có nút vào History)
dump_file "volunteer-app/app/(tabs)/settings.tsx" "Volunteer — Settings Tab (.tsx)"
dump_file "volunteer-app/app/(tabs)/settings.jsx" "Volunteer — Settings Tab (.jsx)"
dump_file "volunteer-app/app/(tabs)/settings.js" "Volunteer — Settings Tab (.js)"

# Home screen (Alert Modal + Accept logic)
dump_file "volunteer-app/app/(tabs)/home.tsx" "Volunteer — Home Screen (.tsx)"
dump_file "volunteer-app/app/(tabs)/home.jsx" "Volunteer — Home Screen (.jsx)"
dump_file "volunteer-app/app/(tabs)/home.js" "Volunteer — Home Screen (.js)"

# Root layout
dump_file "volunteer-app/app/_layout.tsx" "Volunteer — Root Layout (.tsx)"
dump_file "volunteer-app/app/_layout.jsx" "Volunteer — Root Layout (.jsx)"

# Services
dump_file "volunteer-app/services/incidentService.ts" "Volunteer — incidentService (.ts)"
dump_file "volunteer-app/services/incidentService.js" "Volunteer — incidentService (.js)"
dump_file "volunteer-app/services/volunteerService.ts" "Volunteer — volunteerService (.ts)"
dump_file "volunteer-app/services/volunteerService.js" "Volunteer — volunteerService (.js)"

# Context
dump_file "volunteer-app/context/IncidentContext.tsx" "Volunteer — IncidentContext (.tsx)"
dump_file "volunteer-app/context/IncidentContext.jsx" "Volunteer — IncidentContext (.jsx)"
dump_file "volunteer-app/context/IncidentContext.js" "Volunteer — IncidentContext (.js)"

# Alert Modal component
dump_file "volunteer-app/components/AlertModal.tsx" "Volunteer — AlertModal (.tsx)"
dump_file "volunteer-app/components/AlertModal.jsx" "Volunteer — AlertModal (.jsx)"
dump_file "volunteer-app/components/AlertModal.js" "Volunteer — AlertModal (.js)"

# Tìm tất cả file có "completeIncident" hoặc "history"
echo "" >> "$AUDIT_FILE"
echo "---" >> "$AUDIT_FILE"
echo "## 🔎 GREP: Tìm completeIncident trong volunteer-app" >> "$AUDIT_FILE"
echo '```' >> "$AUDIT_FILE"
grep -r "completeIncident\|status.*completed\|complete.*incident" volunteer-app \
  --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" \
  --exclude-dir=node_modules -n 2>/dev/null >> "$AUDIT_FILE"
echo '```' >> "$AUDIT_FILE"

echo "" >> "$AUDIT_FILE"
echo "---" >> "$AUDIT_FILE"
echo "## 🔎 GREP: Tìm getVolunteerHistory / query incidents trong volunteer-app" >> "$AUDIT_FILE"
echo '```' >> "$AUDIT_FILE"
grep -r "getVolunteerHistory\|acceptedBy\|where.*acceptedBy\|incidents.*acceptedBy" volunteer-app \
  --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" \
  --exclude-dir=node_modules -n 2>/dev/null >> "$AUDIT_FILE"
echo '```' >> "$AUDIT_FILE"

echo "" >> "$AUDIT_FILE"
echo "---" >> "$AUDIT_FILE"
echo "## 🔎 GREP: Tìm router.push history hoặc router.replace" >> "$AUDIT_FILE"
echo '```' >> "$AUDIT_FILE"
grep -r "router\.\(push\|replace\|navigate\).*history\|router\.\(push\|replace\|navigate\).*home\|setActiveIncidentId" volunteer-app \
  --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" \
  --exclude-dir=node_modules -n 2>/dev/null >> "$AUDIT_FILE"
echo '```' >> "$AUDIT_FILE"

# ============================================================
# PHẦN 5: CLOUD FUNCTIONS
# ============================================================
echo "" >> "$AUDIT_FILE"
echo "# PHẦN 5: CLOUD FUNCTIONS" >> "$AUDIT_FILE"

dump_file "functions/index.js" "Cloud Functions — index.js"
dump_file "functions/src/index.js" "Cloud Functions — src/index.js"
dump_file "functions/index.ts" "Cloud Functions — index.ts"
dump_file "functions/package.json" "Cloud Functions — package.json"

# Tìm acceptIncident và completeIncident trong functions
echo "" >> "$AUDIT_FILE"
echo "---" >> "$AUDIT_FILE"
echo "## 🔎 GREP: acceptIncident + completeIncident trong functions" >> "$AUDIT_FILE"
echo '```' >> "$AUDIT_FILE"
grep -r "acceptIncident\|completeIncident\|status.*completed\|volunteerName" functions \
  --include="*.js" --include="*.ts" \
  --exclude-dir=node_modules -n 2>/dev/null >> "$AUDIT_FILE"
echo '```' >> "$AUDIT_FILE"

# ============================================================
# PHẦN 6: FIRESTORE CONFIG & FIREBASE INIT
# ============================================================
echo "" >> "$AUDIT_FILE"
echo "# PHẦN 6: FIREBASE CONFIG" >> "$AUDIT_FILE"

# Patient app firebase
dump_file "patient-app/services/firebase.ts" "Patient — firebase config (.ts)"
dump_file "patient-app/services/firebase.js" "Patient — firebase config (.js)"
dump_file "patient-app/config/firebase.ts" "Patient — firebase config (config/)"
dump_file "patient-app/config/firebase.js" "Patient — firebase config (config/)"
dump_file "patient-app/firebase.ts" "Patient — firebase config (root)"
dump_file "patient-app/firebase.js" "Patient — firebase config (root)"

# Volunteer app firebase
dump_file "volunteer-app/services/firebase.ts" "Volunteer — firebase config (.ts)"
dump_file "volunteer-app/services/firebase.js" "Volunteer — firebase config (.js)"
dump_file "volunteer-app/config/firebase.ts" "Volunteer — firebase config (config/)"
dump_file "volunteer-app/config/firebase.js" "Volunteer — firebase config (config/)"
dump_file "volunteer-app/firebase.ts" "Volunteer — firebase config (root)"
dump_file "volunteer-app/firebase.js" "Volunteer — firebase config (root)"

# ============================================================
# PHẦN 7: FIRESTORE SECURITY RULES
# ============================================================
echo "" >> "$AUDIT_FILE"
echo "# PHẦN 7: FIRESTORE SECURITY RULES" >> "$AUDIT_FILE"

dump_file "firestore.rules" "Firestore Rules (root)"
dump_file "functions/firestore.rules" "Firestore Rules (trong functions/)"

# Tìm file .rules bất kỳ
echo "" >> "$AUDIT_FILE"
echo "---" >> "$AUDIT_FILE"
echo "## 🔎 TÌM: Tất cả file .rules" >> "$AUDIT_FILE"
echo '```' >> "$AUDIT_FILE"
find . -name "*.rules" -not -path "*/node_modules/*" 2>/dev/null >> "$AUDIT_FILE"
echo '```' >> "$AUDIT_FILE"

# ============================================================
# PHẦN 8: SUMMARY — CHECKLIST CHO AI REVIEWER
# ============================================================
cat >> "$AUDIT_FILE" << 'SUMMARY'

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

SUMMARY

# ============================================================
echo ""
echo "✅ AUDIT HOÀN THÀNH!"
echo "📄 File: $AUDIT_FILE"
echo "📊 Kích thước: $(wc -l < $AUDIT_FILE) dòng"
echo ""
echo "📌 Bước tiếp theo:"
echo "   1. Mở AUDIT_REPORT.md trong editor"
echo "   2. Gửi toàn bộ nội dung cho AI reviewer"
echo "   3. AI sẽ xác định chính xác root cause và đưa ra patch"