import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import CustomHeader from '../../../components/ui/CustomHeader';
import { Application, fetchResidentApplications } from '../../../utils/documentService';
import { getUserSession } from '../../../utils/session';

export default function RequestsListScreen() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const session = await getUserSession();
      
      if (!session || !session.user_id) {
        console.error('No user session found');
        return;
      }

      const result = await fetchResidentApplications(session.user_id, {
        query: searchQuery || undefined,
        app_status: filterStatus || undefined,
        limit: 100,
      });

      setApplications(result.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApplications();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchApplications();
  }, [searchQuery, filterStatus]);

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, { bg: string; text: string }> = {
      Approved: { bg: '#D1FAE5', text: '#065F46' },
      Processing: { bg: '#DBEAFE', text: '#1E40AF' },
      Pending: { bg: '#FEF3C7', text: '#92400E' },
      Rejected: { bg: '#FEE2E2', text: '#991B1B' },
      'For Payment': { bg: '#E0E7FF', text: '#3730A3' },
      Claimed: { bg: '#F3F4F6', text: '#374151' },
    };
    const colors = statusStyles[status] || statusStyles.Pending;
    return (
      <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
        <Text style={[styles.statusText, { color: colors.text }]}>{status}</Text>
      </View>
    );
  };

  const getPaymentBadge = (status: string) => {
    const statusStyles: Record<string, { bg: string; text: string }> = {
      Paid: { bg: '#D1FAE5', text: '#065F46' },
      Pending: { bg: '#FEF3C7', text: '#92400E' },
      Cancelled: { bg: '#FEE2E2', text: '#991B1B' },
    };
    const colors = statusStyles[status] || statusStyles.Pending;
    return (
      <View style={[styles.paymentBadge, { backgroundColor: colors.bg }]}>
        <Text style={[styles.paymentText, { color: colors.text }]}>{status}</Text>
      </View>
    );
  };

  const handleApplicationPress = (applicationId: number) => {
    console.log('🔍 Navigating to application ID:', applicationId);
    if (!applicationId || isNaN(applicationId)) {
      Alert.alert('Error', 'Invalid application ID');
      return;
    }
    router.push(`/(tabs)/documents/${applicationId}` as any);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="All Requests" />

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by code or business name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Filter Buttons */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, filterStatus === '' && styles.filterChipActive]}
          onPress={() => setFilterStatus('')}
        >
          <Text style={[styles.filterText, filterStatus === '' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterStatus === 'Pending' && styles.filterChipActive]}
          onPress={() => setFilterStatus('Pending')}
        >
          <Text style={[styles.filterText, filterStatus === 'Pending' && styles.filterTextActive]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterStatus === 'Processing' && styles.filterChipActive]}
          onPress={() => setFilterStatus('Processing')}
        >
          <Text style={[styles.filterText, filterStatus === 'Processing' && styles.filterTextActive]}>
            Processing
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterStatus === 'Approved' && styles.filterChipActive]}
          onPress={() => setFilterStatus('Approved')}
        >
          <Text style={[styles.filterText, filterStatus === 'Approved' && styles.filterTextActive]}>
            Approved
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterStatus === 'Rejected' && styles.filterChipActive]}
          onPress={() => setFilterStatus('Rejected')}
        >
          <Text style={[styles.filterText, filterStatus === 'Rejected' && styles.filterTextActive]}>
            Rejected
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading applications...</Text>
          </View>
        ) : applications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No applications found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || filterStatus
                ? 'Try adjusting your search or filters'
                : 'Create your first request to get started'}
            </Text>
          </View>
        ) : (
          <View style={styles.applicationsList}>
            {applications.map((app) => (
              <TouchableOpacity
                key={app.application_id}
                style={styles.applicationCard}
                onPress={() => handleApplicationPress(app.application_id)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={styles.applicationCode}>{app.application_code}</Text>
                    <Text style={styles.requestType}>{app.request}</Text>
                    {app.is_business && app.business_name && (
                      <Text style={styles.businessName}>
                        <Ionicons name="business" size={12} color="#6B7280" /> {app.business_name}
                      </Text>
                    )}
                  </View>
                  {getStatusBadge(app.application_status)}
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="pricetag-outline" size={16} color="#6B7280" />
                    <Text style={styles.detailLabel}>Fee Type:</Text>
                    <Text style={styles.detailValue}>{app.fee_type}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <Text style={styles.detailLabel}>Submitted:</Text>
                    <Text style={styles.detailValue}>{formatDate(app.date_submitted)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="cash-outline" size={16} color="#6B7280" />
                    <Text style={styles.detailLabel}>Amount:</Text>
                    <Text style={styles.amountValue}>₱{parseFloat(app.total_amount).toFixed(2)}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  {getPaymentBadge(app.payment_status)}
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  applicationsList: {
    gap: 12,
  },
  applicationCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  applicationCode: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    marginBottom: 4,
  },
  requestType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#1F2937',
    flex: 1,
  },
  amountValue: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  paymentText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
