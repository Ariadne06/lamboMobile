import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#3B82F6',
    primaryLight: '#F3E8FF',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    danger: '#EF4444',
    pink: '#EC4899',
  },
  radius: { sm: 6, md: 8, lg: 12 },
  spacing: { sm: 8, md: 12, lg: 16, xl: 20 },
};

interface DiseaseType {
  disease_type_id: number;
  disease_name: string;
  is_active: boolean;
}

export default function AddDiseaseScreen() {
  const router = useRouter();
  const { maternal_health_id } = useLocalSearchParams<{ maternal_health_id: string }>();

  const [loading, setLoading] = useState(false);
  const [fetchingTypes, setFetchingTypes] = useState(true);

  const [diseaseTypes, setDiseaseTypes] = useState<DiseaseType[]>([]);
  const [selectedDiseaseType, setSelectedDiseaseType] = useState<string>("");
  const [screeningDate, setScreeningDate] = useState("");
  const [result, setResult] = useState("");

  // --------------------------------------------------------------------
  // LOAD DISEASE TYPES
  // --------------------------------------------------------------------
  useEffect(() => {
    fetch(`${API_BASE_URL}/household_api/disease-types/`)
      .then((res) => res.json())
      .then((json) => {
        console.log("Disease Types response:", json);

        if (Array.isArray(json)) {
          setDiseaseTypes(json);
        } else if (json.success && Array.isArray(json.data)) {
          setDiseaseTypes(json.data);
        } else {
          console.warn("Unexpected response:", json);
        }
      })
      .catch((err) => {
        console.log("Fetch error:", err);
        Alert.alert("Error", "Failed to load disease types");
      })
      .finally(() => setFetchingTypes(false));
  }, []);

  const handleBackPress = () => {
    router.push(`/(nurse)/maternal-health/${maternal_health_id}/disease-surveillance`);
  };

  // --------------------------------------------------------------------
  // SUBMIT
  // --------------------------------------------------------------------
  const handleSubmit = async () => {
    if (!selectedDiseaseType || !screeningDate) {
      Alert.alert("Validation", "Disease Type and Screening Date are required.");
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
      const personnel_id = session.user_id; // <<<<<< FIXED HERE

      if (!personnel_id) {
        Alert.alert("Error", "Personnel ID missing in user_session.");
        return;
      }

      const payload = {
        disease_type_id: parseInt(selectedDiseaseType),
        screening_date: screeningDate,
        result: result || null,
        personnel_id: personnel_id,
      };

      console.log("Submitting payload:", payload);

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MATERNAL_DISEASE_SURVEILLANCE_ADD(
          parseInt(maternal_health_id)
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await response.json();
      console.log("Add Disease Result:", json);

      if (json.success) {
        Alert.alert("Success", "Disease screening added successfully!", [
          { text: "OK", onPress: handleBackPress },
        ]);
      } else {
        Alert.alert("Error", json.error || "Failed to add screening");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Unexpected error occurred.");
    }

    setLoading(false);
  };

  // --------------------------------------------------------------------
  // UI
  // --------------------------------------------------------------------
  if (fetchingTypes) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Add Disease Screening" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={{ marginTop: 8 }}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Add Disease Screening" onBackPress={handleBackPress} />

      <ScrollView contentContainerStyle={styles.content}>

        {/* Disease Type */}
        <ThemedText style={styles.label}>Disease Type *</ThemedText>

        {diseaseTypes.map((dt) => (
          <TouchableOpacity
            key={dt.disease_type_id}
            style={[
              styles.optionButton,
              selectedDiseaseType === String(dt.disease_type_id) && styles.optionButtonSelected,
            ]}
            onPress={() => setSelectedDiseaseType(String(dt.disease_type_id))}
          >
            <ThemedText
              style={[
                styles.optionText,
                selectedDiseaseType === String(dt.disease_type_id) && styles.optionTextSelected,
              ]}
            >
              {dt.disease_name}
            </ThemedText>
          </TouchableOpacity>
        ))}

        {/* Screening Date */}
        <ThemedText style={styles.label}>Screening Date *</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={screeningDate}
          onChangeText={setScreeningDate}
        />

        {/* Result */}
        <ThemedText style={styles.label}>Result (Optional for HIV)</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Enter result"
          value={result}
          onChangeText={setResult}
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
            <>
              <MaterialCommunityIcons name="content-save" size={22} color="#FFF" />
              <ThemedText style={styles.submitText}>Save Screening Record</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// --------------------------------------------------------------------
// STYLES
// --------------------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
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

  optionButton: {
    padding: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    marginBottom: 10,
  },
  optionButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  optionText: { fontSize: 14, color: theme.colors.textPrimary },
  optionTextSelected: {
    color: theme.colors.primary,
    fontWeight: "700",
  },

  submitBtn: {
    backgroundColor: theme.colors.pink,
    padding: 14,
    borderRadius: theme.radius.md,
    alignItems: "center",
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
