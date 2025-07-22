import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useRegister } from '@/context/registercontext';

// Illustration at the top (replace the path with your actual image if needed)
const MockIDImage = () => (
  <Image
    source={require('../../../assets/images/id-card.png')}
    style={styles.image}
    resizeMode="contain"
  />
);

const DOCUMENTS = [
  { label: 'Philippine National ID', value: 'Philippine National ID' },
  { label: 'Voter’s ID', value: 'Voters ID' },
  { label: 'Driver’s License', value: 'Drivers License' },
  { label: 'UMID', value: 'UMID' },
];

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
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/id-card.png')}
          style={{ width: 120, height: 100 }}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.title}>Choose ID/Document to upload</Text>
      <View style={styles.optionsContainer}>
        {DOCUMENTS.map((doc) => (
          <TouchableOpacity
            key={doc.value}
            style={styles.optionCard}
            onPress={() => handleSelect(doc.value)}
            activeOpacity={0.85}
          >
            <Text style={styles.optionText}>{doc.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  imageContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 28,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  optionCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  image: {
    width: '100%',
    maxWidth: 400, // or whatever max you want
    height: 200,   // or use 'auto' with aspectRatio
    alignSelf: 'center',
  },
});