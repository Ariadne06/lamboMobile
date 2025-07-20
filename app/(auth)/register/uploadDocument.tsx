import React, { useState } from 'react';
import { View, Text, Button, Image, Alert, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRegister } from '@/context/registercontext';

export default function UploadDocument() {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [mismatches, setMismatches] = useState<any>(null);
  const { formData, setFormData } = useRegister();
  const router = useRouter();

  const requestPermissions = async () => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraStatus.status !== 'granted' || mediaStatus.status !== 'granted') {
      Alert.alert('Permission required', 'Camera and media library permissions are required.');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleVerify = async () => {
    if (!image) {
      Alert.alert('Please select or take a photo first.');
      return;
    }
    setUploading(true);
    const formDataToSend = new FormData();
    formDataToSend.append('registrationData', JSON.stringify(formData));
    formDataToSend.append('id_image', {
      uri: image,
      type: 'image/jpeg',
      name: 'id.jpg',
    } as any);

    try {
      const response = await fetch('http://192.168.1.13:8000/api/verify-id-fields/', {
        method: 'POST',
        body: formDataToSend,
      });
      const data = await response.json();
      if (data.status === 'match') {
        setVerified(true);
        setMismatches(null);
      } else if (data.status === 'mismatch') {
        setVerified(false);
        setMismatches(data.mismatches);
      } else {
        setVerified(false);
        setMismatches(null);
        Alert.alert('Verification failed', 'Unexpected response from server.');
      }
    } catch (err) {
      Alert.alert('Verification failed', 'There was an error verifying the image.');
    }
    setUploading(false);
  };

  const handleSubmitRegistration = async () => {
    if (!image) {
      Alert.alert('Please select or take a photo first.');
      return;
    }
    setUploading(true);

    // 1. Log formData before building FormDataToSend
    console.log('formData before submit:', formData);

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formDataToSend.append(key, String(value));
      }
    });
    formDataToSend.append('id_image', {
      uri: image,
      type: 'image/jpeg',
      name: 'id.jpg',
    } as any);

  

    try {
      const response = await fetch('http://192.168.1.13:8000/api/register/', {
        method: 'POST',
        body: formDataToSend,
      });
      const data = await response.json();
      if (data.resident_id) {
        Alert.alert('Success', 'Registration complete!');
        router.push('/'); // or navigate to login/dashboard
      } else {
        Alert.alert('Error', 'Registration failed.');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error.');
    }
    setUploading(false);
  };

  // Helper to update mismatched fields in context
  const handleFieldCorrection = (key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
    setMismatches((prev: any) => ({ ...prev, [key]: { ...prev[key], user: value } }));
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Upload and Verify Your ID</Text>
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200, marginBottom: 20 }} />}
      <Button title="Take Photo" onPress={takePhoto} />
      <View style={{ height: 10 }} />
      <Button title="Choose from Gallery" onPress={pickFromGallery} />
      <View style={{ height: 20 }} />
      {image && !uploading && !verified && <Button title="Verify" onPress={handleVerify} />}
      {uploading && <ActivityIndicator size="large" />}
      {mismatches && (
        <View style={{ marginTop: 20, width: '100%' }}>
          <Text style={{ color: 'red', fontWeight: 'bold', marginBottom: 8 }}>Mismatches found:</Text>
          {Object.entries(mismatches).map(([key, val]: any) => (
            <View key={key} style={{ marginBottom: 12 }}>
              <Text style={{ fontWeight: 'bold' }}>{key.replace('_', ' ').toUpperCase()}</Text>
              <Text>User: <Text style={{ color: 'red' }}>{val.user}</Text></Text>
              <Text>OCR: <Text style={{ color: 'blue' }}>{val.ocr}</Text></Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginTop: 4 }}
                value={val.user}
                onChangeText={text => handleFieldCorrection(key, text)}
                placeholder={`Correct ${key}`}
              />
            </View>
          ))}
          <Button title="Re-Verify" onPress={handleVerify} />
        </View>
      )}
      {verified && !uploading && (
        <Button title="Submit Registration" onPress={handleSubmitRegistration} color="#1e40af" />
      )}
    </ScrollView>
  );
}