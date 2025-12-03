import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: any;
  sitioOptions: any[];
  religionOptions: any[];
  civilStatusOptions: any[];
  educationOptions: any[];
  occupationOptions: any[];
  nationalityOptions: any[];
  employmentStatusOptions: any[];
}

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#FF3D33',
    primaryLight: '#FDF2F8',
    success: '#10B981',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

export default function RegistrationReviewModal({
  visible,
  onClose,
  onConfirm,
  formData,
  sitioOptions,
  religionOptions,
  civilStatusOptions,
  educationOptions,
  occupationOptions,
  nationalityOptions,
  employmentStatusOptions,
}: ReviewModalProps) {
  const isNonResident = formData.user_type === 'non_resident';

  // Helper function to get option label by ID
  const getOptionLabel = (options: any[], id: any, labelKey: string) => {
    const option = options.find((opt: any) => opt[Object.keys(opt)[0]] === id);
    return option ? option[labelKey] : 'N/A';
  };

  const getSitioName = () => {
    return getOptionLabel(sitioOptions, formData.sitio_id, 'sitio_name');
  };

  const getReligionName = () => {
    return getOptionLabel(religionOptions, formData.religion_cat_id, 'religion_name');
  };

  const getCivilStatusName = () => {
    return getOptionLabel(civilStatusOptions, formData.civil_status_id, 'civil_name');
  };

  const getEducationName = () => {
    return getOptionLabel(educationOptions, formData.educational_attainment_id, 'educational_attain_name');
  };

  const getOccupationName = () => {
    return getOptionLabel(occupationOptions, formData.occupation_id, 'occupation_name');
  };

  const getNationalityName = () => {
    return getOptionLabel(nationalityOptions, formData.nationality_id, 'nationality');
  };

  const getEmploymentStatusName = () => {
    return getOptionLabel(employmentStatusOptions, formData.employment_status_id, 'employment_status_name');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.modalHeader}>
              <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
              <ThemedText style={styles.modalTitle}>Review Your Information</ThemedText>
              <ThemedText style={styles.modalSubtitle}>
                Please review your details before proceeding
              </ThemedText>
            </View>

            {/* Personal Information Section */}
            <View style={styles.reviewSection}>
              <ThemedText style={styles.reviewSectionTitle}>Personal Information</ThemedText>
              <ReviewRow label="First Name" value={formData.first_name || 'N/A'} />
              <ReviewRow label="Middle Name" value={formData.middle_name || 'N/A'} />
              <ReviewRow label="Last Name" value={formData.last_name || 'N/A'} />
              <ReviewRow label="Suffix" value={formData.suffix || 'None'} />
              <ReviewRow label="Date of Birth" value={formData.dob || 'N/A'} />
              <ReviewRow label="Sex" value={formData.sex || 'N/A'} />
              {!isNonResident && <ReviewRow label="Gender" value={formData.gender || 'N/A'} />}
              <ReviewRow label="Email" value={formData.email || 'N/A'} />
              <ReviewRow label="Phone Number" value={formData.phone_number || 'N/A'} />
            </View>

            {/* Resident-Only Information */}
            {!isNonResident && (
              <View style={styles.reviewSection}>
                <ThemedText style={styles.reviewSectionTitle}>Additional Information</ThemedText>
                <ReviewRow label="Civil Status" value={getCivilStatusName()} />
                <ReviewRow label="Religion" value={getReligionName()} />
                <ReviewRow label="Education" value={getEducationName()} />
                <ReviewRow label="Occupation" value={getOccupationName()} />
                <ReviewRow label="Nationality" value={getNationalityName()} />
                <ReviewRow label="Employment Status" value={getEmploymentStatusName()} />
                <ReviewRow label="PWD" value={formData.is_pwd ? 'Yes' : 'No'} />
              </View>
            )}

            {/* Address Section */}
            <View style={styles.reviewSection}>
              <ThemedText style={styles.reviewSectionTitle}>Address Information</ThemedText>
              <ReviewRow label="House Number" value={formData.house_number || 'N/A'} />
              <ReviewRow label="Street" value={formData.street || 'N/A'} />
              <ReviewRow label="Barangay" value={formData.barangay || 'N/A'} />
              {!isNonResident && <ReviewRow label="Sitio" value={getSitioName()} />}
              <ReviewRow label="City/Municipality" value={formData.city_municipality || 'N/A'} />
              <ReviewRow label="Country" value={formData.country || 'Philippines'} />
            </View>

            {/* Account Section */}
            <View style={styles.reviewSection}>
              <ThemedText style={styles.reviewSectionTitle}>Account Information</ThemedText>
              <ReviewRow label="Username" value={formData.username || 'N/A'} />
              <ReviewRow label="Password" value="••••••••" />
              {/* <ReviewRow label="Account Type" value={isNonResident ? 'Non-Resident' : 'Resident'} /> */}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalButtonSecondary} onPress={onClose}>
              <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.modalButtonSecondaryText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonPrimary} onPress={onConfirm}>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.modalButtonPrimaryText}>Confirm & Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const ReviewRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.reviewRow}>
    <ThemedText style={styles.reviewLabel}>{label}:</ThemedText>
    <ThemedText style={styles.reviewValue}>{value}</ThemedText>
  </View>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 10,
    padding: theme.spacing.xs,
  },
  modalHeader: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xxl * 2,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 500,
  },
  modalScrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  reviewSection: {
    marginTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  reviewSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  reviewLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1.2,
    textAlign: 'right',
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  modalButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalButtonSecondaryText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  modalButtonPrimary: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
  },
  modalButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});