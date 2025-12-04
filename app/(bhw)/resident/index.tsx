import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  View,
  TextInput,
  Modal,
  ScrollView,
  RefreshControl,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL } from '@/constants/apiConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Resident {
  resident_id: number;
  resident_code: string;
  full_name: string;
  sex: string;
  status_name: string;
  family_code: string | null;
  age?: number;
  dob?: string;
  phone_number?: string;
  barangay?: string;
}

// Filter Modal Component (Floating Style)
const FilterModal = memo(({
  visible,
  onClose,
  filters,
  onFiltersChange,
}: {
  visible: boolean;
  onClose: () => void;
  filters: {
    sex: string | null;
    status: string | null;
  };
  onFiltersChange: (filters: any) => void;
}) => {
  const [tempFilters, setTempFilters] = useState(filters);

  useEffect(() => {
    if (visible) {
      setTempFilters(filters);
    }
  }, [visible, filters]);

  const applyFilters = () => {
    onFiltersChange(tempFilters);
    onClose();
  };

  const clearFilters = () => {
    const clearedFilters = {
      sex: null,
      status: null,
    };
    setTempFilters(clearedFilters);
  };

  const sexOptions = ['Male', 'Female'];
  const statusOptions = ['Active', 'Deceased', 'Pending', 'Relocated', 'Non-Resident'];

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableOpacity 
        style={styles.filterModalOverlay} 
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          style={styles.filterModalContent}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.filterModalHeader}>
            <View style={styles.filterModalTitleRow}>
              <Ionicons name="filter" size={20} color="#0ea5e9" />
              <Text style={styles.filterModalTitle}>Filter Residents</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterModalDivider} />

          <ScrollView 
            style={styles.filterModalBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Sex Filter */}
            <View style={styles.filterSection}>
              <View style={styles.filterSectionHeader}>
                <Ionicons name="male-female" size={16} color="#64748b" />
                <Text style={styles.filterLabel}>Sex</Text>
              </View>
              <View style={styles.filterOptionsGrid}>
                <TouchableOpacity
                  style={[
                    styles.filterOptionChip,
                    tempFilters.sex === null && styles.filterOptionChipActive,
                  ]}
                  onPress={() => setTempFilters({ ...tempFilters, sex: null })}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      tempFilters.sex === null && styles.filterOptionTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {sexOptions.map((sex) => (
                  <TouchableOpacity
                    key={sex}
                    style={[
                      styles.filterOptionChip,
                      tempFilters.sex === sex && styles.filterOptionChipActive,
                    ]}
                    onPress={() => setTempFilters({ ...tempFilters, sex })}
                  >
                    <Ionicons 
                      name={sex === 'Male' ? 'male' : 'female'} 
                      size={14} 
                      color={tempFilters.sex === sex ? '#ffffff' : '#64748b'} 
                    />
                    <Text
                      style={[
                        styles.filterOptionText,
                        tempFilters.sex === sex && styles.filterOptionTextActive,
                      ]}
                    >
                      {sex}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status Filter */}
            <View style={styles.filterSection}>
              <View style={styles.filterSectionHeader}>
                <Ionicons name="information-circle" size={16} color="#64748b" />
                <Text style={styles.filterLabel}>Status</Text>
              </View>
              <View style={styles.filterOptionsGrid}>
                <TouchableOpacity
                  style={[
                    styles.filterOptionChip,
                    tempFilters.status === null && styles.filterOptionChipActive,
                  ]}
                  onPress={() => setTempFilters({ ...tempFilters, status: null })}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      tempFilters.status === null && styles.filterOptionTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {statusOptions.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterOptionChip,
                      tempFilters.status === status && styles.filterOptionChipActive,
                    ]}
                    onPress={() => setTempFilters({ ...tempFilters, status })}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        tempFilters.status === status && styles.filterOptionTextActive,
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.filterModalActions}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Ionicons name="refresh" size={16} color="#64748b" />
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Ionicons name="checkmark" size={16} color="#ffffff" />
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
});

FilterModal.displayName = 'FilterModal';

// ✅ FIXED: Enhanced Resident Card Component
const ResidentCard = memo(
  ({ item, onPress }: { item: Resident; onPress: (id: number) => void }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'Deceased':
          return '#EF4444';
        case 'Pending':
          return '#F59E0B';
        case 'Relocated':
          return '#3B82F6';
        case 'Non-Resident':
          return '#9CA3AF';
        default:
          return '#10B981';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'Deceased':
          return 'close-circle';
        case 'Pending':
          return 'time';
        case 'Relocated':
          return 'location';
        case 'Non-Resident':
          return 'person-remove';
        default:
          return 'checkmark-circle';
      }
    };

    const statusColor = getStatusColor(item.status_name);
    const statusIcon = getStatusIcon(item.status_name);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(item.resident_id)}
        activeOpacity={0.7}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardLeft}>
            <View style={[styles.iconContainer, { backgroundColor: `${statusColor}15` }]}>
              <Ionicons name="person" size={18} color={statusColor} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.codeRow}>
                <Ionicons name="barcode" size={10} color="#0ea5e9" />
                <Text style={styles.residentCode}>{item.resident_code}</Text>
              </View>
              <Text style={styles.residentName} numberOfLines={1}>
                {item.full_name}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Ionicons name={statusIcon as any} size={10} color="#ffffff" />
            <Text style={styles.statusText}>{item.status_name}</Text>
          </View>
        </View>

        {/* Card Body - More Info */}
        <View style={styles.cardBody}>
          <View style={styles.infoGrid}>
            {/* Sex */}
            <View style={styles.infoItem}>
              <View style={styles.infoIconWrapper}>
                <Ionicons 
                  name={item.sex === 'Male' ? 'male' : 'female'} 
                  size={14} 
                  color={item.sex === 'Male' ? '#3B82F6' : '#EC4899'} 
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Sex</Text>
                <Text style={styles.infoValue}>{item.sex}</Text>
              </View>
            </View>

            {/* Age (if available) */}
            {item.age !== undefined && (
              <View style={styles.infoItem}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="calendar" size={14} color="#8B5CF6" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Age</Text>
                  <Text style={styles.infoValue}>{item.age} years</Text>
                </View>
              </View>
            )}

            {/* Family Code */}
            {item.family_code && (
              <View style={styles.infoItem}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="home" size={14} color="#F59E0B" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Family</Text>
                  <Text style={styles.infoValue}>{item.family_code}</Text>
                </View>
              </View>
            )}

            {/* Phone (if available) */}
            {item.phone_number && (
              <View style={styles.infoItem}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="call" size={14} color="#10B981" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{item.phone_number}</Text>
                </View>
              </View>
            )}

            {/* Barangay (if available) */}
            {item.barangay && (
              <View style={styles.infoItem}>
                <View style={styles.infoIconWrapper}>
                  <Ionicons name="location" size={14} color="#EF4444" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Barangay</Text>
                  <Text style={styles.infoValue}>{item.barangay}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Arrow */}
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#cbd5e1"
          style={styles.cardArrow}
        />
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.resident_id === nextProps.item.resident_id &&
      prevProps.item.status_name === nextProps.item.status_name
    );
  }
);

ResidentCard.displayName = 'ResidentCard';

export default function ResidentListScreen() {
  const router = useRouter();
  const [allResidents, setAllResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [filters, setFilters] = useState({
    sex: null as string | null,
    status: null as string | null,
  });

  // Memoized filtered residents
  const filteredResidents = useMemo(() => {
    let filtered = [...allResidents];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (resident) =>
          resident.full_name.toLowerCase().includes(query) ||
          resident.resident_code.toLowerCase().includes(query) ||
          resident.family_code?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.sex) {
      filtered = filtered.filter((resident) => resident.sex === filters.sex);
    }

    if (filters.status) {
      filtered = filtered.filter((resident) => resident.status_name === filters.status);
    }

    return filtered;
  }, [allResidents, filters, searchQuery]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.sex) count++;
    if (filters.status) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [filters, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredResidents.length;
    const male = filteredResidents.filter((r) => r.sex === 'Male').length;
    const female = filteredResidents.filter((r) => r.sex === 'Female').length;

    return { total, male, female };
  }, [filteredResidents]);

  // Load data
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/household_api/residents/`);
      const data = await response.json();

      if (data.residents) {
        setAllResidents(data.residents);
      }
    } catch (error) {
      console.error('Error fetching residents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, [loadAllData]);

  const handleResidentPress = useCallback((residentId: number) => {
    // Navigate to resident detail screen if you have one
    console.log('Navigate to resident:', residentId);
  }, []);

  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      sex: null,
      status: null,
    });
    setSearchQuery('');
  }, []);

  const handleBackPress = useCallback(() => {
    router.push('/(bhw)/menu');
  }, [router]);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ✅ OPTIMIZED: Render functions with proper extraction
  const renderResident = useCallback(
    ({ item }: { item: Resident }) => (
      <ResidentCard item={item} onPress={handleResidentPress} />
    ),
    [handleResidentPress]
  );

  const keyExtractor = useCallback((item: Resident) => `resident-${item.resident_id}`, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 160, // Approximate height of your card
      offset: 160 * index,
      index,
    }),
    []
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Residents" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Loading residents...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Residents" onBackPress={handleBackPress} />

      {/* Search & Filter Header */}
      <View style={styles.headerSection}>
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={16} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search residents..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94a3b8"
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilterCount > 0 && styles.filterButtonActive,
            ]}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons
              name="filter"
              size={16}
              color={activeFilterCount > 0 ? '#ffffff' : '#0ea5e9'}
            />
            {activeFilterCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <View style={styles.activeFilters}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {searchQuery.trim() && (
              <View style={styles.filterChip}>
                <Ionicons name="search" size={10} color="#475569" />
                <Text style={styles.filterChipText}>&quot;{searchQuery}&quot;</Text>
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close" size={12} color="#475569" />
                </TouchableOpacity>
              </View>
            )}
            {filters.sex && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>Sex: {filters.sex}</Text>
                <TouchableOpacity
                  onPress={() => setFilters({ ...filters, sex: null })}
                >
                  <Ionicons name="close" size={12} color="#475569" />
                </TouchableOpacity>
              </View>
            )}
            {filters.status && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>Status: {filters.status}</Text>
                <TouchableOpacity
                  onPress={() => setFilters({ ...filters, status: null })}
                >
                  <Ionicons name="close" size={12} color="#475569" />
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={styles.clearAllChip}
              onPress={clearAllFilters}
            >
              <Text style={styles.clearAllChipText}>Clear all</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.male}</Text>
          <Text style={styles.statLabel}>Male</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.female}</Text>
          <Text style={styles.statLabel}>Female</Text>
        </View>
      </View>

      {/* Residents List */}
      <FlatList
        data={filteredResidents}
        renderItem={renderResident}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          filteredResidents.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#0ea5e9']}
            tintColor="#0ea5e9"
          />
        }
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
        removeClippedSubviews={Platform.OS === 'android'}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="people-outline" size={32} color="#cbd5e1" />
            </View>
            <Text style={styles.emptyTitle}>No Residents Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || filters.sex || filters.status
                ? 'Try adjusting your search or filters'
                : 'No residents have been added yet'}
            </Text>
            {(searchQuery || filters.sex || filters.status) && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={clearAllFilters}
              >
                <Text style={styles.emptyButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },

  // Header Section
  headerSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '500',
  },
  filterButton: {
    backgroundColor: '#f1f5f9',
    borderColor: '#0ea5e9',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    position: 'relative',
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#0ea5e9',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 6,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },

  // Active Filters
  activeFilters: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 6,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    gap: 6,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 3,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#475569',
  },
  clearAllChip: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  clearAllChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#dc2626',
  },

  // Stats
  stats: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
    fontWeight: '500',
  },

  // List
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
    gap: 8,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  // Enhanced Card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  residentCode: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0ea5e9',
    textTransform: 'uppercase',
  },
  residentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cardBody: {
    gap: 8,
  },
  infoGrid: {
    gap: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  cardArrow: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#f8fafc',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Floating Filter Modal
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  filterModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  filterModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModalDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 20,
  },
  filterModalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOptionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    gap: 6,
  },
  filterOptionChipActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  filterOptionText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  filterOptionTextActive: {
    color: '#ffffff',
  },
  filterModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 10,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  applyButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
  },
});