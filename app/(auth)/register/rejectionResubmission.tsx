import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/constants/apiConfig';
import { ErrorModal } from '@/components/ui/ErrorModal';

export default function RejectionResubmissionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const message =
    (params.message as string) ||
    'Your application was rejected. Please resubmit your document.';
  const docTypeName =
    (params.identity_doc_type_name as string) || 'Supporting Document';

  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    message: '',
    icon: 'alert-circle' as keyof typeof Ionicons.glyphMap,
    iconColor: '#ef4444',
  });
  const reviewNotes = params.review_notes as string | undefined;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
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
      formData.append(
        'resident_id',
        Array.isArray(params.resident_id) ? params.resident_id[0] : (params.resident_id as string)
      );
      formData.append(
        'identity_doc_type_id',
        Array.isArray(params.identity_doc_type_id)
          ? params.identity_doc_type_id[0]
          : (params.identity_doc_type_id as string)
      );
      formData.append(
        'id_image',
        {
          uri: image,
          type: 'image/jpeg',
          name: 'supporting_document.jpg',
        } as any
      );

      const response = await fetch(
        `${API_BASE_URL}/api/resubmit-supporting-certificate/`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Document resubmitted successfully.', [
          { text: 'OK', onPress: () => router.replace('/(auth)/login') },
        ]);
      } else {
        setErrorModal({
          visible: true,
          title: 'Invalid Document',
          message:
            data.message ||
            `The uploaded image does not match the expected document type (${docTypeName}). Please upload a clear photo of your ${docTypeName}.`,
          icon: 'close-circle',
          iconColor: '#ef4444',
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Network error occurred. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.content, !image && styles.centerContent]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Ionicons name="alert-circle" size={80} color="#f59e0b" />
          <Text style={styles.title}>Resubmission Required</Text>

          <Text style={styles.docRow}>
            Document:{' '}
            <Text style={styles.docType}>{docTypeName}</Text>
          </Text>

          {!!message && <Text style={styles.helperMsg}>{message}</Text>}
        </View>

        {image && (
          <View style={styles.preview}>
            <Image source={{ uri: image }} style={styles.previewImage} />
            <Text style={styles.previewName} numberOfLines={1}>
              {image.split('/').pop()}
            </Text>
          </View>
        )}

        {reviewNotes && (
          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Ionicons name="information-circle" size={18} color="#ea580c" />
              <Text style={styles.notesTitle}>Review Notes</Text>
            </View>
            <Text style={styles.notesText}>{reviewNotes}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryBtn, uploading && styles.btnDisabled]}
          onPress={pickImage}
          disabled={uploading}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={image ? 'Change photo' : 'Pick photo'}
          accessibilityState={{ disabled: uploading }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.primaryBtnText}>
            {image ? 'Change Photo' : 'Pick Photo'}
          </Text>
        </TouchableOpacity>

        {image && (
          <TouchableOpacity
            style={[styles.successBtn, uploading && styles.btnDisabled]}
            onPress={handleResubmit}
            disabled={uploading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Resubmit document"
            accessibilityState={{ disabled: uploading, busy: uploading }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.successBtnText}>Resubmit</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.title}
        message={errorModal.message}
        icon={errorModal.icon}
        iconColor={errorModal.iconColor}
        actions={[
          {
            text: 'OK',
            onPress: () =>
              setErrorModal((prev) => ({ ...prev, visible: false })),
          },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    flexGrow: 1,
    gap: 16,
  },
  centerContent: {
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  docRow: {
    fontSize: 16,
    color: '#334155',
    textAlign: 'center',
  },
  docType: {
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  helperMsg: {
    marginTop: 8,
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
  },
  preview: {
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    marginBottom: 4,
  },
  previewImage: {
    width: 280,
    height: 170,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  previewName: {
    color: '#64748b',
    fontSize: 13,
    maxWidth: '90%',
  },
  notesCard: {
    width: '100%',
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fdba74',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    marginBottom: 6,
  },
  notesTitle: {
    color: '#ea580c',
    fontWeight: 'bold',
    fontSize: 14,
  },
  notesText: {
    color: '#ea580c',
    fontSize: 15,
    lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  successBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.7,
  },
});
