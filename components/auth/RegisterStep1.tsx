import React, { useState } from 'react';
import { View, TextInput, Pressable, Platform, ScrollView, StyleSheet, Dimensions, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRegister, ReligionOption, CivilStatusOption, EducationOption, StatusOption } from '@/context/registercontext';
import { ThemedText } from '@/components/ThemedText';
import { router } from 'expo-router';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function RegisterStep1() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { formData, setFormData, religionOptions, civilStatusOptions, educationOptions, statusOptions, occupationOptions, nationalityOptions, employmentStatusOptions } = useRegister();

  const isNonResident = formData.user_type === 'non_resident';

   const handleNext = () => {
    // Check required fields for all users
    if (!formData.first_name?.trim()) {
      Alert.alert('Missing Info', 'Please enter your first name.');
      return;
    }
    if (!formData.last_name?.trim()) {
      Alert.alert('Missing Info', 'Please enter your last name.');
      return;
    }
    if (!formData.dob) {
      Alert.alert('Missing Info', 'Please select your date of birth.');
      return;
    }
    if (!formData.sex) {
      Alert.alert('Missing Info', 'Please select your sex.');
      return;
    }
    if (!formData.email?.trim()) {
      Alert.alert('Missing Info', 'Please enter your email.');
      return;
    }
    if (!formData.phone_number?.trim()) {
      Alert.alert('Missing Info', 'Please enter your phone number.');
      return;
    }

    // Email validation
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // Phone validation (simple)
    if (formData.phone_number.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
      return;
    }

    // Additional validation for residents only
    if (!isNonResident) {
      if (!formData.civil_status_id) {
        Alert.alert('Missing Info', 'Please select your civil status.');
        return;
      }
      if (!formData.religion_cat_id) {
        Alert.alert('Missing Info', 'Please select your religion.');
        return;
      }
      if (!formData.educational_attainment_id) {
        Alert.alert('Missing Info', 'Please select your educational attainment.');
        return;
      }
      if (!formData.occupation_id) {
        Alert.alert('Missing Info', 'Please select your occupation.');
        return;
      }
      if (!formData.nationality_id) {
        Alert.alert('Missing Info', 'Please select your nationality.');
        return;
      }
      if (!formData.employment_status_id) {
        Alert.alert('Missing Info', 'Please select your employment status.');
        return;
      }
      
      // Check if "Others" religion is selected and requires specification
      if (formData.religion_cat_id === 8 && !formData.other_religion?.trim()) {
        Alert.alert('Missing Info', 'Please specify your religion.');
        return;
      }
    }

    // All validations passed, proceed to next step
    router.push('/(auth)/register/step2');
  };


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


        {!isNonResident && (
          <>
            {/* Gender - RESIDENTS ONLY */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Gender (optional)</ThemedText>
              <TextInput
                placeholder="Gender (optional)"
                value={formData.gender}
                onChangeText={text => setFormData({ ...formData, gender: text })}
                style={styles.input}
              />
            </View>

            {/* Civil Status - RESIDENTS ONLY */}
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

            {/* Religion - RESIDENTS ONLY */}
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

            {/* Educational Attainment - RESIDENTS ONLY */}
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
           {/* Occupation */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Occupation</ThemedText>
              <View style={styles.picker}>
                <Picker
                  selectedValue={formData.occupation_id}
                  onValueChange={itemValue => setFormData({ ...formData, occupation_id: itemValue })}
                >
                  <Picker.Item label="Select Occupation" value="" />
                  {occupationOptions.map((occupation: any) => (
                    <Picker.Item 
                      key={occupation.occupation_id} 
                      label={occupation.occupation_name} 
                      value={occupation.occupation_id} 
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Nationality */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Nationality</ThemedText>
              <View style={styles.picker}>
                <Picker
                  selectedValue={formData.nationality_id}
                  onValueChange={itemValue => setFormData({ ...formData, nationality_id: itemValue })}
                >
                  <Picker.Item label="Select Nationality" value="" />
                  {nationalityOptions.map((nationality: any) => (
                    <Picker.Item 
                      key={nationality.nationality_id} 
                      label={nationality.nationality} 
                      value={nationality.nationality_id} 
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Employment Status */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Employment Status</ThemedText>
              <View style={styles.picker}>
                <Picker
                  selectedValue={formData.employment_status_id}
                  onValueChange={itemValue => setFormData({ ...formData, employment_status_id: itemValue })}
                >
                  <Picker.Item label="Select Employment Status" value="" />
                  {employmentStatusOptions.map((status: any) => (
                    <Picker.Item 
                      key={status.employment_status_id} 
                      label={status.employment_status_name} 
                      value={status.employment_status_id} 
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* PWD Status */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Person with Disability (PWD)</ThemedText>
              <View style={styles.pwdRow}>
                <Pressable 
                  style={[
                    styles.pwdToggle, 
                    !formData.is_pwd && styles.pwdToggleActive
                  ]}
                  onPress={() => setFormData({ ...formData, is_pwd: false })}
                >
                  <ThemedText style={[
                    styles.pwdToggleText, 
                    !formData.is_pwd && styles.pwdToggleTextActive
                  ]}>
                    No
                  </ThemedText>
                </Pressable>
                <Pressable 
                  style={[
                    styles.pwdToggle, 
                    formData.is_pwd && styles.pwdToggleActive
                  ]}
                  onPress={() => setFormData({ ...formData, is_pwd: true })}
                >
                  <ThemedText style={[
                    styles.pwdToggleText, 
                    formData.is_pwd && styles.pwdToggleTextActive
                  ]}>
                    Yes
                  </ThemedText>
                </Pressable>
              </View>
            </View>
            
          </>
        )}
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
        <Pressable
          onPress={handleNext}
          style={styles.nextButton}
        >
          <ThemedText style={styles.nextButtonText}>
            Next: Address Information
          </ThemedText>
        </Pressable>

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
  pwdRow: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    marginBottom: 8,
    marginTop: 2,
  },
  pwdToggle: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  pwdToggleActive: {
    backgroundColor: '#1e40af',
    borderColor: '#1e40af',
    zIndex: 1,
  },
  pwdToggleText: {
    color: '#1e40af',
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  pwdToggleTextActive: {
    color: '#fff',
  },

  requiredField: {
    color: '#dc2626', 
  },
  errorInput: {
    borderColor: '#dc2626', 
    borderWidth: 2,
  },

   nextButton: {
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
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});