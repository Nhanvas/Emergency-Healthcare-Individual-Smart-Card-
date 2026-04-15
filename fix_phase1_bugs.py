import os, re

print("=" * 50)
print("FIX PHA 1 BUGS — Emergency Response System")
print("=" * 50)

# ============================================================
# BUG 0A: functions/index.js — đổi "emergencies" → "incidents"
# ============================================================
path = 'functions/index.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

count = content.count('collection("emergencies")')
content = content.replace('collection("emergencies")', 'collection("incidents")')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"✅ Bug 0A: Đổi {count} chỗ 'emergencies' → 'incidents' trong {path}")

# ============================================================
# BUG 0B: incidentService.ts — đổi 'emergencies' → 'incidents'
# ============================================================
path = 'volunteer-app/services/incidentService.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

c1 = content.count("collection(db, 'emergencies'")
c2 = content.count("doc(db, 'emergencies'")
content = content.replace("collection(db, 'emergencies'", "collection(db, 'incidents'")
content = content.replace("doc(db, 'emergencies'",        "doc(db, 'incidents'")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"✅ Bug 0B: Đổi {c1+c2} chỗ 'emergencies' → 'incidents' trong {path}")

# ============================================================
# BUG 1A: functions/index.js — acceptIncident trả về patientData
# ============================================================
path = 'functions/index.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_return = '''      return res.status(200).json({
        success: true,
        patientId: result.patientId,
        volunteerName: result.volunteerName,
      });'''

new_return = '''      // Fetch patient data server-side — volunteer client không đọc trực tiếp được
      const patientSnap = await db.collection("patients").doc(result.patientId).get();
      const patientData = patientSnap.exists ? patientSnap.data() : null;

      return res.status(200).json({
        success: true,
        patientId: result.patientId,
        volunteerName: result.volunteerName,
        patientData: patientData,
      });'''

if old_return in content:
    content = content.replace(old_return, new_return)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Bug 1A: acceptIncident giờ trả về patientData trong {path}")
else:
    print(f"⚠️  Bug 1A: Không tìm thấy đoạn cần thay trong {path} — kiểm tra thủ công")

# ============================================================
# BUG 1B: incidentService.ts — cập nhật kiểu trả về của acceptIncident
# ============================================================
path = 'volunteer-app/services/incidentService.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_sig = '''): Promise<{ success: boolean; patientId?: string; error?: string }> {'''
new_sig = '''): Promise<{ success: boolean; patientId?: string; patientData?: PatientData; volunteerName?: string; error?: string }> {'''

if old_sig in content:
    content = content.replace(old_sig, new_sig)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Bug 1B: Cập nhật return type acceptIncident trong {path}")
else:
    print(f"⚠️  Bug 1B: Không tìm thấy signature cần đổi trong {path} — kiểm tra thủ công")

# ============================================================
# BUG 2A: Tạo file constants/config.ts dùng chung cho patient-app
# ============================================================
os.makedirs('patient-app/constants', exist_ok=True)
config_content = '''// Cấu hình toàn app — thay đổi domain ở đây là đủ, không cần sửa nhiều file
export const BYSTANDER_DOMAIN = "https://emergency-healthcare-individual-sma.vercel.app";
'''
with open('patient-app/constants/config.ts', 'w', encoding='utf-8') as f:
    f.write(config_content)
print("✅ Bug 2A: Tạo patient-app/constants/config.ts")

# ============================================================
# BUG 2B: qr-code.tsx — dùng BYSTANDER_DOMAIN từ config
# ============================================================
path = 'patient-app/app/(tabs)/qr-code.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Thêm import config
old_import = 'import { auth } from "../../services/firebase";'
new_import = 'import { auth } from "../../services/firebase";\nimport { BYSTANDER_DOMAIN } from "../../constants/config";'

# Xóa dòng khai báo constant cũ
old_const = 'const BYSTANDER_DOMAIN = "https://emergency-healthcare-individual-sma.vercel.app";\n\n'

if old_import in content and old_const in content:
    content = content.replace(old_import, new_import)
    content = content.replace(old_const, '')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Bug 2B: qr-code.tsx dùng BYSTANDER_DOMAIN từ config")
else:
    print(f"⚠️  Bug 2B: Không khớp pattern trong {path} — kiểm tra thủ công")

# ============================================================
# BUG 2C: nfc-write.tsx — dùng BYSTANDER_DOMAIN từ config
# ============================================================
path = 'patient-app/app/nfc-write.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_import = 'import { router } from "expo-router";'
new_import = 'import { router } from "expo-router";\nimport { BYSTANDER_DOMAIN } from "../constants/config";'

old_const = 'const BYSTANDER_DOMAIN = "https://emergency-qr-medical.vercel.app";\n\n'

if old_import in content and old_const in content:
    content = content.replace(old_import, new_import)
    content = content.replace(old_const, '')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Bug 2C: nfc-write.tsx dùng BYSTANDER_DOMAIN từ config")
else:
    print(f"⚠️  Bug 2C: Không khớp pattern trong {path} — kiểm tra thủ công")

print("\n" + "=" * 50)
print("XONG! Kiểm tra output ở trên — nếu có ⚠️ thì báo lại")
print("=" * 50)
