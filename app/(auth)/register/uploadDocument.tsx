import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRegister } from '@/context/registercontext';
import { API_BASE_URL } from '@/constants/apiConfig';
import { Ionicons } from '@expo/vector-icons';
import { ErrorModal } from '@/components/ui/ErrorModal';

export default function UploadDocument() {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verificationStage, setVerificationStage] = useState<'idle' | 'uploading' | 'analyzing' | 'complete'>('idle');
  const [mismatches, setMismatches] = useState<any>(null);
  const [showMismatchDetails, setShowMismatchDetails] = useState(false);
  
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    message: '',
    icon: 'alert-circle' as keyof typeof Ionicons.glyphMap,
    iconColor: '#ef4444',
    actions: [] as any[],
  });

  const { formData, setFormData } = useRegister();
  const router = useRouter();

  const documentType = formData.document_type || 'Supporting Document';
  const verificationType = formData.verification_type || 'ID';
  const isGuardianVerification = verificationType === 'GUARDIAN';
  const isSupportingDocument = verificationType === 'SUPPORTING';

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGuidelinesModal(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const requestPermissions = async () => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus.status !== 'granted' || mediaStatus.status !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library access are needed to upload your document.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.9,
        aspect: undefined,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('📸 Photo taken successfully');
        setImage(result.assets[0].uri);
        setVerified(false);
        setMismatches(null);
        setErrorModal(prev => ({ ...prev, visible: false }));
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      Alert.alert('Camera Error', 'Unable to open camera. Please try again.');
    }
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.9,
        aspect: undefined,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('🖼️ Image selected from gallery');
        setImage(result.assets[0].uri);
        setVerified(false);
        setMismatches(null);
        setErrorModal(prev => ({ ...prev, visible: false }));
      }
    } catch (error) {
      console.error('❌ Gallery error:', error);
      Alert.alert('Gallery Error', 'Unable to open gallery. Please try again.');
    }
  };

 // ✅ ENHANCED: Verification handler with guardian document validation
const handleVerify = async () => {
  if (!image) {
    Alert.alert('No Photo', 'Please take or select a photo first.');
    return;
  }

  if (uploading) {
    console.log('⚠️ Already processing, ignoring duplicate press');
    return;
  }

  console.log('🔄 Starting verification process...');

  setUploading(true);
  setVerificationStage('uploading');
  setVerified(false);
  setMismatches(null);
  setErrorModal(prev => ({ ...prev, visible: false }));

  try {
    const registrationData = {
      first_name: formData.first_name || '',
      last_name: formData.last_name || '',
      middle_name: formData.middle_name || '',
      dob: formData.dob || '',
      document_type: formData.document_type || '',
      verification_type: formData.verification_type || 'ID',
      guardian_username: formData.guardian_username || '',
    };

    console.log('📤 Sending verification request');

    const formDataToSend = new FormData();
    
    formDataToSend.append('id_image', {
      uri: image,
      type: 'image/jpeg',
      name: 'document.jpg',
    } as any);

    formDataToSend.append('registrationData', JSON.stringify(registrationData));

    const endpoint = isGuardianVerification 
      ? `${API_BASE_URL}/api/verify-guardian-id-fields/`
      : `${API_BASE_URL}/api/verify-id-fields/`;

    setVerificationStage('analyzing');

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formDataToSend,
    });

    const data = await response.json();
    console.log('✅ Server response:', data);

    setUploading(false);
    setVerificationStage('idle');

    // Handle document type mismatch
    if (data.error_type === 'DOCUMENT_TYPE_MISMATCH') {
      console.log('❌ Document type mismatch detected');
      
      Alert.alert(
        '⚠️ Wrong Document Type',
        data.user_friendly_message || data.message || `This doesn't look like a ${documentType}. Please upload a clear photo of your ${documentType}.`,
        [
          {
            text: 'Retake Photo',
            onPress: () => setImage(null)
          },
          {
            text: 'Change Document Type',
            onPress: () => router.back()
          }
        ]
      );
      return;
    }

    // Handle photo quality issues
    if (data.error_type === 'QUALITY_ISSUE') {
      console.log('❌ Photo quality issue detected');
      
      Alert.alert(
        '📸 Photo Quality Issue',
        'We couldn\'t read your document clearly. Please retake the photo with:\n\n• Better lighting\n• No shadows or glare\n• All 4 corners visible\n• Camera held steady',
        [
          {
            text: 'Retake Photo',
            onPress: () => setImage(null)
          }
        ]
      );
      return;
    }

    // ✅ FIXED: Check document type properly - supporting documents vs ID documents
    const isSupportingDoc = documentType && (
      documentType.toLowerCase().includes('birth') || 
      documentType.toLowerCase().includes('voter') ||
      documentType.toLowerCase().includes('certificate')
    );

    // ✅ For supporting documents (both regular and guardian), skip OCR validation if verified
    if (isSupportingDoc && (data.verified === true || data.status === 'match')) {
      console.log('✅ Supporting document verified successfully (header check only)');
      
      setVerified(true);
      
      if (data.extracted_fields) {
        setFormData((prev: any) => ({
          ...prev,
          ocr_fields: data.extracted_fields,
        }));
      }

      Alert.alert(
        '✅ Verification Complete',
        isGuardianVerification
          ? `Your guardian's ${documentType} has been verified successfully!`
          : 'Your document has been validated successfully!',
        [{ text: 'Continue' }]
      );
      return;
    }

    // Handle field mismatches (for ID documents only)
    if (data.error_type === 'MISMATCH' && data.mismatches && !data.mismatches.header) {
      console.log('⚠️ Field mismatches detected:', data.mismatches);
      setMismatches(data.mismatches);
      return;
    }

    if (data.status === 'mismatch' && data.mismatches && !data.mismatches.header) {
      console.log('⚠️ Legacy mismatch format:', data.mismatches);
      setMismatches(data.mismatches);
      return;
    }

    // Handle successful verification for ID documents
    if (data.verified === true || data.status === 'match') {
      console.log('✅ Document verified successfully');
      
      // ✅ Additional validation for ID documents (not supporting documents)
      if (!isSupportingDoc && isGuardianVerification && data.extracted_fields) {
        const ocrFields = data.extracted_fields;
        
        // Check if OCR extracted meaningful data for guardian ID verification
        if (!ocrFields.first_name && !ocrFields.last_name) {
          console.log('❌ Guardian ID verification: No names extracted from document');
          
          Alert.alert(
            '⚠️ Document Verification Issue',
            `We couldn't extract readable information from your guardian's ${documentType}. Please ensure the document is:\n\n• Clear and well-lit\n• Not damaged or worn\n• The correct document type\n• Properly aligned in the photo`,
            [
              {
                text: 'Retake Photo',
                onPress: () => setImage(null)
              }
            ]
          );
          return;
        }
        
        console.log('✅ Guardian ID document properly verified with OCR data');
      }
      
      setVerified(true);
      
      if (data.extracted_fields) {
        setFormData((prev: any) => ({
          ...prev,
          ocr_fields: data.extracted_fields,
        }));
      }

      Alert.alert(
        '✅ Verification Complete',
        isSupportingDocument 
          ? 'Your document has been validated successfully!'
          : isGuardianVerification
          ? `Your guardian's ${documentType} has been verified successfully!`
          : 'Your document has been verified successfully!',
        [{ text: 'Continue' }]
      );
      return;
    }

    // Generic error fallback
    console.log('❌ Generic verification error');
    
    Alert.alert(
      '❌ Verification Failed',
      data.message || 'Unable to verify your document. Please try again with a clearer photo.',
      [
        {
          text: 'Try Again',
          onPress: () => setImage(null)
        }
      ]
    );

  } catch (error) {
    console.error('❌ Network error:', error);
    
    setUploading(false);
    setVerificationStage('idle');
    
    Alert.alert(
      '🌐 Network Error',
      'Unable to connect to the server. Please check your internet connection and try again.',
      [
        {
          text: 'Retry',
          onPress: () => {
            setTimeout(() => handleVerify(), 500);
          }
        },
        {
          text: 'Cancel'
        }
      ]
    );
  }
};

  const handleSubmitRegistration = async () => {
    if (!image) {
      Alert.alert('No Photo', 'Please upload your document photo.');
      return;
    }

    if (!verified && !isSupportingDocument) {
      Alert.alert('Verification Required', 'Please verify your document first.');
      return;
    }

    setUploading(true);

    try {
      const formDataToSend = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formDataToSend.append(key, String(value));
        }
      });
      
      formDataToSend.append('id_image', {
        uri: image,
        type: 'image/jpeg',
        name: 'id_document.jpg',
      } as any);

      const response = await fetch(`${API_BASE_URL}/api/register/`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success && data.resident_id) {
        if (isSupportingDocument) {
          router.replace({
            pathname: '/(auth)/register/verificationStatus',
            params: {
              isVerified: 'false',
              message: 'Your documents are being reviewed.',
            }
          });
        } else if (isGuardianVerification) {
          if (data.is_verified) {
            Alert.alert(
              'Registration Successful!',
              'Please log in to continue.',
              [{ text: 'Login Now', onPress: () => router.replace('/(auth)/login') }]
            );
          } else {
            router.replace({
              pathname: '/(auth)/register/verificationStatus',
              params: {
                isVerified: 'false',
                message: 'Your guardian documents are being reviewed.',
              }
            });
          }
        } else {
          if (data.is_verified) {
            Alert.alert(
              'Registration Successful!',
              'Your ID has been verified.',
              [{ text: 'Login Now', onPress: () => router.replace('/(auth)/login') }]
            );
          } else {
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
        handleRegistrationError(data);
      }
    } catch (err) {
      Alert.alert('Network Error', 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRegistrationError = (data: any) => {
  console.log('❌ Registration error data:', data);

 
  const errorMessage = data.error || data.message || data.error_message || '';
  const errorString = typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage);
  const errorCode = data.error_code || '';

  
  if (errorString.includes('E5009') || errorString.includes('same full name')) {
    setErrorModal({
      visible: true,
      title: '⚠️ Account Already Exists',
      message: `An account with your name (${formData.first_name} ${formData.middle_name || ''} ${formData.last_name}${formData.suffix ? ' ' + formData.suffix : ''}) and date of birth (${formData.dob}) already exists in our system.`,
      icon: 'person-circle',
      iconColor: '#f59e0b',
      actions: [
        {
          text: 'Try Login',
          onPress: () => {
            setErrorModal(prev => ({ ...prev, visible: false }));
            router.replace('/(auth)/login');
          },
          style: 'primary',
        },
        {
          text: 'Contact Support',
          onPress: () => {
            setErrorModal(prev => ({ ...prev, visible: false }));
            Alert.alert(
              'Contact Support',
              'If you believe this is an error, please visit the barangay office for assistance.\n\nBarangay Cansaga Office\nConsolacion, Cebu',
              [{ text: 'OK' }]
            );
          },
          style: 'secondary',
        },
      ],
    });
    return;
  }

  
  const displayMessage = errorString || 
                        data.error || 
                        data.message || 
                        data.error_message ||
                        'An unexpected error occurred during registration. Please try again.';

  // ✅ Show the error in the modal
  setErrorModal({
    visible: true,
    title: '❌ Registration Failed',
    message: displayMessage,
    icon: 'alert-circle',
    iconColor: '#ef4444',
    actions: [
      {
        text: 'Try Again',
        onPress: () => {
          setErrorModal(prev => ({ ...prev, visible: false }));
          setImage(null);
          setVerified(false);
          setUploading(false);
        },
        style: 'primary',
      },
      {
        text: 'Contact Support',
        onPress: () => {
          setErrorModal(prev => ({ ...prev, visible: false }));
          Alert.alert(
            'Contact Support',
            'Please visit the barangay office for assistance.\n\nBarangay Cansaga Office\nConsolacion, Cebu\n\nError Code: ' + (errorCode || 'UNKNOWN'),
            [{ text: 'OK' }]
          );
        },
        style: 'secondary',
      },
    ],
  });
};

  // Render conditions
  const showImagePreview = Boolean(image);
  const showActionButtons = !image;
  const showChangePhotoButton = image && !uploading && !verified && !mismatches;
  const showVerifyButton = image && !uploading && !verified && !mismatches;
  const showLoadingState = uploading;
  const showMismatchCard = !uploading && mismatches;
  const showSuccessState = verified && !uploading;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* HEADER */}
      {isGuardianVerification ? (
        <View style={styles.guardianHeaderContainer}>
          <Ionicons name="people-outline" size={48} color="#c2410c" />
          <Text style={styles.guardianHeaderTitle}>Guardian Document Verification</Text>
          <Text style={styles.guardianHeaderDescription}>
            Upload your guardian&apos;s {documentType} for verification.
          </Text>
          {formData.guardian_username && (
            <Text style={styles.guardianUsername}>Guardian: {formData.guardian_username}</Text>
          )}
        </View>
      ) : isSupportingDocument ? (
        <View style={styles.supportingHeaderContainer}>
          <Ionicons name="document-text-outline" size={48} color="#92400e" />
          <Text style={styles.supportingHeaderTitle}>Supporting Document Upload</Text>
          <Text style={styles.supportingHeaderDescription}>
            Your document will be manually reviewed by our team.
          </Text>
        </View>
      ) : (
        <View style={styles.idHeaderContainer}>
          <Ionicons name="scan-outline" size={48} color="#1e40af" />
          <Text style={styles.idHeaderTitle}>ID Document Scanning</Text>
          <Text style={styles.idHeaderDescription}>
            Your ID will be automatically scanned and verified.
          </Text>
        </View>
      )}

      <Text style={styles.mainTitle}>
        {isGuardianVerification 
          ? `Upload Guardian's ${documentType}`
          : isSupportingDocument 
          ? 'Upload Your Document' 
          : 'Upload and Verify Your ID'
        }
      </Text>

      <TouchableOpacity 
        style={styles.guidelinesButton}
        onPress={() => setShowGuidelinesModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
        <Text style={styles.guidelinesButtonText}>View Photo Guidelines</Text>
      </TouchableOpacity>

      {/* IMAGE PREVIEW */}
      <View style={styles.uploadContainer}>
        {showImagePreview && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} resizeMode="contain" />
          </View>
        )}

        {/* ACTION BUTTONS */}
        {showActionButtons && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.takePhotoButton]}
              onPress={takePhoto}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={20} color="#FFFFFF" />
              <Text style={styles.takePhotoButtonText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.galleryButton]}
              onPress={pickFromGallery}
              activeOpacity={0.8}
            >
              <Ionicons name="images" size={20} color="#1e293b" />
              <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CHANGE PHOTO BUTTON */}
        {showChangePhotoButton && (
          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={() => {
              setImage(null);
              setVerified(false);
              setMismatches(null);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={18} color="#374151" />
            <Text style={styles.changePhotoButtonText}>Change Photo</Text>
          </TouchableOpacity>
        )}

        {/* VERIFY BUTTON */}
        {showVerifyButton && (
          <TouchableOpacity 
            style={[styles.verifyButton, uploading && styles.disabledButton]} 
            onPress={handleVerify}
            disabled={uploading}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.verifyButtonText}>
              {isGuardianVerification ? 'Verify Guardian Document' : 'Verify Document'}
            </Text>
          </TouchableOpacity>
        )}

        {/* LOADING STATE */}
        {showLoadingState && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingTitle}>
              {verificationStage === 'uploading' && 'Uploading photo...'}
              {verificationStage === 'analyzing' && 'Verifying your document...'}
              {verificationStage === 'complete' && 'Almost done...'}
              {verificationStage === 'idle' && 'Processing...'}
            </Text>
            <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
          </View>
        )}

        {/* MISMATCH ERROR */}
        {showMismatchCard && (
          <View style={styles.errorCard}>
            <View style={styles.errorHeader}>
              <Ionicons name="alert-circle" size={48} color="#EF4444" />
              <Text style={styles.errorTitle}>Details Don&apos;t Match</Text>
              <Text style={styles.errorMessage}>
                The information you entered doesn&apos;t match the text on your document.
              </Text>
            </View>

            <View style={styles.errorActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setMismatches(null);
                  setVerified(false);
                  router.back();
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="create-outline" size={20} color="#3B82F6" />
                <Text style={styles.secondaryButtonText}>Edit My Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  setImage(null);
                  setMismatches(null);
                  setVerified(false);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Retake Photo</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.detailsToggle}
              onPress={() => setShowMismatchDetails(!showMismatchDetails)}
              activeOpacity={0.8}
            >
              <Text style={styles.detailsToggleText}>
                {showMismatchDetails ? 'Hide' : 'Show'} Details
              </Text>
              <Ionicons
                name={showMismatchDetails ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#6B7280"
              />
            </TouchableOpacity>

            {showMismatchDetails && (
              <View style={styles.mismatchDetails}>
                {Object.entries(mismatches).map(([field, data]: [string, any]) => (
                  <View key={field} style={styles.mismatchRow}>
                    <Text style={styles.mismatchField}>
                      {field.replace('_', ' ').toUpperCase()}
                    </Text>
                    <Text style={styles.mismatchUser}>
                      You entered: {data.user || '(empty)'}
                    </Text>
                    <Text style={styles.mismatchOcr}>
                      Document shows: {data.ocr || '(not found)'}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* SUCCESS STATE */}
        {showSuccessState && (
          <>
            <View style={styles.successCard}>
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
              <Text style={styles.successTitle}>Verified!</Text>
              <Text style={styles.successMessage}>
                Your document has been successfully verified.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, uploading && styles.disabledButton]}
              onPress={handleSubmitRegistration}
              disabled={uploading}
              activeOpacity={0.8}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>
                    {isGuardianVerification ? 'Submit Guardian Document' : 'Complete Registration'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* PHOTO GUIDELINES MODAL */}
      <Modal
        visible={showGuidelinesModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowGuidelinesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            
            <View style={styles.modalHeaderBar}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="camera" size={32} color="#3B82F6" />
              </View>
              <TouchableOpacity 
                onPress={() => setShowGuidelinesModal(false)}
                style={styles.closeButton}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.modalTitle}>Photo Guidelines</Text>
              <Text style={styles.modalSubtitle}>
                Follow these tips for quick verification
              </Text>

              {/* ✅ Good Example */}
              <View style={styles.exampleSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  <Text style={styles.sectionTitle}>Do This</Text>
                </View>
                
                <View style={styles.tipsList}>
                  <View style={styles.tipRow}>
                    <View style={styles.tipIconContainer}>
                      <Ionicons name="checkmark" size={16} color="#10B981" />
                    </View>
                    <View style={styles.tipTextContainer}>
                      <Text style={styles.tipTitle}>All 4 corners visible</Text>
                      <Text style={styles.tipDescription}>Ensure entire document is in frame</Text>
                    </View>
                  </View>

                  <View style={styles.tipRow}>
                    <View style={styles.tipIconContainer}>
                      <Ionicons name="checkmark" size={16} color="#10B981" />
                    </View>
                    <View style={styles.tipTextContainer}>
                      <Text style={styles.tipTitle}>Text is readable</Text>
                      <Text style={styles.tipDescription}>Hold camera steady and focus clearly</Text>
                    </View>
                  </View>

                  <View style={styles.tipRow}>
                    <View style={styles.tipIconContainer}>
                      <Ionicons name="checkmark" size={16} color="#10B981" />
                    </View>
                    <View style={styles.tipTextContainer}>
                      <Text style={styles.tipTitle}>No shadows or glare</Text>
                      <Text style={styles.tipDescription}>Use natural lighting without flash</Text>
                    </View>
                  </View>

                  <View style={styles.tipRow}>
                    <View style={styles.tipIconContainer}>
                      <Ionicons name="checkmark" size={16} color="#10B981" />
                    </View>
                    <View style={styles.tipTextContainer}>
                      <Text style={styles.tipTitle}>Place on contrasting background</Text>
                      <Text style={styles.tipDescription}>Dark surface works best for light IDs</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* ❌ Bad Example */}
              <View style={[styles.exampleSection, { marginTop: 20 }]}>
                <View style={[styles.sectionHeader, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                  <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Avoid This</Text>
                </View>
                
                <View style={styles.tipsList}>
                  <View style={styles.tipRow}>
                    <View style={[styles.tipIconContainer, { backgroundColor: '#FEE2E2' }]}>
                      <Ionicons name="close" size={16} color="#EF4444" />
                    </View>
                    <View style={styles.tipTextContainer}>
                      <Text style={styles.tipTitle}>Don&apos;t use flash</Text>
                      <Text style={styles.tipDescription}>Causes glare and reflections</Text>
                    </View>
                  </View>

                  <View style={styles.tipRow}>
                    <View style={[styles.tipIconContainer, { backgroundColor: '#FEE2E2' }]}>
                      <Ionicons name="close" size={16} color="#EF4444" />
                    </View>
                    <View style={styles.tipTextContainer}>
                      <Text style={styles.tipTitle}>Don&apos;t cover corners</Text>
                      <Text style={styles.tipDescription}>Keep fingers away from edges</Text>
                    </View>
                  </View>

                  <View style={styles.tipRow}>
                    <View style={[styles.tipIconContainer, { backgroundColor: '#FEE2E2' }]}>
                      <Ionicons name="close" size={16} color="#EF4444" />
                    </View>
                    <View style={styles.tipTextContainer}>
                      <Text style={styles.tipTitle}>Don&apos;t tilt camera</Text>
                      <Text style={styles.tipDescription}>Hold parallel to document surface</Text>
                    </View>
                  </View>

                  <View style={styles.tipRow}>
                    <View style={[styles.tipIconContainer, { backgroundColor: '#FEE2E2' }]}>
                      <Ionicons name="close" size={16} color="#EF4444" />
                    </View>
                    <View style={styles.tipTextContainer}>
                      <Text style={styles.tipTitle}>Don&apos;t use damaged IDs</Text>
                      <Text style={styles.tipDescription}>Worn or torn documents may fail</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* 💡 Pro Tips */}
              <View style={styles.proTipsCard}>
                <View style={styles.proTipsHeader}>
                  <Ionicons name="bulb" size={20} color="#F59E0B" />
                  <Text style={styles.proTipsTitle}>Pro Tips</Text>
                </View>
                <View style={styles.proTipsList}>
                  <View style={styles.proTipRow}>
                    <Ionicons name="sunny" size={16} color="#F59E0B" />
                    <Text style={styles.proTipText}>Use natural daylight near a window</Text>
                  </View>
                  <View style={styles.proTipRow}>
                    <Ionicons name="hand-left" size={16} color="#F59E0B" />
                    <Text style={styles.proTipText}>Place ID flat on a table</Text>
                  </View>
                  <View style={styles.proTipRow}>
                    <Ionicons name="eye" size={16} color="#F59E0B" />
                    <Text style={styles.proTipText}>Hold phone directly above at 30cm</Text>
                  </View>
                </View>
              </View>

            </ScrollView>

            <TouchableOpacity 
              style={styles.modalActionButton}
              onPress={() => setShowGuidelinesModal(false)}
              activeOpacity={0.9}
            >
              <Text style={styles.modalActionButtonText}>Got It!</Text>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.title}
        message={errorModal.message}
        icon={errorModal.icon}
        iconColor={errorModal.iconColor}
        actions={errorModal.actions}
        onClose={() => setErrorModal(prev => ({ ...prev, visible: false }))}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24, paddingBottom: 40, backgroundColor: '#f3f4f6' },
  
  guardianHeaderContainer: { alignItems: 'center', padding: 20, backgroundColor: '#fff7ed', borderRadius: 12, marginBottom: 20, width: '100%', borderWidth: 1, borderColor: '#fed7aa' },
  guardianHeaderTitle: { fontSize: 18, fontWeight: '600', color: '#c2410c', marginTop: 12, marginBottom: 8, textAlign: 'center' },
  guardianHeaderDescription: { fontSize: 14, color: '#c2410c', textAlign: 'center', lineHeight: 20 },
  guardianUsername: { fontSize: 12, color: '#c2410c', textAlign: 'center', marginTop: 8, fontWeight: '600' },
  supportingHeaderContainer: { alignItems: 'center', padding: 20, backgroundColor: '#fef3c7', borderRadius: 12, marginBottom: 20, width: '100%', borderWidth: 1, borderColor: '#fde68a' },
  supportingHeaderTitle: { fontSize: 18, fontWeight: '600', color: '#92400e', marginTop: 12, marginBottom: 8, textAlign: 'center' },
  supportingHeaderDescription: { fontSize: 14, color: '#92400e', textAlign: 'center', lineHeight: 20 },
  idHeaderContainer: { alignItems: 'center', padding: 20, backgroundColor: '#dbeafe', borderRadius: 12, marginBottom: 20, width: '100%', borderWidth: 1, borderColor: '#bfdbfe' },
  idHeaderTitle: { fontSize: 18, fontWeight: '600', color: '#1e40af', marginTop: 12, marginBottom: 8, textAlign: 'center' },
  idHeaderDescription: { fontSize: 14, color: '#1e40af', textAlign: 'center', lineHeight: 20 },
  
  mainTitle: { fontSize: 20, marginBottom: 12, fontWeight: '600', textAlign: 'center', color: '#1e293b' },
  
  guidelinesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#93C5FD',
    gap: 6,
  },
  guidelinesButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  
  uploadContainer: { width: '100%', alignItems: 'center', marginTop: 16 },
  imagePreviewContainer: { width: 280, height: 200, borderRadius: 16, borderWidth: 2, borderColor: '#3B82F6', backgroundColor: '#f3f4f6', marginBottom: 20, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  imagePreview: { width: '100%', height: '100%' },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 16, width: '100%' },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, gap: 8, flex: 1 },
  takePhotoButton: { backgroundColor: '#3B82F6' },
  takePhotoButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  galleryButton: { backgroundColor: '#FDE047' },
  galleryButtonText: { color: '#1e293b', fontWeight: '600', fontSize: 15 },
  disabledButton: { opacity: 0.6 },
  changePhotoButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, marginBottom: 12, gap: 8, borderWidth: 1, borderColor: '#d1d5db', width: '100%' },
  changePhotoButtonText: { color: '#374151', fontWeight: '600', fontSize: 15 },
  verifyButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10B981', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, marginBottom: 16, gap: 8, width: '100%', elevation: 3, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  verifyButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  loadingCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 32, alignItems: 'center', gap: 16, width: '100%', marginVertical: 20 },
  loadingTitle: { fontSize: 16, fontWeight: '600', color: '#111827', textAlign: 'center' },
  loadingSubtext: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
  errorCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, marginTop: 20, borderWidth: 2, borderColor: '#FEE2E2', width: '100%' },
  errorHeader: { alignItems: 'center', marginBottom: 24 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: '#EF4444', marginTop: 12, marginBottom: 8 },
  errorMessage: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  errorActions: { gap: 12, marginBottom: 16 },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3B82F6', padding: 16, borderRadius: 12, gap: 8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#3B82F6', padding: 16, borderRadius: 12, gap: 8 },
  secondaryButtonText: { color: '#3B82F6', fontSize: 16, fontWeight: '700' },
  detailsToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 4 },
  detailsToggleText: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  mismatchDetails: { backgroundColor: '#F9FAFB', borderRadius: 8, padding: 12, marginTop: 8 },
  mismatchRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  mismatchField: { fontSize: 11, fontWeight: '700', color: '#111827', marginBottom: 4 },
  mismatchUser: { fontSize: 12, color: '#EF4444' },
  mismatchOcr: { fontSize: 12, color: '#3B82F6' },
  successCard: { backgroundColor: '#ECFDF5', borderRadius: 16, padding: 32, alignItems: 'center', marginBottom: 24, width: '100%', borderWidth: 2, borderColor: '#BBF7D0' },
  successTitle: { fontSize: 22, fontWeight: '700', color: '#10B981', marginTop: 16, marginBottom: 8 },
  successMessage: { fontSize: 14, color: '#047857', textAlign: 'center', lineHeight: 20 },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3B82F6', paddingVertical: 18, paddingHorizontal: 40, borderRadius: 12, gap: 8, width: '100%', elevation: 5, shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 17 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 440, maxHeight: '85%', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 10 },
  modalHeaderBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  closeButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  modalScrollContent: { padding: 20, paddingBottom: 100 },
  modalTitle: { fontSize: 24, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 },
  exampleSection: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#ECFDF5', gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#10B981' },
  tipsList: { padding: 16, gap: 16 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tipIconContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
  tipTextContainer: { flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
  tipDescription: { fontSize: 13, color: '#64748b', lineHeight: 18 },
  proTipsCard: { backgroundColor: '#FFFBEB', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#F59E0B', marginTop: 20 },
  proTipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  proTipsTitle: { fontSize: 16, fontWeight: '700', color: '#92400E' },
  proTipsList: { gap: 10 },
  proTipRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  proTipText: { fontSize: 14, color: '#92400E', flex: 1 },
  modalActionButton: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3B82F6', paddingVertical: 18, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, gap: 8, shadowColor: '#3B82F6', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 8 },
  modalActionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});