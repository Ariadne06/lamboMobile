import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL } from '@/constants/apiConfig';
import { useFocusEffect } from '@react-navigation/native';

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#2563EB',
    primaryLight: '#EFF6FF',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    male: '#3B82F6',
    female: '#EC4899',
    purple: '#8B5CF6',
    pink: '#EC4899',
    orange: '#F59E0B',
    teal: '#14B8A6',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

interface ChildHealthData {
  child_health_id: number;
  child_id: number;
  child_full_name: string;
  sex: string;
  dob: string;
  
  time_of_birth?: string;
  birth_weight_kg?: number;
  birth_length_cm?: number;
  place_of_delivery?: string;
  address_landmark?: string;
  
  tt_status_id?: number;
  tt_status_name?: string;
  tt_status_date?: string;
  newborn_screening_status?: boolean;
  newborn_screening_status_date?: string;
  feeding_method_id?: number;
  feeding_method_name?: string;
  
  complete_address?: string;
  mother_phone_number?: string;
  father_phone_number?: string;
  philhealth_no?: string;
  
  mother_id?: number;
  mother_full_name?: string;
  mother_age_years?: number;
  
  father_id?: number;
  father_full_name?: string;
  father_age_years?: number;
  
  created_by: number;
  created_at: string;
  updated_at?: string;
}

export default function ChildHealthDetailScreen() {
  const { child_health_id } = useLocalSearchParams<{ child_health_id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [childData, setChildData] = useState<ChildHealthData | null>(null);

  useEffect(() => {
    fetchChildHealthDetail();
  }, [child_health_id]);

  const handleBackPress = () => {
    router.push('/(bhw)/child-health');
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleBackPress();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => backHandler.remove();
    }, [])
  );

  const fetchChildHealthDetail = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `${API_BASE_URL}/household_api/child-health-records/${child_health_id}/`
      );
      const data = await response.json();

      console.log('Child health detail response:', data);

      if (data.success) {
        setChildData(data.data);
      } else {
        Alert.alert('Error', data.error || 'Failed to load child health record');
      }
    } catch (error) {
      console.error('Failed to load child health detail:', error);
      Alert.alert('Error', 'Failed to load child health record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob: string): string => {
    const birthDate = new Date(dob);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years === 0) {
      return `${months} ${months === 1 ? 'month' : 'months'} old`;
    } else if (years < 2) {
      return `${years} year${years > 1 ? 's' : ''} and ${months} month${months !== 1 ? 's' : ''} old`;
    }
    return `${years} ${years === 1 ? 'year' : 'years'} old`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string | undefined): string => {
    if (!timeString) return 'Not recorded';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return 'Invalid time';
    }
  };

  const getFullAddress = (): string => {
    const parts = [];
    
    if (childData?.complete_address) {
      parts.push(childData.complete_address);
    }
    
    if (childData?.address_landmark) {
      parts.push(`Landmark: ${childData.address_landmark}`);
    }
    
    return parts.length > 0 ? parts.join('\n') : 'Not recorded';
  };

  const getPhilHealthOwner = (): string | null => {
    if (!childData?.philhealth_no) return null;
    
    if (childData.mother_full_name) {
      return 'Mother';
    } else if (childData.father_full_name) {
      return 'Father';
    }
    return null;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader 
          title="Child Health Record" 
          onBackPress={handleBackPress}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading child health record...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!childData) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader 
          title="Child Health Record" 
          onBackPress={handleBackPress}
        />
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.textMuted} />
          <ThemedText style={styles.emptyText}>Child record not found</ThemedText>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <ThemedText style={styles.backButtonText}>Back to List</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const hasAddress = childData.complete_address || childData.address_landmark;

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader 
        title="Child Health Record" 
        onBackPress={handleBackPress}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Child Profile Header */}
        <View style={styles.profileHeader}>
          <View style={[
            styles.profileAvatar,
            { backgroundColor: childData.sex === 'Male' ? '#EFF6FF' : '#FCE7F3' }
          ]}>
            <MaterialIcons
              name="child-care"
              size={48}
              color={childData.sex === 'Male' ? theme.colors.male : theme.colors.female}
            />
          </View>
          
          <ThemedText style={styles.profileName}>{childData.child_full_name}</ThemedText>
          
          <View style={styles.profileMeta}>
            <View style={[
              styles.genderBadge,
              { backgroundColor: childData.sex === 'Male' ? '#DBEAFE' : '#FCE7F3' }
            ]}>
              <Ionicons
                name={childData.sex === 'Male' ? 'male' : 'female'}
                size={16}
                color={childData.sex === 'Male' ? theme.colors.male : theme.colors.female}
              />
              <ThemedText style={[
                styles.genderText,
                { color: childData.sex === 'Male' ? theme.colors.male : theme.colors.female }
              ]}>
                {childData.sex}
              </ThemedText>
            </View>
            
            <ThemedText style={styles.ageText}>
              {calculateAge(childData.dob)}
            </ThemedText>
          </View>

          <ThemedText style={styles.childCode}>
            Child ID: R{childData.child_id.toString().padStart(5, '0')}
          </ThemedText>
        </View>

        {/* Personal Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Personal Information</ThemedText>
          </View>
          
          <InfoRow
            icon="calendar-outline"
            label="Date of Birth"
            value={formatDate(childData.dob)}
          />
          
          <InfoRow
            icon="time-outline"
            label="Age"
            value={calculateAge(childData.dob)}
          />
          
          <InfoRow
            icon="people-outline"
            label="Sex"
            value={childData.sex}
          />
        </View>

        {/* Address Information */}
        {hasAddress && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={20} color={theme.colors.primary} />
              <ThemedText style={styles.cardTitle}>Address</ThemedText>
            </View>
            
            <InfoRow
              icon="location-outline"
              label="Complete Address"
              value={getFullAddress()}
              multiline
            />
          </View>
        )}

        {/* Parents Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="people" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Parents Information</ThemedText>
          </View>
          
          {/* Mother Section */}
          {childData.mother_full_name ? (
            <>
              <View style={styles.parentSection}>
                <View style={styles.parentHeader}>
                  <Ionicons name="woman" size={18} color={theme.colors.female} />
                  <ThemedText style={styles.parentHeaderText}>Mother</ThemedText>
                </View>
                
                <InfoRow
                  icon="person-outline"
                  label="Name"
                  value={childData.mother_full_name}
                />
                
                {childData.mother_age_years && (
                  <InfoRow
                    icon="calendar-outline"
                    label="Age"
                    value={`${childData.mother_age_years} years old`}
                  />
                )}
                
                {childData.mother_phone_number && (
                  <InfoRow
                    icon="call-outline"
                    label="Phone"
                    value={childData.mother_phone_number}
                  />
                )}

                {childData.philhealth_no && getPhilHealthOwner() === 'Mother' && (
                  <InfoRow
                    icon="card-outline"
                    label="PhilHealth No."
                    value={childData.philhealth_no}
                  />
                )}
              </View>
            </>
          ) : (
            <InfoRow
              icon="woman-outline"
              label="Mother"
              value="Not recorded"
              muted
            />
          )}
          
          {childData.mother_full_name && childData.father_full_name && (
            <View style={styles.parentDivider} />
          )}
          
          {/* Father Section */}
          {childData.father_full_name ? (
            <>
              <View style={styles.parentSection}>
                <View style={styles.parentHeader}>
                  <Ionicons name="man" size={18} color={theme.colors.male} />
                  <ThemedText style={styles.parentHeaderText}>Father</ThemedText>
                </View>
                
                <InfoRow
                  icon="person-outline"
                  label="Name"
                  value={childData.father_full_name}
                />
                
                {childData.father_age_years && (
                  <InfoRow
                    icon="calendar-outline"
                    label="Age"
                    value={`${childData.father_age_years} years old`}
                  />
                )}
                
                {childData.father_phone_number && (
                  <InfoRow
                    icon="call-outline"
                    label="Phone"
                    value={childData.father_phone_number}
                  />
                )}

                {childData.philhealth_no && getPhilHealthOwner() === 'Father' && (
                  <InfoRow
                    icon="card-outline"
                    label="PhilHealth No."
                    value={childData.philhealth_no}
                  />
                )}
              </View>
            </>
          ) : (
            <InfoRow
              icon="man-outline"
              label="Father"
              value="Not recorded"
              muted
            />
          )}

          {!childData.mother_full_name && !childData.father_full_name && childData.philhealth_no && (
            <InfoRow
              icon="card-outline"
              label="PhilHealth No."
              value={childData.philhealth_no}
            />
          )}
        </View>

        {/* Birth Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="child-care" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Birth Information</ThemedText>
          </View>
          
          {childData.time_of_birth && (
            <InfoRow
              icon="time-outline"
              label="Time of Birth"
              value={formatTime(childData.time_of_birth)}
            />
          )}
          
          {childData.place_of_delivery && (
            <InfoRow
              icon="business-outline"
              label="Place of Delivery"
              value={childData.place_of_delivery}
              multiline
            />
          )}
          
          {childData.birth_weight_kg && (
            <InfoRow
              icon="barbell-outline"
              label="Birth Weight"
              value={`${childData.birth_weight_kg} kg`}
            />
          )}
          
          {childData.birth_length_cm && (
            <InfoRow
              icon="resize-outline"
              label="Birth Length"
              value={`${childData.birth_length_cm} cm`}
            />
          )}
          
          {!childData.time_of_birth && !childData.place_of_delivery && !childData.birth_weight_kg && !childData.birth_length_cm && (
            <InfoRow
              icon="information-circle-outline"
              label="Birth Details"
              value="Not recorded"
              muted
            />
          )}
        </View>

        {/* Health Status */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="health-and-safety" size={20} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Health Status</ThemedText>
          </View>
          
          {childData.feeding_method_name && (
            <View style={styles.statusRow}>
              <View style={styles.statusLabel}>
                <MaterialIcons name="local-dining" size={18} color={theme.colors.info} />
                <ThemedText style={styles.statusLabelText}>Feeding Method</ThemedText>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: '#EFF6FF' }]}>
                <ThemedText style={[styles.statusBadgeText, { color: theme.colors.info }]}>
                  {childData.feeding_method_name}
                </ThemedText>
              </View>
            </View>
          )}
          
          <View style={styles.statusRow}>
            <View style={styles.statusLabel}>
              <MaterialIcons name="medical-services" size={18} color={theme.colors.textSecondary} />
              <ThemedText style={styles.statusLabelText}>Newborn Screening</ThemedText>
            </View>
            <View style={[
              styles.statusBadge,
              {
                backgroundColor: childData.newborn_screening_status
                  ? '#D1FAE5'
                  : '#FEF3C7'
              }
            ]}>
              <Ionicons
                name={childData.newborn_screening_status ? "checkmark-circle" : "alert-circle"}
                size={14}
                color={childData.newborn_screening_status ? theme.colors.success : theme.colors.warning}
              />
              <ThemedText style={[
                styles.statusBadgeText,
                {
                  color: childData.newborn_screening_status
                    ? theme.colors.success
                    : theme.colors.warning
                }
              ]}>
                {childData.newborn_screening_status ? 'Completed' : 'Pending'}
              </ThemedText>
            </View>
          </View>
          
          {childData.newborn_screening_status && childData.newborn_screening_status_date && (
            <InfoRow
              icon="calendar-outline"
              label="Screening Date"
              value={formatDate(childData.newborn_screening_status_date)}
            />
          )}
          
          {childData.tt_status_name && (
            <>
              <View style={styles.statusRow}>
                <View style={styles.statusLabel}>
                  <MaterialIcons name="vaccines" size={18} color={theme.colors.primary} />
                  <ThemedText style={styles.statusLabelText}>TT Status (Mother)</ThemedText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#EFF6FF' }]}>
                  <ThemedText style={[styles.statusBadgeText, { color: theme.colors.primary }]}>
                    {childData.tt_status_name}
                  </ThemedText>
                </View>
              </View>
              
              {childData.tt_status_date && (
                <InfoRow
                  icon="calendar-outline"
                  label="TT Date"
                  value={formatDate(childData.tt_status_date)}
                />
              )}
            </>
          )}
        </View>

        {/* Record Metadata */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={20} color={theme.colors.textSecondary} />
            <ThemedText style={styles.cardTitle}>Record Information</ThemedText>
          </View>
          
          <InfoRow
            icon="finger-print-outline"
            label="Record ID"
            value={`#CHR${childData.child_health_id.toString().padStart(5, '0')}`}
          />
          
          <InfoRow
            icon="time-outline"
            label="Created On"
            value={formatDate(childData.created_at)}
          />
          
          {childData.updated_at && (
            <InfoRow
              icon="refresh-outline"
              label="Last Updated"
              value={formatDate(childData.updated_at)}
            />
          )}
        </View>

        {/* Action Buttons Section */}
        <View style={styles.actionSection}>
          <ThemedText style={styles.sectionTitle}>Health Records & Monitoring</ThemedText>
          
          {/* Row 1: Immunization & Supplements */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButtonSmall, { backgroundColor: theme.colors.primary }]}
               onPress={() => router.push(`/(bhw)/child-health/${child_health_id}/immunization` as any)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="vaccines" size={28} color="#FFFFFF" />
              <ThemedText style={styles.actionButtonSmallText}>Immunization</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButtonSmall, { backgroundColor: theme.colors.pink }]}
              onPress={() => router.push(`/(bhw)/child-health/${child_health_id}/supplements` as any)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="medication" size={28} color="#FFFFFF" />
              <ThemedText style={styles.actionButtonSmallText}>Supplements</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Row 2: Growth Monitoring & Medical/Surgical History */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButtonSmall, { backgroundColor: theme.colors.success }]}
              onPress={() => router.push(`/(bhw)/child-health/${child_health_id}/growth-monitoring` as any)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="trending-up" size={28} color="#FFFFFF" />
              <ThemedText style={styles.actionButtonSmallText}>Growth Monitoring</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButtonSmall, { backgroundColor: theme.colors.orange }]}
              onPress={() => router.push(`/(bhw)/child-health/${child_health_id}/medical-conditions` as any)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="local-hospital" size={28} color="#FFFFFF" />
              <ThemedText style={styles.actionButtonSmallText}>Medical/Surgical</ThemedText>
            </TouchableOpacity>
            
          </View>

          {/* Row 3: Medical & Surgical History
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButtonSmall, { backgroundColor: theme.colors.orange }]}
              onPress={() => router.push(`/(bhw)/child-health/${child_health_id}/medical-conditions` as any)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="local-hospital" size={28} color="#FFFFFF" />
              <ThemedText style={styles.actionButtonSmallText}>Medical</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButtonSmall, { backgroundColor: theme.colors.danger }]}
              onPress={() => router.push(`/(bhw)/child-health/${child_health_id}/surgical-history` as any)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="healing" size={28} color="#FFFFFF" />
              <ThemedText style={styles.actionButtonSmallText}>Surgical</ThemedText>
            </TouchableOpacity>
          </View> */}

          {/* Full width Update Button */}
          <TouchableOpacity
            style={[styles.actionButtonFull, { backgroundColor: theme.colors.warning }]}
            onPress={() => router.push(`/(bhw)/child-health/${child_health_id}/update-child-health-record` as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={24} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonFullText}>Update Basic Information</ThemedText>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
  multiline?: boolean;
  muted?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, multiline, muted }) => (
  <View style={[styles.infoRow, multiline && styles.infoRowMultiline]}>
    <View style={styles.infoLabel}>
      <Ionicons
        name={icon as any}
        size={16}
        color={muted ? theme.colors.textMuted : theme.colors.textSecondary}
      />
      <ThemedText style={[styles.labelText, muted && styles.mutedText]}>{label}</ThemedText>
    </View>
    <ThemedText
      style={[
        styles.valueText,
        multiline && styles.valueTextMultiline,
        muted && styles.mutedText
      ]}
      numberOfLines={multiline ? undefined : 1}
    >
      {value}
    </ThemedText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  profileAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  genderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    gap: theme.spacing.xs,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ageText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  childCode: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  parentSection: {
    marginBottom: theme.spacing.md,
  },
  parentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  parentHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  parentDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoRowMultiline: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  labelText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  valueText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  valueTextMultiline: {
    textAlign: 'left',
    marginTop: theme.spacing.sm,
    width: '100%',
  },
  mutedText: {
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statusLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  statusLabelText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButtonSmall: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    borderRadius: theme.radius.xl,
    gap: theme.spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonSmallText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonFullText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});