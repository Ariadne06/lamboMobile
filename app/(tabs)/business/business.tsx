import { ThemedText } from '@/components/ThemedText';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { getUserSession } from '@/utils/session';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

type BusinessSummary = {
  business_id: number;
  business_name: string;
  business_status_name: string;
  business_type_name: string;
  ownership_name: string;
  clearance_category_name: string | null;
  reg_number: string | null;
  total_gross_income: number | null;
  address_id: number;
  full_address: string | null;
  updated_at: string | null;
};

function formatCurrency(value: number | null): string {
  if (value == null) return '—';
  try {
    return (
      '₱ ' +
      value.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  } catch {
    return `₱ ${value}`;
  }
}

export default function BusinessListScreen() {
  const router = useRouter();
  const [businesses, setBusinesses] = React.useState<BusinessSummary[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [refreshing, setRefreshing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchBusinessList = async () => {
    try {
      setError(null);

      const session = await getUserSession();
      const storedUserId = session?.user_id;

      if (!storedUserId) {
        setError('No logged-in resident found. Please log in again.');
        return;
      }

      const ownerIdNum = Number(storedUserId);
      if (!ownerIdNum || isNaN(ownerIdNum)) {
        setError('Invalid stored resident ID. Please log in again.');
        return;
      }

      const endpoint = `${API_BASE_URL}${API_ENDPOINTS.MOBILE_BUSINESSES_BY_OWNER}?owner_id=${ownerIdNum}`;
      console.log('Fetching businesses for owner from:', endpoint);

      const res = await fetch(endpoint);
      const rawText = await res.text();

      if (!res.ok) {
        console.log('Error response body:', rawText);
        throw new Error(`HTTP ${res.status} - ${rawText}`);
      }

      let parsed: BusinessSummary[];
      try {
        parsed = JSON.parse(rawText);
      } catch (e) {
        console.log('Failed to parse JSON:', e);
        throw new Error('Invalid JSON response from server');
      }

      if (!parsed || parsed.length === 0) {
        setBusinesses([]);
        setError('You currently have no registered business.');
        return;
      }

      setBusinesses(parsed);
    } catch (err: any) {
      console.error('Failed to load business list', err);
      setError(err?.message || 'Failed to load business information.');
    }
  };

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchBusinessList();
      setLoading(false);
    };
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBusinessList();
    setRefreshing(false);
  };

  const handleBusinessPress = (businessId: number) => {
    router.push(`/business/detail?businessId=${businessId}`);
  };

  const renderBusinessCard = ({ item }: { item: BusinessSummary }) => {
    const isActive = item.business_status_name?.toLowerCase() === 'active';

    return (
      <TouchableOpacity
        style={styles.businessCard}
        onPress={() => handleBusinessPress(item.business_id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="business" size={32} color="#FF3D33" />
          </View>
          <View style={styles.headerContent}>
            <ThemedText style={styles.businessName} numberOfLines={2}>
              {item.business_name}
            </ThemedText>
            <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusInactive]}>
              <Ionicons
                name={isActive ? 'checkmark-circle' : 'close-circle'}
                size={14}
                color="#fff"
                style={{ marginRight: 4 }}
              />
              <ThemedText style={styles.statusText}>{item.business_status_name}</ThemedText>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <FontAwesome5 name="store" size={14} color="#6b7280" />
            <ThemedText style={styles.infoLabel}>Type:</ThemedText>
            <ThemedText style={styles.infoValue} numberOfLines={1}>
              {item.business_type_name}
            </ThemedText>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={16} color="#16a34a" />
            <ThemedText style={styles.infoLabel}>Income:</ThemedText>
            <ThemedText style={[styles.infoValue, { color: '#16a34a', fontWeight: '600' }]}>
              {formatCurrency(item.total_gross_income)}
            </ThemedText>
          </View>

          {item.full_address && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="#6b7280" />
              <ThemedText style={styles.addressText} numberOfLines={2}>
                {item.full_address}
              </ThemedText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF3D33" />
        <ThemedText style={styles.muted}>Loading businesses...</ThemedText>
      </View>
    );
  }

  if (error && businesses.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <ThemedText style={[styles.muted, { marginTop: 12, textAlign: 'center', fontSize: 16 }]}>
          {error}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={businesses}
        renderItem={renderBusinessCard}
        keyExtractor={(item) => item.business_id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#FF3D33']}
            tintColor="#FF3D33"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="business" size={64} color="#d1d5db" />
            <ThemedText style={styles.emptyText}>No businesses found</ThemedText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  centered: {
    flex: 1,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  muted: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  businessCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#22c55e',
  },
  statusInactive: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    padding: 16,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
    flex: 1,
  },
  addressText: {
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
});
