import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomHeader from '../../../components/ui/CustomHeader';
import { Application, fetchResidentApplications } from '../../../utils/documentService';
import { getUserSession } from '../../../utils/session';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Approved: { bg: '#D1FAE5', text: '#065F46' },
  Processing: { bg: '#DBEAFE', text: '#1E40AF' },
  Pending: { bg: '#FEF3C7', text: '#92400E' },
  Rejected: { bg: '#FEE2E2', text: '#991B1B' },
  Claimed: { bg: '#F3F4F6', text: '#374151' },
  'For Payment': { bg: '#E0E7FF', text: '#3730A3' },
};

export default function DocumentsScreen() {
  const [recentRequests, setRecentRequests] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch recent requests
  const fetchRecentRequests = async () => {
    try {
      setLoading(true);
      const session = await getUserSession();

      if (!session || !session.user_id) {
        console.error('No user session found');
        return;
      }

      console.log('📥 Fetching recent applications for user:', session.user_id);
      const result = await fetchResidentApplications(session.user_id, {
        limit: 3, // Only get 3 most recent
      });

      console.log('📊 Received applications:', result.data.length, 'items');
      console.log('📋 Applications data:', JSON.stringify(result.data, null, 2));
      setRecentRequests(result.data);
    } catch (error) {
      console.error('Error fetching recent requests:', error);
      Alert.alert('Error', 'Failed to load recent requests. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecentRequests();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchRecentRequests();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      Approved: { bg: '#D1FAE5', text: '#065F46' },
      Processing: { bg: '#DBEAFE', text: '#1E40AF' },
      Pending: { bg: '#FEF3C7', text: '#92400E' },
      Rejected: { bg: '#FEE2E2', text: '#991B1B' },
      Claimed: { bg: '#F3F4F6', text: '#374151' },
    };
    const colors = statusStyles[status as keyof typeof statusStyles] || statusStyles.Pending;
    return (
      <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
        <Text style={[styles.statusText, { color: colors.text }]}>{status}</Text>
      </View>
    );
  };

  const handleRequestPress = (requestId: number) => {
    // Navigate to request details screen
    console.log('🔍 Navigating to application ID:', requestId);
    if (!requestId || isNaN(requestId)) {
      Alert.alert('Error', 'Invalid application ID');
      return;
    }
    router.push(`/(tabs)/documents/${requestId}` as any);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Documents & Certificates" />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/(tabs)/documents/create-request')}
            activeOpacity={0.7}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="add-circle-outline" size={24} color="white" />
              <Text style={styles.createButtonText}>
                Create New Request
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push('/(tabs)/documents/requests-list')}
            activeOpacity={0.7}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="document-text-outline" size={24} color="#3B82F6" />
              <Text style={styles.viewAllButtonText}>
                View All Requests
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Recent Requests Section */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Recent Requests
            </Text>
            {recentRequests.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/documents/requests-list')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : recentRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>
                No requests yet
              </Text>
              <Text style={styles.emptySubtext}>
                Create your first document request above
              </Text>
            </View>
          ) : (
            <View style={styles.requestsList}>
              {recentRequests.map((request) => (
                <TouchableOpacity
                  key={request.application_id}
                  style={styles.requestCard}
                  onPress={() => handleRequestPress(request.application_id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.requestHeader}>
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestType}>
                        {request.request}
                      </Text>
                      <Text style={styles.requestPurpose}>
                        {request.fee_type}
                      </Text>
                    </View>
                    {getStatusBadge(request.application_status)}
                  </View>

                  <View style={styles.requestFooter}>
                    <View style={styles.requestDetail}>
                      <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                      <Text style={styles.detailText}>
                        {formatDate(request.date_submitted)}
                      </Text>
                    </View>
                    <View style={styles.requestDetail}>
                      <Ionicons name="cash-outline" size={14} color="#6B7280" />
                      <Text style={styles.detailText}>
                        ₱{parseFloat(request.total_amount).toFixed(2)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoContent}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>
                Processing Time
              </Text>
              <Text style={styles.infoText}>
                Most certificates are processed within 1-3 business days. You'll
                receive a notification when your request is approved.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  quickActions: {
    padding: 16,
    gap: 12,
  },
  createButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewAllButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  viewAllButtonText: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  recentSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  seeAllText: {
    color: '#2563EB',
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: 32,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  requestsList: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  requestInfo: {
    flex: 1,
  },
  requestType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  requestPurpose: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  requestDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  infoTitle: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#2563EB',
  },
});
