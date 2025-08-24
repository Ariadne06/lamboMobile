import React, { useEffect } from 'react';
import { View, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useRegister, SitioOption } from '@/context/registercontext';
import { Picker } from '@react-native-picker/picker';
import { ThemedText } from '@/components/ThemedText';

export default function RegisterStep2() {
  const { formData, setFormData, sitioOptions } = useRegister();

  // Check if user is non-resident
  const isNonResident = formData.user_type === 'non_resident';

  // Set default values based on user type
  useEffect(() => {
    if (!isNonResident) {
      // RESIDENT: Set fixed location
      setFormData((prev: any) => ({
        ...prev,
        city_municipality: 'Consolacion',
        barangay: 'Cansaga',
        status_id: 2, // Resident status
      }));
    } else {
      // NON-RESIDENT: Clear sitio and set pending status
      setFormData((prev: any) => ({
        ...prev,
        sitio_id: null,
        status_id: 1, // Pending status
      }));
    }
  }, [isNonResident]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.formCard}>
        <ThemedText style={styles.formTitle}>Address Information</ThemedText>
        <ThemedText style={styles.formSubtitle}>
          {isNonResident 
            ? 'Please provide your address details' 
            : 'Select your sitio in Barangay Cansaga, Consolacion'
          }
        </ThemedText>

        {/* House Number - ALWAYS SHOW */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>House Number</ThemedText>
          <TextInput
            placeholder="House Number"
            value={formData.house_number}
            onChangeText={text => setFormData({ ...formData, house_number: text })}
            style={styles.input}
          />
        </View>

        {/* Street - ALWAYS SHOW */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Street</ThemedText>
          <TextInput
            placeholder="Street"
            value={formData.street}
            onChangeText={text => setFormData({ ...formData, street: text })}
            style={styles.input}
            autoCapitalize="words"
          />
        </View>

        {/* RESIDENT: Fixed City and Barangay + Sitio Picker */}
        {!isNonResident && (
          <>
            {/* Fixed City for Residents */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>City/Municipality</ThemedText>
              <View style={[styles.input, styles.fixedInput]}>
                <ThemedText style={styles.fixedInputText}>Consolacion</ThemedText>
              </View>
            </View>

            {/* Fixed Barangay for Residents */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Barangay</ThemedText>
              <View style={[styles.input, styles.fixedInput]}>
                <ThemedText style={styles.fixedInputText}>Cansaga</ThemedText>
              </View>
            </View>

            {/* Sitio Picker - RESIDENTS ONLY */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Sitio *</ThemedText>
              <View style={styles.picker}>
                <Picker
                  selectedValue={formData.sitio_id}
                  onValueChange={itemValue => setFormData({ ...formData, sitio_id: itemValue })}
                >
                  <Picker.Item label="Select Sitio" value="" />
                  {sitioOptions.map((sitio: SitioOption) => (
                    <Picker.Item
                      key={sitio.sitio_id}
                      label={sitio.sitio_name}
                      value={sitio.sitio_id}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </>
        )}

        {/* NON-RESIDENT: Input Fields for City and Barangay */}
        {isNonResident && (
          <>
            {/* City Input for Non-Residents */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>City/Municipality *</ThemedText>
              <TextInput
                placeholder="Enter your city/municipality"
                value={formData.city_municipality}
                onChangeText={text => setFormData({ ...formData, city_municipality: text })}
                style={styles.input}
                autoCapitalize="words"
              />
            </View>

            {/* Barangay Input for Non-Residents */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Barangay *</ThemedText>
              <TextInput
                placeholder="Enter your barangay"
                value={formData.barangay}
                onChangeText={text => setFormData({ ...formData, barangay: text })}
                style={styles.input}
                autoCapitalize="words"
              />
            </View>
          </>
        )}

    

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#f3f4f6',
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
    fontWeight: 'bold' as const,
    color: '#FF3D33',
    marginBottom: 2,
    textAlign: 'center' as const,
    letterSpacing: 0.5,
  },
  formSubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 18,
    textAlign: 'center' as const,
  },
  inputGroup: {
    marginBottom: 14,
    width: '100%',
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
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 4,
    marginLeft: 2,
  },
  

  fixedInput: {
    backgroundColor: '#f0f9ff',
    borderColor: '#0ea5e9',
    borderWidth: 1,
  },
  fixedInputText: {
    color: '#0c4a6e',
    fontSize: 15,
    fontWeight: '600',
  },
  
});