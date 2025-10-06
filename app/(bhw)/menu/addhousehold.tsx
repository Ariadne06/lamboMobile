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
  Text,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import ResidentSearchModal from './residentSearchModal';

interface FormData {
  houseOwnershipId: number | null;
  houseTypeId: number | null;
  sitioId: number | null;
  cityMunicipality: string;
  houseNumber: string;
  street: string;
  country: string;
  householdHeadId: string;
  respondentId: string;
  respondentRthId: number | null;
}

export default function AddHousehold() {
  const router = useRouter();

  // Dropdown options
  const [houseOwnershipOptions, setHouseOwnershipOptions] = useState<any[]>([]);
  const [houseTypeOptions, setHouseTypeOptions] = useState<any[]>([]);
  const [sitioOptions, setSitioOptions] = useState<any[]>([]);
  const [relationshipOptions, setRelationshipOptions] = useState<any[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [showHeadSearch, setShowHeadSearch] = useState(false);
  const [showRespondentSearch, setShowRespondentSearch] = useState(false);
  const [selectedHead, setSelectedHead] = useState<any>(null);
  const [selectedRespondent, setSelectedRespondent] = useState<any>(null);

  // Example: get personnel_id from context/session
  const user = { personnel_id: 1 }; // Replace with actual user context

  const [formData, setFormData] = useState<FormData>({
    houseOwnershipId: null,
    houseTypeId: null,
    sitioId: null,
    cityMunicipality: 'Consolacion',
    houseNumber: '',
    street: '',
    country: 'Philippines',
    householdHeadId: '',
    respondentId: '',
    respondentRthId: null,
  });

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [ownershipRes, houseTypeRes, sitioRes, relationshipRes] = await Promise.all([
          fetch(`${API_BASE_URL}${API_ENDPOINTS.HOUSEHOLD_OWNERSHIP_TYPE}`),
          fetch(`${API_BASE_URL}${API_ENDPOINTS.HOUSE_TYPE}`),
          fetch(`${API_BASE_URL}${API_ENDPOINTS.SITIOS}`),
          fetch(`${API_BASE_URL}${API_ENDPOINTS.HOUSEHOLD_RELATIONSHIP}`),
        ]);
        setHouseOwnershipOptions(await ownershipRes.json());
        setHouseTypeOptions(await houseTypeRes.json());
        setSitioOptions(await sitioRes.json());
        const relJson = await relationshipRes.json();
        const relArray = Array.isArray(relJson) ? relJson : relJson.results || relJson.data || [];
        setRelationshipOptions(relArray);
      } catch (err) {
        Alert.alert('Error', 'Failed to load dropdowns. Please check your internet or API endpoints.');
      } finally {
        setLoadingDropdowns(false);
      }
    };
    fetchDropdowns();
  }, []);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (formData.houseTypeId === null || formData.houseTypeId === undefined) {
      Alert.alert('Missing Info', 'Please select a House Type.');
      return;
    }
    if (formData.houseOwnershipId === null || formData.houseOwnershipId === undefined) {
      Alert.alert('Missing Info', 'Please select a House Ownership Type.');
      return;
    }
    if (formData.sitioId === null || formData.sitioId === undefined) {
      Alert.alert('Missing Info', 'Please select a Sitio/Purok.');
      return;
    }
    saveHousehold();
  };

  const saveHousehold = async () => {
    try {
      const payload = {
        house_ownership_id: formData.houseOwnershipId,
        house_type_id: formData.houseTypeId,
        barangay: 'Cansaga',
        city_municipality: formData.cityMunicipality,
        sitio_id: formData.sitioId,
        personnel_id: user.personnel_id,
        house_number: formData.houseNumber || '',
        street: formData.street || '',
        country: formData.country || 'Philippines',
        household_head_id: formData.householdHeadId ? parseInt(formData.householdHeadId) : '',
        respondent_id: formData.respondentId ? parseInt(formData.respondentId) : '',
        respondent_rth_id: formData.respondentRthId || '',
        performed_by_id: user.personnel_id,
        performed_by_type: 'personnel',
        enforce_bhw_assignment: false,
      };

      const formDataToSend = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        formDataToSend.append(key, String(value));
      });

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.HOUSEHOLD_INSERT}`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', data.message || 'Household saved successfully!');
        router.back();
      } else {
        Alert.alert('Error', data.message || 'Failed to save household.');
      }
    } catch (err) {
      console.error('Network error:', err);
      Alert.alert('Error', 'Network error occurred. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Household Registration" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formCard}>
            <ThemedText style={styles.formTitle}>Household Data</ThemedText>
            <View style={styles.sectionDivider} />

            {loadingDropdowns ? (
              <ActivityIndicator size="large" color="#FF3D33" />
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>House Ownership Type</ThemedText>
                  <View style={styles.picker}>
                    <Picker
                      selectedValue={formData.houseOwnershipId}
                      onValueChange={(value) => updateFormData('houseOwnershipId', value)}
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
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>House Type</ThemedText>
                  <View style={styles.picker}>
                    <Picker
                      selectedValue={formData.houseTypeId}
                      onValueChange={(value) => updateFormData('houseTypeId', value)}
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
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Sitio/Purok</ThemedText>
                  <View style={styles.picker}>
                    <Picker
                      selectedValue={formData.sitioId}
                      onValueChange={(value) => updateFormData('sitioId', value)}
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
                <View style={styles.inputGroupRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <ThemedText style={styles.label}>House Number</ThemedText>
                    <TextInput
                      style={styles.input}
                      value={formData.houseNumber}
                      onChangeText={(value) => updateFormData('houseNumber', value)}
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
                <View style={styles.inputGroupRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <ThemedText style={styles.label}>Barangay</ThemedText>
                    <View style={[styles.input, styles.fixedInput]}>
                      <ThemedText style={styles.fixedInputText}>Cansaga</ThemedText>
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.label}>City/Municipality</ThemedText>
                    <View style={[styles.input, styles.fixedInput]}>
                      <ThemedText style={styles.fixedInputText}>{formData.cityMunicipality}</ThemedText>
                    </View>
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Country</ThemedText>
                  <View style={[styles.input, styles.fixedInput]}>
                    <ThemedText style={styles.fixedInputText}>{formData.country}</ThemedText>
                  </View>
                </View>

                <View style={styles.sectionDivider} />

                {/* Section: Household Members */}
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="people" size={20} color="#0ea5e9" />
                  <ThemedText style={styles.sectionHeaderText}>Household Members</ThemedText>
                </View>
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Household Head</ThemedText>
                  <Pressable style={[styles.input, styles.searchInput]} onPress={() => setShowHeadSearch(true)}>
                    <Ionicons name="search" size={18} color="#888" style={{ marginRight: 8 }} />
                    <ThemedText style={!selectedHead ? styles.placeholderText : undefined}>
                      {selectedHead
                        ? `${selectedHead.full_name} (${selectedHead.resident_code})`
                        : 'Search & select household head'}
                    </ThemedText>
                  </Pressable>
                  {selectedHead && (
                    <View style={styles.selectedResidentCard}>
                      <Ionicons name="person" size={20} color="#0ea5e9" style={{ marginRight: 8 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.selectedResidentName}>{selectedHead.full_name}</Text>
                        <Text style={styles.selectedResidentCode}>Code: {selectedHead.resident_code}</Text>
                        <Text style={styles.selectedResidentStatus}>
                          {selectedHead.resident_status} | {selectedHead.sex} | DOB: {selectedHead.dob}
                        </Text>
                        {selectedHead.is_verified && (
                          <Text style={styles.selectedResidentVerified}>
                            <Ionicons name="checkmark-circle" size={14} color="#22c55e" /> Verified
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                </View>
                <ResidentSearchModal
                  visible={showHeadSearch}
                  onClose={() => setShowHeadSearch(false)}
                  onSelect={resident => {
                    setSelectedHead(resident);
                    updateFormData('householdHeadId', resident.resident_id);
                  }}
                />

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Respondent</ThemedText>
                  <Pressable style={[styles.input, styles.searchInput]} onPress={() => setShowRespondentSearch(true)}>
                    <Ionicons name="search" size={18} color="#888" style={{ marginRight: 8 }} />
                     <ThemedText style={!selectedHead ? styles.placeholderText : undefined}>
                      {selectedRespondent
                        ? `${selectedRespondent.full_name} (${selectedRespondent.resident_code})`
                        : 'Search & select respondent'}
                    </ThemedText>
                  </Pressable>
                  {selectedRespondent && (
                    <View style={styles.selectedResidentCard}>
                      <Ionicons name="person" size={20} color="#0ea5e9" style={{ marginRight: 8 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.selectedResidentName}>{selectedRespondent.full_name}</Text>
                        <Text style={styles.selectedResidentCode}>Code: {selectedRespondent.resident_code}</Text>
                        <Text style={styles.selectedResidentStatus}>
                          {selectedRespondent.resident_status} | {selectedRespondent.sex} | DOB: {selectedRespondent.dob}
                        </Text>
                        {selectedRespondent.is_verified && (
                          <Text style={styles.selectedResidentVerified}>
                            <Ionicons name="checkmark-circle" size={14} color="#22c55e" /> Verified
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                </View>
                <ResidentSearchModal
                  visible={showRespondentSearch}
                  onClose={() => setShowRespondentSearch(false)}
                  onSelect={resident => {
                    setSelectedRespondent(resident);
                    updateFormData('respondentId', resident.resident_id);
                  }}
                />

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Respondent Relationship to Household Head</ThemedText>
                  <View style={styles.picker}>
                    <Picker
                      selectedValue={formData.respondentRthId}
                      onValueChange={(value) => updateFormData('respondentRthId', value)}
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
              </>
            )}

            <View style={styles.saveButtonsContainer}>
              <Pressable style={styles.saveButton} onPress={handleSave}>
                <Ionicons name="save" size={20} color="#FFFFFF" />
                <ThemedText style={styles.saveButtonText}>Save Household</ThemedText>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({  
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    minHeight: 1,
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
    marginBottom: 32,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3D33',
    marginBottom: 2,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 18,
    gap: 8,
  },
  sectionHeaderText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginLeft: 4,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
    borderRadius: 2,
  },
  inputGroup: {
    marginBottom: 14,
    width: '100%',
  },
  inputGroupRow: {
    flexDirection: 'row',
    marginBottom: 14,
    width: '100%',
    gap: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    fontSize: 15,
    width: '100%',
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    backgroundColor: '#f1f5f9',
    borderColor: '#0ea5e9',
    borderWidth: 1,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    width: '100%',
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    height: 48,
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    marginLeft: 2,
  },
  fixedInput: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0ea5e9',
    borderWidth: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  fixedInputText: {
    color: '#0c4a6e',
    fontSize: 15,
    fontWeight: '600',
  },
  saveButtonsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#FF3D33',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  selectedResidentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderColor: '#0ea5e9',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    marginBottom: 2,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedResidentName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#334155',
  },
  selectedResidentCode: {
    fontSize: 13,
    color: '#0ea5e9',
    marginTop: 2,
  },
  selectedResidentStatus: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  selectedResidentVerified: {
    fontSize: 11,
    color: '#22c55e',
    marginTop: 2,
    fontWeight: 'bold',
  },
  placeholderText: {
    color: '#6b7280',
  fontWeight: '400',
},
});