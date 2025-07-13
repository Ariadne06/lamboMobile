import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Platform, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRegister, ReligionOption, CivilStatusOption, EducationOption, StatusOption } from '@/context/registercontext';

export default function RegisterStep1() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { formData, setFormData, religionOptions, civilStatusOptions, educationOptions, statusOptions } = useRegister();

  return (
    <View>
      <TextInput
        placeholder="First Name"
        value={formData.first_name}
        onChangeText={(text) => setFormData({ ...formData, first_name: text })}
        style={styles.input}
      />

      <TextInput
        placeholder="Middle Name"
        value={formData.middle_name}
        onChangeText={(text) => setFormData({ ...formData, middle_name: text })}
        style={styles.input}
      />

      <TextInput
        placeholder="Last Name"
        style={styles.input}
        value={formData.last_name}
        onChangeText={(text) => setFormData({ ...formData, last_name: text })}
      />

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

      <View style={styles.picker}>
        <Picker selectedValue={formData.sex} onValueChange={(itemValue) => setFormData({ ...formData, sex: itemValue })}>
          <Picker.Item label="Select Sex" value="" />
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
        </Picker>
      </View>

      <TextInput
        placeholder="Gender (optional)"
        value={formData.gender}
        onChangeText={text => setFormData({ ...formData, gender: text })}
        style={styles.input}
      />

      <View style={styles.picker}>
        <Picker
          selectedValue={formData.civil_status}
          onValueChange={itemValue => setFormData({ ...formData, civil_status: itemValue })}
        >
          <Picker.Item label="Select Civil Status" value="" />
          {civilStatusOptions.map((cs: CivilStatusOption) => (
            <Picker.Item key={cs.civil_stat_id} label={cs.civil_name} value={cs.civil_stat_id} />
          ))}
        </Picker>
      </View>

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

      <View style={styles.picker}>
        <Picker
          selectedValue={formData.educational_attainment}
          onValueChange={itemValue => setFormData({ ...formData, educational_attainment: itemValue })}
        >
          <Picker.Item label="Select Educational Attainment" value="" />
          {educationOptions.map((ed: EducationOption) => (
            <Picker.Item key={ed.educational_attain_id} label={ed.educational_attain_name} value={ed.educational_attain_id} />
          ))}
        </Picker>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ marginRight: 10 }}>Registered Voter?</Text>
        <Switch
          value={!!formData.is_voter}
          onValueChange={(value) => setFormData({ ...formData, is_voter: value })}
        />
      </View>

      <TextInput
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        style={styles.input}
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Phone Number"
        value={formData.phone_number}
        onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
        style={styles.input}
        keyboardType="phone-pad"
      />

      <Picker
        selectedValue={formData.status}
        onValueChange={itemValue => setFormData({ ...formData, status: itemValue })}
      >
        <Picker.Item label="Select Status" value="" />
        {statusOptions.map((status: StatusOption) => (
          <Picker.Item key={status.status_id} label={status.status_name} value={status.status_id} />
        ))}
      </Picker>
    </View>
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
}; 