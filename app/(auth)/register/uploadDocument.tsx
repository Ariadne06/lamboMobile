import React, { useState } from 'react';
import { View, Text, Image, Alert, ActivityIndicator, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRegister } from '@/context/registercontext';
import { API_BASE_URL } from '@/constants/apiConfig';
import { Ionicons } from '@expo/vector-icons';

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
      name: 'id_document.jpg',
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

  //  new verification function for guardian IDs
  const handleGuardianVerify = async () => {
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
      name: 'guardian_document.jpg',
    } as any);

    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-guardian-id-fields/`, {
        method: 'POST',
        body: formDataToSend,
      });
      const data = await response.json(); 
      
      if (data.status === 'match') {
        setVerified(true);
        setMismatches(null);
        Alert.alert('Success', 'Guardian document verified successfully!');
      } else if (data.status === 'mismatch') {
        setVerified(false);
        setMismatches(data.mismatches);
        Alert.alert('Verification Issue', 'Some details don\'t match. Please review and correct if needed.');
      } else {
        setVerified(false);
        setMismatches(null);
        Alert.alert('Verification failed', data.message || 'Unexpected response from server.');
      }
    } catch (err) {
      console.error('Guardian verification error:', err);
      Alert.alert('Verification failed', 'There was an error verifying the guardian document.');
    }
    setUploading(false);
  };

  const handleSubmitRegistration = async () => {
    if (!image) {
      Alert.alert('Please select or take a photo first.');
      return;
    }
    setUploading(true);

    // Log formData before building FormDataToSend
    console.log('📋 formData before submit:', formData);

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
      
      console.log('📥 Response data:', data);
      
      // Updated condition - Check for success AND resident_id
      if (data.success && data.resident_id) {
        Alert.alert('Success', 'Registration complete!');
        
        // UPDATED ROUTING LOGIC FOR ALL VERIFICATION TYPES:
        if (formData.verification_type === 'GUARDIAN') {
          // Guardian verification - check if auto-verified or pending
          if (data.is_verified) {
            // Guardian ID documents may auto-verify
            router.replace('/(tabs)/menu');
          } else {
            // Guardian supporting documents need review
            router.replace({
              pathname: '/(auth)/register/verificationStatus',
              params: {
                isVerified: 'false',
                message: 'Your guardian documents are being reviewed by our team. You will be notified when approved.',
              }
            });
          }
        } else if (formData.verification_type === 'SUPPORTING') {
          // Supporting documents → Always go to verification status screen
          router.replace({
            pathname: '/(auth)/register/verificationStatus',
            params: {
              isVerified: 'false',
              message: 'Your documents are being reviewed by our team. You will be notified when approved.',
            }
          });
        } else {
          // ID document logic remains the same
          if (data.is_verified) {
            // Auto-verified → Go to main app
            router.replace('/(tabs)/menu');
          } else {
            // Not verified for some reason → Go to status screen
            router.replace({
              pathname: '/(auth)/register/verificationStatus',
              params: {
                isVerified: 'false',
                message: 'Your account is pending verification.',
              }
            });
          }
        }
      } else {
        // Better error handling
        const errorMessage = data.error || data.details || 'Registration failed.';
        Alert.alert('Error', errorMessage);
      }
    } catch (err) {
      console.error('Network error:', err);
      Alert.alert('Error', 'Network error occurred.');
    }
    setUploading(false);
  };

  // Helper to update mismatched fields in context
  const handleFieldCorrection = (key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
    setMismatches((prev: any) => ({ ...prev, [key]: { ...prev[key], user: value } }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* Show different header based on verification type */}
      {formData.verification_type === 'GUARDIAN' ? (
        <View style={styles.guardianHeaderContainer}>
          <Ionicons name="people-outline" size={48} color="#ff6b35" />
          <Text style={styles.guardianHeaderTitle}>
            Guardian Document Upload
          </Text>
          <Text style={styles.guardianHeaderDescription}>
            Upload your guardian&apos;s {formData.document_type} for verification.
            {formData.guardian_type === 'GUARDIAN_ID' && ' Document will be automatically scanned.'}
            {formData.guardian_type === 'GUARDIAN_SUPPORTING' && ' Document will be manually reviewed.'}
          </Text>
          <Text style={styles.guardianUsername}>
            Guardian: {formData.guardian_username}
          </Text>
        </View>
      ) : formData.verification_type === 'SUPPORTING' ? (
        <View style={styles.supportingHeaderContainer}>
          <Ionicons name="document-text-outline" size={48} color="#f59e0b" />
          <Text style={styles.supportingHeaderTitle}>
            Supporting Document Upload
          </Text>
          <Text style={styles.supportingHeaderDescription}>
            Your document will be manually reviewed by our team. No automatic scanning will be performed.
          </Text>
        </View>
      ) : (
        <View style={styles.idHeaderContainer}>
          <Ionicons name="scan-outline" size={48} color="#3b82f6" />
          <Text style={styles.idHeaderTitle}>
            ID Document Scanning
          </Text>
          <Text style={styles.idHeaderDescription}>
            Your ID will be automatically scanned and verified for instant approval.
          </Text>
        </View>
      )}

      <Text style={styles.mainTitle}>
        {formData.verification_type === 'GUARDIAN' 
          ? `Upload Guardian's ${formData.document_type || 'Document'}`
          : formData.verification_type === 'SUPPORTING' 
          ? 'Upload Your Document' 
          : 'Upload and Verify Your ID'
        }
      </Text>

      <View style={styles.uploadContainer}>
        {/* Image Preview */}
        {image && (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: image }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Action Buttons */}
        {!image && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.takePhotoButton, uploading && styles.disabledButton]}
              onPress={takePhoto}
              disabled={uploading}
            >
              <Text style={styles.takePhotoButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.galleryButton, uploading && styles.disabledButton]}
              onPress={pickFromGallery}
              disabled={uploading}
            >
              <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Change Photo Button */}
        {image && !uploading && (
          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={() => setImage(null)}
          >
            <Text style={styles.changePhotoButtonText}>Change Photo</Text>
          </TouchableOpacity>
        )}

        {/* Verify Button - Show for ID documents AND Guardian IDs */}
        {image && !uploading && !verified && !mismatches && 
         (formData.verification_type === 'ID' || 
          (formData.verification_type === 'GUARDIAN' && formData.guardian_type === 'GUARDIAN_ID')) && (
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={formData.verification_type === 'GUARDIAN' ? handleGuardianVerify : handleVerify}
          >
            <Text style={styles.verifyButtonText}>
              {formData.verification_type === 'GUARDIAN' ? 'Verify Guardian Document' : 'Verify ID'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Spinner */}
        {uploading && (
          <ActivityIndicator size="large" color="#6366f1" style={styles.spinner} />
        )}

        {/* Submit Button - Updated logic to require verification for Guardian IDs */}
        {(
          // Regular ID verification (verified required)
          (verified && !uploading && formData.verification_type === 'ID') || 
          // Supporting documents (no verification needed)
          (image && !uploading && formData.verification_type === 'SUPPORTING') ||
          // Guardian Supporting documents (no verification needed)
          (image && !uploading && formData.verification_type === 'GUARDIAN' && formData.guardian_type === 'GUARDIAN_SUPPORTING') ||
          // Guardian ID documents (verification required)
          (verified && !uploading && formData.verification_type === 'GUARDIAN' && formData.guardian_type === 'GUARDIAN_ID')
        ) && (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitRegistration}
          >
            <Text style={styles.submitButtonText}>
              {formData.verification_type === 'GUARDIAN' 
                ? 'Submit Guardian Document'
                : formData.verification_type === 'SUPPORTING' 
                ? 'Submit Document' 
                : 'Submit Registration'
              }
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Mismatches handling */}
      {mismatches && (
        <View style={styles.mismatchesContainer}>
          <Text style={styles.mismatchesTitle}>We found some differences:</Text>
          {Object.entries(mismatches).map(([key, val]: any) => (
            <View key={key} style={styles.mismatchItem}>
              <View style={styles.mismatchContent}>
                <Text style={styles.mismatchFieldName}>
                  {key.replace('_', ' ').toUpperCase()}
                </Text>
                <Text style={styles.mismatchText}>
                  Document Extracted: <Text style={styles.mismatchUserValue}>{val.guardian}</Text>
                </Text>
                <Text style={styles.mismatchText}>
                  Guardian&apos;s Stored Info: <Text style={styles.mismatchOcrValue}>{val.expected}</Text>
                </Text>
                {/* Remove the TextInput for guardian verification since user can't correct guardian's document */}
                <Text style={styles.mismatchNote}>
                  Please ensure you&apos;re uploading the correct guardian document that matches their registered information.
                </Text>
              </View>
              <Text style={styles.mismatchIcon}>!</Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.reverifyButton}
            onPress={formData.verification_type === 'GUARDIAN' ? handleGuardianVerify : handleVerify}
            disabled={uploading}
          >
            <Text style={styles.reverifyButtonText}>Re-verify</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 40,
  },
  // Header Styles
  guardianHeaderContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  guardianHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#c2410c',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  guardianHeaderDescription: {
    fontSize: 14,
    color: '#c2410c',
    textAlign: 'center',
    lineHeight: 20,
  },
  guardianUsername: {
    fontSize: 12,
    color: '#c2410c',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  supportingHeaderContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  supportingHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400e',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  supportingHeaderDescription: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
    lineHeight: 20,
  },
  idHeaderContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  idHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e40af',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  idHeaderDescription: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Main Content Styles
  mainTitle: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1e293b',
  },
  uploadContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  // Image Preview Styles
  imagePreviewContainer: {
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
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  // Action Buttons Styles
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  takePhotoButton: {
    backgroundColor: '#2563eb',
  },
  takePhotoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  galleryButton: {
    backgroundColor: '#fbbf24',
  },
  galleryButtonText: {
    color: '#1e293b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  // Change Photo Button
  changePhotoButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  changePhotoButtonText: {
    color: '#374151',
    fontWeight: 'bold',
    fontSize: 15,
  },
  // Verify Button
  verifyButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  // Spinner
  spinner: {
    marginVertical: 20,
  },
  // Submit Button
  submitButton: {
    backgroundColor: '#1e40af',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
    elevation: 2,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  // Mismatches Styles
  mismatchesContainer: {
    marginTop: 20,
    width: '100%',
  },
  mismatchesTitle: {
    color: 'red',
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
  },
  mismatchItem: {
    backgroundColor: '#fef2f2',
    borderColor: '#f87171',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mismatchContent: {
    flex: 1,
  },
  mismatchFieldName: {
    fontWeight: 'bold',
    color: '#991b1b',
    fontSize: 14,
  },
  mismatchText: {
    fontSize: 14,
    color: '#374151',
    marginVertical: 2,
  },
  mismatchUserValue: {
    color: '#991b1b',
    fontWeight: '500',
  },
  mismatchOcrValue: {
    color: '#2563eb',
    fontWeight: '500',
  },
  mismatchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 8,
    marginTop: 6,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  mismatchIcon: {
    fontSize: 24,
    color: '#f87171',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  // Re-verify Button
  reverifyButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    marginBottom: 40,
  },
  reverifyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mismatchNote: {
  fontSize: 12,
  color: '#6b7280',
  marginTop: 8,
  fontStyle: 'italic',
  lineHeight: 16,
  },
});