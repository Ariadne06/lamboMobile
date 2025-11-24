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
import { getUserSession } from '../../../utils/session';
import { TransactionDetail, fetchTransactionDetail } from '../../../utils/transactionService';

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const session = await getUserSession();

      if (!session || !session.user_id) {
        Alert.alert('Error', 'Unable to identify user. Please login again.');
        router.replace('/(auth)/login');
        return;
      }

      const transactionId = Array.isArray(id) ? id[0] : id;
      console.log('📍 Route ID parameter:', id, '| Parsed:', transactionId);
      const numericId = parseInt(transactionId || '0', 10);
      console.log('📍 Numeric ID:', numericId);

      if (isNaN(numericId) || numericId === 0) {
        throw new Error('Invalid transaction ID');
      }

      const detail = await fetchTransactionDetail(session.user_id, numericId);
      console.log('📦 Full transaction detail:', JSON.stringify(detail, null, 2));
      setTransaction(detail);
    } catch (error: any) {
      console.error('Error fetching transaction detail:', error);
      Alert.alert('Error', error.message || 'Failed to load transaction details');
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
    const transactionId = Array.isArray(id) ? id[0] : id;
    const numericId = parseInt(transactionId || '0', 10);
    
    if (!isNaN(numericId) && numericId > 0) {
      fetchDetail();
    } else {
      setLoading(false);
    }
  }, [id]);

  const formatDate = (dateString: string | null | undefined) => {
     console.log('🔍 Formatting date:', dateString);
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    console.log('📅 Parsed date:', date, 'Valid:', !isNaN(date.getTime()));
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number | string | null | undefined) => {
    if (!amount && amount !== 0) return '₱0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '₱0.00';
    return `₱${numAmount.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      Paid: { bg: '#D1FAE5', text: '#065F46' },
      Pending: { bg: '#FEF3C7', text: '#92400E' },
      Cancelled: { bg: '#FEE2E2', text: '#991B1B' },
      Failed: { bg: '#FEE2E2', text: '#991B1B' },
    };
    return colors[status] || colors.Pending;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Transaction Details" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading transaction details...</Text>
        </View>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Transaction Details" />
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>Transaction not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statusColor = getStatusColor(transaction.payment_status);

  return (
    <View style={styles.container}>
      <CustomHeader title="Transaction Details" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.transactionCode}>{transaction.transaction_code}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.statusText, { color: statusColor.text }]}>
                {transaction.payment_status}
              </Text>
            </View>
          </View>
          <Text style={styles.transactionType}>{transaction.fee_type}</Text>
          <Text style={styles.requestType}>{transaction.request}</Text>
          {transaction.is_business && transaction.business_name && (
            <View style={styles.businessTag}>
              <Ionicons name="business" size={16} color="#2563EB" />
              <Text style={styles.businessName}>{transaction.business_name}</Text>
            </View>
          )}
        </View>

        {/* Transaction Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Information</Text>
          <View style={styles.detailsCard}>
            <DetailRow 
              icon="cash-outline" 
              label="Amount" 
              value={formatAmount(transaction.total_amount)}
              valueStyle={styles.amountValue}
            />
            {transaction.date_submitted && (
              <DetailRow icon="calendar-outline" label="Date Created" value={formatDate(transaction.date_submitted)} />
            )}
            {(transaction.updated_at || transaction.canceled_at) && (
              <DetailRow 
                icon="time-outline" 
                label="Last Updated" 
                value={formatDate(transaction.updated_at || transaction.canceled_at)} 
              />
            )}
            {transaction.payment_method && (
              <DetailRow icon="card-outline" label="Payment Method" value={transaction.payment_method} />
            )}
            {transaction.reference_number && (
              <DetailRow icon="barcode-outline" label="Reference #" value={transaction.reference_number} />
            )}
          </View>
        </View>

        {/* Payment Details */}
        {transaction.payment_status === 'Paid' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            <View style={[styles.detailsCard, styles.successCard]}>
              {transaction.or_number && (
                <DetailRow icon="receipt-outline" label="OR Number" value={transaction.or_number} />
              )}
              {transaction.date_paid && (
                <DetailRow icon="checkmark-circle-outline" label="Date Paid" value={formatDate(transaction.date_paid)} />
              )}
              {transaction.paid_by_full_name && (
                <DetailRow icon="person-outline" label="Paid By" value={transaction.paid_by_full_name} />
              )}
            </View>
          </View>
        )}

        {/* Related Application */}
        {transaction.application_id && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Related Application</Text>
            <TouchableOpacity
              style={styles.relatedCard}
              onPress={() => {
                if (transaction.application_id) {
                  router.push(`/(tabs)/documents/${transaction.application_id}` as any);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.relatedCardContent}>
                <Ionicons name="document-text" size={24} color="#2563EB" />
                <View style={styles.relatedCardText}>
                  <Text style={styles.relatedCardTitle}>Application Details</Text>
                  <Text style={styles.relatedCardSubtitle}>{transaction.request}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          <View style={styles.detailsCard}>
            {transaction.resident_name && (
              <DetailRow icon="person-outline" label="Resident" value={transaction.resident_name} />
            )}
            {transaction.processed_by_full_name && (
              <DetailRow icon="person-circle-outline" label="Processed By" value={transaction.processed_by_full_name} />
            )}
            {transaction.notes && (
              <View style={styles.notesContainer}>
                <View style={styles.notesHeader}>
                  <Ionicons name="document-text-outline" size={18} color="#6B7280" />
                  <Text style={styles.notesLabel}>Notes</Text>
                </View>
                <Text style={styles.notesText}>{transaction.notes}</Text>
              </View>
            )}
          </View>
        </View>
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
  transactionCode: {
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
  transactionType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  requestType: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
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
  successCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
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
    color: '#059669',
    fontSize: 18,
    fontWeight: '700',
  },
  relatedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  relatedCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  relatedCardText: {
    marginLeft: 12,
    flex: 1,
  },
  relatedCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  relatedCardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  notesContainer: {
    marginTop: 4,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    paddingLeft: 26,
  },
});
