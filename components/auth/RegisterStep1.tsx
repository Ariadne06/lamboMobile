import React, { useState } from 'react';
import { View, TextInput, Pressable, Platform, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRegister, ReligionOption, CivilStatusOption, EducationOption, StatusOption } from '@/context/registercontext';
import { ThemedText } from '@/components/ThemedText';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function RegisterStep1() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { formData, setFormData, religionOptions, civilStatusOptions, educationOptions, statusOptions } = useRegister();

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.formCard}>
        <ThemedText style={styles.formTitle}>Registration</ThemedText>
        <ThemedText style={styles.formSubtitle}>Please fill in your details to continue</ThemedText>

        {/* Name Fields */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>First Name</ThemedText>
          <TextInput
            placeholder="First Name"
            value={formData.first_name}
            onChangeText={(text) => setFormData({ ...formData, first_name: text })}
            style={styles.input}
            autoCapitalize="words"
          />
        </View>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Middle Name</ThemedText>
          <TextInput
            placeholder="Middle Name"
            value={formData.middle_name}
            onChangeText={(text) => setFormData({ ...formData, middle_name: text })}
            style={styles.input}
            autoCapitalize="words"
          />
        </View>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Last Name</ThemedText>
          <TextInput
            placeholder="Last Name"
            style={styles.input}
            value={formData.last_name}
            onChangeText={(text) => setFormData({ ...formData, last_name: text })}
            autoCapitalize="words"
          />
        </View>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Suffix</ThemedText>
          <View style={styles.picker}>
            <Picker
              selectedValue={formData.suffix}
              onValueChange={(itemValue) => setFormData({ ...formData, suffix: itemValue })}
            >
              <Picker.Item label="No Suffix" value="" />
              <Picker.Item label="Jr." value="Jr." />
              <Picker.Item label="Sr." value="Sr." />
              <Picker.Item label="II" value="II" />
              <Picker.Item label="III" value="III" />
              <Picker.Item label="IV" value="IV" />
              <Picker.Item label="V" value="V" />
            </Picker>
          </View>
        </View>

        {/* Birthdate, Sex, Gender */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Birthdate</ThemedText>
          <Pressable onPress={() => setShowDatePicker(true)} style={styles.input}>
            <ThemedText style={{ color: formData.dob ? '#222' : '#888' }}>
              {formData.dob ? formData.dob : 'Select Birthdate'}
            </ThemedText>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={formData.dob ? new Date(formData.dob) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  const formatted = selectedDate.toISOString().split('T')[0];
                  setFormData({ ...formData, dob: formatted });
                }
              }}
            />
          )}
        </View>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Sex</ThemedText>
          <View style={styles.picker}>
            <Picker selectedValue={formData.sex} onValueChange={(itemValue) => setFormData({ ...formData, sex: itemValue })}>
              <Picker.Item label="Select Sex" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
            </Picker>
          </View>
        </View>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Gender (optional)</ThemedText>
          <TextInput
            placeholder="Gender (optional)"
            value={formData.gender}
            onChangeText={text => setFormData({ ...formData, gender: text })}
            style={styles.input}
          />
        </View>

        {/* Civil Status, Religion */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Civil Status</ThemedText>
          <View style={styles.picker}>
            <Picker
              selectedValue={formData.civil_status_id}
              onValueChange={itemValue => setFormData({ ...formData, civil_status_id: itemValue })}
            >
              <Picker.Item label="Select Civil Status" value="" />
              {civilStatusOptions.map((cs: CivilStatusOption) => (
                <Picker.Item key={cs.civil_stat_id} label={cs.civil_name} value={cs.civil_stat_id} />
              ))}
            </Picker>
          </View>
        </View>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Religion</ThemedText>
          <View style={styles.picker}>
            <Picker
              selectedValue={formData.religion_cat_id}
              onValueChange={itemValue => setFormData({ ...formData, religion_cat_id: itemValue })}
            >
              <Picker.Item label="Select Religion" value="" />
              {religionOptions.map((rel: ReligionOption) => (
                <Picker.Item key={rel.religion_cat_id} label={rel.religion_name} value={rel.religion_cat_id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Education, Email, Phone */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Educational Attainment</ThemedText>
          <View style={styles.picker}>
            <Picker
              selectedValue={formData.educational_attainment_id}
              onValueChange={itemValue => setFormData({ ...formData, educational_attainment_id: itemValue })}
            >
              <Picker.Item label="Select Educational Attainment" value="" />
              {educationOptions.map((ed: EducationOption) => (
                <Picker.Item key={ed.educational_attain_id} label={ed.educational_attain_name} value={ed.educational_attain_id} />
              ))}
            </Picker>
          </View>
        </View>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Email</ThemedText>
          <TextInput
            placeholder="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Phone Number</ThemedText>
          <TextInput
            placeholder="Phone Number"
            value={formData.phone_number}
            onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
            style={styles.input}
            keyboardType="phone-pad"
          />
        </View>

        {/* Status */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Status</ThemedText>
          <View style={styles.picker}>
            <Picker
              selectedValue={formData.status_id}
              onValueChange={itemValue => setFormData({ ...formData, status_id: itemValue })}
            >
              <Picker.Item label="Select Status" value="" />
              {statusOptions.map((status: StatusOption) => (
                <Picker.Item key={status.status_id} label={status.status_name} value={status.status_id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Voter */}
        <ThemedText style={styles.voterLabel}>Are you a registered voter?</ThemedText>
        <View style={styles.voterRow}>
          <Pressable
            onPress={() => setFormData({ ...formData, is_voter: true })}
            style={[
              styles.voterToggle,
              formData.is_voter === true && styles.voterToggleActive,
              { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
            ]}
          >
            <ThemedText style={[
              styles.voterToggleText,
              formData.is_voter === true && styles.voterToggleTextActive,
            ]}>Yes</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setFormData({ ...formData, is_voter: false })}
            style={[
              styles.voterToggle,
              formData.is_voter === false && styles.voterToggleActive,
              { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }
            ]}
          >
            <ThemedText style={[
              styles.voterToggleText,
              formData.is_voter === false && styles.voterToggleTextActive,
            ]}>No</ThemedText>
          </Pressable>
        </View>
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
    height: 48, // <-- Add this line to match input height
    justifyContent: 'center', // <-- Optional, for vertical alignment
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 4,
    marginLeft: 2,
  },
  voterLabel: {
    marginBottom: 10,
    marginTop: 28,
    fontWeight: '600' as const,
    fontSize: 15,
    color: '#374151',
    textAlign: 'center' as const,
  },
  voterRow: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    marginBottom: 8,
    marginTop: 2,
  },
  voterToggle: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 8,
  },
  voterToggleActive: {
    backgroundColor: '#1e40af',
    borderColor: '#1e40af',
    zIndex: 1,
  },
  voterToggleText: {
    color: '#1e40af',
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  voterToggleTextActive: {
    color: '#fff',
  },
});