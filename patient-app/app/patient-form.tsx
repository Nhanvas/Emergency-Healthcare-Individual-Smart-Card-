import { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { savePatient, getPatient } from "../services/patientService";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Nam", "Nu"];
const RELATIONSHIPS = ["Bo/Me", "Vo/Chong", "Con", "Anh/Chi/Em", "Ban be", "Khac"];

export default function PatientForm() {
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bloodType, setBloodType] = useState("");

  // Emergency contact — tách thành 2 trường
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");

  const [allergyInput, setAllergyInput] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [conditionInput, setConditionInput] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const data = await getPatient();
      if (data) {
        setFullName(data.fullName || "");
        setDateOfBirth(data.dateOfBirth || "");
        if (data.dateOfBirth) {
          const parts = data.dateOfBirth.split("-");
          if (parts.length === 3) {
            setSelectedDate(new Date(
              parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])
            ));
          }
        }
        setGender(data.gender || "");
        setPhoneNumber(data.phoneNumber || "");
        setBloodType(data.bloodType || "");
        setAllergies(data.allergies || []);
        setConditions(data.conditions || []);

        // Load emergency contact — hỗ trợ cả format cũ (string) và mới (object)
        if (data.emergencyContact) {
          if (typeof data.emergencyContact === "string") {
            setEmergencyPhone(data.emergencyContact);
          } else {
            setEmergencyPhone(data.emergencyContact.phone || "");
            setEmergencyName(data.emergencyContact.name || "");
            setEmergencyRelationship(data.emergencyContact.relationship || "");
          }
        }
      }
    };
    load();
  }, []);

  const handleDateChange = (_: any, date?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      setDateOfBirth(`${y}-${m}-${d}`);
    }
  };

  const formatDisplayDate = (isoDate: string) => {
    if (!isoDate) return "Chon ngay sinh";
    const parts = isoDate.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return isoDate;
  };

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setAllergies([...allergies, allergyInput.trim()]);
      setAllergyInput("");
    }
  };

  const addCondition = () => {
    if (conditionInput.trim()) {
      setConditions([...conditions, conditionInput.trim()]);
      setConditionInput("");
    }
  };

  const handleSave = async () => {
    setError("");
    if (!fullName || !dateOfBirth || !bloodType) {
      setError("Vui long dien: Ho ten, Ngay sinh, Nhom mau");
      return;
    }
    try {
      setLoading(true);
      await savePatient({
        fullName, dateOfBirth, gender, phoneNumber,
        bloodType, allergies, conditions,
        // Lưu emergencyContact dạng object — khớp với schema
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relationship: emergencyRelationship,
        },
      });
      Alert.alert("Thanh cong", "Da luu thong tin y te", [
        { text: "OK", onPress: () => router.replace("/(tabs)/profile") }
      ]);
    } catch (e) {
      setError("Luu that bai, thu lai nhe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Thong tin y te</Text>

        {/* Ho ten */}
        <Text style={styles.label}>Ho va ten *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nguyen Van A"
          value={fullName}
          onChangeText={setFullName}
        />

        {/* Ngay sinh — date picker */}
        <Text style={styles.label}>Ngay sinh *</Text>
        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.dateBtnText, !dateOfBirth && { color: "#9E9E9E" }]}>
            {formatDisplayDate(dateOfBirth)}
          </Text>
          <Text style={styles.dateIcon}>📅</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1920, 0, 1)}
          />
        )}

        {/* iOS: nut xac nhan */}
        {showDatePicker && Platform.OS === "ios" && (
          <TouchableOpacity
            style={styles.dateConfirmBtn}
            onPress={() => setShowDatePicker(false)}
          >
            <Text style={styles.dateConfirmText}>Xac nhan</Text>
          </TouchableOpacity>
        )}

        {/* Gioi tinh */}
        <Text style={styles.label}>Gioi tinh</Text>
        <View style={styles.pillRow}>
          {GENDERS.map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.pill, gender === g && styles.pillActive]}
              onPress={() => setGender(g)}
            >
              <Text style={[styles.pillText, gender === g && styles.pillTextActive]}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* So dien thoai */}
        <Text style={styles.label}>So dien thoai</Text>
        <TextInput
          style={styles.input}
          placeholder="0901234567"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        {/* Nhom mau */}
        <Text style={styles.label}>Nhom mau *</Text>
        <View style={styles.pillRow}>
          {BLOOD_TYPES.map((bt) => (
            <TouchableOpacity
              key={bt}
              style={[styles.bloodPill, bloodType === bt && styles.bloodPillActive]}
              onPress={() => setBloodType(bt)}
            >
              <Text style={[styles.bloodPillText, bloodType === bt && styles.bloodPillTextActive]}>
                {bt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Di ung */}
        <Text style={styles.label}>Di ung</Text>
        <View style={styles.chipInputRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="VD: Penicillin"
            value={allergyInput}
            onChangeText={setAllergyInput}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addAllergy}>
            <Text style={styles.addBtnText}>+ Them</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.chipContainer}>
          {allergies.map((a, i) => (
            <View key={i} style={styles.chip}>
              <Text style={styles.chipText}>{a}</Text>
              <TouchableOpacity onPress={() => setAllergies(allergies.filter((_, j) => j !== i))}>
                <Text style={styles.chipRemove}>x</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Benh ly nen */}
        <Text style={styles.label}>Benh ly nen</Text>
        <View style={styles.chipInputRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="VD: Tang huyet ap"
            value={conditionInput}
            onChangeText={setConditionInput}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addCondition}>
            <Text style={styles.addBtnText}>+ Them</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.chipContainer}>
          {conditions.map((c, i) => (
            <View key={i} style={styles.chip}>
              <Text style={styles.chipText}>{c}</Text>
              <TouchableOpacity onPress={() => setConditions(conditions.filter((_, j) => j !== i))}>
                <Text style={styles.chipRemove}>x</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Lien he khan cap */}
        <Text style={styles.sectionLabel}>Lien he khan cap</Text>

        <Text style={styles.label}>Ho ten nguoi lien he</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: Nguyen Thi B"
          value={emergencyName}
          onChangeText={setEmergencyName}
        />

        <Text style={styles.label}>So dien thoai khan cap</Text>
        <TextInput
          style={styles.input}
          placeholder="0901234567"
          value={emergencyPhone}
          onChangeText={setEmergencyPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Quan he</Text>
        <View style={styles.pillRow}>
          {RELATIONSHIPS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.pill, emergencyRelationship === r && styles.pillActive]}
              onPress={() => setEmergencyRelationship(r)}
            >
              <Text style={[styles.pillText, emergencyRelationship === r && styles.pillTextActive]}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={handleSave}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Luu thong tin</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: "bold", color: "#D32F2F", marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "600", color: "#212121", marginBottom: 6, marginTop: 12 },
  sectionLabel: {
    fontSize: 16, fontWeight: "700", color: "#D32F2F",
    marginTop: 24, marginBottom: 4, borderTopWidth: 1,
    borderTopColor: "#F0F0F0", paddingTop: 16,
  },
  input: {
    height: 48, borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 8,
    paddingHorizontal: 12, marginBottom: 4, fontSize: 14, backgroundColor: "#F5F5F5",
  },
  dateBtn: {
    height: 48, borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 8,
    paddingHorizontal: 12, backgroundColor: "#F5F5F5",
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 4,
  },
  dateBtnText: { fontSize: 14, color: "#212121" },
  dateIcon: { fontSize: 18 },
  dateConfirmBtn: {
    backgroundColor: "#D32F2F", height: 40, borderRadius: 8,
    justifyContent: "center", alignItems: "center", marginBottom: 8,
  },
  dateConfirmText: { color: "#fff", fontWeight: "700" },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  pill: {
    paddingHorizontal: 16, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: "#E0E0E0",
    justifyContent: "center", alignItems: "center", backgroundColor: "#F5F5F5",
  },
  pillActive: { backgroundColor: "#D32F2F", borderColor: "#D32F2F" },
  pillText: { fontSize: 13, color: "#757575" },
  pillTextActive: { color: "#fff", fontWeight: "bold" },
  bloodPill: {
    width: 56, height: 56, borderRadius: 8, borderWidth: 1,
    borderColor: "#E0E0E0", justifyContent: "center",
    alignItems: "center", backgroundColor: "#F5F5F5",
  },
  bloodPillActive: { backgroundColor: "#D32F2F", borderColor: "#D32F2F" },
  bloodPillText: { fontSize: 14, fontWeight: "600", color: "#757575" },
  bloodPillTextActive: { color: "#fff" },
  chipInputRow: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 8 },
  addBtn: {
    backgroundColor: "#D32F2F", paddingHorizontal: 14,
    height: 48, borderRadius: 8, justifyContent: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "bold" },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#FFEBEE",
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6,
  },
  chipText: { color: "#D32F2F", fontSize: 13 },
  chipRemove: { color: "#D32F2F", fontSize: 18, fontWeight: "bold" },
  error: { color: "#D32F2F", fontSize: 13, marginBottom: 12, marginTop: 8 },
  btnPrimary: {
    backgroundColor: "#D32F2F", height: 56, borderRadius: 8,
    justifyContent: "center", alignItems: "center", marginTop: 24,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});