import { ThemedText } from '@/components/ThemedText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { 
  Dimensions, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  ActivityIndicator, 
  RefreshControl,
  Text,
  Alert,
  SafeAreaView,
} from 'react-native';
import { getUserSession } from '@/utils/session';
import { API_BASE_URL } from '@/constants/apiConfig';
import CustomHeader from '@/components/ui/CustomHeader';

interface MaternalRecord {
  maternal_health_id: number;
  record_status: string;
  date_created: string;
}

interface Child {
  child_resident_id: number;
  child_health_id: number | null;
  child_full_name: string;
  sex: string;
  dob: string;
  age: string;
}

export default function HealthRecordsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [residentSex, setResidentSex] = useState<string | null>(null);
  const [residentName, setResidentName] = useState<string>('');
  const [maternalRecords, setMaternalRecords] = useState<MaternalRecord[]>([]);
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      
      const session = await getUserSession();
      if (!session || !session.user_id) {
        console.error('❌ No session found');
        Alert.alert('Error', 'Please log in again');
        return;
      }

      console.log('📋 Loading health data for resident:', session.user_id);

      // 1. Get resident profile to check sex
      const profileUrl = `${API_BASE_URL}/api/resident-profile/${session.user_id}/`;
      console.log('🌐 Fetching profile:', profileUrl);
      
      const profileResponse = await fetch(profileUrl);
      const profileData = await profileResponse.json();
      
      console.log('📋 Profile data:', profileData);
      
      // ✅ FIX: Use profileData.profile instead of profileData.data
      if (profileData.success && profileData.profile) {
        const sex = profileData.profile.sex;
        setResidentSex(sex);
        
        // Construct full name from profile fields
        const fullName = `${profileData.profile.first_name} ${profileData.profile.middle_name || ''} ${profileData.profile.last_name}`.trim();
        setResidentName(fullName);
        
        console.log('✅ Resident:', fullName, '| Sex:', sex);
        
        // 2. If Female, fetch maternal records using SQL function
        if (sex === 'Female') {
          console.log('👩 Female resident detected! Fetching maternal records...');
          
          const maternalUrl = `${API_BASE_URL}/household_api/residents/${session.user_id}/maternal-records/`;
          console.log('🌐 Fetching maternal records:', maternalUrl);
          
          try {
            const maternalResponse = await fetch(maternalUrl);
            const maternalData = await maternalResponse.json();
            
            console.log('📋 Maternal records response:', maternalData);
            
            if (maternalData.success) {
              console.log(`✅ Found ${maternalData.data?.length || 0} maternal records`);
              setMaternalRecords(maternalData.data || []);
            } else {
              console.warn('⚠️ No maternal records found:', maternalData.error);
              setMaternalRecords([]);
            }
          } catch (maternalError) {
            console.error('❌ Error fetching maternal records:', maternalError);
            setMaternalRecords([]);
          }
        } else {
          console.log('ℹ️ Not a female resident, skipping maternal records');
        }
      }

      // 3. Fetch children using SQL function (both male and female can have children)
      console.log('👶 Fetching children...');
      
      const childrenUrl = `${API_BASE_URL}/household_api/residents/${session.user_id}/children/`;
      console.log('🌐 Fetching children:', childrenUrl);
      
      try {
        const childrenResponse = await fetch(childrenUrl);
        const childrenData = await childrenResponse.json();
        
        console.log('📋 Children data response:', childrenData);
        
        if (childrenData.success) {
          console.log(`✅ Found ${childrenData.data?.length || 0} children`);
          setChildren(childrenData.data || []);
        } else {
          console.warn('⚠️ No children found:', childrenData.error);
          setChildren([]);
        }
      } catch (childrenError) {
        console.error('❌ Error fetching children:', childrenError);
        setChildren([]);
      }

    } catch (error) {
      console.error('❌ Error loading health data:', error);
      Alert.alert('Error', 'Failed to load health records. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadHealthData();
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ongoing':
        return { bg: '#FEF3C7', text: '#F59E0B' };
      case 'completed':
        return { bg: '#ECFDF5', text: '#10B981' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <CustomHeader title="Health Records" onBackPress={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Loading health records...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomHeader title="Health Records" onBackPress={() => router.back()} />
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#10b981']} />
        }
      >
        {/* Welcome Banner */}
        {/* {residentName && (
          <View style={styles.welcomeBanner}>
            <MaterialCommunityIcons name="heart-pulse" size={32} color="#10b981" />
            <View style={styles.welcomeInfo}>
              <Text style={styles.welcomeTitle}>Health Records</Text>
              <Text style={styles.welcomeSubtext}>{residentName}</Text>
            </View>
          </View>
        )} */}

        {/* Maternal Health Section (Only for Females) */}
        {residentSex === 'Female' && (
          <>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="human-pregnant" size={24} color="#FF3D33" />
              <Text style={styles.sectionTitle}>My Maternal Records</Text>
            </View>
            
            <View style={styles.section}>
              {maternalRecords.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="clipboard-text-outline" size={64} color="#9CA3AF" />
                  <Text style={styles.emptyTitle}>No Maternal Records</Text>
                  <Text style={styles.emptyText}>
                    You don&apos;t have any maternal health records yet. Contact your Barangay Health Worker to create one.
                  </Text>
                </View>
              ) : (
                maternalRecords.map((record) => {
                  const statusColors = getStatusColor(record.record_status);
                  return (
                    <TouchableOpacity
                      key={record.maternal_health_id}
                      style={styles.recordCard}
                      onPress={() => router.push(`/(tabs)/health/maternal/${record.maternal_health_id}` as any)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.recordLeft}>
                        <View style={[styles.recordIcon, { backgroundColor: '#fee2e2' }]}>
                          <MaterialCommunityIcons name="clipboard-pulse" size={24} color="#FF3D33" />
                        </View>
                        <View style={styles.recordInfo}>
                          <Text style={styles.recordTitle}>
                            Maternal Record #{record.maternal_health_id}
                          </Text>
                          <Text style={styles.recordDate}>
                            Created: {formatDate(record.date_created)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.recordRight}>
                        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                          <Text style={[styles.statusText, { color: statusColors.text }]}>
                            {record.record_status}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </>
        )}

        {/* Children's Health Section */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="baby-face" size={24} color="#0ea5e9" />
          <Text style={styles.sectionTitle}>My Children&apos;s Health</Text>
        </View>
        
        <View style={styles.section}>
          {children.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-child-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No Children Records</Text>
              <Text style={styles.emptyText}>
                No children health records found in the system.
              </Text>
            </View>
          ) : (
            children.map((child) => (
              <TouchableOpacity
                key={child.child_resident_id}
                style={styles.childCard}
                onPress={() => {
                  if (child.child_health_id) {
                    router.push(`/(tabs)/health/child/${child.child_health_id}` as any);
                  } else {
                    Alert.alert(
                      'No Health Record',
                      'This child does not have a health record yet. Contact your Barangay Health Worker to create one.',
                      [{ text: 'OK' }]
                    );
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.childHeader}>
                  <View style={[
                    styles.childIcon,
                    { backgroundColor: child.sex === 'Male' ? '#dbeafe' : '#fce7f3' }
                  ]}>
                    <MaterialCommunityIcons 
                      name={child.sex === 'Male' ? 'gender-male' : 'gender-female'} 
                      size={24} 
                      color={child.sex === 'Male' ? '#3b82f6' : '#ec4899'} 
                    />
                  </View>
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{child.child_full_name}</Text>
                    <Text style={styles.childDetails}>
                      {child.age} • {child.sex}
                    </Text>
                  </View>
                </View>
                
                {child.child_health_id ? (
                  <View style={styles.healthStatus}>
                    <View style={styles.healthStatusBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                      <Text style={styles.healthStatusText}>Has health record</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </View>
                ) : (
                  <View style={styles.healthStatus}>
                    <View style={[styles.healthStatusBadge, { backgroundColor: '#fef3c7' }]}>
                      <Ionicons name="alert-circle" size={16} color="#f59e0b" />
                      <Text style={[styles.healthStatusText, { color: '#f59e0b' }]}>
                        No health record
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Ionicons name="information-circle" size={20} color="#6B7280" />
          <Text style={styles.infoText}>
            Pull down to refresh your health records. Contact your Barangay Health Worker for any updates or new records.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
  },
  loadingText: { 
    fontSize: 14, 
    color: '#6B7280',
    marginTop: 8,
  },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: '#10b98130',
  },
  welcomeInfo: { 
    flex: 1 
  },
  welcomeTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#111827',
    marginBottom: 4,
  },
  welcomeSubtext: { 
    fontSize: 14, 
    color: '#6B7280' 
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 20,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  recordIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  recordRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  childCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  childIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  childDetails: {
    fontSize: 13,
    color: '#6B7280',
  },
  healthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  healthStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  healthStatusText: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '500',
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F1F5F9',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});