import React, { useState, useEffect } from 'react';
import { View, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useRegister, SitioOption } from '@/context/registercontext';
import { Picker } from '@react-native-picker/picker';
import { ThemedText } from '@/components/ThemedText';

export default function RegisterStep2() {
  const { formData, setFormData, sitioOptions } = useRegister();
  const [showOtherCity, setShowOtherCity] = useState(false);
  const [showOtherBarangay, setShowOtherBarangay] = useState(false);

  // Set default location on first load
  useEffect(() => {
    if (!formData.city_municipality && !formData.barangay) {
      updateLocationAndStatus('Consolacion', 'Cansaga');
    }
  }, []);

  const updateLocationAndStatus = (city: string, barangay: string) => {
    const isResident =
      city.toLowerCase().includes('consolacion') &&
      barangay.toLowerCase().includes('cansaga');

    const status_id = isResident ? 2 : 1; // 2 = Resident, 1 = Pending

    setFormData((prev: any) => ({
      ...prev,
      city_municipality: city,
      barangay: barangay,
      status_id: status_id,
      sitio_id: isResident ? prev.sitio_id : null, // Reset sitio if not resident
    }));

    console.log(`Location updated: ${city}, ${barangay} → Status: ${isResident ? 'Resident' : 'Pending'}`);
  };

  const handleCityChange = (value: string) => {
    if (value === 'other') {
      setShowOtherCity(true);
      setFormData((prev: any) => ({ ...prev, city_municipality: '' }));
    } else {
      setShowOtherCity(false);
      updateLocationAndStatus(value, formData.barangay);
    }
  };

  const handleBarangayChange = (value: string) => {
    if (value === 'other') {
      setShowOtherBarangay(true);
      setFormData((prev: any) => ({ ...prev, barangay: '' }));
    } else {
      setShowOtherBarangay(false);
      updateLocationAndStatus(formData.city_municipality, value);
    }
  };

  const handleManualCityInput = (text: string) => {
    setFormData((prev: any) => ({ ...prev, city_municipality: text }));
    if (text.trim()) {
      updateLocationAndStatus(text, formData.barangay);
    }
  };

  const handleManualBarangayInput = (text: string) => {
    setFormData((prev: any) => ({ ...prev, barangay: text }));
    if (text.trim()) {
      updateLocationAndStatus(formData.city_municipality, text);
    }
  };

  const shouldShowSitio =
    formData.city_municipality?.toLowerCase() === 'consolacion' &&
    formData.barangay?.toLowerCase() === 'cansaga';

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.formCard}>
        <ThemedText style={styles.formTitle}>Address Information</ThemedText>
        <ThemedText style={styles.formSubtitle}>Please provide your address details</ThemedText>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>House Number</ThemedText>
          <TextInput
            placeholder="House Number"
            value={formData.house_number}
            onChangeText={text => setFormData({ ...formData, house_number: text })}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Street</ThemedText>
          <TextInput
            placeholder="Street"
            value={formData.street}
            onChangeText={text => setFormData({ ...formData, street: text })}
            style={styles.input}
          />
        </View>

        {/* City Picker */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>City/Municipality</ThemedText>
          {!showOtherCity ? (
            <View style={styles.picker}>
              <Picker
                selectedValue={
                  formData.city_municipality?.toLowerCase() === 'consolacion'
                    ? 'Consolacion'
                    : 'other'
                }
                onValueChange={handleCityChange}
              >
                <Picker.Item label="Select City" value="" />
                <Picker.Item label="Consolacion" value="Consolacion" />
                <Picker.Item label="Other City" value="other" />
              </Picker>
            </View>
          ) : (
            <TextInput
              placeholder="Enter your city/municipality"
              value={formData.city_municipality}
              onChangeText={handleManualCityInput}
              style={styles.input}
              autoCapitalize="words"
            />
          )}
        </View>

        {/* Barangay Picker */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Barangay</ThemedText>
          {!showOtherBarangay ? (
            <View style={styles.picker}>
              <Picker
                selectedValue={
                  formData.barangay?.toLowerCase() === 'cansaga' ? 'Cansaga' : 'other'
                }
                onValueChange={handleBarangayChange}
              >
                <Picker.Item label="Select Barangay" value="" />
                <Picker.Item label="Cansaga" value="Cansaga" />
                <Picker.Item label="Other Barangay" value="other" />
              </Picker>
            </View>
          ) : (
            <TextInput
              placeholder="Enter your barangay"
              value={formData.barangay}
              onChangeText={handleManualBarangayInput}
              style={styles.input}
              autoCapitalize="words"
            />
          )}
        </View>

        {/* Sitio Picker (Only when Consolacion + Cansaga) */}
        {shouldShowSitio && (
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Sitio</ThemedText>
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
        )}
      </View>
    </ScrollView>
  );
}

// Styles
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
});
