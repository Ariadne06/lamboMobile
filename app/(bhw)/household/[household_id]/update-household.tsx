import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import ResidentSearchModal from '@/app/(bhw)/menu/residentSearchModal';
import { getUserSession } from '@/utils/session';
import { useFocusEffect } from '@react-navigation/native';

interface HouseholdData {
  household_id: number;
  household_number: string;
  house_ownership_id: number;
  house_type_id: number;
  house_number: string;
  street: string;
  barangay: string;
  sitio_id: number;
  city_municipality: string;
  country: string;
  household_head_id: number;
  household_head_name: string;
  respondent_id: number;
  respondent_name: string;
  respondent_rth_id: number;
  is_visited: boolean;
  quarter_name: string;
  year: number;
  is_current_quarter: boolean;
}

export default function UpdateHouseholdScreen() {
  const { household_id } = useLocalSearchParams<{ household_id: string }>();
  const router = useRouter();

  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [householdData, setHouseholdData] = useState<HouseholdData | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    house_ownership_id: null as number | null,
    house_type_id: null as number | null,
    sitio_id: null as number | null,
    house_number: '',
    street: '',
    barangay: 'Cansaga',
    city_municipality: 'Consolacion',
    country: 'Philippines',
    household_head_id: null as number | null,
    respondent_id: null as number | null,
    respondent_rth_id: null as number | null,
  });

  // Dropdown options
  const [houseOwnershipOptions, setHouseOwnershipOptions] = useState<any[]>([]);
  const [houseTypeOptions, setHouseTypeOptions] = useState<any[]>([]);
  const [sitioOptions, setSitioOptions] = useState<any[]>([]);
  const [relationshipOptions, setRelationshipOptions] = useState<any[]>([]);

  // Search modals
  const [showHeadSearch, setShowHeadSearch] = useState(false);
  const [showRespondentSearch, setShowRespondentSearch] = useState(false);
  const [selectedHead, setSelectedHead] = useState<any>(null);
  const [selectedRespondent, setSelectedRespondent] = useState<any>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [household_id]);

  // Android back button handler
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBackPress();
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [household_id])
  );

  const handleBackPress = () => {
    router.push(`/(bhw)/household/${household_id}` as any);
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const session = await getUserSession();
      setUserSession(session);

      // Load household data
      const householdResponse = await fetch(
        `${API_BASE_URL}/household_api/households/${household_id}/details/`
      );
      const householdResult = await householdResponse.json();

      if (!householdResult.success) {
        Alert.alert('Error', 'Failed to load household details');
        router.back();
        return;
      }

      const household = householdResult.data;
      
      // Check if household can be updated
      if (household.is_visited) {
        Alert.alert(
          'Cannot Update',
          'This household has already been visited and cannot be modified.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      if (!household.is_current_quarter) {
        Alert.alert(
          'Cannot Update',
          `You can only update households from the current quarter. This household is from ${household.quarter_name} ${household.year}.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      setHouseholdData(household);

      // Set form data from household
      setFormData({
        house_ownership_id: household.house_ownership_id,
        house_type_id: household.house_type_id,
        sitio_id: household.sitio_id,
        house_number: household.house_number || '',
        street: household.street || '',
        barangay: household.barangay,
        city_municipality: household.city_municipality,
        country: household.country,
        household_head_id: household.household_head_id,
        respondent_id: household.respondent_id,
        respondent_rth_id: household.respondent_rth_id,
      });

      // Set selected residents
      if (household.household_head_id) {
        setSelectedHead({
          resident_id: household.household_head_id,
          full_name: household.household_head_name,
        });
      }

      if (household.respondent_id) {
        setSelectedRespondent({
          resident_id: household.respondent_id,
          full_name: household.respondent_name,
        });
      }

      // Load dropdown options
      const [ownershipRes, houseTypeRes, sitioRes, relationshipRes] = await Promise.all([
        fetch(`${API_BASE_URL}${API_ENDPOINTS.HOUSEHOLD_OWNERSHIP_TYPE}`),
        fetch(`${API_BASE_URL}${API_ENDPOINTS.HOUSE_TYPE}`),
        fetch(`${API_BASE_URL}${API_ENDPOINTS.SITIOS}`),
        fetch(`${API_BASE_URL}${API_ENDPOINTS.HOUSEHOLD_RELATIONSHIP}`),
      ]);

      setHouseOwnershipOptions(await ownershipRes.json());
      setHouseTypeOptions(await houseTypeRes.json());
      setSitioOptions(await sitioRes.json());
      const relArray = await relationshipRes.json();
      setRelationshipOptions(Array.isArray(relArray) ? relArray : relArray.results || relArray.data || []);

    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load household data. Please try again.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.house_ownership_id) {
      Alert.alert('Missing Info', 'Please select a House Ownership Type.');
      return false;
    }
    if (!formData.house_type_id) {
      Alert.alert('Missing Info', 'Please select a House Type.');
      return false;
    }
    if (!formData.sitio_id) {
      Alert.alert('Missing Info', 'Please select a Sitio/Purok.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    Alert.alert(
      'Confirm Update',
      'Are you sure you want to update this household?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Update', onPress: saveHousehold }
      ]
    );
  };

  const saveHousehold = async () => {
    try {
      setSubmitting(true);
      const personnelId = userSession?.user_id || 1;

      const payload = {
        personnel_id: personnelId,
        house_ownership_id: formData.house_ownership_id,
        house_type_id: formData.house_type_id,
        barangay: formData.barangay,
        city_municipality: formData.city_municipality,
        sitio_id: formData.sitio_id,
        house_number: formData.house_number || null,
        street: formData.street || null,
        country: formData.country,
        household_head_id: formData.household_head_id || null,
        respondent_id: formData.respondent_id || null,
        respondent_rth_id: formData.respondent_rth_id || null,
        performed_by_id: personnelId,
        performed_by_type: 'personnel',
        enforce_bhw_assignment: false,
      };

      const formDataToSend = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, String(value));
        }
      });

      const response = await fetch(
        `${API_BASE_URL}/household_api/households/${household_id}/update/`,
        {
          method: 'PUT',
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          'Success',
          'Household updated successfully!',
          [{ text: 'OK', onPress: () => router.push(`/(bhw)/household/${household_id}` as any) }]
        );
      } else {
        const errorMessage = data.user_message || data.error || 'Failed to update household.';
        Alert.alert('Update Failed', errorMessage);
      }
    } catch (error) {
      console.error('Network error:', error);
      Alert.alert('Error', 'Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Update Household" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3D33" />
          <ThemedText style={styles.loadingText}>Loading household data...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!householdData) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Update Household" onBackPress={handleBackPress} />
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Unable to load household data</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Update Household" onBackPress={handleBackPress} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formCard}>
            <View style={styles.householdInfo}>
              <ThemedText style={styles.householdNumber}>
                {householdData.household_number}
              </ThemedText>
              <ThemedText style={styles.quarterInfo}>
                {householdData.quarter_name} {householdData.year}
              </ThemedText>
            </View>

            <ThemedText style={styles.formTitle}>Update Household Data</ThemedText>
            <View style={styles.sectionDivider} />

            {/* House Ownership Type */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>House Ownership Type</ThemedText>
              <View style={styles.picker}>
                <Picker
                  selectedValue={formData.house_ownership_id}
                  onValueChange={(value) => updateFormData('house_ownership_id', value)}
                >
                  <Picker.Item label="Select House Ownership Type" value={null} />
                  {houseOwnershipOptions.map((option, idx) => (
                    <Picker.Item
                      key={option.house_ownership_id ?? idx}
                      label={option.description ?? `Option ${idx + 1}`}
                      value={option.house_ownership_id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* House Type */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>House Type</ThemedText>
              <View style={styles.picker}>
                <Picker
                  selectedValue={formData.house_type_id}
                  onValueChange={(value) => updateFormData('house_type_id', value)}
                >
                  <Picker.Item label="Select House Type" value={null} />
                  {houseTypeOptions.map((option, idx) => (
                    <Picker.Item
                      key={option.house_type_id ?? idx}
                      label={option.description ?? `Option ${idx + 1}`}
                      value={option.house_type_id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Sitio/Purok */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Sitio/Purok</ThemedText>
              <View style={styles.picker}>
                <Picker
                  selectedValue={formData.sitio_id}
                  onValueChange={(value) => updateFormData('sitio_id', value)}
                >
                  <Picker.Item label="Select Sitio/Purok" value={null} />
                  {sitioOptions.map((option, idx) => (
                    <Picker.Item
                      key={option.sitio_id ?? idx}
                      label={option.sitio_name ?? `Sitio ${idx + 1}`}
                      value={option.sitio_id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Address Fields */}
            <View style={styles.inputGroupRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <ThemedText style={styles.label}>House Number</ThemedText>
                <TextInput
                  style={styles.input}
                  value={formData.house_number}
                  onChangeText={(value) => updateFormData('house_number', value)}
                  placeholder="House #"
                />
              </View>
              <View style={{ flex: 2 }}>
                <ThemedText style={styles.label}>Street</ThemedText>
                <TextInput
                  style={styles.input}
                  value={formData.street}
                  onChangeText={(value) => updateFormData('street', value)}
                  placeholder="Street"
                />
              </View>
            </View>

            {/* Fixed Address Fields */}
            <View style={styles.inputGroupRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <ThemedText style={styles.label}>Barangay</ThemedText>
                <View style={[styles.input, styles.fixedInput]}>
                  <ThemedText style={styles.fixedInputText}>{formData.barangay}</ThemedText>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.label}>City/Municipality</ThemedText>
                <View style={[styles.input, styles.fixedInput]}>
                  <ThemedText style={styles.fixedInputText}>{formData.city_municipality}</ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.sectionDivider} />

            {/* Household Head */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Household Head</ThemedText>
              <Pressable 
                style={[styles.input, styles.searchInput]} 
                onPress={() => setShowHeadSearch(true)}
              >
                <Ionicons name="search" size={18} color="#888" style={{ marginRight: 8 }} />
                <ThemedText style={!selectedHead ? styles.placeholderText : undefined}>
                  {selectedHead
                    ? selectedHead.full_name
                    : 'Search & select household head'}
                </ThemedText>
              </Pressable>
            </View>

            {/* Respondent */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Respondent</ThemedText>
              <Pressable 
                style={[styles.input, styles.searchInput]} 
                onPress={() => setShowRespondentSearch(true)}
              >
                <Ionicons name="search" size={18} color="#888" style={{ marginRight: 8 }} />
                <ThemedText style={!selectedRespondent ? styles.placeholderText : undefined}>
                  {selectedRespondent
                    ? selectedRespondent.full_name
                    : 'Search & select respondent'}
                </ThemedText>
              </Pressable>
            </View>

            {/* Respondent Relationship */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Respondent Relationship to Household Head</ThemedText>
              <View style={styles.picker}>
                <Picker
                  selectedValue={formData.respondent_rth_id}
                  onValueChange={(value) => updateFormData('respondent_rth_id', value)}
                >
                  <Picker.Item label="Select Relationship" value={null} />
                  {relationshipOptions.map((option, idx) => (
                    <Picker.Item
                      key={option.rth_id ?? idx}
                      label={option.description ?? `Relationship ${idx + 1}`}
                      value={option.rth_id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.saveButtonsContainer}>
              <Pressable 
                style={[styles.saveButton, submitting && styles.saveButtonDisabled]} 
                onPress={handleSave}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="save" size={20} color="#FFFFFF" />
                    <ThemedText style={styles.saveButtonText}>Update Household</ThemedText>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Search Modals */}
      <ResidentSearchModal
        visible={showHeadSearch}
        onClose={() => setShowHeadSearch(false)}
        onSelect={resident => {
          setSelectedHead(resident);
          updateFormData('household_head_id', resident.resident_id);
        }}
      />
      
      <ResidentSearchModal
        visible={showRespondentSearch}
        onClose={() => setShowRespondentSearch(false)}
        onSelect={resident => {
          setSelectedRespondent(resident);
          updateFormData('respondent_id', resident.resident_id);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  householdInfo: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  householdNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3D33',
    marginBottom: 4,
  },
  quarterInfo: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
    textAlign: 'center',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputGroupRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    fontSize: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    backgroundColor: '#f1f5f9',
    borderColor: '#0ea5e9',
    borderWidth: 1,
  },
  fixedInput: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0ea5e9',
    borderWidth: 1,
    justifyContent: 'center',
  },
  fixedInputText: {
    color: '#0c4a6e',
    fontSize: 15,
    fontWeight: '600',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    height: 48,
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#6b7280',
    fontWeight: '400',
  },
  saveButtonsContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#FF3D33',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});