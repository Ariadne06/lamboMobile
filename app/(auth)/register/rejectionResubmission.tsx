import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/constants/apiConfig';
import { ErrorModal } from '@/components/ui/ErrorModal';

export default function RejectionResubmissionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const message = params.message as string || 'Your application was rejected. Please resubmit your document.';
  const docTypeName = params.identity_doc_type_name as string || 'Supporting Document';
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    message: '',
    icon: 'alert-circle' as keyof typeof Ionicons.glyphMap,
    iconColor: '#ef4444',
  });

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleResubmit = async () => {
    if (!image) {
      Alert.alert('Please select or take a photo first.');
      return;
    }
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('resident_id', Array.isArray(params.resident_id) ? params.resident_id[0] : params.resident_id);
      formData.append('identity_doc_type_id', Array.isArray(params.identity_doc_type_id) ? params.identity_doc_type_id[0] : params.identity_doc_type_id);
      formData.append('id_image', {
        uri: image,
        type: 'image/jpeg',
        name: 'supporting_document.jpg',
      } as any);

      const response = await fetch(`${API_BASE_URL}/api/resubmit-supporting-certificate/`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Document resubmitted successfully.', [
          { text: 'OK', onPress: () => router.replace('/(auth)/login') }
        ]);
      } else {
        setErrorModal({
          visible: true,
          title: 'Invalid Document',
          message: data.message || `The uploaded image does not match the expected document type (${docTypeName}). Please upload a clear photo of your ${docTypeName}.`,
          icon: 'close-circle',
          iconColor: '#ef4444',
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Network error occurred. Please try again.');
    }
    setUploading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: 32, width: '90%' }}>
        <Ionicons name="alert-circle" size={80} color="#f59e0b" />
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#f59e0b', marginTop: 16, marginBottom: 8 }}>
          Resubmission Required
        </Text>
        <Text style={{ fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 12 }}>
          {message}
        </Text>
        <Text style={{ fontSize: 16, color: '#334155', textAlign: 'center', marginBottom: 20 }}>
          Document: <Text style={{ fontWeight: 'bold', color: '#0ea5e9' }}>{docTypeName}</Text>.
        </Text>
        {image && (
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Image source={{ uri: image }} style={{ width: 220, height: 140, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' }} />
            <Text style={{ color: '#64748b', fontSize: 13 }}>
              {image.split('/').pop()}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={{
            backgroundColor: '#0ea5e9',
            padding: 14,
            borderRadius: 8,
            alignItems: 'center',
            width: 200,
            marginBottom: 18,
            marginTop: 6,
          }}
          onPress={pickImage}
          disabled={uploading}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            {image ? 'Change Photo' : 'Pick Photo'}
          </Text>
        </TouchableOpacity>
        {image && (
          <TouchableOpacity
            style={{
              backgroundColor: uploading ? '#a7f3d0' : '#10b981',
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
              width: 220,
              opacity: uploading ? 0.7 : 1,
            }}
            onPress={handleResubmit}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                Resubmit
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.title}
        message={errorModal.message}
        icon={errorModal.icon}
        iconColor={errorModal.iconColor}
        actions={[
          {
            text: 'OK',
            onPress: () => setErrorModal(prev => ({ ...prev, visible: false })),
          },
        ]}
      />
    </SafeAreaView>
  );
}