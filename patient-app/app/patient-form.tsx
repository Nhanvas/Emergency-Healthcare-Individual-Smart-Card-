import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { savePatient, getPatient } from "../services/patientService";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Nam", "Nữ", "Khác"];
const RELATIONSHIPS = ["Bố/Mẹ", "Vợ/Chồng", "Anh/Chị/Em", "Bạn bè", "Khác"];

type PickerKind = "blood" | "gender" | "relationship";

function isoFromDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDdMmYyyy(isoDate: string) {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return isoDate;
}

export default function PatientForm() {
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bloodType, setBloodType] = useState("");

  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");

  const [allergyInput, setAllergyInput] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [conditionInput, setConditionInput] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);

  const [pickerKind, setPickerKind] = useState<PickerKind | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [fullNameError, setFullNameError] = useState("");
  const [dobError, setDobError] = useState("");
  const [bloodError, setBloodError] = useState("");
  const [genderError, setGenderError] = useState("");

  const applyDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setDateOfBirth(isoFromDate(date));
  }, []);

  // Tải dữ liệu đã lưu
  useEffect(() => {
    const load = async () => {
      const data = await getPatient();
      if (data) {
        setFullName(data.fullName || "");
        setDateOfBirth(data.dateOfBirth || "");
        if (data.dateOfBirth) {
          const parts = data.dateOfBirth.split("-");
          if (parts.length === 3) {
            setSelectedDate(
              new Date(
                parseInt(parts[0], 10),
                parseInt(parts[1], 10) - 1,
                parseInt(parts[2], 10)
              )
            );
          }
        }
        let g = data.gender || "";
        if (g === "Nu") g = "Nữ";
        setGender(g);
        setPhoneNumber(data.phoneNumber || "");
        setBloodType(data.bloodType || "");
        setAllergies(data.allergies || []);
        setConditions(data.conditions || []);

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

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === "dismissed") { setShowDatePicker(false); return; }
    if (Platform.OS === "android") setShowDatePicker(false);
    if (date) { applyDate(date); setDobError(""); }
  };

  const pickerOptions =
    pickerKind === "blood" ? BLOOD_TYPES :
    pickerKind === "gender" ? GENDERS :
    pickerKind === "relationship" ? RELATIONSHIPS : [];

  const onPickOption = (value: string) => {
    if (pickerKind === "blood") { setBloodType(value); setBloodError(""); }
    else if (pickerKind === "gender") { setGender(value); setGenderError(""); }
    else if (pickerKind === "relationship") setEmergencyRelationship(value);
    setPickerKind(null);
  };

  const addAllergy = () => {
    const t = allergyInput.trim();
    if (t) { setAllergies([...allergies, t]); setAllergyInput(""); }
  };

  const addCondition = () => {
    const t = conditionInput.trim();
    if (t) { setConditions([...conditions, t]); setConditionInput(""); }
  };

  const validate = () => {
    setFullNameError(""); setDobError(""); setBloodError(""); setGenderError("");
    let ok = true;
    if (!fullName.trim()) { setFullNameError("Vui lòng nhập họ và tên"); ok = false; }
    if (!dateOfBirth) { setDobError("Vui lòng chọn ngày sinh"); ok = false; }
    if (!bloodType) { setBloodError("Vui lòng chọn nhóm máu"); ok = false; }
    if (!gender) { setGenderError("Vui lòng chọn giới tính"); ok = false; }
    return ok;
  };

  const handleSave = async () => {
    setSaveError("");
    if (!validate()) return;
    try {
      setLoading(true);
      await savePatient({
        fullName: fullName.trim(),
        dateOfBirth,
        gender,
        phoneNumber,
        bloodType,
        allergies,
        conditions,
        medications: [],
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relationship: emergencyRelationship,
        },
      });
      router.replace("/(tabs)/profile");
    } catch {
      setSaveError("Lưu thất bại, thử lại nhé");
    } finally {
      setLoading(false);
    }
  };

  const renderSelectShell = (value: string, onOpen: () => void, placeholder: string) => (
    <TouchableOpacity style={styles.selectShell} onPress={onOpen} activeOpacity={0.85}>
      <Text style={[styles.selectText, !value && styles.selectPlaceholder]} numberOfLines={1}>
        {value || placeholder}
      </Text>
      <View style={styles.selectChevronWrap}>
        <Ionicons name="chevron-down" size={20} color="#757575" />
      </View>
    </TouchableOpacity>
  );

  const dateDisplay = formatDdMmYyyy(dateOfBirth);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable
            style={styles.backPressable}
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
          >
            <Ionicons name="arrow-back" size={24} color="#212121" />
          </Pressable>
          <Text style={styles.headerTitle}>Thông tin y tế</Text>
        </View>

        {/* Họ và tên */}
        <Text style={styles.label}>Họ và tên *</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={(t) => { setFullName(t); setFullNameError(""); }}
          placeholder="Họ và tên"
          placeholderTextColor="#BDBDBD"
          underlineColorAndroid="transparent"
        />
        {fullNameError ? <Text style={styles.fieldError}>{fullNameError}</Text> : null}

        {/* Ngày sinh + SĐT */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Ngày sinh *</Text>
            <TouchableOpacity
              style={styles.dateShell}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.85}
            >
              <Text style={[styles.dateText, !dateDisplay && styles.selectPlaceholder]}>
                {dateDisplay || "DD/MM/YYYY"}
              </Text>
              <View style={styles.calendarIconWrap}>
                <Ionicons name="calendar-outline" size={20} color="#757575" />
              </View>
            </TouchableOpacity>
            {dobError ? <Text style={styles.fieldError}>{dobError}</Text> : null}
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="Số điện thoại"
              placeholderTextColor="#BDBDBD"
              underlineColorAndroid="transparent"
            />
          </View>
        </View>

        {/* Android Date Picker */}
        {Platform.OS === "android" && showDatePicker ? (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1920, 0, 1)}
          />
        ) : null}

        {/* Nhóm máu + Giới tính */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Nhóm máu *</Text>
            {renderSelectShell(bloodType, () => setPickerKind("blood"), "Chọn")}
            {bloodError ? <Text style={styles.fieldError}>{bloodError}</Text> : null}
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Giới tính *</Text>
            {renderSelectShell(gender, () => setPickerKind("gender"), "Chọn")}
            {genderError ? <Text style={styles.fieldError}>{genderError}</Text> : null}
          </View>
        </View>

        {/* Dị ứng */}
        <Text style={[styles.label, styles.labelSpaced]}>Dị ứng</Text>
        <View style={styles.chipInputRow}>
          <TextInput
            style={styles.chipTextInput}
            value={allergyInput}
            onChangeText={setAllergyInput}
            placeholder="Thêm dị ứng"
            placeholderTextColor="#BDBDBD"
            underlineColorAndroid="transparent"
          />
          <TouchableOpacity style={styles.addChipBtn} onPress={addAllergy} activeOpacity={0.85}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.chipWrap}>
          {allergies.map((a, i) => (
            <View key={`${a}-${i}`} style={styles.chip}>
              <Text style={styles.chipLabel}>{a}</Text>
              <Pressable onPress={() => setAllergies(allergies.filter((_, j) => j !== i))} hitSlop={8}>
                <Text style={styles.chipRemove}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Bệnh lý nền */}
        <Text style={[styles.label, styles.labelSpaced]}>Bệnh lý nền</Text>
        <View style={styles.chipInputRow}>
          <TextInput
            style={styles.chipTextInput}
            value={conditionInput}
            onChangeText={setConditionInput}
            placeholder="Thêm bệnh lý"
            placeholderTextColor="#BDBDBD"
            underlineColorAndroid="transparent"
          />
          <TouchableOpacity style={styles.addChipBtn} onPress={addCondition} activeOpacity={0.85}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.chipWrap}>
          {conditions.map((c, i) => (
            <View key={`${c}-${i}`} style={styles.chip}>
              <Text style={styles.chipLabel}>{c}</Text>
              <Pressable onPress={() => setConditions(conditions.filter((_, j) => j !== i))} hitSlop={8}>
                <Text style={styles.chipRemove}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* ── Liên hệ khẩn cấp ── */}
        <Text style={styles.sectionLabel}>Liên hệ khẩn cấp</Text>

        {/* Row: Họ tên + Quan hệ */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Họ tên</Text>
            <TextInput
              style={styles.input}
              value={emergencyName}
              onChangeText={setEmergencyName}
              placeholder="Họ tên"
              placeholderTextColor="#BDBDBD"
              underlineColorAndroid="transparent"
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Quan hệ</Text>
            {renderSelectShell(
              emergencyRelationship,
              () => setPickerKind("relationship"),
              "Chọn"
            )}
          </View>
        </View>

        {/* ← FIX: Số điện thoại liên hệ khẩn cấp (field bị thiếu trước đây) */}
        <Text style={[styles.label, styles.labelSpaced]}>Số điện thoại khẩn cấp</Text>
        <TextInput
          style={styles.input}
          value={emergencyPhone}
          onChangeText={setEmergencyPhone}
          placeholder="0901234567"
          placeholderTextColor="#BDBDBD"
          keyboardType="phone-pad"
          underlineColorAndroid="transparent"
        />

        {saveError ? (
          <Text style={[styles.fieldError, styles.saveError]}>{saveError}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.btnPrimary, loading && styles.btnPrimaryDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnPrimaryText}>Lưu hồ sơ</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* iOS Date Picker Modal */}
      {Platform.OS === "ios" ? (
        <Modal
          visible={showDatePicker}
          animationType="slide"
          transparent
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.dateModalRoot}>
            <Pressable
              style={styles.dateModalBackdrop}
              onPress={() => setShowDatePicker(false)}
            />
            <View style={styles.dateModalCardWrap} pointerEvents="box-none">
              <View style={styles.dateModalCard}>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1920, 0, 1)}
                />
                <TouchableOpacity
                  style={styles.dateModalDone}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.dateModalDoneText}>Xong</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}

      {/* Generic Picker Modal */}
      <Modal
        visible={pickerKind !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setPickerKind(null)}
      >
        <View style={styles.pickerModalRoot}>
          <Pressable style={styles.pickerBackdrop} onPress={() => setPickerKind(null)} />
          <View style={styles.pickerSheet}>
            <FlatList
              data={pickerOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.pickerRow}
                  onPress={() => onPickOption(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pickerRowText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  headerRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    marginTop: 16, marginBottom: 24, position: "relative", minHeight: 40,
  },
  backPressable: { position: "absolute", left: 0, zIndex: 1, paddingVertical: 8 },
  headerTitle: { flex: 1, textAlign: "center", color: "#212121", fontSize: 20, fontWeight: "bold" },
  label: { color: "#212121", fontSize: 14, fontWeight: "500", marginBottom: 6 },
  labelSpaced: { marginTop: 16 },
  sectionLabel: { color: "#212121", fontSize: 15, fontWeight: "bold", marginTop: 20, marginBottom: 6 },
  row: { flexDirection: "row", gap: 12, marginTop: 16 },
  col: { flex: 1 },
  input: {
    borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 8,
    height: 52, paddingHorizontal: 14, fontSize: 16,
    color: "#212121", backgroundColor: "#FFFFFF",
  },
  dateShell: {
    borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 8,
    height: 52, paddingHorizontal: 14, justifyContent: "center",
    backgroundColor: "#FFFFFF", position: "relative",
  },
  dateText: { fontSize: 16, color: "#212121", paddingRight: 36 },
  calendarIconWrap: { position: "absolute", right: 12, top: 0, bottom: 0, justifyContent: "center" },
  selectShell: {
    borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 8,
    height: 52, paddingHorizontal: 14, justifyContent: "center",
    backgroundColor: "#FFFFFF", position: "relative",
  },
  selectText: { fontSize: 16, color: "#212121", paddingRight: 28 },
  selectPlaceholder: { color: "#BDBDBD" },
  selectChevronWrap: { position: "absolute", right: 12, top: 0, bottom: 0, justifyContent: "center" },
  chipInputRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  chipTextInput: {
    flex: 1, borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 8,
    height: 52, paddingHorizontal: 14, fontSize: 16,
    color: "#212121", backgroundColor: "#FFFFFF",
  },
  addChipBtn: {
    width: 52, height: 52, backgroundColor: "#1892BE",
    borderRadius: 8, justifyContent: "center", alignItems: "center",
  },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, marginBottom: 4 },
  chip: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#E3F2FD", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, gap: 6,
  },
  chipLabel: { color: "#1892BE", fontSize: 13 },
  chipRemove: { color: "#1892BE", fontSize: 18, fontWeight: "600" },
  fieldError: { color: "red", fontSize: 13, marginTop: 6 },
  saveError: { marginTop: 16 },
  btnPrimary: {
    backgroundColor: "#1892BE", height: 52, borderRadius: 8,
    width: "100%", marginTop: 32, justifyContent: "center", alignItems: "center",
  },
  btnPrimaryDisabled: { opacity: 0.7 },
  btnPrimaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  dateModalRoot: { flex: 1 },
  dateModalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  dateModalCardWrap: { flex: 1, justifyContent: "flex-end" },
  dateModalCard: {
    backgroundColor: "#FFFFFF", borderTopLeftRadius: 16,
    borderTopRightRadius: 16, paddingBottom: 24, paddingTop: 8,
  },
  dateModalDone: {
    marginHorizontal: 20, marginTop: 12, height: 48, borderRadius: 8,
    backgroundColor: "#1892BE", justifyContent: "center", alignItems: "center",
  },
  dateModalDoneText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  pickerModalRoot: { flex: 1 },
  pickerBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  pickerSheet: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    maxHeight: "50%", backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 12, borderTopRightRadius: 12,
    paddingVertical: 8, zIndex: 1,
  },
  pickerRow: {
    height: 48, justifyContent: "center", paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E0E0E0",
  },
  pickerRowText: { fontSize: 16, color: "#212121" },
});
