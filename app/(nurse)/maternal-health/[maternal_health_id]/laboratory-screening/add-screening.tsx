import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomHeader from "@/components/ui/CustomHeader";
import { ThemedText } from "@/components/ThemedText";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/apiConfig";

interface TestType {
  test_type_id: number;
  test_name: string;
}

interface FormState {
  test_type_id: string;
  test_date: string;
  result: string;
}

const theme = {
  colors: {
    background: "#F8FAFC",
    surface: "#FFFFFF",
    border: "#E5E7EB",
    primary: "#3B82F6",
    textPrimary: "#111827",
    textSecondary: "#6B7280",
  },
  spacing: { lg: 16, md: 12 },
  radius: { md: 8 },
};

export default function AddScreening() {
  const router = useRouter();
  const { maternal_health_id } =
    useLocalSearchParams<{ maternal_health_id: string }>();

  const [loading, setLoading] = useState(false);
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [form, setForm] = useState<FormState>({
    test_type_id: "",
    test_date: "",
    result: "",
  });

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleBackPress = () => {
    router.push(
      `/(nurse)/maternal-health/${maternal_health_id}/laboratory-screening`
    );
  };

  // ---------- Load Test Types ----------
  useEffect(() => {
    fetch(`${API_BASE_URL}/household_api/test-types/`)
      .then((res) => res.json())
      .then((json) => {
        console.log("Loaded test types:", json);

        if (Array.isArray(json)) {
          setTestTypes(json);
        } else if (json.success && Array.isArray(json.data)) {
          setTestTypes(json.data);
        } else {
          console.warn("Unexpected test type response:", json);
        }
      })
      .catch(() => {
        Alert.alert("Error", "Failed to load test types");
      });
  }, []);

  // ---------- Submit ----------
  const handleSubmit = async () => {
    if (!form.test_type_id || !form.test_date) {
      Alert.alert("Validation", "Test Type and Test Date are required.");
      return;
    }

    try {
      setLoading(true);

      const sessionRaw = await AsyncStorage.getItem("user_session");
      if (!sessionRaw) {
        Alert.alert("Error", "User session missing. Please log in again.");
        return;
      }

      const session = JSON.parse(sessionRaw);
      const personnel_id = session.user_id;

      const payload = {
        test_type_id: parseInt(form.test_type_id),
        test_date: form.test_date,
        result: form.result || null,
        personnel_id: personnel_id,
      };

      console.log("Submitting payload:", payload);

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MATERNAL_LAB_SCREENING_CREATE(
          parseInt(maternal_health_id)
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await response.json();
      console.log("Server response:", json);

      if (json.success) {
        Alert.alert("Success", "Laboratory screening added!", [
          { text: "OK", onPress: handleBackPress },
        ]);
      } else {
        Alert.alert("Error", json.error || "Failed to add screening");
      }
    } catch (e) {
      Alert.alert("Error", "Unexpected error occurred.");
    }

    setLoading(false);
  };

  // ---------------------------- UI ----------------------------
  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Add Laboratory Screening" onBackPress={handleBackPress} />

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Test Type */}
        <ThemedText style={styles.label}>Test Type *</ThemedText>
        <View style={styles.selectBox}>
          <Picker
            selectedValue={form.test_type_id}
            onValueChange={(v) => updateField("test_type_id", v)}
          >
            <Picker.Item label="Select test type..." value="" />
            {testTypes.map((t) => (
              <Picker.Item
                key={t.test_type_id}
                label={t.test_name}
                value={t.test_type_id.toString()}
              />
            ))}
          </Picker>
        </View>

       <ThemedText style={styles.label}>Test Date *</ThemedText>

<TextInput
  style={styles.input}
  placeholder="YYYY-MM-DD"
  value={form.test_date}
  onChangeText={(v) => {
    // Auto-convert slashes to dashes
    const cleaned = v.replace(/\//g, "-");
    updateField("test_date", cleaned);
  }}
  maxLength={10}
/>

{/* Format notes */}
<ThemedText style={{ 
  fontSize: 12, 
  color: "#6B7280", 
  marginTop: -10, 
  marginBottom: 16 
}}>
  Please follow the format: YYYY-MM-DD (e.g., 2025-12-01)
</ThemedText>


        {/* Result */}
        <ThemedText style={styles.label}>Result (Optional)</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Result"
          value={form.result}
          onChangeText={(v) => updateField("result", v)}
        />

        {/* Submit */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.submitText}>Submit</ThemedText>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------- STYLES ----------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: theme.colors.textPrimary,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    borderRadius: theme.radius.md,
    marginBottom: 16,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: theme.radius.md,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
  },
});
