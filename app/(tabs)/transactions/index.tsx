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
  TouchableOpacity,
  View,
} from 'react-native';
import CustomHeader from '../../../components/ui/CustomHeader';
import { getUserSession } from '../../../utils/session';
import { Transaction, fetchResidentTransactions } from '../../../utils/transactionService';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Paid: { bg: '#D1FAE5', text: '#065F46' },
  Pending: { bg: '#FEF3C7', text: '#92400E' },
  Cancelled: { bg: '#FEE2E2', text: '#991B1B' },
  Failed: { bg: '#FEE2E2', text: '#991B1B' },
};

export default function TransactionsScreen() {
  const router = useRouter();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch recent transactions
  const fetchRecentTransactions = async () => {
    try {
      setLoading(true);
      const session = await getUserSession();

      if (!session || !session.user_id) {
        console.error('No user session found');
        return;
      }

      console.log('📥 Fetching recent transactions for user:', session.user_id);
      const result = await fetchResidentTransactions(session.user_id, {
        limit: 5, // Only get 5 most recent
      });

      console.log('📊 Received transactions:', result.data.length, 'items');
      console.log('📋 Transaction data:', JSON.stringify(result.data, null, 2));
      setRecentTransactions(result.data);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      Alert.alert('Error', 'Failed to load recent transactions. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecentTransactions();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchRecentTransactions();
  }, []);

  const getStatusBadge = (status: string) => {
    const colors = STATUS_COLORS[status] || STATUS_COLORS.Pending;
    return (
      <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
        <Text style={[styles.statusText, { color: colors.text }]}>{status}</Text>
      </View>
    );
  };

  const handleTransactionPress = (transactionId: number) => {
    console.log('🔍 Navigating to transaction ID:', transactionId);
    if (!transactionId || isNaN(transactionId)) {
      Alert.alert('Error', 'Invalid transaction ID');
      return;
    }
    router.push(`/(tabs)/transactions/${transactionId}` as any);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatAmount = (amount: number | string | null | undefined) => {
    if (!amount && amount !== 0) return '₱0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '₱0.00';
    return `₱${numAmount.toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Transaction History" />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push('/(tabs)/transactions/transactions-list')}
            activeOpacity={0.7}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="list-outline" size={24} color="#3B82F6" />
              <Text style={styles.viewAllButtonText}>
                View All Transactions
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Recent Transactions Section */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Recent Transactions
            </Text>
            {recentTransactions.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/transactions/transactions-list')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>
                No transactions yet
              </Text>
              <Text style={styles.emptySubtext}>
                Your payment history will appear here
              </Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {recentTransactions.map((transaction) => (
                <TouchableOpacity
                  key={transaction.transaction_id}
                  style={styles.transactionCard}
                  onPress={() => handleTransactionPress(transaction.transaction_id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.transactionHeader}>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionCode}>
                        {transaction.transaction_code}
                      </Text>
                      <Text style={styles.transactionType}>
                        {transaction.fee_type}
                      </Text>
                      <Text style={styles.requestType}>
                        {transaction.request}
                      </Text>
                    </View>
                    {getStatusBadge(transaction.payment_status)}
                  </View>

                  <View style={styles.transactionFooter}>
                    <View style={styles.transactionDetail}>
                      <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                      <Text style={styles.detailText}>
                        {formatDate(transaction.date_submitted)}
                      </Text>
                    </View>
                    <Text style={styles.amountText}>
                      {formatAmount(transaction.total_amount)}
                    </Text>
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
                Payment Records
              </Text>
              <Text style={styles.infoText}>
                All your payment transactions for certificates, clearances, and
                other barangay services are recorded here for your reference.
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
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  transactionsList: {
    gap: 12,
  },
  transactionCard: {
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
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCode: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  requestType: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 2,
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
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  transactionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
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
