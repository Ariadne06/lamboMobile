import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';

// ✅ Types defined in the file
interface MaternalRecord {
  maternal_health_id: number;
  maternal_id: number;
  maternal_full_name: string;
  dob: string;
  record_status: string;
  date_created: string;
}

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#EC4899', // Pink for maternal
    primaryLight: '#FDF2F8',
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#EF4444',
    info: '#3B82F6',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

export default function NurseMaternalHealthListScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<MaternalRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMaternalHealthRecords();
  }, []);

  const handleBackPress = () => {
    router.push('/(nurse)/menu');
  };

  const fetchMaternalHealthRecords = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MATERNAL_RECORDS_LIST}?limit=1000`
      );
      const data = await response.json();

      if (data.success) {
        setRecords(data.data || []);
        console.log(`Loaded ${data.count || 0} maternal health records`);
      }
    } catch (error) {
      console.error('Failed to load maternal health records:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMaternalHealthRecords();
  };

  const handleCardPress = (maternalHealthId: number) => {
    router.push(`/(nurse)/maternal-health/${maternalHealthId}` as any);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ongoing':
        return theme.colors.info;
      case 'completed':
        return theme.colors.success;
      default:
        return theme.colors.textMuted;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ongoing':
        return '#EFF6FF';
      case 'completed':
        return theme.colors.successLight;
      default:
        return '#F3F4F6';
    }
  };

  const filteredRecords = records.filter(record => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    const motherName = (record.maternal_full_name || '').toLowerCase();
    const recordId = record.maternal_health_id.toString();
    
    return motherName.includes(query) || recordId.includes(query);
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader 
          title="Maternal Health Records" 
          showBackButton={true}
          onBackPress={handleBackPress}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading maternal records...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader 
        title="Maternal Health Records" 
        showBackButton={true}
        onBackPress={handleBackPress}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or ID..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.textMuted}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{records.length}</ThemedText>
          <ThemedText style={styles.statLabel}>Total Mothers</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: theme.colors.info }]}>
            {records.filter(r => r.record_status.toLowerCase() === 'ongoing').length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Ongoing</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: theme.colors.success }]}>
            {records.filter(r => r.record_status.toLowerCase() === 'completed').length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Completed</ThemedText>
        </View>
      </View>

      {/* Records List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {filteredRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="pregnant-woman" size={64} color={theme.colors.textMuted} />
            <ThemedText style={styles.emptyTitle}>
              {searchQuery ? 'No matching records found' : 'No maternal health records yet'}
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              {searchQuery
                ? 'Try a different search term'
                : 'No Records'}
            </ThemedText>
          </View>
        ) : (
          filteredRecords.map((record, index) => (
            <TouchableOpacity
              key={record.maternal_health_id}
              style={[styles.card, index === filteredRecords.length - 1 && styles.lastCard]}
              onPress={() => handleCardPress(record.maternal_health_id)}
              activeOpacity={0.7}
            >
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primaryLight }]}>
                  <MaterialIcons name="pregnant-woman" size={24} color={theme.colors.primary} />
                </View>
                
                <View style={styles.motherInfo}>
                  <ThemedText style={styles.motherName} numberOfLines={1}>
                    {record.maternal_full_name}
                  </ThemedText>
                  <View style={styles.motherMeta}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusBgColor(record.record_status) }
                    ]}>
                      <Ionicons
                        name={record.record_status.toLowerCase() === 'ongoing' ? 'time-outline' : 'checkmark-circle-outline'}
                        size={12}
                        color={getStatusColor(record.record_status)}
                      />
                      <ThemedText style={[
                        styles.statusText,
                        { color: getStatusColor(record.record_status) }
                      ]}>
                        {record.record_status}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
              </View>

              {/* Card Body */}
              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={16} color={theme.colors.textSecondary} />
                  <ThemedText style={styles.infoLabel}>ID:</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {record.maternal_health_id}
                  </ThemedText>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                  <ThemedText style={styles.infoLabel}>DOB:</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {formatDate(record.dob)}
                  </ThemedText>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                  <ThemedText style={styles.infoLabel}>Created:</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {formatDate(record.date_created)}
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl + 60,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  lastCard: {
    marginBottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  motherInfo: {
    flex: 1,
  },
  motherName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  motherMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardBody: {
    gap: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    minWidth: 60,
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },

});