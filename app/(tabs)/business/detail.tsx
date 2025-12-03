import { ThemedText } from '@/components/ThemedText';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { getUserSession } from '@/utils/session';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

type BusinessDetail = {
  business_id: number;
  business_name: string;
  nature_of_business: string;
  total_gross_income: number | null;
  reg_number: string | null;
  clearance_date_issued: string | null;
  status: string;
  business_type: string;
  ownership: string;
  clearance_category: string | null;
  owner_id: number;
  owner_name: string;
  address_id: number;
  address: string;
  updated_at: string | null;
  created_by: number;
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

function formatDate(input: string | null): string {
  if (!input) return '—';
  const d = new Date(input);
  if (Number.isNaN(+d)) return input;
  return d.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export default function BusinessDetailScreen() {
  const router = useRouter();
  const { businessId } = useLocalSearchParams<{ businessId: string }>();

  const [business, setBusiness] = React.useState<BusinessDetail | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchBusinessDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const session = await getUserSession();
        const storedUserId = session?.user_id;

        if (!storedUserId) {
          setError('No logged-in resident found. Please log in again.');
          setLoading(false);
          return;
        }

        const ownerId = Number(storedUserId);
        if (!ownerId || isNaN(ownerId)) {
          setError('Invalid stored resident ID. Please log in again.');
          setLoading(false);
          return;
        }

        const businessIdNum = Number(businessId);
        if (!businessIdNum || isNaN(businessIdNum)) {
          setError('Invalid business ID.');
          setLoading(false);
          return;
        }

        const endpoint = `${API_BASE_URL}${API_ENDPOINTS.MOBILE_SPECIFIC_BUSINESS(businessIdNum)}?owner_id=${ownerId}`;
        console.log('Fetching business detail from:', endpoint);

        const res = await fetch(endpoint);
        const rawText = await res.text();

        if (!res.ok) {
          console.log('Error response body:', rawText);
          throw new Error(`HTTP ${res.status} - ${rawText}`);
        }

        let parsed: BusinessDetail;
        try {
          parsed = JSON.parse(rawText);
        } catch (e) {
          console.log('Failed to parse JSON:', e);
          throw new Error('Invalid JSON response from server');
        }

        setBusiness(parsed);
      } catch (err: any) {
        console.error('Failed to load business detail', err);
        setError(err?.message || 'Failed to load business information.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessDetail();
  }, [businessId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF3D33" />
        <ThemedText style={styles.muted}>Loading business details...</ThemedText>
      </View>
    );
  }

  if (error || !business) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <ThemedText style={[styles.muted, { marginTop: 12, textAlign: 'center', fontSize: 16 }]}>
          {error || 'Business not found.'}
        </ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  const isActive = business.status?.toLowerCase() === 'active';

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerIconContainer}>
          <MaterialIcons name="business-center" size={48} color="#FF3D33" />
        </View>
        <ThemedText style={styles.headerTitle}>{business.business_name}</ThemedText>
        <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusInactive]}>
          <Ionicons
            name={isActive ? 'checkmark-circle' : 'close-circle'}
            size={16}
            color="#fff"
            style={{ marginRight: 4 }}
          />
          <ThemedText style={styles.statusText}>{business.status}</ThemedText>
        </View>
      </View>

      {/* Business Details Card */}
      <View style={styles.card}>
        <ThemedText style={styles.cardTitle}>Business Details</ThemedText>

        {/* Business Type */}
        <View style={styles.detailRow}>
          <View style={styles.iconCircle}>
            <FontAwesome5 name="store" size={16} color="#FF3D33" />
          </View>
          <View style={styles.detailContent}>
            <ThemedText style={styles.detailLabel}>Business Type</ThemedText>
            <ThemedText style={styles.detailValue}>{business.business_type}</ThemedText>
          </View>
        </View>

        {/* Nature of Business */}
        {business.nature_of_business && (
          <View style={styles.detailRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#fef3c7' }]}>
              <MaterialIcons name="description" size={16} color="#f59e0b" />
            </View>
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Nature of Business</ThemedText>
              <ThemedText style={styles.detailValue}>{business.nature_of_business}</ThemedText>
            </View>
          </View>
        )}

        {/* Ownership */}
        <View style={styles.detailRow}>
          <View style={[styles.iconCircle, { backgroundColor: '#e0e7ff' }]}>
            <MaterialIcons name="person" size={16} color="#6366f1" />
          </View>
          <View style={styles.detailContent}>
            <ThemedText style={styles.detailLabel}>Ownership</ThemedText>
            <ThemedText style={styles.detailValue}>{business.ownership}</ThemedText>
          </View>
        </View>

        {/* Registration Number */}
        {business.reg_number && (
          <View style={styles.detailRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#dbeafe' }]}>
              <MaterialIcons name="badge" size={16} color="#0ea5e9" />
            </View>
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Registration Number</ThemedText>
              <ThemedText style={styles.detailValue}>{business.reg_number}</ThemedText>
            </View>
          </View>
        )}

        {/* Total Gross Income */}
        <View style={styles.detailRow}>
          <View style={[styles.iconCircle, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="cash-outline" size={18} color="#16a34a" />
          </View>
          <View style={styles.detailContent}>
            <ThemedText style={styles.detailLabel}>Total Gross Income</ThemedText>
            <ThemedText style={[styles.detailValue, styles.incomeText]}>
              {formatCurrency(business.total_gross_income)}
            </ThemedText>
          </View>
        </View>

        {/* Clearance Category */}
        {business.clearance_category && (
          <View style={styles.detailRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#fce7f3' }]}>
              <Ionicons name="pricetag-outline" size={16} color="#ec4899" />
            </View>
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Clearance Category</ThemedText>
              <ThemedText style={styles.detailValue}>{business.clearance_category}</ThemedText>
            </View>
          </View>
        )}

        {/* Clearance Date Issued */}
        {business.clearance_date_issued && (
          <View style={styles.detailRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="calendar-outline" size={16} color="#0ea5e9" />
            </View>
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Clearance Date Issued</ThemedText>
              <ThemedText style={styles.detailValue}>
                {formatDate(business.clearance_date_issued)}
              </ThemedText>
            </View>
          </View>
        )}
      </View>

      {/* Owner Information Card */}
      <View style={styles.card}>
        <ThemedText style={styles.cardTitle}>Owner Information</ThemedText>

        <View style={styles.detailRow}>
          <View style={[styles.iconCircle, { backgroundColor: '#e0e7ff' }]}>
            <MaterialIcons name="account-circle" size={18} color="#6366f1" />
          </View>
          <View style={styles.detailContent}>
            <ThemedText style={styles.detailLabel}>Owner Name</ThemedText>
            <ThemedText style={styles.detailValue}>{business.owner_name}</ThemedText>
          </View>
        </View>
      </View>

      {/* Location Card */}
      <View style={styles.card}>
        <ThemedText style={styles.cardTitle}>Location</ThemedText>
        <View style={styles.addressContainer}>
          <Ionicons name="location-outline" size={20} color="#FF3D33" />
          <ThemedText style={styles.addressText}>{business.address}</ThemedText>
        </View>
      </View>

      {/* Last Updated */}
      {business.updated_at && (
        <View style={styles.footerInfo}>
          <Ionicons name="time-outline" size={14} color="#9ca3af" />
          <ThemedText style={styles.footerText}>
            Last updated: {formatDate(business.updated_at)}
          </ThemedText>
        </View>
      )}
    </ScrollView>
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
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FF3D33',
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusActive: {
    backgroundColor: '#22c55e',
  },
  statusInactive: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  incomeText: {
    color: '#16a34a',
    fontSize: 18,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  addressText: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 10,
    flex: 1,
    lineHeight: 22,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});
