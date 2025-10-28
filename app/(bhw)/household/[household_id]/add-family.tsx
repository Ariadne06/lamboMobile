import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, SafeAreaView, ScrollView, Alert, Pressable,
  ActivityIndicator, TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import ResidentSearchModal from '@/app/(bhw)/menu/residentSearchModal';
import { API_BASE_URL } from '@/constants/apiConfig';
import { getUserSession } from '@/utils/session';

// Clean, modern design system
const theme = {
  colors: {
    background: '#FAFBFC',
    surface: '#FFFFFF',
    border: '#E1E8ED',
    borderLight: '#F7F9FA',
    primary: '#1DA1F2',
    primaryLight: '#EBF7FF',
    primaryDark: '#1A91DA',
    success: '#00BA7C',
    successLight: '#E8F8F0',
    warning: '#FFB020',
    warningLight: '#FFF4E6',
    error: '#E0245E',
    errorLight: '#FCE8EE',
    textPrimary: '#14171A',
    textSecondary: '#5B7083',
    textMuted: '#8899A6',
    textDisabled: '#AAB8C2',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  radius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  },
  typography: {
    h1: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
    h2: { fontSize: 22, fontWeight: '600', lineHeight: 28 },
    h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
    caption: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  },
  shadow: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    button: {
      shadowColor: '#1DA1F2',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
  },
};

export default function AddFamilyScreen() {
  const { household_id } = useLocalSearchParams<{ household_id: string }>();
  const router = useRouter();

  // State management
  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showRespondentSearch, setShowRespondentSearch] = useState(false);
  const [showFamilyHeadSearch, setShowFamilyHeadSearch] = useState(false);
  const [selectedRespondent, setSelectedRespondent] = useState<any>(null);
  const [selectedFamilyHead, setSelectedFamilyHead] = useState<any>(null);

  // Form data
  const [formData, setFormData] = useState({
    respondent_id: null as number | null,
    respondent_rth_id: null as number | null,
    respondent_relationship_to_fh_id: null as number | null,
    family_head_id: null as number | null,
    head_rth_id: null as number | null,
    household_type_id: null as number | null,
    water_source_type_id: null as number | null,
    toilet_facility_type_id: null as number | null,
    waste_management_type_id: null as number | null,
    ip_status: false,
    ip_tribe: '',
    nhts_status: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Lookup data
  const [householdTypes, setHouseholdTypes] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [waterSources, setWaterSources] = useState<any[]>([]);
  const [toiletFacilities, setToiletFacilities] = useState<any[]>([]);
  const [wasteManagement, setWasteManagement] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const session = await getUserSession();
      setUserSession(session);

      const [htRes, rthRes, wsRes, tfRes, wmRes] = await Promise.all([
        fetch(`${API_BASE_URL}/household_api/household-types/`),
        fetch(`${API_BASE_URL}/household_api/relationships/`),
        fetch(`${API_BASE_URL}/household_api/water-source-types/`),
        fetch(`${API_BASE_URL}/household_api/toilet-facility-types/`),
        fetch(`${API_BASE_URL}/household_api/waste-management-types/`),
      ]);

      setHouseholdTypes(await htRes.json());
      setRelationships(await rthRes.json());
      setWaterSources(await wsRes.json());
      setToiletFacilities(await tfRes.json());
      setWasteManagement(await wmRes.json());
    } catch (error) {
      showError('Unable to load form data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Smart form logic with auto-sync
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Auto-sync logic for same person scenarios
      if (field === 'family_head_id' && value) {
        if (newData.respondent_id === value) {
          // Same person: respondent IS the family head
          newData.respondent_relationship_to_fh_id = 1;
          if (newData.respondent_rth_id) {
            newData.head_rth_id = newData.respondent_rth_id;
          }
        } else {
          // Different people: reset relationship
          newData.respondent_relationship_to_fh_id = null;
        }
      }

      // Clear tribe name when IP status is set to false
      if (field === 'ip_status' && !value) {
        newData.ip_tribe = '';
      }

      // Sync relationships when same person
      if (field === 'respondent_rth_id' && value && newData.respondent_id === newData.family_head_id) {
        newData.head_rth_id = value;
      }
      if (field === 'head_rth_id' && value && newData.respondent_id === newData.family_head_id) {
        newData.respondent_rth_id = value;
      }

      return newData;
    });

    // Clear field errors
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const showError = (message: string, title = 'Error') => {
    Alert.alert(title, message, [{ text: 'OK' }]);
  };

  const makeSamePerson = () => {
    if (selectedRespondent) {
      setSelectedFamilyHead(selectedRespondent);
      updateFormData('family_head_id', selectedRespondent.resident_id);
      Alert.alert(
        'Family Head Set',
        `${selectedRespondent.full_name} is now both the respondent and family head.`,
        [{ text: 'OK' }]
      );
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required validations
    if (!selectedRespondent) newErrors.respondent = 'Respondent is required';
    if (!formData.respondent_rth_id) newErrors.respondent_rth_id = 'Respondent relationship to household head is required';
    if (!selectedFamilyHead) newErrors.family_head = 'Family head is required';
    if (!formData.head_rth_id) newErrors.head_rth_id = 'Family head relationship to household head is required';
    if (!formData.household_type_id) newErrors.household_type_id = 'Household type is required';
    if (!formData.water_source_type_id) newErrors.water_source_type_id = 'Water source is required';
    if (!formData.toilet_facility_type_id) newErrors.toilet_facility_type_id = 'Toilet facility is required';
    if (!formData.waste_management_type_id) newErrors.waste_management_type_id = 'Waste management is required';

    // Special validation for different people
    const isSamePerson = formData.respondent_id === formData.family_head_id;
    if (!isSamePerson && !formData.respondent_relationship_to_fh_id) {
      newErrors.respondent_relationship_to_fh_id = 'Respondent relationship to family head is required';
    }

    // Indigenous People tribe validation
    if (formData.ip_status && (!formData.ip_tribe || formData.ip_tribe.trim() === '')) {
      newErrors.ip_tribe = 'Tribe name is required when Indigenous People status is "Yes"';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showError('Please complete all required fields before submitting.', 'Incomplete Form');
      return;
    }

    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('personnel_id', (userSession?.user_id || 1).toString());
      payload.append('household_type_id', formData.household_type_id!.toString());
      payload.append('family_head_id', formData.family_head_id!.toString());
      payload.append('respondent_id', formData.respondent_id!.toString());
      payload.append('respondent_relationship_to_fh_id', (formData.respondent_relationship_to_fh_id || 1).toString());
      payload.append('head_rth_id', formData.head_rth_id!.toString());
      payload.append('respondent_rth_id', formData.respondent_rth_id!.toString());
      payload.append('ip_status', formData.ip_status.toString());
      payload.append('ip_tribe', formData.ip_tribe);
      payload.append('nhts_status', formData.nhts_status.toString());
      payload.append('water_source_type_id', formData.water_source_type_id!.toString());
      payload.append('toilet_facility_type_id', formData.toilet_facility_type_id!.toString());
      payload.append('waste_management_type_id', formData.waste_management_type_id!.toString());

      const response = await fetch(
        `${API_BASE_URL}/household_api/households/${household_id}/families/create/`,
        { method: 'POST', body: payload }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          'Success',
          'Family created successfully!',
          [
            {
              text: 'View Household',
              onPress: () => {
                router.replace(`/(bhw)/household/${household_id}?t=${Date.now()}` as any);
              },
            },
            {
              text: 'Add Members',
              onPress: () => router.replace(`/(bhw)/family/${data.family_id}/add-member` as any),
            },
          ],
          { cancelable: false }
        );
      } else {
        // Function to extract user-friendly error message
        const getSimplifiedError = (errorData: any) => {
          // First check if server provided a user_message
          if (errorData.user_message) {
            return errorData.user_message;
          }

          // Get the error text to analyze
          const errorText = errorData.error || errorData.message || JSON.stringify(errorData);

          // Check for specific error codes and return simplified messages
          if (errorText.includes('E7402') || errorText.includes('already registered as a family member')) {
            return 'The selected person is already a member of another family. Please choose a different person.';
          }

          if (errorText.includes('E7211R') || errorText.includes('IP tribe is required')) {
            return 'Please enter the tribe name when Indigenous People status is set to "Yes".';
          }

          if (errorText.includes('E7299') || errorText.includes('insert_family() failed')) {
            return 'Unable to create family. Please check your selections and try again.';
          }

          if (errorText.includes('E7499') || errorText.includes('insert_family_member() failed')) {
            return 'Failed to add family members. The selected people may already be part of another family.';
          }

          if (errorText.includes('E7209M')) {
            return 'Family head and respondent have conflicting relationship information. Please review your selections.';
          }

          if (errorText.includes('E7206HH') || errorText.includes('E7217H')) {
            return 'Selected person is not the actual household head. Please select the correct person.';
          }

          if (errorText.includes('E7206H') || errorText.includes('E7209H')) {
            return 'Selected person role does not match their relationship. Please review your selections.';
          }

          if (errorText.includes('E7203A') || errorText.includes('Family head is required')) {
            return 'Family head is required. Please select a family head.';
          }

          if (errorText.includes('E7204R') || errorText.includes('Respondent is required')) {
            return 'Respondent is required. Please select a respondent.';
          }

          if (errorText.includes('E7201')) {
            return 'Household not found. Please refresh and try again.';
          }

          if (errorText.includes('E7213')) {
            return 'You are not assigned to this area. Please contact your administrator.';
          }

          if (errorText.includes('E7200')) {
            return 'Session expired. Please log in again.';
          }

          if (errorText.includes('unique_violation')) {
            return 'This family configuration already exists.';
          }

          if (errorText.includes('foreign_key_violation')) {
            return 'One of the selected options is no longer valid. Please refresh and try again.';
          }

          if (errorText.includes('not_null_violation')) {
            return 'Some required information is missing. Please complete all required fields.';
          }

          if (errorText.includes('ValidationError') || errorText.includes('validation')) {
            return 'Please check your form data and try again.';
          }

          // Default fallback for any unhandled error
          return 'Unable to create family. Please review your information and try again.';
        };

        // Get simplified error message
        const simplifiedError = getSimplifiedError(data);

        // Determine error title based on error type
        let errorTitle = 'Creation Failed';
        if (simplifiedError.includes('already a member') || simplifiedError.includes('already registered')) {
          errorTitle = 'Person Already Registered';
        } else if (simplifiedError.includes('tribe name') || simplifiedError.includes('Indigenous')) {
          errorTitle = 'Missing Information';
        } else if (simplifiedError.includes('relationship') || simplifiedError.includes('role')) {
          errorTitle = 'Invalid Selection';
        } else if (simplifiedError.includes('not found') || simplifiedError.includes('expired')) {
          errorTitle = 'Data Error';
        } else if (simplifiedError.includes('required') || simplifiedError.includes('missing')) {
          errorTitle = 'Required Information';
        } else if (simplifiedError.includes('not assigned') || simplifiedError.includes('administrator')) {
          errorTitle = 'Access Denied';
        } else if (simplifiedError.includes('exists')) {
          errorTitle = 'Duplicate Entry';
        }

        showError(simplifiedError, errorTitle);
      }
    } catch (error) {
      // Network or unexpected errors
      showError('Unable to connect to server. Please check your internet connection and try again.', 'Connection Error');
    } finally {
      setSubmitting(false);
    }
  };

  const isSamePerson = formData.respondent_id === formData.family_head_id && formData.respondent_id !== null;

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Add Family" onBackPress={() => router.push(`/(bhw)/household/${household_id}` as any)} />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <ThemedText style={styles.loadingText}>Loading form data...</ThemedText>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Add Family" onBackPress={() => router.push(`/(bhw)/household/${household_id}` as any)} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main form card */}
        <View style={styles.formCard}>
          {/* Header */}
          <View style={styles.formHeader}>
            <View style={styles.headerIcon}>
              <MaterialIcons name="group-add" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.headerText}>
              <ThemedText style={styles.formTitle}>Create New Family</ThemedText>
              <ThemedText style={styles.formSubtitle}>Add a family to this household</ThemedText>
            </View>
          </View>

          {/* Respondent Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <ThemedText style={styles.sectionNumberText}>1</ThemedText>
              </View>
              <View style={styles.sectionTitleContainer}>
                <ThemedText style={styles.sectionTitle}>Respondent</ThemedText>
                <ThemedText style={styles.sectionDescription}>
                  Who will provide information about this family?
                </ThemedText>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>
                Select Respondent
                <ThemedText style={styles.required}> *</ThemedText>
              </ThemedText>
              <Pressable 
                style={[styles.selectField, errors.respondent && styles.fieldError]} 
                onPress={() => setShowRespondentSearch(true)}
              >
                <View style={styles.selectContent}>
                  <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} />
                  <View style={styles.selectTextContainer}>
                    <ThemedText style={!selectedRespondent ? styles.placeholder : styles.selectedText}>
                      {selectedRespondent ? selectedRespondent.full_name : 'Search and select respondent'}
                    </ThemedText>
                    {selectedRespondent && (
                      <ThemedText style={styles.selectedSubtext}>
                        ID: {selectedRespondent.resident_code}
                      </ThemedText>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                </View>
              </Pressable>
              {errors.respondent && (
                <ThemedText style={styles.errorText}>{errors.respondent}</ThemedText>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>
                Relationship to Household Head
                <ThemedText style={styles.required}> *</ThemedText>
              </ThemedText>
              <View style={[styles.pickerContainer, errors.respondent_rth_id && styles.fieldError]}>
                <MaterialIcons name="family-restroom" size={20} color={theme.colors.textSecondary} />
                <Picker
                  selectedValue={formData.respondent_rth_id}
                  onValueChange={(value) => updateFormData('respondent_rth_id', value)}
                  style={styles.picker}
                  enabled={!!selectedRespondent}
                >
                  <Picker.Item label="Select relationship" value={null} />
                  {relationships.map((rel) => (
                    <Picker.Item key={rel.rth_id} label={rel.description} value={rel.rth_id} />
                  ))}
                </Picker>
              </View>
              {errors.respondent_rth_id && (
                <ThemedText style={styles.errorText}>{errors.respondent_rth_id}</ThemedText>
              )}
            </View>
          </View>

          {/* Family Head Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <ThemedText style={styles.sectionNumberText}>2</ThemedText>
              </View>
              <View style={styles.sectionTitleContainer}>
                <ThemedText style={styles.sectionTitle}>Family Head</ThemedText>
                <ThemedText style={styles.sectionDescription}>
                  Who is the head of this family?
                </ThemedText>
              </View>
            </View>

            {/* Quick action */}
            {selectedRespondent && !selectedFamilyHead && (
              <View style={styles.quickActionCard}>
                <View style={styles.quickActionHeader}>
                  <MaterialIcons name="lightbulb-outline" size={16} color={theme.colors.warning} />
                  <ThemedText style={styles.quickActionTitle}>Quick Action</ThemedText>
                </View>
                <Pressable style={styles.quickActionButton} onPress={makeSamePerson}>
                  <MaterialIcons name="person-add" size={18} color={theme.colors.primary} />
                  <ThemedText style={styles.quickActionText}>
                    Make {selectedRespondent.full_name} the family head
                  </ThemedText>
                  <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
                </Pressable>
              </View>
            )}

            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>
                Select Family Head
                <ThemedText style={styles.required}> *</ThemedText>
              </ThemedText>
              <Pressable 
                style={[styles.selectField, errors.family_head && styles.fieldError]} 
                onPress={() => setShowFamilyHeadSearch(true)}
              >
                <View style={styles.selectContent}>
                  <Ionicons name="person-add-outline" size={20} color={theme.colors.textSecondary} />
                  <View style={styles.selectTextContainer}>
                    <ThemedText style={!selectedFamilyHead ? styles.placeholder : styles.selectedText}>
                      {selectedFamilyHead ? selectedFamilyHead.full_name : 'Search and select family head'}
                    </ThemedText>
                    {selectedFamilyHead && (
                      <ThemedText style={styles.selectedSubtext}>
                        ID: {selectedFamilyHead.resident_code}
                      </ThemedText>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                </View>
              </Pressable>
              {errors.family_head && (
                <ThemedText style={styles.errorText}>{errors.family_head}</ThemedText>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>
                Relationship to Household Head
                <ThemedText style={styles.required}> *</ThemedText>
              </ThemedText>
              <View style={[styles.pickerContainer, errors.head_rth_id && styles.fieldError]}>
                <MaterialIcons name="family-restroom" size={20} color={theme.colors.textSecondary} />
                <Picker
                  selectedValue={formData.head_rth_id}
                  onValueChange={(value) => updateFormData('head_rth_id', value)}
                  style={styles.picker}
                  enabled={!!selectedFamilyHead}
                >
                  <Picker.Item label="Select relationship" value={null} />
                  {relationships.map((rel) => (
                    <Picker.Item key={rel.rth_id} label={rel.description} value={rel.rth_id} />
                  ))}
                </Picker>
              </View>
              {errors.head_rth_id && (
                <ThemedText style={styles.errorText}>{errors.head_rth_id}</ThemedText>
              )}
            </View>

            {/* Same person indicator */}
            {isSamePerson && (
              <View style={styles.samePersonCard}>
                <View style={styles.samePersonHeader}>
                  <Ionicons name="people" size={18} color={theme.colors.success} />
                  <ThemedText style={styles.samePersonTitle}>Same Person Selected</ThemedText>
                </View>
                <ThemedText style={styles.samePersonText}>
                  {selectedRespondent?.full_name} is both the respondent and family head. 
                  Their relationships are automatically synchronized.
                </ThemedText>
              </View>
            )}

            {/* Relationship to family head (for different people) */}
            {selectedRespondent && selectedFamilyHead && !isSamePerson && (
              <View style={styles.fieldContainer}>
                <ThemedText style={styles.fieldLabel}>
                  Respondent&apos;s Relationship to Family Head
                  <ThemedText style={styles.required}> *</ThemedText>
                </ThemedText>
                <ThemedText style={styles.fieldHint}>
                  How is {selectedRespondent.full_name} related to {selectedFamilyHead.full_name}?
                </ThemedText>
                <View style={[styles.pickerContainer, errors.respondent_relationship_to_fh_id && styles.fieldError]}>
                  <MaterialIcons name="people" size={20} color={theme.colors.textSecondary} />
                  <Picker
                    selectedValue={formData.respondent_relationship_to_fh_id}
                    onValueChange={(value) => updateFormData('respondent_relationship_to_fh_id', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select relationship" value={null} />
                    {relationships.map((rel) => (
                      <Picker.Item key={rel.rth_id} label={rel.description} value={rel.rth_id} />
                    ))}
                  </Picker>
                </View>
                {errors.respondent_relationship_to_fh_id && (
                  <ThemedText style={styles.errorText}>{errors.respondent_relationship_to_fh_id}</ThemedText>
                )}
              </View>
            )}
          </View>

          {/* Family Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <ThemedText style={styles.sectionNumberText}>3</ThemedText>
              </View>
              <View style={styles.sectionTitleContainer}>
                <ThemedText style={styles.sectionTitle}>Family Details</ThemedText>
                <ThemedText style={styles.sectionDescription}>
                  Basic information about the family
                </ThemedText>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>
                Household Type
                <ThemedText style={styles.required}> *</ThemedText>
              </ThemedText>
              <View style={[styles.pickerContainer, errors.household_type_id && styles.fieldError]}>
                <MaterialIcons name="home" size={20} color={theme.colors.textSecondary} />
                <Picker
                  selectedValue={formData.household_type_id}
                  onValueChange={(value) => updateFormData('household_type_id', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select household type" value={null} />
                  {householdTypes.map((type) => (
                    <Picker.Item key={type.household_type_id} label={type.description} value={type.household_type_id} />
                  ))}
                </Picker>
              </View>
              {errors.household_type_id && (
                <ThemedText style={styles.errorText}>{errors.household_type_id}</ThemedText>
              )}
            </View>
          </View>

          {/* Facilities Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <ThemedText style={styles.sectionNumberText}>4</ThemedText>
              </View>
              <View style={styles.sectionTitleContainer}>
                <ThemedText style={styles.sectionTitle}>Facilities</ThemedText>
                <ThemedText style={styles.sectionDescription}>
                  Water, sanitation, and waste management
                </ThemedText>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>
                Water Source
                <ThemedText style={styles.required}> *</ThemedText>
              </ThemedText>
              <View style={[styles.pickerContainer, errors.water_source_type_id && styles.fieldError]}>
                <Ionicons name="water" size={20} color={theme.colors.textSecondary} />
                <Picker
                  selectedValue={formData.water_source_type_id}
                  onValueChange={(value) => updateFormData('water_source_type_id', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select water source" value={null} />
                  {waterSources.map((ws) => (
                    <Picker.Item key={ws.water_source_type_id} label={ws.description} value={ws.water_source_type_id} />
                  ))}
                </Picker>
              </View>
              {errors.water_source_type_id && (
                <ThemedText style={styles.errorText}>{errors.water_source_type_id}</ThemedText>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>
                Toilet Facility
                <ThemedText style={styles.required}> *</ThemedText>
              </ThemedText>
              <View style={[styles.pickerContainer, errors.toilet_facility_type_id && styles.fieldError]}>
                <MaterialCommunityIcons name="toilet" size={20} color={theme.colors.textSecondary} />
                <Picker
                  selectedValue={formData.toilet_facility_type_id}
                  onValueChange={(value) => updateFormData('toilet_facility_type_id', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select toilet facility" value={null} />
                  {toiletFacilities.map((tf) => (
                    <Picker.Item key={tf.toilet_facility_type_id} label={tf.description} value={tf.toilet_facility_type_id} />
                  ))}
                </Picker>
              </View>
              {errors.toilet_facility_type_id && (
                <ThemedText style={styles.errorText}>{errors.toilet_facility_type_id}</ThemedText>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>
                Waste Management
                <ThemedText style={styles.required}> *</ThemedText>
              </ThemedText>
              <View style={[styles.pickerContainer, errors.waste_management_type_id && styles.fieldError]}>
                <MaterialIcons name="delete" size={20} color={theme.colors.textSecondary} />
                <Picker
                  selectedValue={formData.waste_management_type_id}
                  onValueChange={(value) => updateFormData('waste_management_type_id', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select waste management" value={null} />
                  {wasteManagement.map((wm) => (
                    <Picker.Item key={wm.waste_management_type_id} label={wm.description} value={wm.waste_management_type_id} />
                  ))}
                </Picker>
              </View>
              {errors.waste_management_type_id && (
                <ThemedText style={styles.errorText}>{errors.waste_management_type_id}</ThemedText>
              )}
            </View>
          </View>

          {/* Status Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <ThemedText style={styles.sectionNumberText}>5</ThemedText>
              </View>
              <View style={styles.sectionTitleContainer}>
                <ThemedText style={styles.sectionTitle}>Special Status</ThemedText>
                <ThemedText style={styles.sectionDescription}>
                  Optional status information
                </ThemedText>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>NHTS Beneficiary</ThemedText>
              <View style={styles.toggleContainer}>
                <Pressable
                  style={[styles.toggleOption, !formData.nhts_status && styles.toggleActive]}
                  onPress={() => updateFormData('nhts_status', false)}
                >
                  <ThemedText style={[styles.toggleText, !formData.nhts_status && styles.toggleTextActive]}>
                    No
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.toggleOption, formData.nhts_status && styles.toggleActive]}
                  onPress={() => updateFormData('nhts_status', true)}
                >
                  <ThemedText style={[styles.toggleText, formData.nhts_status && styles.toggleTextActive]}>
                    Yes
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>Indigenous People</ThemedText>
              <View style={styles.toggleContainer}>
                <Pressable
                  style={[styles.toggleOption, !formData.ip_status && styles.toggleActive]}
                  onPress={() => updateFormData('ip_status', false)}
                >
                  <ThemedText style={[styles.toggleText, !formData.ip_status && styles.toggleTextActive]}>
                    No
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.toggleOption, formData.ip_status && styles.toggleActive]}
                  onPress={() => updateFormData('ip_status', true)}
                >
                  <ThemedText style={[styles.toggleText, formData.ip_status && styles.toggleTextActive]}>
                    Yes
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            {formData.ip_status && (
              <View style={styles.fieldContainer}>
                <ThemedText style={styles.fieldLabel}>
                  Tribe Name
                  <ThemedText style={styles.required}> *</ThemedText>
                </ThemedText>
                <ThemedText style={styles.fieldHint}>
                  Please specify the indigenous tribe name
                </ThemedText>
                <View style={[styles.inputContainer, errors.ip_tribe && styles.fieldError]}>
                  <MaterialIcons name="groups" size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={styles.textInput}
                    value={formData.ip_tribe}
                    onChangeText={(value) => updateFormData('ip_tribe', value)}
                    placeholder="Enter tribe name"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>
                {errors.ip_tribe && (
                  <ThemedText style={styles.errorText}>{errors.ip_tribe}</ThemedText>
                )}
              </View>
            )}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Submit Button */}
      <View style={styles.submitContainer}>
        <Pressable
          style={[
            styles.submitButton,
            submitting && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <ThemedText style={styles.submitButtonText}>Creating...</ThemedText>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <ThemedText style={styles.submitButtonText}>Create Family</ThemedText>
            </>
          )}
        </Pressable>
      </View>

      {/* Search Modals */}
      <ResidentSearchModal
        visible={showRespondentSearch}
        onClose={() => setShowRespondentSearch(false)}
        onSelect={(resident) => {
          setSelectedRespondent(resident);
          updateFormData('respondent_id', resident.resident_id);
        }}
      />
      
      <ResidentSearchModal
        visible={showFamilyHeadSearch}
        onClose={() => setShowFamilyHeadSearch(false)}
        onSelect={(resident) => {
          setSelectedFamilyHead(resident);
          updateFormData('family_head_id', resident.resident_id);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Base Layout
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  bottomSpacer: {
    height: 100,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xxxl,
  },
  loadingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xxxl,
    alignItems: 'center',
    gap: theme.spacing.lg,
    ...theme.shadow.card,
  },
  loadingText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // Main Form Card
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    ...theme.shadow.card,
  },

  // Form Header
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    gap: theme.spacing.lg,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  formTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  formSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },

  // Sections
  section: {
    padding: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  sectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  sectionNumberText: {
    ...theme.typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  sectionDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },

  // Fields
  fieldContainer: {
    marginBottom: theme.spacing.xl,
  },
  fieldLabel: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  fieldHint: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 16,
  },
  required: {
    color: theme.colors.error,
  },

  // Select Field
  selectField: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  selectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  selectTextContainer: {
    flex: 1,
  },
  placeholder: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  selectedText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  selectedSubtext: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  // Picker
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    paddingLeft: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  picker: {
    flex: 1,
    height: 52,
    color: theme.colors.textPrimary,
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  textInput: {
    flex: 1,
    height: 52,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },

  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.radius.lg,
    padding: 2,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.radius.md,
  },
  toggleActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },

  // Quick Action Card
  quickActionCard: {
    backgroundColor: theme.colors.warningLight,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  quickActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  quickActionTitle: {
    ...theme.typography.caption,
    color: theme.colors.warning,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  quickActionText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '600',
    flex: 1,
  },

  // Same Person Card
  samePersonCard: {
    backgroundColor: theme.colors.successLight,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  samePersonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  samePersonTitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.success,
    fontWeight: '700',
  },
  samePersonText: {
    ...theme.typography.caption,
    color: theme.colors.success,
    lineHeight: 16,
  },

  // Error States
  fieldError: {
    borderColor: theme.colors.error,
    borderWidth: 2,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },

  // Submit Container
  submitContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    ...theme.shadow.card,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
    ...theme.shadow.button,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.textDisabled,
    ...theme.shadow.card,
  },
  submitButtonText: {
    ...theme.typography.body,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});