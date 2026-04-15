// ─── Domain bystander web ────────────────────────────────────
export const BYSTANDER_DOMAIN =
  "https://emergency-healthcare-individual-sma.vercel.app";

// ─── Helper: build URL hồ sơ bệnh nhân từ UID ───────────────
// Dùng trong:
//   - qr-code.tsx  → hiển thị QR
//   - nfc-write.tsx → ghi vào thẻ NFC
export function getPatientPublicProfileUrl(uid: string): string {
  return `${BYSTANDER_DOMAIN}/patient/${uid}`;
}