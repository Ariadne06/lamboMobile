import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import CustomHeader from '@/components/ui/CustomHeader';
import { ThemedText } from '@/components/ThemedText';
import { API_BASE_URL } from '@/constants/apiConfig';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Household {
  household_id: number;
  household_number: string;
  household_head: string;
  full_address: string;
  is_visited: boolean;
  date_visited: string | null;
  visited_by: string | null;
  quarter_id: number;
  created_by: string | null;
  is_active: boolean;
}

interface Quarter {
  quarter_id: number;
  quarter_name: string;
  quarter_number: number;
  year: number;
}

interface Sitio {
  sitio_id: number;
  sitio_name: string;
}

// Minimal Filter Modal Component
const FilterModal = memo(({ 
  visible, 
  onClose, 
  filters, 
  onFiltersChange,
  quarters,
  sitios 
}: {
  visible: boolean;
  onClose: () => void;
  filters: {
    quarter_id: number | null;
    sitio_name: string | null;
    visit_status: 'all' | 'visited' | 'not_visited';
  };
  onFiltersChange: (filters: any) => void;
  quarters: Quarter[];
  sitios: string[];
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
      quarter_id: null,
      sitio_name: null,
      visit_status: 'all' as const,
    };
    setTempFilters(clearedFilters);
  };

FilterModal.displayName = 'FilterModal';

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.filterModalOverlay}>
        <View style={styles.filterModalContent}>
          {/* Simple Header */}
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterModalBody}>
            {/* Quarter Filter */}
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Quarter</Text>
              <View style={styles.filterPickerContainer}>
                <Picker
                  selectedValue={tempFilters.quarter_id}
                  onValueChange={(value) => setTempFilters(prev => ({ ...prev, quarter_id: value }))}
                  style={styles.filterPicker}
                >
                  <Picker.Item label="All Quarters" value={null} />
                  {quarters.map(quarter => (
                    <Picker.Item 
                      key={quarter.quarter_id}
                      label={`${quarter.quarter_name}`}
                      value={quarter.quarter_id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Sitio Filter */}
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Sitio</Text>
              <View style={styles.filterPickerContainer}>
                <Picker
                  selectedValue={tempFilters.sitio_name}
                  onValueChange={(value) => setTempFilters(prev => ({ ...prev, sitio_name: value }))}
                  style={styles.filterPicker}
                >
                  <Picker.Item label="All Sitios" value={null} />
                  {sitios.map((sitio, index) => (
                    <Picker.Item 
                      key={`${sitio}-${index}`}
                      label={sitio}
                      value={sitio}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Visit Status Filter */}
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Visit Status</Text>
              <View style={styles.filterPickerContainer}>
                <Picker
                  selectedValue={tempFilters.visit_status}
                  onValueChange={(value) => setTempFilters(prev => ({ ...prev, visit_status: value }))}
                  style={styles.filterPicker}
                >
                  <Picker.Item label="All Status" value="all" />
                  <Picker.Item label="Visited" value="visited" />
                  <Picker.Item label="Not Visited" value="not_visited" />
                </Picker>
              </View>
            </View>
          </ScrollView>

          {/* Simple Actions */}
          <View style={styles.filterModalActions}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

// Enhanced Household Card Component
const HouseholdCard = memo(({ 
  item, 
  onPress 
}: { 
  item: Household; 
  onPress: (id: number) => void;
}) => {
  const sitioName = useMemo(() => {
    const addressParts = item.full_address.split(', ');
    return addressParts.length >= 2 ? addressParts[1].replace('Sitio ', '') : '';
  }, [item.full_address]);

  const formatDate = useMemo(() => {
    if (!item.date_visited) return null;
    return new Date(item.date_visited).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [item.date_visited]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item.household_id)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="home" size={18} color="#0ea5e9" />
          </View>
          <View>
            <Text style={styles.householdNumber}>{item.household_number}</Text>
            <Text style={styles.householdHead} numberOfLines={1}>
              {item.household_head || 'No head assigned'}
            </Text>
          </View>
        </View>
        
        <View style={[
          styles.statusBadge,
          item.is_visited ? styles.visitedBadge : styles.pendingBadge
        ]}>
          <Ionicons 
            name={item.is_visited ? "checkmark-circle" : "time-outline"} 
            size={12} 
            color="#ffffff" 
          />
          <Text style={styles.statusText}>
            {item.is_visited ? 'Visited' : 'Pending'}
          </Text>
        </View>
      </View>

      {/* Address */}
      <View style={styles.addressContainer}>
        <Ionicons name="location-outline" size={14} color="#64748b" />
        <Text style={styles.address} numberOfLines={2}>
          {item.full_address}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.footerRow}>
          {/* Added by */}
          {item.created_by && (
            <View style={styles.createdInfo}>
              <Ionicons name="person-add-outline" size={12} color="#64748b" />
              <Text style={styles.createdByText}>Added by {item.created_by}</Text>
            </View>
          )}
          
          {/* Date visited (if visited) - Now same color as "added by" */}
          {item.is_visited && formatDate && (
            <View style={styles.dateInfo}>
              <Ionicons name="calendar-outline" size={12} color="#64748b" />
              <Text style={styles.dateText}>{formatDate}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return prevProps.item.household_id === nextProps.item.household_id &&
         prevProps.item.is_visited === nextProps.item.is_visited &&
         prevProps.item.date_visited === nextProps.item.date_visited;
});

HouseholdCard.displayName = 'HouseholdCard';

export default function ViewHouseholds() {
  const [allHouseholds, setAllHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [quarters, setQuarters] = useState<Quarter[]>([]);
  const [sitios, setSitios] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [filters, setFilters] = useState({
    quarter_id: null as number | null,
    sitio_name: null as string | null,
    visit_status: 'all' as 'all' | 'visited' | 'not_visited',
  });

  // Memoized filtered households with search
  const filteredHouseholds = useMemo(() => {
    let filtered = [...allHouseholds];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(h => 
        h.household_number.toLowerCase().includes(query) ||
        h.household_head?.toLowerCase().includes(query) ||
        h.full_address.toLowerCase().includes(query) ||
        h.visited_by?.toLowerCase().includes(query) ||
        h.created_by?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.quarter_id) {
      filtered = filtered.filter(h => h.quarter_id === filters.quarter_id);
    }

    if (filters.sitio_name) {
      filtered = filtered.filter(h => 
        h.full_address.toLowerCase().includes(filters.sitio_name!.toLowerCase())
      );
    }

    if (filters.visit_status !== 'all') {
      filtered = filtered.filter(h => {
        if (filters.visit_status === 'visited') return h.is_visited;
        if (filters.visit_status === 'not_visited') return !h.is_visited;
        return true;
      });
    }

    return filtered;
  }, [allHouseholds, filters, searchQuery]);

  // Active filter count (including search)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.quarter_id) count++;
    if (filters.sitio_name) count++;
    if (filters.visit_status !== 'all') count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [filters, searchQuery]);

  // Load all data
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);

      const householdResponse = await fetch(
        `${API_BASE_URL}/household_api/households/?limit=1000&offset=0`
      );
      
      if (!householdResponse.ok) {
        throw new Error(`HTTP ${householdResponse.status}`);
      }

      const householdData = await householdResponse.json();
      
      const [quartersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/household_api/quarters/`)
      ]);

      const quartersData = await quartersRes.json();

      setAllHouseholds(householdData.data || []);
      setQuarters(quartersData || []);
      
      // Extract unique sitios
      const uniqueSitios = new Set<string>();
      householdData.data?.forEach((household: Household) => {
        const addressParts = household.full_address.split(', ');
        if (addressParts.length >= 2) {
          const sitio = addressParts[1].replace('Sitio ', '');
          uniqueSitios.add(sitio);
        }
      });
      setSitios(Array.from(uniqueSitios).sort());

    } catch (error) {
      console.error('❌ Failed to load households:', error);
      Alert.alert('Error', 'Failed to load households. Please try again.');
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

  const handleHouseholdPress = useCallback((householdId: number) => {
    router.push(`/(bhw)/household/${householdId}` as any);
  }, []);

  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({ 
      quarter_id: null, 
      sitio_name: null, 
      visit_status: 'all' 
    });
    setSearchQuery('');
  }, []);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Render functions
  const renderHousehold = useCallback(({ item }: { item: Household }) => (
    <HouseholdCard item={item} onPress={handleHouseholdPress} />
  ), [handleHouseholdPress]);

  const keyExtractor = useCallback((item: Household) => 
    item.household_id.toString(), []
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Households" showBackButton={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Loading households...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Households" showBackButton={false} />
      
      {/* Minimal Search and Actions */}
      <View style={styles.headerSection}>
        {/* Compact Search Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={14} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search households..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94a3b8"
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={14} color="#64748b" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Filter Button beside search */}
          <TouchableOpacity 
            style={[
              styles.filterButton,
              activeFilterCount > 0 && styles.filterButtonActive
            ]} 
            onPress={() => setShowFilters(true)}
          >
            <Ionicons 
              name="options-outline" 
              size={16} 
              color={activeFilterCount > 0 ? "#ffffff" : "#0ea5e9"} 
            />
            {/* red circle filter badge */}
            {/* {activeFilterCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeFilterCount}</Text>
              </View>
            )} */}
          </TouchableOpacity>
        </View>

        {/* Add Button - Now matches header color */}
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => router.push('/(bhw)/menu/addhousehold' as any)}
        >
          <Ionicons name="add" size={16} color="#ffffff" />
          <Text style={styles.addButtonText}>Add Household</Text>
        </TouchableOpacity>
      </View>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <View style={styles.activeFilters}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {searchQuery && (
              <View style={styles.filterChip}>
                <Ionicons name="search" size={10} color="#64748b" />
                <Text style={styles.filterChipText}>&quot;{searchQuery}&quot;</Text>
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close" size={10} color="#64748b" />
                </TouchableOpacity>
              </View>
            )}
            {filters.quarter_id && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>
                  {quarters.find(q => q.quarter_id === filters.quarter_id)?.quarter_name}
                </Text>
                <TouchableOpacity onPress={() => setFilters(prev => ({ ...prev, quarter_id: null }))}>
                  <Ionicons name="close" size={10} color="#64748b" />
                </TouchableOpacity>
              </View>
            )}
            {filters.sitio_name && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>{filters.sitio_name}</Text>
                <TouchableOpacity onPress={() => setFilters(prev => ({ ...prev, sitio_name: null }))}>
                  <Ionicons name="close" size={10} color="#64748b" />
                </TouchableOpacity>
              </View>
            )}
            {filters.visit_status !== 'all' && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>
                  {filters.visit_status === 'visited' ? 'Visited' : 'Pending'}
                </Text>
                <TouchableOpacity onPress={() => setFilters(prev => ({ ...prev, visit_status: 'all' }))}>
                  <Ionicons name="close" size={10} color="#64748b" />
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={styles.clearAllChip} onPress={clearAllFilters}>
              <Text style={styles.clearAllChipText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Simple Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{filteredHouseholds.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10b981' }]}>
            {filteredHouseholds.filter(h => h.is_visited).length}
          </Text>
          <Text style={styles.statLabel}>Visited</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#f59e0b' }]}>
            {filteredHouseholds.filter(h => !h.is_visited).length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Households List */}
      <FlatList
        data={filteredHouseholds}
        renderItem={renderHousehold}
        keyExtractor={keyExtractor}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          filteredHouseholds.length === 0 && styles.emptyListContent
        ]}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={15}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <MaterialIcons name="home" size={48} color="#cbd5e1" />
            </View>
            <Text style={styles.emptyTitle}>
              {activeFilterCount > 0 
                ? 'No households match your criteria'
                : 'No households found'
              }
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeFilterCount > 0 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first household'
              }
            </Text>
            {activeFilterCount > 0 && (
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
        quarters={quarters}
        sitios={sitios}
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

  // Minimal Header Section
  headerSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 10,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3D33', // Changed to match header color
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
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

  // Simple Stats
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
    gap: 6,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  // Enhanced Card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 14,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    backgroundColor: '#f0f9ff',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  householdNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0ea5e9',
    marginBottom: 1,
  },
  householdHead: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  visitedBadge: {
    backgroundColor: '#10b981',
  },
  pendingBadge: {
    backgroundColor: '#f59e0b',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    marginBottom: 10,
  },
  address: {
    flex: 1,
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  createdInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  createdByText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '400',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dateText: {
    fontSize: 11,
    color: '#64748b', // Changed to match "added by" color
    fontWeight: '400', // Changed to match "added by" weight
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

  // Basic Filter Modal Styles
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  filterModalBody: {
    maxHeight: 300,
  },
  filterRow: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  filterPickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  filterPicker: {
    height: 50,
  },
  filterModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  clearButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});