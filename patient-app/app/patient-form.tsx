import { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform
} from "react-native";
import { router } from "expo-router";
import { savePatient, getPatient } from "../services/patientService";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Nam", "Nữ"];

export default function PatientForm() {
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
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
        setGender(data.gender || "");
        setPhoneNumber(data.phoneNumber || "");
        setBloodType(data.bloodType || "");
        setEmergencyContact(data.emergencyContact || "");
        setAllergies(data.allergies || []);
        setConditions(data.conditions || []);
      }
    };
    load();
  }, []);

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setAllergies([...allergies, allergyInput.trim()]);
      setAllergyInput("");
    }
  };

  const removeAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const addCondition = () => {
    if (conditionInput.trim()) {
      setConditions([...conditions, conditionInput.trim()]);
      setConditionInput("");
    }
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setError("");
    if (!fullName || !dateOfBirth || !bloodType) {
      setError("Vui lòng điền: Họ tên, Ngày sinh, Nhóm máu");
      return;
    }
    try {
      setLoading(true);
      await savePatient({
        fullName, dateOfBirth, gender, phoneNumber,
        bloodType, allergies, conditions, emergencyContact
      });
      Alert.alert("✅ Thành công", "Đã lưu thông tin y tế", [
        { text: "OK", onPress: () => router.replace("/(tabs)/profile") }
      ]);
    } catch (e) {
      setError("Lưu thất bại, thử lại nhé");
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
        <Text style={styles.title}>Thông tin y tế</Text>

        {/* Họ tên */}
        <Text style={styles.label}>Họ và tên *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nguyễn Văn A"
          value={fullName}
          onChangeText={setFullName}
        />

        {/* Ngày sinh */}
        <Text style={styles.label}>Ngày sinh * (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="2000-01-31"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
        />

        {/* Giới tính */}
        <Text style={styles.label}>Giới tính</Text>
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

        {/* Số điện thoại */}
        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          placeholder="+84901234567"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        {/* Nhóm máu */}
        <Text style={styles.label}>Nhóm máu *</Text>
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

        {/* Dị ứng */}
        <Text style={styles.label}>Dị ứng</Text>
        <View style={styles.chipInputRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="VD: Penicillin"
            value={allergyInput}
            onChangeText={setAllergyInput}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addAllergy}>
            <Text style={styles.addBtnText}>+ Thêm</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.chipContainer}>
          {allergies.map((a, i) => (
            <View key={i} style={styles.chip}>
              <Text style={styles.chipText}>{a}</Text>
              <TouchableOpacity onPress={() => removeAllergy(i)}>
                <Text style={styles.chipRemove}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Bệnh lý */}
        <Text style={styles.label}>Bệnh lý nền</Text>
        <View style={styles.chipInputRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="VD: Tăng huyết áp"
            value={conditionInput}
            onChangeText={setConditionInput}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addCondition}>
            <Text style={styles.addBtnText}>+ Thêm</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.chipContainer}>
          {conditions.map((c, i) => (
            <View key={i} style={styles.chip}>
              <Text style={styles.chipText}>{c}</Text>
              <TouchableOpacity onPress={() => removeCondition(i)}>
                <Text style={styles.chipRemove}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Liên hệ khẩn cấp */}
        <Text style={styles.label}>Số điện thoại khẩn cấp</Text>
        <TextInput
          style={styles.input}
          placeholder="0901234567"
          value={emergencyContact}
          onChangeText={setEmergencyContact}
          keyboardType="phone-pad"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={handleSave}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Lưu thông tin</Text>
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
  input: {
    height: 48, borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 8,
    paddingHorizontal: 12, marginBottom: 4, fontSize: 14, backgroundColor: "#F5F5F5"
  },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  pill: {
    paddingHorizontal: 20, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: "#E0E0E0", justifyContent: "center",
    alignItems: "center", backgroundColor: "#F5F5F5"
  },
  pillActive: { backgroundColor: "#D32F2F", borderColor: "#D32F2F" },
  pillText: { fontSize: 14, color: "#757575" },
  pillTextActive: { color: "#fff", fontWeight: "bold" },
  bloodPill: {
    width: 56, height: 56, borderRadius: 8, borderWidth: 1,
    borderColor: "#E0E0E0", justifyContent: "center",
    alignItems: "center", backgroundColor: "#F5F5F5"
  },
  bloodPillActive: { backgroundColor: "#D32F2F", borderColor: "#D32F2F" },
  bloodPillText: { fontSize: 14, fontWeight: "600", color: "#757575" },
  bloodPillTextActive: { color: "#fff" },
  chipInputRow: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 8 },
  addBtn: {
    backgroundColor: "#D32F2F", paddingHorizontal: 14,
    height: 48, borderRadius: 8, justifyContent: "center"
  },
  addBtnText: { color: "#fff", fontWeight: "bold" },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#FFEBEE",
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6
  },
  chipText: { color: "#D32F2F", fontSize: 13 },
  chipRemove: { color: "#D32F2F", fontSize: 18, fontWeight: "bold" },
  error: { color: "#D32F2F", fontSize: 13, marginBottom: 12, marginTop: 8 },
  btnPrimary: {
    backgroundColor: "#D32F2F", height: 56, borderRadius: 8,
    justifyContent: "center", alignItems: "center", marginTop: 24
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});