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
import { getUserSession } from '../../../utils/session';
import { Transaction, fetchResidentTransactions } from '../../../utils/transactionService';

export default function TransactionsListScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const session = await getUserSession();
      
      if (!session || !session.user_id) {
        console.error('No user session found');
        return;
      }

      const result = await fetchResidentTransactions(session.user_id, {
        query: searchQuery || undefined,
        payment_status: filterStatus || undefined,
        limit: 100,
      });

      setTransactions(result.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [searchQuery, filterStatus]);

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, { bg: string; text: string }> = {
      Paid: { bg: '#D1FAE5', text: '#065F46' },
      Pending: { bg: '#FEF3C7', text: '#92400E' },
      Cancelled: { bg: '#FEE2E2', text: '#991B1B' },
      Failed: { bg: '#FEE2E2', text: '#991B1B' },
    };
    const colors = statusStyles[status] || statusStyles.Pending;
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
      <CustomHeader title="All Transactions" />

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by transaction code..."
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
          style={[styles.filterChip, filterStatus === 'Paid' && styles.filterChipActive]}
          onPress={() => setFilterStatus('Paid')}
        >
          <Text style={[styles.filterText, filterStatus === 'Paid' && styles.filterTextActive]}>
            Paid
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
          style={[styles.filterChip, filterStatus === 'Cancelled' && styles.filterChipActive]}
          onPress={() => setFilterStatus('Cancelled')}
        >
          <Text style={[styles.filterText, filterStatus === 'Cancelled' && styles.filterTextActive]}>
            Cancelled
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
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No transactions found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || filterStatus
                ? 'Try adjusting your search or filters'
                : 'Your payment history will appear here'}
            </Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {transactions.map((txn) => (
              <TouchableOpacity
                key={txn.transaction_id}
                style={styles.transactionCard}
                onPress={() => handleTransactionPress(txn.transaction_id)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={styles.transactionCode}>{txn.transaction_code}</Text>
                    <Text style={styles.transactionType}>{txn.fee_type}</Text>
                    <Text style={styles.requestType}>{txn.request}</Text>
                    {txn.is_business && txn.business_name && (
                      <Text style={styles.businessName}>
                        <Ionicons name="business" size={12} color="#6B7280" /> {txn.business_name}
                      </Text>
                    )}
                  </View>
                  {getStatusBadge(txn.payment_status)}
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>{formatDate(txn.date_submitted)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="cash-outline" size={16} color="#6B7280" />
                    <Text style={styles.detailLabel}>Amount:</Text>
                    <Text style={styles.amountValue}>{formatAmount(txn.total_amount)}</Text>
                  </View>
                  {txn.or_number && (
                    <View style={styles.detailRow}>
                      <Ionicons name="receipt-outline" size={16} color="#6B7280" />
                      <Text style={styles.detailLabel}>OR #:</Text>
                      <Text style={styles.detailValue}>{txn.or_number}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.viewDetailsText}>View Details</Text>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  transactionCode: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  requestType: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
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
    color: '#059669',
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
  viewDetailsText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
  },
});
