import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, SafeAreaView, ScrollView, Alert, Pressable,
  ActivityIndicator, TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import ResidentSearchModal from '@/app/(bhw)/menu/residentSearchModal';
import { API_BASE_URL } from '@/constants/apiConfig';
import { getUserSession } from '@/utils/session';

export default function AddFamilyMemberScreen() {
  const { family_id } = useLocalSearchParams<{ family_id: string }>();
  const router = useRouter();

  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResidentSearch, setShowResidentSearch] = useState(false);
  const [selectedResident, setSelectedResident] = useState<any>(null);

  const [relationships, setRelationships] = useState<any[]>([]);
  const [philhealthCategories, setPhilhealthCategories] = useState<any[]>([]);
  const [nutritionStatuses, setNutritionStatuses] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    resident_id: null as number | null,
    rth_id: null as number | null,
    rtf_id: null as number | null,
    philhealthid_number: '',
    membership_type: 'M',
    philhealth_category_id: null as number | null,
    nutrition_status_id: null as number | null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const session = await getUserSession();
      setUserSession(session);

      const [rthRes, philRes, nutriRes] = await Promise.all([
        fetch(`${API_BASE_URL}/household_api/relationships/`),
        fetch(`${API_BASE_URL}/household_api/philhealth-categories/`),
        fetch(`${API_BASE_URL}/household_api/nutrition-statuses/`),
      ]);

      setRelationships(await rthRes.json());
      setPhilhealthCategories(await philRes.json());
      setNutritionStatuses(await nutriRes.json());
    } catch (error) {
      Alert.alert('Error', 'Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Better error handling + form clearing
  const handleSubmit = async () => {
    if (!formData.resident_id || !formData.rth_id || !formData.rtf_id) {
      Alert.alert('Required', 'Please fill all required fields');
      return;
    }

    if (!selectedResident) {
      Alert.alert('Error', 'Please select a resident from the search');
      return;
    }

    console.log(' Submitting family member:', {
      family_id,
      resident_id: formData.resident_id,
      resident_name: selectedResident.full_name,
      personnel_id: userSession?.user_id,
    });

    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('personnel_id', (userSession?.user_id || 1).toString());
      payload.append('resident_id', formData.resident_id.toString());
      payload.append('rth_id', formData.rth_id.toString());
      payload.append('rtf_id', formData.rtf_id.toString());
      payload.append('philhealthid_number', formData.philhealthid_number);
      payload.append('membership_type', formData.membership_type);
      
      if (formData.philhealth_category_id) {
        payload.append('philhealth_category_id', formData.philhealth_category_id.toString());
      }
      if (formData.nutrition_status_id) {
        payload.append('nutrition_status_id', formData.nutrition_status_id.toString());
      }

      const response = await fetch(
        `${API_BASE_URL}/household_api/families/${family_id}/members/add/`,
        { method: 'POST', body: payload }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        //  SUCCESS: Show options
        Alert.alert(
          'Success', 
          `${selectedResident.full_name} has been added to the family!`,
          [
            {
              text: 'Add Another Member',
              onPress: () => {
                //  CLEAR THE FORM
                setSelectedResident(null);
                setFormData({
                  resident_id: null,
                  rth_id: null,
                  rtf_id: null,
                  philhealthid_number: '',
                  membership_type: 'M',
                  philhealth_category_id: null,
                  nutrition_status_id: null,
                });
              },
            },
            {
              text: 'View Family',
              onPress: () => {
                router.replace(`/(bhw)/family/${family_id}` as any);
              },
              style: 'default',
            },
          ],
          { cancelable: false }
        );
      } else {
        //  BETTER ERROR HANDLING
        const errorMessage = data.message || data.error || 'Failed to add member';
        
        if (errorMessage.includes('already registered')) {
          Alert.alert(
            'Already Registered',
            `${selectedResident.full_name} is already a member of another family.\n\nPlease select a different resident.`,
            [{ text: 'OK' }]
          );
        } else if (errorMessage.includes('not found')) {
          Alert.alert(
            'Resident Not Found',
            'The selected resident could not be found in the system. Please try selecting again.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
        }
      }
    } catch (error) {
      console.error(' Submit error:', error);
      Alert.alert(
        'Network Error',
        'Could not connect to the server. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Add Family Member" onBackPress={() => router.push(`/(bhw)/family/${family_id}` as any)} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3D33" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Add Family Member" onBackPress={() => router.push(`/(bhw)/family/${family_id}` as any)} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Member Information</ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Select Resident *</ThemedText>
            <Pressable style={styles.searchButton} onPress={() => setShowResidentSearch(true)}>
              <Ionicons name="search" size={18} color="#888" />
              <ThemedText style={!selectedResident ? styles.placeholderText : undefined}>
                {selectedResident ? selectedResident.full_name : 'Search resident'}
              </ThemedText>
            </Pressable>
            {selectedResident && (
              <View style={styles.selectedCard}>
                <ThemedText style={styles.selectedName}>{selectedResident.full_name}</ThemedText>
                <ThemedText style={styles.selectedCode}>Code: {selectedResident.resident_code}</ThemedText>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Relationship to Household Head *</ThemedText>
            <View style={styles.picker}>
              <Picker
                selectedValue={formData.rth_id}
                onValueChange={(value) => updateFormData('rth_id', value)}
              >
                <Picker.Item label="Select Relationship" value={null} />
                {relationships.map((rel) => (
                  <Picker.Item key={rel.rth_id} label={rel.description} value={rel.rth_id} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Relationship to Family Head *</ThemedText>
            <View style={styles.picker}>
              <Picker
                selectedValue={formData.rtf_id}
                onValueChange={(value) => updateFormData('rtf_id', value)}
              >
                <Picker.Item label="Select Relationship" value={null} />
                {relationships.map((rel) => (
                  <Picker.Item key={rel.rth_id} label={rel.description} value={rel.rth_id} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>PhilHealth ID</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.philhealthid_number}
              onChangeText={(value) => updateFormData('philhealthid_number', value)}
              placeholder="Enter PhilHealth ID"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Membership Type</ThemedText>
            <View style={styles.picker}>
              <Picker
                selectedValue={formData.membership_type}
                onValueChange={(value) => updateFormData('membership_type', value)}
              >
                <Picker.Item label="Member (M)" value="M" />
                <Picker.Item label="Dependent (D)" value="D" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>PhilHealth Category</ThemedText>
            <View style={styles.picker}>
              <Picker
                selectedValue={formData.philhealth_category_id}
                onValueChange={(value) => updateFormData('philhealth_category_id', value)}
              >
                <Picker.Item label="Select Category" value={null} />
                {philhealthCategories.map((cat) => (
                  <Picker.Item
                    key={cat.philhealth_category_id}
                    label={`${cat.code} - ${cat.description}`}
                    value={cat.philhealth_category_id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Nutrition Status</ThemedText>
            <View style={styles.picker}>
              <Picker
                selectedValue={formData.nutrition_status_id}
                onValueChange={(value) => updateFormData('nutrition_status_id', value)}
              >
                <Picker.Item label="Select Status" value={null} />
                {nutritionStatuses.map((status) => (
                  <Picker.Item
                    key={status.nutrition_status_id}
                    label={status.description}
                    value={status.nutrition_status_id}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <Pressable
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#FFFFFF" />
              <ThemedText style={styles.submitButtonText}>Add Member</ThemedText>
            </>
          )}
        </Pressable>
      </ScrollView>

      <ResidentSearchModal
        visible={showResidentSearch}
        onClose={() => setShowResidentSearch(false)}
        onSelect={(resident) => {
          console.log(' Selected resident from search:', {
            resident_id: resident.resident_id,
            resident_code: resident.resident_code,
            full_name: resident.full_name,
          });
          
          setSelectedResident(resident);
          updateFormData('resident_id', resident.resident_id);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, margin: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FF3D33', marginBottom: 16 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, backgroundColor: '#F9FAFB' },
  picker: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, backgroundColor: '#F9FAFB' },
  searchButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#10B981', borderRadius: 8, padding: 12, gap: 8 },
  placeholderText: { color: '#6B7280' },
  selectedCard: { backgroundColor: '#F0F9FF', borderWidth: 1, borderColor: '#10B981', borderRadius: 8, padding: 10, marginTop: 8 },
  selectedName: { fontSize: 15, fontWeight: '600', color: '#374151' },
  selectedCode: { fontSize: 13, color: '#10B981', marginTop: 2 },
  submitButton: { backgroundColor: '#10B981', borderRadius: 8, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, margin: 16 },
  submitButtonDisabled: { backgroundColor: '#9CA3AF' },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});