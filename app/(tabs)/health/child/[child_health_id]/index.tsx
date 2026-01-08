import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
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
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    male: '#3B82F6',
    female: '#EC4899',
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
  tt_status_name?: string;
  newborn_screening_status?: boolean;
  feeding_method_name?: string;
  mother_full_name?: string;
  father_full_name?: string;
  created_at: string;
}

export default function ChildHealthOverview() {
  const router = useRouter();
  const { child_health_id } = useLocalSearchParams<{ child_health_id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [childData, setChildData] = useState<ChildHealthData | null>(null);

  useEffect(() => {
    fetchChildHealthData();
  }, [child_health_id]);

  // Handle back button and refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Refresh data when coming back to this screen
      if (!loading) {
        fetchChildHealthData();
      }

      const onBackPress = () => {
        router.back();
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [])
  );

  const fetchChildHealthData = async () => {
    try {
      setLoading(true);
      
      const basicResponse = await fetch(
        `${API_BASE_URL}/household_api/child-health-records/${child_health_id}/`
      );
      const basicData = await basicResponse.json();

      if (basicData.success) {
        setChildData(basicData.data);
      }

    } catch (error) {
      console.error('Failed to load child health data:', error);
      Alert.alert('Error', 'Failed to load health records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchChildHealthData();
  };

  const handleBackPress = () => {
    router.back();
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateAge = (dob: string): string => {
    const birthDate = new Date(dob);
    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();
    
    if (years === 0) {
      return `${months} ${months === 1 ? 'month' : 'months'} old`;
    }
    return `${years} ${years === 1 ? 'year' : 'years'} old`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Child Health Record" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading health record...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!childData) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Child Health Record" onBackPress={handleBackPress} />
        <View style={styles.emptyContainer}>
          <MaterialIcons name="child-care" size={64} color={theme.colors.textMuted} />
          <ThemedText style={styles.emptyTitle}>Record not found</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            This child health record could not be loaded
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Child Health Record" onBackPress={handleBackPress} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <View style={[
            styles.avatarContainer,
            { backgroundColor: childData.sex === 'Male' ? '#EFF6FF' : '#FCE7F3' }
          ]}>
            <MaterialIcons 
              name="child-care"
              size={40} 
              color={childData.sex === 'Male' ? theme.colors.male : theme.colors.female} 
            />
          </View>
          
          <ThemedText style={styles.childName}>{childData.child_full_name}</ThemedText>
          
          <View style={styles.profileMeta}>
            <View style={[
              styles.sexBadge,
              { backgroundColor: childData.sex === 'Male' ? '#DBEAFE' : '#FCE7F3' }
            ]}>
              <Ionicons 
                name={childData.sex === 'Male' ? 'male' : 'female'} 
                size={14} 
                color={childData.sex === 'Male' ? theme.colors.male : theme.colors.female} 
              />
              <ThemedText style={[
                styles.sexText,
                { color: childData.sex === 'Male' ? theme.colors.male : theme.colors.female }
              ]}>
                {childData.sex}
              </ThemedText>
            </View>
            <ThemedText style={styles.ageText}>{calculateAge(childData.dob)}</ThemedText>
          </View>
        </View>

        {/* Basic Information */}
        <SectionCard title="Basic Information" icon="information-circle" iconColor={theme.colors.primary}>
          <InfoRow icon="calendar-outline" label="Date of Birth" value={formatDate(childData.dob)} />
          {childData.birth_weight_kg && (
            <InfoRow icon="barbell-outline" label="Birth Weight" value={`${childData.birth_weight_kg} kg`} />
          )}
          {childData.birth_length_cm && (
            <InfoRow icon="resize-outline" label="Birth Length" value={`${childData.birth_length_cm} cm`} />
          )}
          {childData.place_of_delivery && (
            <InfoRow icon="location-outline" label="Place of Birth" value={childData.place_of_delivery} />
          )}
          {childData.feeding_method_name && (
            <InfoRow icon="restaurant-outline" label="Feeding Method" value={childData.feeding_method_name} />
          )}
          {childData.newborn_screening_status !== undefined && (
            <InfoRow 
              icon="medical-outline" 
              label="Newborn Screening" 
              value={childData.newborn_screening_status ? 'Completed' : 'Pending'} 
            />
          )}
        </SectionCard>

        {/* Parents Information */}
        {(childData.mother_full_name || childData.father_full_name) && (
          <SectionCard title="Parents" icon="people" iconColor="#8B5CF6" iconComponent={MaterialIcons}>
            {childData.mother_full_name && (
              <InfoRow icon="person-outline" label="Mother" value={childData.mother_full_name} />
            )}
            {childData.father_full_name && (
              <InfoRow icon="person-outline" label="Father" value={childData.father_full_name} />
            )}
          </SectionCard>
        )}

        {/* Health Records Section */}
        <View style={styles.actionSection}>
          <ThemedText style={styles.sectionTitleHeader}>Health Records</ThemedText>

          {/* Growth Monitoring Button */}
          <TouchableOpacity
            style={[styles.actionButtonFull, { backgroundColor: theme.colors.success }]}
            onPress={() => router.push(`/(tabs)/health/child/${child_health_id}/growthmonitoring` as any)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="trending-up" size={24} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonFullText}>Growth Monitoring</ThemedText>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Immunization Button */}
          <TouchableOpacity
            style={[styles.actionButtonFull, { backgroundColor: theme.colors.info }]}
            onPress={() => router.push(`/(tabs)/health/child/${child_health_id}/immunization` as any)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="vaccines" size={24} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonFullText}>Immunization Records</ThemedText>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Medical/Surgical History Button */}
          <TouchableOpacity
            style={[styles.actionButtonFull, { backgroundColor: theme.colors.warning }]}
            onPress={() => router.push(`/(tabs)/health/child/${child_health_id}/medicalsurgical` as any)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="medical-bag" size={24} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonFullText}>Medical & Surgical History</ThemedText>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Supplements Button */}
          <TouchableOpacity
            style={[styles.actionButtonFull, { backgroundColor: '#EC4899' }]}
            onPress={() => router.push(`/(tabs)/health/child/${child_health_id}/supplements` as any)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="pill" size={24} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonFullText}>Supplements & Vitamins</ThemedText>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Ionicons name="information-circle" size={20} color={theme.colors.info} />
          <ThemedText style={styles.footerText}>
            All health records are maintained by your Barangay Health Worker and Midwife.
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable Components
interface SectionCardProps {
  title: string;
  icon: string;
  iconColor: string;
  children: React.ReactNode;
  iconComponent?: any;
}

const SectionCard: React.FC<SectionCardProps> = ({ 
  title, 
  icon, 
  iconColor, 
  children,
  iconComponent: IconComponent = Ionicons,
}) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <IconComponent name={icon} size={20} color={iconColor} />
        <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      </View>
    </View>
    {children}
  </View>
);

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
  iconComponent?: any;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, iconComponent: IconComponent = Ionicons }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLabel}>
      <IconComponent name={icon} size={16} color={theme.colors.textSecondary} />
      <ThemedText style={styles.labelText}>{label}</ThemedText>
    </View>
    <ThemedText style={styles.valueText}>{value}</ThemedText>
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
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  profileCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  childName: {
    fontSize: 20,
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
  sexBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    gap: 4,
  },
  sexText: {
    fontSize: 13,
    fontWeight: '600',
  },
  ageText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  labelText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  valueText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  actionSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  sectionTitleHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  actionButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    borderRadius: theme.radius.xl,
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  actionButtonFullText: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.md,
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});