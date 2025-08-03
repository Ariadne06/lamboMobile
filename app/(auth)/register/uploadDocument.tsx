import React, { useState } from 'react';
import { View, Text, Image, Alert, ActivityIndicator, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRegister } from '@/context/registercontext';
import { API_BASE_URL } from '@/constants/apiConfig';


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
      const response = await fetch(`${API_BASE_URL}/api/verify-id-fields/`, {
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
      const response = await fetch(`${API_BASE_URL}/api/register/`, {
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
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24, paddingBottom: 40 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Upload and Verify Your ID</Text>
      <View style={{ width: '100%', alignItems: 'center', marginTop: 16 }}>
        {/* Image Preview */}
        {image && (
          <View
            style={{
              width: 220,
              height: 220,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: '#6366f1',
              backgroundColor: '#f3f4f6',
              marginBottom: 20,
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              source={{ uri: image }}
              style={{ width: 200, height: 200, borderRadius: 12 }}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Action Buttons */}
        {!image && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#2563eb',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 8,
                marginHorizontal: 8,
                opacity: uploading ? 0.6 : 1,
              }}
              onPress={takePhoto}
              disabled={uploading}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: '#fbbf24',
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 8,
                marginHorizontal: 8,
                opacity: uploading ? 0.6 : 1,
              }}
              onPress={pickFromGallery}
              disabled={uploading}
            >
              <Text style={{ color: '#1e293b', fontWeight: 'bold', fontSize: 16 }}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Change Photo Button (only once, after image preview) */}
        {image && !uploading && (
          <TouchableOpacity
            style={{
              backgroundColor: '#e5e7eb',
              paddingVertical: 10,
              paddingHorizontal: 18,
              borderRadius: 8,
              marginBottom: 10,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#d1d5db',
            }}
            onPress={() => setImage(null)}
          >
            <Text style={{ color: '#374151', fontWeight: 'bold', fontSize: 15 }}>Change Photo</Text>
          </TouchableOpacity>
        )}

        {/* Verify Button */}
        {image && !uploading && !verified && !mismatches && (
          <TouchableOpacity
            style={{
              backgroundColor: '#10b981',
              paddingVertical: 14,
              paddingHorizontal: 32,
              borderRadius: 10,
              marginBottom: 16,
              alignItems: 'center',
            }}
            onPress={handleVerify}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>Verify ID</Text>
          </TouchableOpacity>
        )}

        {/* Spinner */}
        {uploading && (
          <ActivityIndicator size="large" color="#6366f1" style={{ marginVertical: 20 }} />
        )}

        {/* Submit Button */}
        {verified && !uploading && (
          <TouchableOpacity
            style={{
              backgroundColor: '#1e40af',
              paddingVertical: 16,
              paddingHorizontal: 40,
              borderRadius: 12,
              marginTop: 10,
              alignItems: 'center',
              elevation: 2,
            }}
            onPress={handleSubmitRegistration}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Submit Registration</Text>
          </TouchableOpacity>
        )}
      </View>
      {mismatches && (
        <View style={{ marginTop: 20, width: '100%' }}>
          <Text style={{ color: 'red', fontWeight: 'bold', marginBottom: 8 }}>We found some differences:</Text>
          {Object.entries(mismatches).map(([key, val]: any) => (
            <View key={key} style={{
              backgroundColor: '#fef2f2',
              borderColor: '#f87171',
              borderWidth: 1,
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', color: '#991b1b' }}>{key.replace('_', ' ').toUpperCase()}</Text>
                <Text>User Input: <Text style={{ color: '#991b1b' }}>{val.user}</Text></Text>
                <Text>ID Extracted: <Text style={{ color: '#2563eb' }}>{val.ocr}</Text></Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: 6,
                    padding: 8,
                    marginTop: 6,
                    backgroundColor: '#fff'
                  }}
                  value={val.user}
                  onChangeText={text => handleFieldCorrection(key, text)}
                  placeholder={`Correct ${key}`}
                />
              </View>
              <Text style={{ fontSize: 24, color: '#f87171', marginLeft: 8 }}>!</Text>
            </View>
          ))}
          <TouchableOpacity
            style={{
              backgroundColor: '#10b981',
              paddingVertical: 12,
              paddingHorizontal: 32,
              borderRadius: 10,
              marginTop: 10,
              alignItems: 'center',
              marginBottom: 40, // Add extra space below the button
            }}
            onPress={handleVerify}
            disabled={uploading}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Re-verify</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}