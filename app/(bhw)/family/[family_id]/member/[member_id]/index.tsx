import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Pressable,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL } from '@/constants/apiConfig';
import { useFocusEffect } from '@react-navigation/native';

interface FamilyMemberDetail {
  family_member_id: number;
  family_member_code: string;
  rth_id: number;
  rth_name: string;
  rtf_id: number;
  rtf_name: string;
  resident_id: number;
  resident_full_name: string;
  philhealthid_number: string | null;
  membership_type: 'M' | 'D' | null;
  philhealth_category_id: number | null;
  philhealth_category_name: string | null;
  nutrition_status_id: number | null;
  nutrition_status_name: string | null;
  date_added: string;
  added_by_id: number;
  added_by_full_name: string;
}

export default function FamilyMemberDetailScreen() {
  const { family_id, member_id } = useLocalSearchParams<{ 
    family_id: string; 
    member_id: string;
  }>();
  const router = useRouter();
  
  const [member, setMember] = useState<FamilyMemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMemberDetails();
  }, [member_id]);

  const handleBackPress = () => {
    router.push(`/(bhw)/family/${family_id}` as any);
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
    }, [family_id])
  );
  
  const fetchMemberDetails = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/household_api/family-members/${member_id}/`
      );
      const data = await response.json();

      if (data.success) {
        setMember(data.data);
      } else {
        Alert.alert('Error', data.message || 'Failed to load member details');
      }
    } catch (error) {
      console.error('Error fetching member:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMemberDetails();
  };

  // ✅ Helper function for membership type
  const getMembershipTypeText = (type: 'M' | 'D' | null): string => {
    if (!type) return 'Not specified';
    return type === 'M' ? 'Member (Principal)' : 'Dependent';
  };

  // ✅ Helper function for formatting dates
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Member Details" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3D33" />
          <ThemedText style={styles.loadingText}>Loading member details...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!member || member.family_member_id === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Member Details" onBackPress={handleBackPress} />
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
          <ThemedText style={styles.emptyText}>Member not found</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            {member?.family_member_id === 0 
              ? 'No snapshot exists for this quarter' 
              : 'This family member may have been removed'}
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={member.family_member_code} onBackPress={handleBackPress} />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
            colors={['#FF3D33']}
            tintColor="#FF3D33"
          />
        }
      >
        {/* 📋 Personal Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={24} color="#FF3D33" />
            <ThemedText style={styles.cardTitle}>Personal Information</ThemedText>
          </View>

          <View style={styles.nameSection}>
            <ThemedText style={styles.memberName}>{member.resident_full_name}</ThemedText>
            <View style={styles.codeRow}>
              <Ionicons name="barcode-outline" size={16} color="#0ea5e9" />
              <ThemedText style={styles.memberCode}>{member.family_member_code}</ThemedText>
            </View>
          </View>

          <View style={styles.infoGroup}>
            <ThemedText style={styles.label}>Resident ID</ThemedText>
            <ThemedText style={styles.value}>#{member.resident_id}</ThemedText>
          </View>
        </View>

        {/* 👨‍👩‍👧‍👦 Family Relationships Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="people" size={24} color="#0ea5e9" />
            <ThemedText style={[styles.cardTitle, { color: '#0ea5e9' }]}>
              Family Relationships
            </ThemedText>
          </View>

          <View style={styles.relationshipItem}>
            <Ionicons name="home" size={18} color="#0ea5e9" />
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.relationshipLabel}>
                Relationship to Household Head
              </ThemedText>
              <ThemedText style={styles.relationshipValue}>
                {member.rth_name || 'Not specified'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.relationshipItem}>
            <Ionicons name="people" size={18} color="#0ea5e9" />
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.relationshipLabel}>
                Relationship to Family Head
              </ThemedText>
              <ThemedText style={styles.relationshipValue}>
                {member.rtf_name || 'Not specified'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* 🏥 PhilHealth Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="medical" size={24} color="#10B981" />
            <ThemedText style={[styles.cardTitle, { color: '#10B981' }]}>
              PhilHealth Information
            </ThemedText>
          </View>

          <View style={styles.infoGroup}>
            <ThemedText style={styles.label}>PhilHealth ID Number</ThemedText>
            <View style={styles.valueRow}>
              {member.philhealthid_number ? (
                <>
                  <Ionicons name="card-outline" size={16} color="#10B981" />
                  <ThemedText style={styles.value}>{member.philhealthid_number}</ThemedText>
                </>
              ) : (
                <ThemedText style={[styles.value, styles.notProvided]}>Not provided</ThemedText>
              )}
            </View>
          </View>

          <View style={styles.infoGroup}>
            <ThemedText style={styles.label}>Membership Type</ThemedText>
            <View style={[
              styles.membershipBadge,
              member.membership_type === 'M' ? styles.principalBadge : styles.dependentBadge
            ]}>
              <Ionicons 
                name={member.membership_type === 'M' ? 'person' : 'people'} 
                size={14} 
                color="#FFFFFF" 
              />
              <ThemedText style={styles.membershipText}>
                {getMembershipTypeText(member.membership_type)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.infoGroup}>
            <ThemedText style={styles.label}>PhilHealth Category</ThemedText>
            <ThemedText style={styles.value}>
              {member.philhealth_category_name || 'Not specified'}
            </ThemedText>
          </View>
        </View>

        {/* 🍎 Health & Nutrition Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="fitness" size={24} color="#F59E0B" />
            <ThemedText style={[styles.cardTitle, { color: '#F59E0B' }]}>
              Health & Nutrition Status
            </ThemedText>
          </View>

          <View style={styles.nutritionStatusContainer}>
            <Ionicons 
              name={member.nutrition_status_name ? 'checkmark-circle' : 'alert-circle'} 
              size={24} 
              color={member.nutrition_status_name ? '#10B981' : '#9CA3AF'} 
            />
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.label}>Nutrition Status</ThemedText>
              <ThemedText style={[
                styles.value,
                !member.nutrition_status_name && styles.notProvided
              ]}>
                {member.nutrition_status_name || 'Not assessed'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* 📅 Record Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color="#6B7280" />
            <ThemedText style={[styles.cardTitle, { color: '#6B7280' }]}>
              Record Information
            </ThemedText>
          </View>

          <View style={styles.infoGroup}>
            <ThemedText style={styles.label}>Date Added</ThemedText>
            <View style={styles.valueRow}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <ThemedText style={styles.value}>
                {formatDate(member.date_added)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.infoGroup}>
            <ThemedText style={styles.label}>Added By</ThemedText>
            <View style={styles.valueRow}>
              <Ionicons name="person-outline" size={16} color="#6B7280" />
              <ThemedText style={styles.value}>
                {member.added_by_full_name || `User #${member.added_by_id}`}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="medkit" size={24} color="#8B5CF6" />
            <ThemedText style={[styles.cardTitle, { color: '#8B5CF6' }]}>
              General Health Profile
            </ThemedText>
          </View>

          <Pressable
            style={styles.addGHButton}
            onPress={() => router.push(
              `/(bhw)/family/${family_id}/member/${member_id}/add-general-health` as any
            )}
          >
            <Ionicons name="add-circle" size={20} color="#8B5CF6" />
            <ThemedText style={styles.addGHButtonText}>
              Add General Health Record
            </ThemedText>
            <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
          </Pressable>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF3D33',
  },
  nameSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  memberName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberCode: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  infoGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  notProvided: {
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  relationshipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  relationshipLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  relationshipValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginTop: 2,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  principalBadge: {
    backgroundColor: '#10B981',
  },
  dependentBadge: {
    backgroundColor: '#3B82F6',
  },
  membershipText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  nutritionStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  addGHButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#F5F3FF',
  padding: 14,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#8B5CF6',
},
addGHButtonText: {
  flex: 1,
  fontSize: 14,
  fontWeight: '600',
  color: '#8B5CF6',
  marginLeft: 8,
},
});