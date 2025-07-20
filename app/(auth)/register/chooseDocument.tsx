import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useRegister } from '@/context/registercontext';

export default function ChooseDocument() {
  const router = useRouter();
  const { setFormData } = useRegister();

  const handleSelect = (docType: string) => {
    setFormData((prev: any) => ({
      ...prev,
      document_type: docType,
    }));
    router.push('/(auth)/register/uploadDocument');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text style={{ fontSize: 22, marginBottom: 20, fontWeight: 'bold' }}>Choose Document to Upload</Text>
      <TouchableOpacity style={styles.button} onPress={() => handleSelect('Philippine National ID')}>
        <Text style={styles.buttonText}>Philippine National ID</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleSelect('Birth Certificate')}>
        <Text style={styles.buttonText}>Birth Certificate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  button: {
    backgroundColor: '#e0e7ff',
    padding: 16,
    borderRadius: 8,
    marginVertical: 10,
    width: 240,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 600 as const,
    color: '#1e293b',
  },
};