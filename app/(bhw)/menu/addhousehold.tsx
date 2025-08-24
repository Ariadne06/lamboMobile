import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';

interface FormData {
  sitio: string;
  householdNumber: string;
  barangay: string;
  familyNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  relationship: string;
  isRenter: boolean | null;
  monthsRenting: string;
  waterSource: string;
  toiletFacility: string;
  wasteManagement: string;
  hasBlincDrainage: boolean | null;
}

// Define item types kept for the FlatList
type ListItemType =
  | { type: 'householdData' }
  | { type: 'respondent' }
  | { type: 'socioEconomic' }
  | { type: 'saveButton' }
  | { type: 'spacer' };

export default function AddHousehold() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    sitio: '',
    householdNumber: '',
    barangay: '',
    familyNumber: '',
    firstName: '',
    middleName: '',
    lastName: '',
    relationship: '',
    isRenter: null,
    monthsRenting: '',
    waterSource: '',
    toiletFacility: '',
    wasteManagement: '',
    hasBlincDrainage: null,
  });

  const waterSources = ['Piped Water', 'Deep Well', 'Shallow Well', 'Spring', 'River/Stream', 'Rainwater', 'Other'];
  const toiletFacilities = ['Water-sealed toilet', 'Pit latrine', 'Pour-flush toilet', 'Composting toilet', 'No toilet facility', 'Other'];
  const wasteManagements = ['Collected by truck', 'Burning', 'Burying', 'Composting', 'Throwing anywhere', 'Other'];
  const relationships = ['Head', 'Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Grandchild', 'Other relative', 'Non-relative'];

  const updateFormData = (field: keyof FormData, value: string | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    Alert.alert(
      'Save Household',
      'Do you want to save this household?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save', onPress: () => saveHousehold() },
      ]
    );
  };

  const saveHousehold = () => {
    console.log('Saving household:', { formData });
    Alert.alert('Success', 'Household saved successfully!');
    router.back();
  };

  const createListData = (): ListItemType[] => {
    return [
      { type: 'householdData' },
      { type: 'respondent' },
      { type: 'socioEconomic' },
      { type: 'saveButton' },
      { type: 'spacer' },
    ];
  };

  const renderListItem = ({ item }: { item: ListItemType }) => {
    switch (item.type) {
      case 'householdData':
        return (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>1. Household Data</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>Household information</ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Sitio/Purok</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.sitio}
                onChangeText={(value) => updateFormData('sitio', value)}
                placeholder="Enter sitio/purok"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Household Number</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.householdNumber}
                onChangeText={(value) => updateFormData('householdNumber', value)}
                placeholder="Enter household number"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Barangay</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.barangay}
                onChangeText={(value) => updateFormData('barangay', value)}
                placeholder="Enter barangay"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Family Number</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.familyNumber}
                onChangeText={(value) => updateFormData('familyNumber', value)}
                placeholder="Enter family number"
              />
            </View>
          </View>
        );

      case 'respondent':
        return (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>2. Respondent</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>Name of respondent</ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>First Name</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(value) => updateFormData('firstName', value)}
                placeholder="Enter first name"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Middle Name</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.middleName}
                onChangeText={(value) => updateFormData('middleName', value)}
                placeholder="Enter middle name"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Last Name</ThemedText>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(value) => updateFormData('lastName', value)}
                placeholder="Enter last name"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Relationship to Household Head</ThemedText>
              <View style={styles.horizontalContainer}>
                {relationships.map((rel) => (
                  <TouchableOpacity
                    key={rel}
                    style={[
                      styles.chipButton,
                      formData.relationship === rel && styles.chipButtonSelected
                    ]}
                    onPress={() => updateFormData('relationship', rel)}
                  >
                    <ThemedText style={[
                      styles.chipText,
                      formData.relationship === rel && styles.chipTextSelected
                    ]}>
                      {rel}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Renter?</ThemedText>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => updateFormData('isRenter', true)}
                >
                  <Ionicons
                    name={formData.isRenter === true ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={formData.isRenter === true ? '#FF3D33' : '#9CA3AF'}
                  />
                  <ThemedText style={styles.radioText}>Yes</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => updateFormData('isRenter', false)}
                >
                  <Ionicons
                    name={formData.isRenter === false ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={formData.isRenter === false ? '#FF3D33' : '#9CA3AF'}
                  />
                  <ThemedText style={styles.radioText}>No</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {formData.isRenter === true && (
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Number of Months</ThemedText>
                <TextInput
                  style={styles.input}
                  value={formData.monthsRenting}
                  onChangeText={(value) => updateFormData('monthsRenting', value)}
                  placeholder="Enter number of months"
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>
        );

      case 'socioEconomic':
        return (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>3. Socio Economic</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>Socio Economic</ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Type of Water Source</ThemedText>
              <View style={styles.horizontalContainer}>
                {waterSources.map((source) => (
                  <TouchableOpacity
                    key={source}
                    style={[
                      styles.chipButton,
                      formData.waterSource === source && styles.chipButtonSelected
                    ]}
                    onPress={() => updateFormData('waterSource', source)}
                  >
                    <ThemedText style={[
                      styles.chipText,
                      formData.waterSource === source && styles.chipTextSelected
                    ]}>
                      {source}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Toilet Facility</ThemedText>
              <View style={styles.horizontalContainer}>
                {toiletFacilities.map((facility) => (
                  <TouchableOpacity
                    key={facility}
                    style={[
                      styles.chipButton,
                      formData.toiletFacility === facility && styles.chipButtonSelected
                    ]}
                    onPress={() => updateFormData('toiletFacility', facility)}
                  >
                    <ThemedText style={[
                      styles.chipText,
                      formData.toiletFacility === facility && styles.chipTextSelected
                    ]}>
                      {facility}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Type of Waste Management</ThemedText>
              <View style={styles.horizontalContainer}>
                {wasteManagements.map((waste) => (
                  <TouchableOpacity
                    key={waste}
                    style={[
                      styles.chipButton,
                      formData.wasteManagement === waste && styles.chipButtonSelected
                    ]}
                    onPress={() => updateFormData('wasteManagement', waste)}
                  >
                    <ThemedText style={[
                      styles.chipText,
                      formData.wasteManagement === waste && styles.chipTextSelected
                    ]}>
                      {waste}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>With Blinc Drainage?</ThemedText>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => updateFormData('hasBlincDrainage', true)}
                >
                  <Ionicons
                    name={formData.hasBlincDrainage === true ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={formData.hasBlincDrainage === true ? '#FF3D33' : '#9CA3AF'}
                  />
                  <ThemedText style={styles.radioText}>Yes</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => updateFormData('hasBlincDrainage', false)}
                >
                  <Ionicons
                    name={formData.hasBlincDrainage === false ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={formData.hasBlincDrainage === false ? '#FF3D33' : '#9CA3AF'}
                  />
                  <ThemedText style={styles.radioText}>No</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      case 'saveButton':
        return (
          <View style={styles.saveButtonsContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Ionicons name="save" size={20} color="#FFFFFF" />
              <ThemedText style={styles.saveButtonText}>Save Household</ThemedText>
            </TouchableOpacity>
          </View>
        );

      case 'spacer':
        return <View style={{ height: 50 }} />;

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Household Registration" />
      <FlatList
        data={createListData()}
        renderItem={renderListItem}
        keyExtractor={(_, index) => `item-${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  horizontalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chipButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipButtonSelected: {
    backgroundColor: '#FF3D33',
    borderColor: '#FF3D33',
  },
  chipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioText: {
    fontSize: 16,
    color: '#374151',
  },
  saveButtonsContainer: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  saveButton: {
    backgroundColor: '#FF3D33',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
