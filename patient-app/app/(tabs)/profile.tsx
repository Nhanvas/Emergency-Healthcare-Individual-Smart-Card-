import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getPatient } from "../../services/patientService";

type EmergencyShape =
  | string
  | { name?: string; phone?: string; relationship?: string };

type PatientDoc = {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
  bloodType?: string;
  allergies?: string[];
  conditions?: string[];
  emergencyContact?: EmergencyShape;
};

function formatGender(g: string | undefined) {
  if (!g) return "-";
  if (g === "Nu") return "Nữ";
  return g;
}

function ageFromDob(dob: string | undefined) {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  return new Date().getFullYear() - d.getFullYear();
}

function parseEmergency(p: PatientDoc | null) {
  const ec = p?.emergencyContact;
  if (!ec) return { name: "", phone: "", relationship: "" };
  if (typeof ec === "string") {
    return { name: "", phone: ec, relationship: "" };
  }
  return {
    name: ec.name || "",
    phone: ec.phone || "",
    relationship: ec.relationship || "",
  };
}

export default function Profile() {
  const [patient, setPatient] = useState<PatientDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatient()
      .then((data) => setPatient((data as PatientDoc) ?? null))
      .catch(() => setPatient(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeRoot} edges={["top"]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#1892BE" />
        </View>
      </SafeAreaView>
    );
  }

  const hasProfile = Boolean(patient?.fullName?.trim());
  const name = patient?.fullName?.trim() || "";
  const phone = patient?.phoneNumber || "";
  const gender = formatGender(patient?.gender);
  const age = ageFromDob(patient?.dateOfBirth);
  const blood = patient?.bloodType || "-";
  const allergies = patient?.allergies ?? [];
  const conditions = patient?.conditions ?? [];
  const em = parseEmergency(patient);

  const initials =
    hasProfile && name.length > 0
      ? name.trim().charAt(0).toUpperCase()
      : "?";

  return (
    <SafeAreaView style={styles.safeRoot} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hồ sơ</Text>
          <View style={styles.headerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.headerTextCol}>
              <Text style={styles.headerName} numberOfLines={2}>
                {hasProfile ? name : "Chưa có hồ sơ"}
              </Text>
              <Text style={styles.headerPhone} numberOfLines={1}>
                {hasProfile ? phone || " " : " "}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardsWrap}>
          {!hasProfile ? (
            <View style={[styles.card, styles.emptyCard]}>
              <Text style={styles.emptyPrompt}>
                Bạn chưa lưu hồ sơ y tế. Nhấn Chỉnh sửa bên dưới để điền
                thông tin.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Thông tin</Text>
                <View style={styles.divider} />
                <Text style={styles.infoLine}>
                  Họ tên: {name || "-"}
                </Text>
                <View style={styles.infoRowSplit}>
                  <Text style={styles.infoLinePlain}>
                    Giới tính: {gender}
                  </Text>
                  <View style={styles.vDivider} />
                  <Text style={styles.infoLinePlain}>
                    Tuổi: {age != null ? String(age) : "-"}
                  </Text>
                  <View style={styles.vDivider} />
                  <Text style={styles.infoLineBold}>
                    Nhóm máu: {blood}
                  </Text>
                </View>
                <Text style={styles.infoLinePhone}>
                  Số điện thoại: {phone || "-"}
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Bệnh lý</Text>
                <View style={styles.divider} />
                <Text style={styles.subLabel}>Dị ứng</Text>
                {allergies.length > 0 ? (
                  <View style={styles.chipRow}>
                    {allergies.map((a, i) => (
                      <View key={`${a}-${i}`} style={styles.chip}>
                        <Text style={styles.chipText}>{a}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.dashMuted}>-</Text>
                )}
                <Text style={styles.subLabelSpaced}>Bệnh nền</Text>
                {conditions.length > 0 ? (
                  <View style={styles.chipRow}>
                    {conditions.map((c, i) => (
                      <View key={`${c}-${i}`} style={styles.chip}>
                        <Text style={styles.chipText}>{c}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.dashMuted}>-</Text>
                )}
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Liên hệ khẩn cấp</Text>
                <View style={styles.divider} />
                <Text style={styles.contactLine}>
                  {em.name && em.relationship
                    ? `${em.name} - ${em.relationship}`
                    : em.name || em.relationship || "-"}
                </Text>
                {em.phone ? (
                  <TouchableOpacity
                    style={styles.phoneRow}
                    onPress={() => Linking.openURL(`tel:${em.phone}`)}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name="call-outline"
                      size={18}
                      color="#1892BE"
                    />
                    <Text style={styles.phoneLink}>{em.phone}</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.dashMuted, styles.phoneRowMuted]}>
                    -
                  </Text>
                )}
              </View>
            </>
          )}
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.btnEdit}
            onPress={() => router.push("/patient-form")}
            activeOpacity={0.85}
          >
            <Text style={styles.btnEditText}>Chỉnh sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnQr}
            onPress={() => router.push("/(tabs)/qr-code")}
            activeOpacity={0.85}
          >
            <Text style={styles.btnQrText}>Mã QR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeRoot: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#1892BE",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#1892BE",
    fontSize: 22,
    fontWeight: "bold",
  },
  headerTextCol: {
    flex: 1,
  },
  headerName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerPhone: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.85,
    marginTop: 4,
  },
  cardsWrap: {
    paddingHorizontal: 16,
    marginTop: -14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 16,
    marginBottom: 12,
  },
  emptyCard: {
    justifyContent: "center",
  },
  emptyPrompt: {
    fontSize: 14,
    color: "#757575",
    lineHeight: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: 10,
  },
  infoLine: {
    fontSize: 14,
    color: "#212121",
  },
  infoRowSplit: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 0,
    marginTop: 6,
  },
  infoLinePlain: {
    fontSize: 14,
    color: "#212121",
  },
  infoLineBold: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#212121",
  },
  vDivider: {
    width: 1,
    height: 14,
    backgroundColor: "#BDBDBD",
    marginHorizontal: 10,
  },
  infoLinePhone: {
    fontSize: 14,
    color: "#212121",
    marginTop: 6,
  },
  subLabel: {
    fontSize: 13,
    color: "#757575",
    marginBottom: 6,
  },
  subLabelSpaced: {
    fontSize: 13,
    color: "#757575",
    marginTop: 12,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#1892BE",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipText: {
    color: "#FFFFFF",
    fontSize: 13,
  },
  dashMuted: {
    fontSize: 14,
    color: "#9E9E9E",
  },
  contactLine: {
    fontSize: 14,
    color: "#212121",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  phoneRowMuted: {
    marginTop: 8,
  },
  phoneLink: {
    color: "#1892BE",
    fontSize: 15,
    fontWeight: "600",
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  btnEdit: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#1892BE",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  btnEditText: {
    color: "#1892BE",
    fontSize: 15,
    fontWeight: "600",
  },
  btnQr: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#1892BE",
    justifyContent: "center",
    alignItems: "center",
  },
  btnQrText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});
