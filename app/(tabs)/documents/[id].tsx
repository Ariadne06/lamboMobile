import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { ApplicationDetail, cancelClearanceApplication, fetchApplicationDetail } from '../../../utils/documentService';
import { getUserSession } from '../../../utils/session';

export default function RequestDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const session = await getUserSession();

      if (!session || !session.user_id) {
        Alert.alert('Error', 'Unable to identify user. Please login again.');
        router.replace('/(auth)/login');
        return;
      }

      // Handle id being an array (useLocalSearchParams can return string | string[])
      const applicationId = Array.isArray(id) ? id[0] : id;
      console.log('📍 Route ID parameter:', id, '| Parsed:', applicationId);
      const numericId = parseInt(applicationId || '0', 10);
      console.log('📍 Numeric ID:', numericId);

      if (isNaN(numericId) || numericId === 0) {
        throw new Error('Invalid application ID');
      }

      const detail = await fetchApplicationDetail(session.user_id, numericId);
      setApplication(detail);
    } catch (error: any) {
      console.error('Error fetching application detail:', error);
      Alert.alert('Error', error.message || 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDetail();
    setRefreshing(false);
  };

  useEffect(() => {
    // Only fetch if we have a valid ID
    const applicationId = Array.isArray(id) ? id[0] : id;
    const numericId = parseInt(applicationId || '0', 10);
    
    if (!isNaN(numericId) && numericId > 0) {
      fetchDetail();
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleCancelApplication = () => {
    if (!application) return;

    Alert.alert(
      'Cancel Application',
      'Are you sure you want to cancel this application? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              const session = await getUserSession();

              if (!session || !session.user_id) {
                Alert.alert('Error', 'Unable to identify user. Please login again.');
                return;
              }

              await cancelClearanceApplication(
                session.user_id,
                application.application_id,
                'Cancelled by user from mobile app'
              );

              Alert.alert(
                '✅ Success',
                'Your application has been cancelled successfully.',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (error: any) {
              Alert.alert('❌ Error', error.message || 'Failed to cancel application');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      Approved: { bg: '#D1FAE5', text: '#065F46' },
      Processing: { bg: '#DBEAFE', text: '#1E40AF' },
      Pending: { bg: '#FEF3C7', text: '#92400E' },
      Rejected: { bg: '#FEE2E2', text: '#991B1B' },
      'For Payment': { bg: '#E0E7FF', text: '#3730A3' },
      Claimed: { bg: '#F3F4F6', text: '#374151' },
    };
    return colors[status] || colors.Pending;
  };

  const canCancel = () => {
    if (!application) return false;
    return (
      (application.application_status === 'Pending' || application.application_status === 'For Payment') &&
      application.payment_status !== 'Paid' &&
      !application.is_business
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Request Details" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading application details...</Text>
        </View>
      </View>
    );
  }

  if (!application) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Request Details" />
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>Application not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statusColor = getStatusColor(application.application_status);
  const paymentColor = getStatusColor(application.payment_status);

  return (
    <View style={styles.container}>
      <CustomHeader title="Request Details" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.applicationCode}>{application.application_code}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.statusText, { color: statusColor.text }]}>
                {application.application_status}
              </Text>
            </View>
          </View>
          <Text style={styles.requestType}>{application.request}</Text>
          {application.is_business && application.business_name && (
            <View style={styles.businessTag}>
              <Ionicons name="business" size={16} color="#2563EB" />
              <Text style={styles.businessName}>{application.business_name}</Text>
            </View>
          )}
        </View>

        {/* Application Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Information</Text>
          <View style={styles.detailsCard}>
            <DetailRow icon="pricetag-outline" label="Fee Type" value={application.fee_type} />
            <DetailRow icon="person-outline" label="Applicant" value={application.applicant_name} />
            <DetailRow icon="calendar-outline" label="Date Submitted" value={formatDate(application.date_submitted)} />
            <DetailRow icon="time-outline" label="Last Updated" value={formatDate(application.updated_at)} />
            <DetailRow
              icon="person-circle-outline"
              label="Requested By"
              value={application.requested_by_full_name || application.requested_by}
            />
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.detailsCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.detailLabel}>Payment Status</Text>
              <View style={[styles.paymentBadge, { backgroundColor: paymentColor.bg }]}>
                <Text style={[styles.paymentText, { color: paymentColor.text }]}>
                  {application.payment_status}
                </Text>
              </View>
            </View>
            <DetailRow
              icon="cash-outline"
              label="Total Amount"
              value={`₱${parseFloat(application.total_amount).toFixed(2)}`}
              valueStyle={styles.amountValue}
            />
            {application.or_number && (
              <DetailRow icon="receipt-outline" label="OR Number" value={application.or_number} />
            )}
            {application.date_paid && (
              <DetailRow icon="checkmark-circle-outline" label="Date Paid" value={formatDate(application.date_paid)} />
            )}
          </View>
        </View>

        {/* Rejection Details (includes both cancellation and rejection) */}
        {(application.cancel_reason || application.reject_reason) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rejection Details</Text>
            <View style={[styles.detailsCard, styles.errorCard]}>
              <DetailRow 
                icon={application.cancel_reason ? "close-circle-outline" : "alert-circle-outline"} 
                label="Reason" 
                value={application.cancel_reason || application.reject_reason || 'N/A'} 
              />
              {(application.canceled_at || application.rejected_at) && (
                <DetailRow 
                  icon="time-outline" 
                  label="Cancelled At" 
                  value={formatDate(application.canceled_at || application.rejected_at)} 
                />
              )}
              {(application.canceled_by_full_name || application.rejected_by_full_name) && (
                <DetailRow 
                  icon="person-outline" 
                  label="Cancelled By" 
                  value={application.canceled_by_full_name || application.rejected_by_full_name || 'N/A'} 
                />
              )}
            </View>
          </View>
        )}

        {/* Cancel Button */}
        {canCancel() && (
          <TouchableOpacity
            style={[styles.cancelButton, cancelling && styles.cancelButtonDisabled]}
            onPress={handleCancelApplication}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={20} color="#fff" />
                <Text style={styles.cancelButtonText}>Cancel Application</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

interface DetailRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueStyle?: any;
}

function DetailRow({ icon, label, value, valueStyle }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailRowLeft}>
        <Ionicons name={icon} size={18} color="#6B7280" />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={[styles.detailValue, valueStyle]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  applicationCode: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  requestType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  businessTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  businessName: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  warningCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  amountValue: {
    color: '#2563EB',
    fontSize: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cancelButtonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
