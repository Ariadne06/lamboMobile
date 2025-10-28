import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Pressable,
  BackHandler,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import ResidentSearchModal from '@/app/(bhw)/menu/residentSearchModal';
import { API_BASE_URL } from '@/constants/apiConfig';
import { getUserSession } from '@/utils/session';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// Match the add-family theme
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
  shadow: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
  },
};

interface FamilyUpdateData {
  family_id: number;
  family_code: string;
  household_id: number;
  household_type_id: number;
  household_type_name: string;
  family_head_id: number;
  family_head_name: string;
  respondent_id: number;
  respondent_name: string;
  respondent_rtf_id: number;
  // Add missing fields to match add-family
  respondent_rth_id: number;
  head_rth_id: number;
  respondent_relationship_to_fh_id: number;
  ip_status: boolean;
  ip_tribe?: string;
  nhts_status: boolean;
  water_source_type_id: number;
  water_source_name: string;
  toilet_facility_type_id: number;
  toilet_facility_name: string;
  waste_management_type_id: number;
  waste_management_name: string;
  waste_other_text?: string;
  is_visited: boolean;
  quarter_name: string;
  year: number;
}

export default function UpdateFamilyScreen() {
  const { family_id } = useLocalSearchParams<{ family_id: string }>();
  const router = useRouter();

  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [familyData, setFamilyData] = useState<FamilyUpdateData | null>(null);
  
  // Match add-family form structure exactly
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
    waste_other_text: '',
    ip_status: false,
    ip_tribe: '',
    nhts_status: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dropdown options - same as add-family
  const [householdTypes, setHouseholdTypes] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [waterSources, setWaterSources] = useState<any[]>([]);
  const [toiletFacilities, setToiletFacilities] = useState<any[]>([]);
  const [wasteManagement, setWasteManagement] = useState<any[]>([]);

  // Search modals - same as add-family
  const [showFamilyHeadSearch, setShowFamilyHeadSearch] = useState(false);
  const [showRespondentSearch, setShowRespondentSearch] = useState(false);
  const [selectedFamilyHead, setSelectedFamilyHead] = useState<any>(null);
  const [selectedRespondent, setSelectedRespondent] = useState<any>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [family_id]);

  // Android back button handler
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBackPress();
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [family_id])
  );

  const handleBackPress = () => {
    router.push(`/(bhw)/family/${family_id}` as any);
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const session = await getUserSession();
      setUserSession(session);

      // Load family data
      const familyResponse = await fetch(
        `${API_BASE_URL}/household_api/families/${family_id}/details/`
      );
      const familyResult = await familyResponse.json();

      if (!familyResult.success) {
        Alert.alert('Error', 'Failed to load family details');
        router.back();
        return;
      }

      const family = familyResult.data;
      
      // Check if family can be updated
      if (family.is_visited) {
        Alert.alert(
          'Cannot Update',
          'This family has already been visited and cannot be modified.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      setFamilyData(family);

      // Set form data to match add-family structure
      setFormData({
        respondent_id: family.respondent_id,
        respondent_rth_id: family.respondent_rth_id || null,
        respondent_relationship_to_fh_id: family.respondent_relationship_to_fh_id || 1,
        family_head_id: family.family_head_id,
        head_rth_id: family.head_rth_id || null,
        household_type_id: family.household_type_id,
        water_source_type_id: family.water_source_type_id,
        toilet_facility_type_id: family.toilet_facility_type_id,
        waste_management_type_id: family.waste_management_type_id,
        waste_other_text: family.waste_other_text || '',
        ip_status: family.ip_status || false,
        ip_tribe: family.ip_tribe || '',
        nhts_status: family.nhts_status || false,
      });

      // Set selected residents
      if (family.family_head_id) {
        setSelectedFamilyHead({
          resident_id: family.family_head_id,
          full_name: family.family_head_name,
        });
      }

      if (family.respondent_id) {
        setSelectedRespondent({
          resident_id: family.respondent_id,
          full_name: family.respondent_name,
        });
      }

      // Load dropdown options - same endpoints as add-family
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
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load family data. Please try again.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // Smart form logic with auto-sync - same as add-family
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Auto-sync logic for same person scenarios
      if (field === 'family_head_id' && value) {
        if (newData.respondent_id === value) {
          // Same person: sync relationships
          if (newData.respondent_rth_id) {
            newData.head_rth_id = newData.respondent_rth_id;
          }
          newData.respondent_relationship_to_fh_id = 1; // Default to "Self" or appropriate value
        } else {
          // Different people: clear the family head relationship auto-sync
          newData.head_rth_id = null;
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

  // Validation logic - same as add-family
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

  const handleSave = async () => {
    if (!validateForm()) {
      showError('Please complete all required fields before submitting.', 'Incomplete Form');
      return;
    }

    Alert.alert(
      'Confirm Update',
      'Are you sure you want to update this family?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Update', onPress: saveFamily }
      ]
    );
  };

  const saveFamily = async () => {
    try {
      setSubmitting(true);
      const personnelId = userSession?.user_id || 1;

      // Match add-family payload structure exactly
      const payload = new FormData();
      payload.append('personnel_id', personnelId.toString());
      payload.append('household_id', familyData!.household_id.toString()); // Add household_id
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
      payload.append('waste_other_text', formData.waste_other_text || '');

      const response = await fetch(
        `${API_BASE_URL}/household_api/families/${family_id}/update/`,
        {
          method: 'PUT',
          body: payload, // Use FormData like add-family
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
      const timestamp = Date.now();
      
      Alert.alert(
        'Success',
        'Family updated successfully!',
        [{
          text: 'OK',
          onPress: () => {
            // Navigate back with refresh flag
            router.replace(`/(bhw)/family/${family_id}?refresh=${timestamp}` as any);
          }
        }]
      );
      } else {
        // Use same error handling as add-family
        const getSimplifiedError = (errorData: any) => {
          if (errorData.user_message) return errorData.user_message;
          if (errorData.error) {
            if (errorData.error.includes('tribe name')) return 'Please enter the tribe name when Indigenous People status is "Yes".';
            if (errorData.error.includes('relationship')) return 'Please check the relationship configurations.';
            if (errorData.error.includes('not found')) return 'One of the selected options is no longer valid.';
            if (errorData.error.includes('required')) return 'Please fill in all required fields.';
            return errorData.error;
          }
          return 'Failed to update family. Please try again.';
        };

        const simplifiedError = getSimplifiedError(data);
        showError(simplifiedError, 'Update Failed');
      }
    } catch (error) {
      console.error('Network error:', error);
      showError('Unable to connect to server. Please check your internet connection and try again.', 'Connection Error');
    } finally {
      setSubmitting(false);
    }
  };

  const isSamePerson = formData.respondent_id === formData.family_head_id && formData.respondent_id !== null;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Update Family" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <ThemedText style={styles.loadingText}>Loading family data...</ThemedText>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!familyData) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Update Family" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Unable to load family data</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Update Family" onBackPress={handleBackPress} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          {/* Family Info Header */}
          <View style={styles.formHeader}>
            <View style={styles.headerIcon}>
              <Ionicons name="people" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.headerText}>
              <ThemedText style={styles.formTitle}>Update Family</ThemedText>
              <ThemedText style={styles.formSubtitle}>
                {familyData.family_code} • {familyData.quarter_name} {familyData.year}
              </ThemedText>
            </View>
          </View>

          {/* Section 1: Family Members */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <ThemedText style={styles.sectionNumberText}>1</ThemedText>
              </View>
              <View style={styles.sectionTitleContainer}>
                <ThemedText style={styles.sectionTitle}>Family Members</ThemedText>
                <ThemedText style={styles.sectionDescription}>
                  Select the respondent and family head
                </ThemedText>
              </View>
            </View>

            {/* Respondent */}
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>
                Respondent <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <ThemedText style={styles.fieldHint}>
                The person who will provide information about the family
              </ThemedText>
              <Pressable 
                style={[styles.selectField, errors.respondent && styles.fieldError]}
                onPress={() => setShowRespondentSearch(true)}
              >
                <View style={styles.selectContent}>
                  <Ionicons name="search" size={18} color={theme.colors.textMuted} />
                  <View style={styles.selectTextContainer}>
                    {selectedRespondent ? (
                      <>
                        <ThemedText style={styles.selectedText}>
                          {selectedRespondent.full_name}
                        </ThemedText>
                        <ThemedText style={styles.selectedSubtext}>
                          {selectedRespondent.resident_code}
                        </ThemedText>
                      </>
                    ) : (
                      <ThemedText style={styles.placeholder}>
                        Search & select respondent
                      </ThemedText>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                </View>
              </Pressable>
              {errors.respondent && <ThemedText style={styles.errorText}>{errors.respondent}</ThemedText>}
            </View>

            {/* Respondent Relationship to Household Head */}
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>
                Respondent's Relationship to Household Head <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <View style={[styles.pickerContainer, errors.respondent_rth_id && styles.fieldError]}>
                <Ionicons name="people" size={18} color={theme.colors.textMuted} />
                <Picker
                  style={styles.picker}
                  selectedValue={formData.respondent_rth_id}
                  onValueChange={(value) => updateFormData('respondent_rth_id', value)}
                >
                  <Picker.Item label="Select relationship..." value={null} />
                  {relationships.map((rel) => (
                    <Picker.Item
                      key={rel.rth_id}
                      label={rel.description}
                      value={rel.rth_id}
                    />
                  ))}
                </Picker>
              </View>
              {errors.respondent_rth_id && <ThemedText style={styles.errorText}>{errors.respondent_rth_id}</ThemedText>}
            </View>

            {/* Family Head */}
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>
                Family Head <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <ThemedText style={styles.fieldHint}>
                The primary decision-maker and head of this family unit
              </ThemedText>
              
              {/* Quick Action for Same Person */}
              {selectedRespondent && formData.respondent_id !== formData.family_head_id && (
                <View style={styles.quickActionCard}>
                  <View style={styles.quickActionHeader}>
                    <Ionicons name="flash" size={14} color={theme.colors.warning} />
                    <ThemedText style={styles.quickActionTitle}>Quick Action</ThemedText>
                  </View>
                  <Pressable style={styles.quickActionButton} onPress={makeSamePerson}>
                    <ThemedText style={styles.quickActionText}>
                      Make {selectedRespondent.full_name} the family head too
                    </ThemedText>
                    <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
                  </Pressable>
                </View>
              )}

              <Pressable 
                style={[styles.selectField, errors.family_head && styles.fieldError]}
                onPress={() => setShowFamilyHeadSearch(true)}
              >
                <View style={styles.selectContent}>
                  <Ionicons name="search" size={18} color={theme.colors.textMuted} />
                  <View style={styles.selectTextContainer}>
                    {selectedFamilyHead ? (
                      <>
                        <ThemedText style={styles.selectedText}>
                          {selectedFamilyHead.full_name}
                        </ThemedText>
                        <ThemedText style={styles.selectedSubtext}>
                          {selectedFamilyHead.resident_code}
                        </ThemedText>
                      </>
                    ) : (
                      <ThemedText style={styles.placeholder}>
                        Search & select family head
                      </ThemedText>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                </View>
              </Pressable>
              {errors.family_head && <ThemedText style={styles.errorText}>{errors.family_head}</ThemedText>}
            </View>

            {/* Same Person Indicator */}
            {isSamePerson && (
              <View style={styles.samePersonCard}>
                <View style={styles.samePersonHeader}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <ThemedText style={styles.samePersonTitle}>Same Person Selected</ThemedText>
                </View>
                <ThemedText style={styles.samePersonText}>
                  The respondent and family head are the same person. Their relationship to the household head will be synchronized.
                </ThemedText>
              </View>
            )}

            {/* Family Head Relationship to Household Head */}
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>
                Family Head's Relationship to Household Head <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <View style={[styles.pickerContainer, errors.head_rth_id && styles.fieldError]}>
                <Ionicons name="people" size={18} color={theme.colors.textMuted} />
                <Picker
                  style={styles.picker}
                  selectedValue={formData.head_rth_id}
                  onValueChange={(value) => updateFormData('head_rth_id', value)}
                >
                  <Picker.Item label="Select relationship..." value={null} />
                  {relationships.map((rel) => (
                    <Picker.Item
                      key={rel.rth_id}
                      label={rel.description}
                      value={rel.rth_id}
                    />
                  ))}
                </Picker>
              </View>
              {errors.head_rth_id && <ThemedText style={styles.errorText}>{errors.head_rth_id}</ThemedText>}
            </View>

            {/* Respondent Relationship to Family Head - Only show if different people */}
            {!isSamePerson && (
              <View style={styles.fieldContainer}>
                <ThemedText style={styles.fieldLabel}>
                  Respondent's Relationship to Family Head <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <View style={[styles.pickerContainer, errors.respondent_relationship_to_fh_id && styles.fieldError]}>
                  <Ionicons name="people" size={18} color={theme.colors.textMuted} />
                  <Picker
                    style={styles.picker}
                    selectedValue={formData.respondent_relationship_to_fh_id}
                    onValueChange={(value) => updateFormData('respondent_relationship_to_fh_id', value)}
                  >
                    <Picker.Item label="Select relationship..." value={null} />
                    {relationships.map((rel) => (
                      <Picker.Item
                        key={rel.rth_id}
                        label={rel.description}
                        value={rel.rth_id}
                      />
                    ))}
                  </Picker>
                </View>
                {errors.respondent_relationship_to_fh_id && <ThemedText style={styles.errorText}>{errors.respondent_relationship_to_fh_id}</ThemedText>}
              </View>
            )}
          </View>

          {/* Section 2: Household Classification */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <ThemedText style={styles.sectionNumberText}>2</ThemedText>
              </View>
              <View style={styles.sectionTitleContainer}>
                <ThemedText style={styles.sectionTitle}>Household Classification</ThemedText>
                <ThemedText style={styles.sectionDescription}>
                  Specify the type and characteristics of this household
                </ThemedText>
              </View>
            </View>

            {/* Household Type */}
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>
                Household Type <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <View style={[styles.pickerContainer, errors.household_type_id && styles.fieldError]}>
                <Ionicons name="home" size={18} color={theme.colors.textMuted} />
                <Picker
                  style={styles.picker}
                  selectedValue={formData.household_type_id}
                  onValueChange={(value) => updateFormData('household_type_id', value)}
                >
                  <Picker.Item label="Select household type..." value={null} />
                  {householdTypes.map((type) => (
                    <Picker.Item
                      key={type.household_type_id}
                      label={type.description}
                      value={type.household_type_id}
                    />
                  ))}
                </Picker>
              </View>
              {errors.household_type_id && <ThemedText style={styles.errorText}>{errors.household_type_id}</ThemedText>}
            </View>
          </View>

          {/* Section 3: Program Status */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <ThemedText style={styles.sectionNumberText}>3</ThemedText>
              </View>
              <View style={styles.sectionTitleContainer}>
                <ThemedText style={styles.sectionTitle}>Program Status</ThemedText>
                <ThemedText style={styles.sectionDescription}>
                  Government assistance and indigenous people status
                </ThemedText>
              </View>
            </View>

            {/* Indigenous People Status */}
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>Indigenous People (IP) Status</ThemedText>
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

            {/* IP Tribe (conditional) */}
            {formData.ip_status && (
              <View style={styles.fieldContainer}>
                <ThemedText style={styles.fieldLabel}>
                  Tribe Name <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <View style={[styles.inputContainer, errors.ip_tribe && styles.fieldError]}>
                  <Ionicons name="leaf" size={18} color={theme.colors.textMuted} />
                  <TextInput
                    style={styles.textInput}
                    value={formData.ip_tribe}
                    onChangeText={(value) => updateFormData('ip_tribe', value)}
                    placeholder="Enter tribe name"
                  />
                </View>
                {errors.ip_tribe && <ThemedText style={styles.errorText}>{errors.ip_tribe}</ThemedText>}
              </View>
            )}

            {/* NHTS Status */}
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>NHTS (4Ps) Status</ThemedText>
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
          </View>

          {/* Section 4: Environmental Health */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <ThemedText style={styles.sectionNumberText}>4</ThemedText>
              </View>
              <View style={styles.sectionTitleContainer}>
                <ThemedText style={styles.sectionTitle}>Environmental Health</ThemedText>
                <ThemedText style={styles.sectionDescription}>
                  Water source, sanitation, and waste management facilities
                </ThemedText>
              </View>
            </View>

            {/* Water Source */}
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>
                Water Source <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <View style={[styles.pickerContainer, errors.water_source_type_id && styles.fieldError]}>
                <Ionicons name="water" size={18} color={theme.colors.textMuted} />
                <Picker
                  style={styles.picker}
                  selectedValue={formData.water_source_type_id}
                  onValueChange={(value) => updateFormData('water_source_type_id', value)}
                >
                  <Picker.Item label="Select water source..." value={null} />
                  {waterSources.map((source) => (
                    <Picker.Item
                      key={source.water_source_type_id}
                      label={source.description}
                      value={source.water_source_type_id}
                    />
                  ))}
                </Picker>
              </View>
              {errors.water_source_type_id && <ThemedText style={styles.errorText}>{errors.water_source_type_id}</ThemedText>}
            </View>

            {/* Toilet Facility */}
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>
                Toilet Facility <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <View style={[styles.pickerContainer, errors.toilet_facility_type_id && styles.fieldError]}>
                <MaterialCommunityIcons name="toilet" size={18} color={theme.colors.textMuted} />
                <Picker
                  style={styles.picker}
                  selectedValue={formData.toilet_facility_type_id}
                  onValueChange={(value) => updateFormData('toilet_facility_type_id', value)}
                >
                  <Picker.Item label="Select toilet facility..." value={null} />
                  {toiletFacilities.map((facility) => (
                    <Picker.Item
                      key={facility.toilet_facility_type_id}
                      label={facility.description}
                      value={facility.toilet_facility_type_id}
                    />
                  ))}
                </Picker>
              </View>
              {errors.toilet_facility_type_id && <ThemedText style={styles.errorText}>{errors.toilet_facility_type_id}</ThemedText>}
            </View>

            {/* Waste Management */}
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel}>
                Waste Management <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <View style={[styles.pickerContainer, errors.waste_management_type_id && styles.fieldError]}>
                <Ionicons name="trash" size={18} color={theme.colors.textMuted} />
                <Picker
                  style={styles.picker}
                  selectedValue={formData.waste_management_type_id}
                  onValueChange={(value) => updateFormData('waste_management_type_id', value)}
                >
                  <Picker.Item label="Select waste management..." value={null} />
                  {wasteManagement.map((waste) => (
                    <Picker.Item
                      key={waste.waste_management_type_id}
                      label={waste.description}
                      value={waste.waste_management_type_id}
                    />
                  ))}
                </Picker>
              </View>
              {errors.waste_management_type_id && <ThemedText style={styles.errorText}>{errors.waste_management_type_id}</ThemedText>}
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Submit Button */}
      <View style={styles.submitContainer}>
        <Pressable
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSave}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#FFFFFF" />
              <ThemedText style={styles.submitButtonText}>Update Family</ThemedText>
            </>
          )}
        </Pressable>
      </View>

      {/* Search Modals */}
      <ResidentSearchModal
        visible={showFamilyHeadSearch}
        onClose={() => setShowFamilyHeadSearch(false)}
        onSelect={(resident) => {
          setSelectedFamilyHead(resident);
          updateFormData('family_head_id', resident.resident_id);
        }}
      />
      
      <ResidentSearchModal
        visible={showRespondentSearch}
        onClose={() => setShowRespondentSearch(false)}
        onSelect={(resident) => {
          setSelectedRespondent(resident);
          updateFormData('respondent_id', resident.resident_id);
        }}
      />
    </SafeAreaView>
  );
}

// Use the exact same styles as add-family
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
    fontSize: 14,
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
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  formSubtitle: {
    fontSize: 14,
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
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },

  // Fields
  fieldContainer: {
    marginBottom: theme.spacing.xl,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  fieldHint: {
    fontSize: 12,
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
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  selectedText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  selectedSubtext: {
    fontSize: 12,
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
    fontSize: 16,
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
    fontSize: 14,
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
    fontSize: 12,
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
    fontSize: 14,
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
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: '700',
  },
  samePersonText: {
    fontSize: 12,
    color: theme.colors.success,
    lineHeight: 16,
  },

  // Error States
  fieldError: {
    borderColor: theme.colors.error,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
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
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.textDisabled,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});