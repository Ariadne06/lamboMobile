import { View, Text, TextInput, Alert, Pressable } from 'react-native';
import { useRegister } from '@/context/registercontext';
import { router } from 'expo-router';

export default function RegisterStep3() {
  const { formData, setFormData } = useRegister();

  const handleNext = () => {
    // Validate required fields
    if (!formData.username || !formData.password || !formData.confirm_password) {
      Alert.alert('Missing Info', 'Please fill out all fields.');
      return;
    }
    if (formData.password !== formData.confirm_password) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    // Proceed to choose document screen
    router.push('/(auth)/register/chooseDocument');
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
      <Pressable
        onPress={handleNext}
        style={{ backgroundColor: '#FF3D33', padding: 12, borderRadius: 6, marginTop: 20 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>Next: Choose Document</Text>
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