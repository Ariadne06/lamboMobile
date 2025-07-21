import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Platform, Switch, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRegister, ReligionOption, CivilStatusOption, EducationOption, StatusOption } from '@/context/registercontext';

export default function RegisterStep1() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { formData, setFormData, religionOptions, civilStatusOptions, educationOptions, statusOptions } = useRegister();

  return (
    <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
      
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>First Name</Text>
            <TextInput
              placeholder="First Name"
              value={formData.first_name}
              onChangeText={(text) => setFormData({ ...formData, first_name: text })}
              style={styles.input}
            />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Middle Name</Text>
          <TextInput
            placeholder="Middle Name"
            value={formData.middle_name}
            onChangeText={(text) => setFormData({ ...formData, middle_name: text })}
            style={styles.input}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Last Name</Text>
            <TextInput
              placeholder="Last Name"
              style={styles.input}
              value={formData.last_name}
              onChangeText={(text) => setFormData({ ...formData, last_name: text })}
            />
        </View>

        <View style={{ flex: 1 }}>    
          <Text style={styles.label}>Suffix</Text>
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

      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Birthdate</Text>
          <Pressable onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text style={{ color: formData.dob ? '#000' : '#888' }}>
              {formData.dob ? formData.dob : 'Select Birthdate'}
            </Text>
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

      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Sex</Text>
        <View style={styles.picker}>
          <Picker selectedValue={formData.sex} onValueChange={(itemValue) => setFormData({ ...formData, sex: itemValue })}>
            <Picker.Item label="Select Sex" value="" />
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
          </Picker>
        </View>
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Gender (optional)</Text>
        <TextInput
          placeholder="Gender (optional)"
          value={formData.gender}
          onChangeText={text => setFormData({ ...formData, gender: text })}
          style={styles.input}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Civil Status</Text>
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

      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Religion</Text>
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

      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Educational Attainment</Text>
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
      
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            style={styles.input}
            keyboardType="email-address"
          />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.label}>Phone Number</Text>
          <TextInput
            placeholder="Phone Number"
            value={formData.phone_number}
            onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
            style={styles.input}
            keyboardType="phone-pad"
          />
      </View>
    
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Status</Text>
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

        <Text style={{ marginBottom: 8, marginTop: 16, fontWeight: '600' }}>Are you a registered voter?</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
          <Pressable
            onPress={() => setFormData({ ...formData, is_voter: true })}
            style={{
              backgroundColor: formData.is_voter ? '#1e40af' : '#f3f4f6',
              paddingVertical: 12,
              paddingHorizontal: 32,
              borderRadius: 8,
              marginRight: 8,
              borderWidth: formData.is_voter ? 0 : 1,
              borderColor: '#d1d5db',
            }}
          >
            <Text style={{ color: formData.is_voter ? '#fff' : '#1e40af', fontWeight: 'bold' }}>Yes</Text>
          </Pressable>
          <Pressable
            onPress={() => setFormData({ ...formData, is_voter: false })}
            style={{
              backgroundColor: formData.is_voter === false ? '#1e40af' : '#f3f4f6',
              paddingVertical: 12,
              paddingHorizontal: 32,
              borderRadius: 8,
              borderWidth: formData.is_voter === false ? 0 : 1,
              borderColor: '#d1d5db',
            }}
          >
            <Text style={{ color: formData.is_voter === false ? '#fff' : '#1e40af', fontWeight: 'bold' }}>No</Text>
          </Pressable>
        </View>

    </ScrollView>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 12,
  },
    label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 6,
  },
}; 