import { View, Text, TextInput } from 'react-native';
import { useRegister, SitioOption } from '@/context/registercontext';
import { Picker } from '@react-native-picker/picker';

export default function RegisterStep2() {
  const { formData, setFormData, sitioOptions } = useRegister();
  
  return (
    <View>
      <TextInput
        placeholder="House Number"
        value={formData.house_number}
        onChangeText={text => setFormData({ ...formData, house_number: text })}
        style={styles.input}
      />
      
      <TextInput
        placeholder="Street"
        value={formData.street}
        onChangeText={text => setFormData({ ...formData, street: text })}
        style={styles.input}
      />

      <TextInput
        placeholder="Barangay"
        value={formData.barangay}
        onChangeText={text => setFormData({ ...formData, barangay: text })}
        style={styles.input}
      />

      <View style={styles.picker}>
        <Picker
          selectedValue={formData.sitio_id}
          onValueChange={itemValue => setFormData({ ...formData, sitio_id: itemValue })}
        >
          <Picker.Item label="Select Sitio" value="" />
          {sitioOptions.map((sitio: SitioOption) => (
            <Picker.Item key={sitio.sitio_id} label={sitio.sitio_name} value={sitio.sitio_id} />
          ))}
        </Picker>
      </View>

      <TextInput
        placeholder="City/Municipality"
        value={formData.city_municipality}
        onChangeText={text => setFormData({ ...formData, city_municipality: text })}
        style={styles.input}
      />

      <TextInput
        placeholder="Country"
        value={formData.country}
        onChangeText={text => setFormData({ ...formData, country: text })}
        style={styles.input}
      />
    </View>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 12,
  },
}; 