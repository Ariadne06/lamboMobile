import React from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserSession } from '@/utils/session';

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

export default function BusinessInfoScreen() {
  // Optional: if you navigate like `/business?businessId=22` from a list
  const { businessId } = useLocalSearchParams<{ businessId?: string }>();

  const [business, setBusiness] = React.useState<BusinessSummary | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1️⃣ Get logged-in resident_id stored in user_session
        const session = await getUserSession();
        const storedUserId = session?.user_id;
        console.log('Business screen - stored user_id:', storedUserId);

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

        // 2️⃣ Call get_all_businesses_mobile_by_owner(ownerId)
        const endpoint = `${API_BASE_URL}${API_ENDPOINTS.MOBILE_BUSINESSES_BY_OWNER(
          ownerId
        )}`;

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
          throw new Error('Invalid JSON from server');
        }

        if (!parsed || parsed.length === 0) {
          setBusiness(null);
          setError('You currently have no registered business.');
          setLoading(false);
          return;
        }

        // 3️⃣ If businessId param is given → select that specific business
        //    Otherwise → show the first business in the list
        let selected: BusinessSummary | undefined;
        const businessIdNum = businessId ? Number(businessId) : NaN;

        if (businessId && !isNaN(businessIdNum)) {
          selected = parsed.find((b) => b.business_id === businessIdNum);
        }

        if (!selected) {
          selected = parsed[0];
        }

        setBusiness(selected);
      } catch (err: any) {
        console.error('Failed to load business', err);
        setError(err?.message || 'Failed to load business information.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [businessId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.muted}>Loading business info...</ThemedText>
      </View>
    );
  }

  if (error || !business) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle" size={40} color="#ef4444" />
        <ThemedText style={[styles.muted, { marginTop: 8, textAlign: 'center' }]}>
          {error || 'You currently have no registered business.'}
        </ThemedText>
      </View>
    );
  }

  // Owner details (we only have address from this function)
  const ownerName = 'Business Owner';
  const ownerAddress = business.full_address || 'No address on record';

  // Business detail fields
  const businessName = business.business_name;
  const businessType = business.business_type_name;
  const businessAddress = business.full_address || 'No address on record';
  const totalGrossIncome = business.total_gross_income;
  const clearanceCategory = business.clearance_category_name || 'N/A';
  const statusName = business.business_status_name;
  const isActive = statusName?.toLowerCase() === 'active';
  const issuanceDate = isActive ? formatDate(business.updated_at) : '—';

  return (
    <ScrollView style={styles.container}>
      {/* Business information */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Business Information</ThemedText>

        {/* Business Name */}
        <View style={styles.infoRow}>
          <MaterialIcons
            name="business-center"
            size={22}
            color="#FFA333"
            style={styles.icon}
          />
          <ThemedText style={styles.infoLabel}>Business Name: </ThemedText>
          <ThemedText style={styles.infoText}>{businessName}</ThemedText>
        </View>

        {/* Business Type */}
        <View style={styles.infoRow}>
          <FontAwesome5 name="store" size={20} color="#FF3D33" style={styles.icon} />
          <ThemedText style={styles.infoLabel}>Business Type: </ThemedText>
          <ThemedText style={styles.infoText}>{businessType}</ThemedText>
        </View>

        {/* Total Gross Income */}
        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={22} color="#16a34a" style={styles.icon} />
          <ThemedText style={styles.infoLabel}>Total Gross Income: </ThemedText>
          <ThemedText style={styles.infoText}>
            {formatCurrency(totalGrossIncome)}
          </ThemedText>
        </View>

        {/* Address */}
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={22} color="#FF3D33" style={styles.icon} />
          <ThemedText style={styles.infoLabel}>Address: </ThemedText>
          <ThemedText style={styles.infoText}>{businessAddress}</ThemedText>
        </View>

        {/* Clearance Category */}
        <View style={styles.infoRow}>
          <Ionicons name="pricetag-outline" size={20} color="#6366f1" style={styles.icon} />
          <ThemedText style={styles.infoLabel}>Clearance Category: </ThemedText>
          <ThemedText style={styles.infoText}>{clearanceCategory}</ThemedText>
        </View>

        {/* Issuance Date (if active) */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color="#0ea5e9" style={styles.icon} />
          <ThemedText style={styles.infoLabel}>Issuance Date: </ThemedText>
          <ThemedText style={styles.infoText}>
            {isActive ? issuanceDate : '—'}
          </ThemedText>
        </View>

        {/* Status */}
        <View style={styles.infoRow}>
          <Ionicons
            name={isActive ? 'checkmark-circle' : 'close-circle'}
            size={22}
            color={isActive ? '#22c55e' : '#ef4444'}
            style={styles.icon}
          />
          <ThemedText style={styles.infoLabel}>Status: </ThemedText>
          <ThemedText
            style={[
              styles.infoText,
              { color: isActive ? '#22c55e' : '#ef4444', fontWeight: 'bold' },
            ]}
          >
            {statusName}
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 12,
    padding: 18,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FF3D33',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  icon: {
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 15,
    color: '#6b7280',
    marginRight: 4,
  },
  infoText: {
    fontSize: 15,
    color: '#374151',
    flexShrink: 1,
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
});
