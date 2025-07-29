import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ThemedText } from '@/components/ThemedText';

const requestTypes = ['Barangay Clearance', 'Business Permit', 'Residency Certificate'];
const purposes = ['Employment', 'Business', 'School', 'Other'];

export default function CnCRequestScreen() {
  const [request, setRequest] = useState('');
  const [purpose, setPurpose] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [numUnit, setNumUnit] = useState('');
  const [cost, setCost] = useState(0);

  // Dummy cost calculation (customize as needed)
  React.useEffect(() => {
    if (request === 'Barangay Clearance') setCost(100);
    else if (request === 'Business Permit') setCost(300);
    else if (request === 'Residency Certificate') setCost(150);
    else setCost(0);
  }, [request]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>

      <View style={styles.form}>
        {/* Request Type */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>Select Request</ThemedText>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={request}
              onValueChange={setRequest}
              style={styles.picker}
              dropdownIconColor="#FF3D33"
            >
              <Picker.Item label="Select request type" value="" />
              {requestTypes.map((item) => (
                <Picker.Item label={item} value={item} key={item} />
              ))}
            </Picker>
          </View>
        </View>
        {/* Purpose */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>Purpose</ThemedText>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={purpose}
              onValueChange={setPurpose}
              style={styles.picker}
              dropdownIconColor="#FF3D33"
            >
              <Picker.Item label="Select purpose" value="" />
              {purposes.map((item) => (
                <Picker.Item label={item} value={item} key={item} />
              ))}
            </Picker>
          </View>
        </View>
        {/* Business Type */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>Business Type</ThemedText>
          <TextInput
            style={styles.input}
            value={businessType}
            onChangeText={setBusinessType}
            placeholder="Enter business type"
            placeholderTextColor="#a1a1aa"
          />
        </View>
        {/* Number of Unit */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>Number of Unit</ThemedText>
          <TextInput
            style={styles.input}
            value={numUnit}
            onChangeText={setNumUnit}
            placeholder="Enter number of unit"
            placeholderTextColor="#a1a1aa"
            keyboardType="numeric"
          />
        </View>
        {/* Cost */}
        <View style={styles.costBox}>
          <ThemedText style={styles.costText}>Total Cost: </ThemedText>
          <ThemedText style={styles.costAmount}>₱{cost.toFixed(2)}</ThemedText>
        </View>
        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton}>
          <ThemedText style={styles.submitButtonText}>Submit Request</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#FF3D33',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 12,
    marginTop: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    color: '#1e293b',
  },
  pickerWrapper: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    color: '#1e293b',
  },
  costBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#FFA333',
    justifyContent: 'center',
  },
  costText: {
    fontSize: 16,
    color: '#FF3D33',
    fontWeight: '600',
  },
  costAmount: {
    fontSize: 18,
    color: '#FF3D33',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: '#FF3D33',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    elevation: 1,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});