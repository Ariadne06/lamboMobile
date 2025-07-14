import { View, Text, TextInput, Alert, Pressable } from 'react-native';
import { useRegister } from '@/context/registercontext';

export default function RegisterStep3() {
  const { formData, setFormData } = useRegister();
  
  const handleSubmit = async () => {
    if (!formData.first_name || !formData.middle_name || !formData.last_name || !formData.dob || !formData.sex ) {
      Alert.alert('Missing Info', 'Please fill out all fields.');
      return;
    }

    try {
      const response = await fetch('http://192.168.1.9:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Resident registered successfully!');
      } else {
        console.error(result);
        Alert.alert('Error', 'Registration failed.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Network error.');
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Username"
        value={formData.username}
        onChangeText={text => setFormData({ ...formData, username: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={formData.password}
        onChangeText={text => setFormData({ ...formData, password: text })}
        style={styles.input}
        secureTextEntry
      />
      <TextInput
        placeholder="Confirm Password"
        value={formData.confirm_password}
        onChangeText={text => setFormData({ ...formData, confirm_password: text })}
        style={styles.input}
        secureTextEntry
      />
      
      {/* Submit button within the component */}
      <Pressable
        onPress={handleSubmit}
        style={{ backgroundColor: '#FF3D33', padding: 12, borderRadius: 6, marginTop: 20 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>Submit</Text>
      </Pressable>
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
}; 