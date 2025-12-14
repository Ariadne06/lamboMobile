import { ThemedText } from '@/components/ThemedText';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { getUserSession } from '@/utils/session';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type BusinessType = {
  business_type_id: number;
  type_name: string;
};

type Ownership = {
  ownership_id: number;
  ownership_name: string;
};

type ClearanceCategory = {
  clearance_category_id: number;
  category_name: string;
  supported_units: boolean;
  minimum_units: number;
};

type Sitio = {
  sitio_id: number;
  sitio_name: string;
};

export default function AddBusinessScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [residentId, setResidentId] = useState<number | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [businessTypeId, setBusinessTypeId] = useState<number | null>(null);
  const [natureOfBusiness, setNatureOfBusiness] = useState('');
  const [ownershipId, setOwnershipId] = useState<number | null>(null);
  
  // Address
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [sitioId, setSitioId] = useState<number | null>(null);
  
  // Financial
  const [totalGrossIncome, setTotalGrossIncome] = useState('');
  const [dtiSecCdaRegNumber, setDtiSecCdaRegNumber] = useState('');
  
  // Clearance
  const [clearanceCategoryId, setClearanceCategoryId] = useState<number | null>(null);
  const [totalUnits, setTotalUnits] = useState('');
  
  // Amusement devices
  const [videoke, setVideoke] = useState('0');
  const [billiard, setBilliard] = useState('0');
  const [otherDevice, setOtherDevice] = useState('0');

  // Dropdown options
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [ownerships, setOwnerships] = useState<Ownership[]>([]);
  const [clearanceCategories, setClearanceCategories] = useState<ClearanceCategory[]>([]);
  const [sitios, setSitios] = useState<Sitio[]>([]);

  // UI helpers
  const [selectedCategory, setSelectedCategory] = useState<ClearanceCategory | null>(null);
  const isAmusement = selectedCategory?.category_name?.toLowerCase().includes('amusement') || false;

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (clearanceCategoryId) {
      const category = clearanceCategories.find(c => c.clearance_category_id === clearanceCategoryId);
      setSelectedCategory(category || null);
    } else {
      setSelectedCategory(null);
    }
  }, [clearanceCategoryId, clearanceCategories]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Get resident ID from session
      const session = await getUserSession();
      const storedUserId = session?.user_id;
      if (storedUserId) {
        setResidentId(Number(storedUserId));
      }

      // Fetch dropdown data (you'll need to create these endpoints)
      await Promise.all([
        fetchBusinessTypes(),
        fetchOwnerships(),
        fetchClearanceCategories(),
        fetchSitios(),
      ]);
    } catch (error: any) {
      console.error('Failed to load initial data:', error);
      Alert.alert('Error', 'Failed to load form data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessTypes = async () => {
    try {
      // You'll need to create this endpoint
      const response = await fetch(`${API_BASE_URL}/api/mobile/business-types/`);
      if (response.ok) {
        const data = await response.json();
        setBusinessTypes(data);
      }
    } catch (error) {
      console.error('Failed to fetch business types:', error);
    }
  };

  const fetchOwnerships = async () => {
    try {
      // You'll need to create this endpoint
      const response = await fetch(`${API_BASE_URL}/api/mobile/ownerships/`);
      if (response.ok) {
        const data = await response.json();
        setOwnerships(data);
      }
    } catch (error) {
      console.error('Failed to fetch ownerships:', error);
    }
  };

  const fetchClearanceCategories = async () => {
    try {
      // You'll need to create this endpoint
      const response = await fetch(`${API_BASE_URL}/api/mobile/clearance-categories/`);
      if (response.ok) {
        const data = await response.json();
        setClearanceCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch clearance categories:', error);
    }
  };

  const fetchSitios = async () => {
    try {
      // You'll need to create this endpoint
      const response = await fetch(`${API_BASE_URL}/api/mobile/sitios/`);
      if (response.ok) {
        const data = await response.json();
        setSitios(data);
      }
    } catch (error) {
      console.error('Failed to fetch sitios:', error);
    }
  };

  const validateForm = (): boolean => {
    if (!businessName.trim()) {
      Alert.alert('Validation Error', 'Business name is required');
      return false;
    }
    if (!businessTypeId) {
      Alert.alert('Validation Error', 'Please select a business type');
      return false;
    }
    if (!natureOfBusiness.trim()) {
      Alert.alert('Validation Error', 'Nature of business is required');
      return false;
    }
    if (!ownershipId) {
      Alert.alert('Validation Error', 'Please select ownership type');
      return false;
    }
    if (!sitioId) {
      Alert.alert('Validation Error', 'Please select a sitio');
      return false;
    }
    if (!totalGrossIncome.trim()) {
      Alert.alert('Validation Error', 'Total gross income is required');
      return false;
    }
    if (!clearanceCategoryId) {
      Alert.alert('Validation Error', 'Please select a clearance category');
      return false;
    }
    
    // Validate units if category supports it
    if (selectedCategory?.supported_units && !totalUnits.trim()) {
      Alert.alert('Validation Error', 'Total units is required for this category');
      return false;
    }

    // Validate amusement devices if applicable
    if (isAmusement) {
      if (!videoke || !billiard || !otherDevice) {
        Alert.alert('Validation Error', 'All amusement device counts are required');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!residentId) {
      Alert.alert('Error', 'No resident ID found. Please log in again.');
      return;
    }

    try {
      setSubmitting(true);

      const payload: any = {
        resident_id: residentId,
        business_name: businessName.trim(),
        business_type_id: businessTypeId,
        nature_of_business: natureOfBusiness.trim(),
        ownership_id: ownershipId,
        sitio_id: sitioId,
        city_municipality: 'Consolacion',
        country: 'Philippines',
        total_gross_income: parseFloat(totalGrossIncome),
        clearance_category_id: clearanceCategoryId,
      };

      // Optional fields
      if (houseNumber.trim()) payload.house_number = houseNumber.trim();
      if (street.trim()) payload.street = street.trim();
      payload.barangay = 'Cansaga';
      if (dtiSecCdaRegNumber.trim()) payload.dti_sec_cda_reg_number = dtiSecCdaRegNumber.trim();
      
      if (selectedCategory?.supported_units && totalUnits.trim()) {
        payload.total_units = parseInt(totalUnits);
      }

      if (isAmusement) {
        payload.videoke_count = parseInt(videoke);
        payload.billiard_count = parseInt(billiard);
        payload.other_device_count = parseInt(otherDevice);
      }

      console.log('Submitting payload:', payload);
      const url = `${API_BASE_URL}${API_ENDPOINTS.REGISTER_BUSINESS_RESIDENT}`;
      console.log('Request URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 500));
        throw new Error(`Server returned non-JSON response (${response.status}). Check console for details.`);
      }

      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok && result.success) {
        Alert.alert(
          'Success',
          result.message || 'Business registered successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        const errorMsg = typeof result.error === 'string' 
          ? result.error 
          : JSON.stringify(result.error);
        Alert.alert('Registration Failed', errorMsg);
      }
    } catch (error: any) {
      console.error('Business registration error:', error);
      Alert.alert('Error', error.message || 'Failed to register business');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF3D33" />
        <ThemedText style={styles.loadingText}>Loading form...</ThemedText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FF3D33" />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Register New Business</ThemedText>
        </View>

        {/* Business Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="Enter business name"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Type <Text style={styles.required}>*</Text></Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={businessTypeId}
                onValueChange={(value) => setBusinessTypeId(value)}
                style={styles.picker}
              >
                <Picker.Item label="-- Select Business Type --" value={null} />
                {businessTypes.map((type) => (
                  <Picker.Item
                    key={type.business_type_id}
                    label={type.type_name}
                    value={type.business_type_id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nature of Business <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={natureOfBusiness}
              onChangeText={setNatureOfBusiness}
              placeholder="Describe the nature of your business"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ownership Type <Text style={styles.required}>*</Text></Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={ownershipId}
                onValueChange={(value) => setOwnershipId(value)}
                style={styles.picker}
              >
                <Picker.Item label="-- Select Ownership --" value={null} />
                {ownerships.map((ownership) => (
                  <Picker.Item
                    key={ownership.ownership_id}
                    label={ownership.ownership_name}
                    value={ownership.ownership_id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Total Gross Income <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={totalGrossIncome}
              onChangeText={setTotalGrossIncome}
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>DTI/SEC/CDA Registration Number</Text>
            <TextInput
              style={styles.input}
              value={dtiSecCdaRegNumber}
              onChangeText={setDtiSecCdaRegNumber}
              placeholder="Optional"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Address</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>House Number</Text>
            <TextInput
              style={styles.input}
              value={houseNumber}
              onChangeText={setHouseNumber}
              placeholder="Optional"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Street</Text>
            <TextInput
              style={styles.input}
              value={street}
              onChangeText={setStreet}
              placeholder="Optional"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Barangay</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value="Cansaga"
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sitio <Text style={styles.required}>*</Text></Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={sitioId}
                onValueChange={(value) => setSitioId(value)}
                style={styles.picker}
              >
                <Picker.Item label="-- Select Sitio --" value={null} />
                {sitios.map((sitio) => (
                  <Picker.Item
                    key={sitio.sitio_id}
                    label={sitio.sitio_name}
                    value={sitio.sitio_id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>City/Municipality</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value="Consolacion"
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Country</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value="Philippines"
              editable={false}
            />
          </View>
        </View>

        {/* Clearance Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clearance Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Clearance Category <Text style={styles.required}>*</Text></Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={clearanceCategoryId}
                onValueChange={(value) => setClearanceCategoryId(value)}
                style={styles.picker}
              >
                <Picker.Item label="-- Select Category --" value={null} />
                {clearanceCategories.map((category) => (
                  <Picker.Item
                    key={category.clearance_category_id}
                    label={category.category_name}
                    value={category.clearance_category_id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {selectedCategory?.supported_units && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Total Units <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={totalUnits}
                onChangeText={setTotalUnits}
                placeholder="Enter number of units"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
              />
              <Text style={styles.helperText}>
                Required for this category (min: {selectedCategory.minimum_units})
              </Text>
            </View>
          )}

          {isAmusement && (
            <View style={styles.amusementSection}>
              <Text style={styles.subsectionTitle}>Amusement Devices</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Videoke Count <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={videoke}
                  onChangeText={setVideoke}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Billiard Count <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={billiard}
                  onChangeText={setBilliard}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Other Devices Count <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={otherDevice}
                  onChangeText={setOtherDevice}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                />
              </View>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Register Business</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  disabledInput: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  amusementSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  submitButton: {
    backgroundColor: '#FF3D33',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#fca5a5',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
