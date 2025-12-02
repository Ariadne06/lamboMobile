import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  BackHandler,
  TouchableOpacity,
  Modal,
  Text,
} from "react-native";
import {
  useLocalSearchParams,
  useRouter,
  useFocusEffect,
} from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import CustomHeader from "@/components/ui/CustomHeader";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/apiConfig";
import { getUserSession } from "@/utils/session";

/* ------------------------------------------------------
   THEME — LAMBO ADMIN STYLE (RED PRIMARY)
------------------------------------------------------- */

const theme = {
  colors: {
    background: "#F8FAFC",
    surface: "#FFFFFF",
    border: "#E5E7EB",
    primary: "#E11D2F",
    primarySoft: "#FFE4E6",
    primaryDeep: "#C81E25",
    danger: "#DC2626",
    success: "#16A34A",
    textPrimary: "#111827",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    disabled: "#D1D5DB",
  },
  radius: { md: 10, lg: 16, xl: 20 },
  spacing: { sm: 6, md: 12, lg: 16, xl: 20 },
};

/* ------------------------------------------------------
   REUSABLE BOTTOM-SHEET DROPDOWN (LAMBO STYLE)
------------------------------------------------------- */

const SelectModal = ({
  visible,
  title,
  items,
  selectedValue,
  onSelect,
  onClose,
}: any) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalSheet}>

        <Text style={styles.modalTitle}>{title}</Text>

        <View style={styles.modalDivider} />

        <ScrollView style={{ maxHeight: 300 }}>
          {items.map((item: any, index: number) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.modalItem,
                selectedValue === item.value && styles.modalItemSelected,
              ]}
              onPress={() => {
                onSelect(item.value);
                onClose();
              }}
            >
              <Text style={styles.modalItemText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
          <Text style={styles.modalCancelText}>Cancel</Text>
        </TouchableOpacity>

      </View>
    </View>
  </Modal>
);

/* ------------------------------------------------------
   CUSTOM BOTTOM-SHEET CALENDAR
------------------------------------------------------- */

const CalendarBottomSheet = ({ visible, onClose, onSelect }: any) => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const getDays = (m: number, y: number) => {
    const start = new Date(y, m, 1).getDay();
    const total = new Date(y, m + 1, 0).getDate();

    const arr: (number | null)[] = [];
    for (let i = 0; i < start; i++) arr.push(null);
    for (let d = 1; d <= total; d++) arr.push(d);
    return arr;
  };

  const days = getDays(month, year);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>

          <Text style={styles.modalTitle}>Select Date</Text>
          <View style={styles.modalDivider} />

          <View style={styles.calendarHeader}>
            <TouchableOpacity
              onPress={() => {
                if (month === 0) {
                  setMonth(11);
                  setYear(year - 1);
                } else setMonth(month - 1);
              }}
            >
              <Ionicons name="chevron-back" size={20} />
            </TouchableOpacity>

            <Text style={styles.calendarMonthText}>
              {monthNames[month]} {year}
            </Text>

            <TouchableOpacity
              onPress={() => {
                if (month === 11) {
                  setMonth(0);
                  setYear(year + 1);
                } else setMonth(month + 1);
              }}
            >
              <Ionicons name="chevron-forward" size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarWeekRow}>
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
              <Text key={d} style={styles.calendarWeekDay}>{d}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {days.map((d, i) => (
              <TouchableOpacity
                key={i}
                disabled={!d}
                style={styles.calendarDayCell}
                onPress={() => {
                  const final =
                    `${year}-${String(month + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                  onSelect(final);
                  onClose();
                }}
              >
                <Text style={[styles.calendarDayText, !d && { opacity: 0 }]}>
                  {d || ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

/* ------------------------------------------------------
   MAIN SCREEN
------------------------------------------------------- */

export default function NurseAddImmunizationScreen() {
  const { child_health_id } =
    useLocalSearchParams<{ child_health_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);

  const [childInfo, setChildInfo] = useState<any>(null);
  const [vaccines, setVaccines] = useState<any[]>([]);
  const [doses, setDoses] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    vaccine_type_id: null as number | null,
    dose_type_id: null as number | null,
  });

  const [dateGiven, setDateGiven] = useState<string | null>(null);

  const [vaccineModal, setVaccineModal] = useState(false);
  const [doseModal, setDoseModal] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const handleBackPress = () => {
    router.push(`/(nurse)/child-health/${child_health_id}/immunization`);
  };

  /* LOAD DATA */
  useFocusEffect(
  React.useCallback(() => {
      let active = true;

      const load = async () => {
        try {
          setLoading(true);

          const session = await getUserSession();
          setUserSession(session);

          const infoRes = await fetch(
            `${API_BASE_URL}${API_ENDPOINTS.CHILD_IMMUNIZATIONS_LIST(parseInt(child_health_id))}`
          );
          const infoJson = await infoRes.json();

          if (infoJson.success) {
            setChildInfo({ child_full_name: infoJson.child_name });
          }

          const vaccRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VACCINE_TYPES}`);
          const vaccJson = await vaccRes.json();
          setVaccines(vaccJson.results || vaccJson);

          const doseRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DOSE_TYPES}`);
          const doseJson = await doseRes.json();
          setDoses(doseJson.results || doseJson);

        } catch (e) {
          Alert.alert("Error", "Failed to load data.");
        } finally {
          setLoading(false);
        }
      };

      load();

      const back = BackHandler.addEventListener("hardwareBackPress", () => {
        handleBackPress();
        return true;
      });

      return () => back.remove();
  }, [child_health_id])
);


  const updateForm = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.vaccine_type_id)
      return Alert.alert("Required", "Select a vaccine.");
    if (!formData.dose_type_id)
      return Alert.alert("Required", "Select a dose.");
    if (!dateGiven)
      return Alert.alert("Required", "Select date given.");
    return true;
  };

  const submitImmunization = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = {
        vaccine_type_id: formData.vaccine_type_id,
        dose_type_id: formData.dose_type_id,
        date_given: dateGiven,
        personnel_id: userSession?.user_id,
      };

      const res = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CHILD_IMMUNIZATIONS_ADD(
          parseInt(child_health_id)
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();

      if (json.success) {
        Alert.alert("Success", "Immunization added.", [
          {
            text: "Add another",
            onPress: () => {
              setFormData({
                vaccine_type_id: null,
                dose_type_id: null,
              });
              setDateGiven(null);
            },
          },
          { text: "Back to records", onPress: handleBackPress },
        ]);
      } else {
        Alert.alert("Error", json.error || "Failed to save.");
      }
    } catch {
      Alert.alert("Error", "Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Add Immunization" onBackPress={handleBackPress} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 10, color: theme.colors.textSecondary }}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ------------------------------------------------------
     MAIN UI
  ------------------------------------------------------- */
  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Add Immunization" onBackPress={handleBackPress} />

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Child Info Card */}
        <View style={styles.childCard}>
          <View style={styles.childIcon}>
            <Ionicons name="medkit" size={24} color={theme.colors.primaryDeep} />
          </View>
          <View>
            <Text style={styles.childName}>
              {childInfo?.child_full_name ?? "Child"}
            </Text>
            <Text style={styles.childMeta}>New immunization entry</Text>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          
          {/* Vaccine */}
          <Text style={styles.label}>Vaccine *</Text>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setVaccineModal(true)}
          >
            <Text
              style={{
                color: formData.vaccine_type_id
                  ? theme.colors.textPrimary
                  : theme.colors.textMuted,
              }}
            >
              {
                vaccines.find(
                  (v) => v.vaccine_type_id === formData.vaccine_type_id
                )?.vaccine_name || "Select vaccine..."
              }
            </Text>
            <Ionicons name="chevron-down" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>

          {/* Dose */}
          <Text style={[styles.label, { marginTop: 16 }]}>Dose *</Text>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => {
              if (!formData.vaccine_type_id)
                return Alert.alert("Select vaccine first.");
              setDoseModal(true);
            }}
          >
            <Text
              style={{
                color: formData.dose_type_id
                  ? theme.colors.textPrimary
                  : theme.colors.textMuted,
              }}
            >
              {
                doses.find((d) => d.dose_type_id === formData.dose_type_id)
                  ?.dose_name || "Select dose..."
              }
            </Text>
            <Ionicons name="chevron-down" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>

          {/* Date */}
          <Text style={[styles.label, { marginTop: 16 }]}>Date Given *</Text>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setCalendarVisible(true)}
          >
            <Text
              style={{
                color: dateGiven
                  ? theme.colors.textPrimary
                  : theme.colors.textMuted,
              }}
            >
              {dateGiven || "Select date..."}
            </Text>
            <Ionicons name="calendar" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>

        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, submitting && { opacity: 0.5 }]}
          onPress={submitImmunization}
        >
          <Text style={styles.saveButtonText}>
            {submitting ? "Saving..." : "Save Immunization"}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Vaccine Modal */}
      <SelectModal
        visible={vaccineModal}
        title="Select Vaccine"
        items={vaccines.map((v) => ({
          label: v.vaccine_name,
          value: v.vaccine_type_id,
        }))}
        selectedValue={formData.vaccine_type_id}
        onSelect={(value: any) => updateForm("vaccine_type_id", value)}
        onClose={() => setVaccineModal(false)}
      />

      {/* Dose Modal */}
      <SelectModal
        visible={doseModal}
        title="Select Dose"
        items={doses.map((d) => ({
          label: d.dose_name,
          value: d.dose_type_id,
        }))}
        selectedValue={formData.dose_type_id}
        onSelect={(value: any) => updateForm("dose_type_id", value)}
        onClose={() => setDoseModal(false)}
      />

      {/* Calendar Modal */}
      <CalendarBottomSheet
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        onSelect={setDateGiven}
      />

    </SafeAreaView>
  );
}

/* ------------------------------------------------------
   STYLES — LAMBO ADMIN STYLE
------------------------------------------------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 120,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* CHILD CARD */
  childCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },

  childIcon: {
    height: 42,
    width: 42,
    borderRadius: 20,
    backgroundColor: theme.colors.primarySoft,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },

  childName: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },

  childMeta: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },

  /* FORM CARD */
  formCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },

  selectInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    marginTop: 6,
    backgroundColor: theme.colors.surface,
  },

  /* SAVE BUTTON */
  saveButton: {
    marginTop: theme.spacing.lg,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },

  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
  },

  /* MODAL BASE */
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  modalSheet: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },

  modalDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },

  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 8,
  },

  modalItemSelected: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.sm,
  },

  modalItemText: {
    fontSize: 15,
    color: theme.colors.textPrimary,
  },

  modalCancelBtn: {
    marginTop: theme.spacing.md,
  },

  modalCancelText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },

  /* CALENDAR */
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  calendarMonthText: {
    fontSize: 15,
    fontWeight: "600",
  },

  calendarWeekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.md,
  },

  calendarWeekDay: {
    width: "14.28%",
    textAlign: "center",
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: theme.spacing.md,
  },

  calendarDayCell: {
    width: "14.28%",
    paddingVertical: 8,
    alignItems: "center",
  },

  calendarDayText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
});
