import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';
import { Picker } from '@react-native-picker/picker';

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    primary: '#3B82F6',
    primaryLight: '#DBEAFE',
    success: '#059669',
    successLight: '#ECFDF5',
    warning: '#D97706',
    danger: '#DC2626',
    info: '#0891B2',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    male: '#3B82F6',
    female: '#EC4899',
  },
  spacing: { xs: 4, sm: 6, md: 8, lg: 12, xl: 16, xxl: 20 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  }
};

interface GeneralHealthRecord {
  resident_id: number;
  family_member_id: number;
  family_code: string;
  full_name: string;
  sex: string;
  age: string;
  household_number: string;
  sitio_id: number | null;
  sitio_name: string | null;
}

interface Quarter {
  quarter_id: number;
  quarter_name: string;
  quarter_number: number;
  year: number;
}

interface Filters {
  quarter_id: number | null;
  sitio_name: string | null;
  sex: string | null;
}

// ✅ IMPROVED Filter Modal with Dropdowns
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
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
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
    const cleared: Filters = {
      quarter_id: null,
      sitio_name: null,
      sex: null,
    };
    setTempFilters(cleared);
    onFiltersChange(cleared);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.filterModalOverlay}>
        <View style={styles.filterModalContent}>
          <View style={styles.filterModalHeader}>
            <ThemedText style={styles.filterModalTitle}>Filter Records</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterModalBody} showsVerticalScrollIndicator={false}>
            {/* Quarter Filter */}
            <View style={styles.filterRow}>
              <ThemedText style={styles.filterLabel}>Quarter</ThemedText>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={tempFilters.quarter_id}
                  onValueChange={(value) => setTempFilters({ ...tempFilters, quarter_id: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="All Quarters" value={null} />
                  {quarters.map((q) => (
                    <Picker.Item 
                      key={q.quarter_id} 
                      label={`${q.quarter_name}`}
                      value={q.quarter_id} 
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Sex Filter - Dropdown */}
            <View style={styles.filterRow}>
              <ThemedText style={styles.filterLabel}>Sex</ThemedText>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={tempFilters.sex || 'all'}
                  onValueChange={(value) => setTempFilters({
                    ...tempFilters,
                    sex: value === 'all' ? null : value
                  })}
                  style={styles.picker}
                >
                  <Picker.Item label="All" value="all" />
                  <Picker.Item label="Male" value="Male" />
                  <Picker.Item label="Female" value="Female" />
                </Picker>
              </View>
            </View>

            {/* Sitio Filter - Dropdown */}
            {sitios.length > 0 && (
              <View style={styles.filterRow}>
                <ThemedText style={styles.filterLabel}>Sitio/Purok</ThemedText>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={tempFilters.sitio_name || 'all'}
                    onValueChange={(value) => setTempFilters({
                      ...tempFilters,
                      sitio_name: value === 'all' ? null : value
                    })}
                    style={styles.picker}
                  >
                    <Picker.Item label="All Sitios" value="all" />
                    {sitios.map((sitio) => (
                      <Picker.Item key={sitio} label={sitio} value={sitio} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.filterModalActions}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <ThemedText style={styles.clearButtonText}>Clear All</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <ThemedText style={styles.applyButtonText}>Apply Filters</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

FilterModal.displayName = 'FilterModal';

//  SIMPLIFIED Record Card Component
const RecordCard = memo(({ 
  item, 
  onPress 
}: { 
  item: GeneralHealthRecord; 
  onPress: (id: number) => void;
}) => {
  const isMale = item.sex.toLowerCase() === 'male';
  
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item.family_member_id)}
      activeOpacity={0.7}
    >
      {/* Header Row - Household No & Gender */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: isMale ? theme.colors.primaryLight : '#FDF2F8' }
          ]}>
            <Ionicons
              name={isMale ? 'male' : 'female'}
              size={18}
              color={isMale ? theme.colors.male : theme.colors.female}
            />
          </View>
           {/* Name */}
            <ThemedText style={styles.fullName}>{item.full_name}</ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} /> 
      </View>

      
      <ThemedText style={styles.householdNumber}>{item.household_number} | {item.family_code}</ThemedText>

      {/* Meta Row - Family Code, Sex, Age */}
      <View style={styles.metaRow}>
        {/* <View style={styles.metaItem}>
          <Ionicons name="pricetag-outline" size={14} color={theme.colors.primary} />
          <ThemedText style={styles.metaText}>{item.family_code}</ThemedText>
        </View> */}
        
        {/* <View style={styles.metaItem}>
          <Ionicons 
            name={isMale ? 'male' : 'female'} 
            size={14} 
            color={isMale ? theme.colors.male : theme.colors.female} 
          />
          <ThemedText style={[
            styles.metaText,
            { color: isMale ? theme.colors.male : theme.colors.female }
          ]}>
            {item.sex}
          </ThemedText>
        </View> */}

        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
          <ThemedText style={styles.metaText}>Age: {item.age}</ThemedText>
        </View>

        {item.sitio_name && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
            <ThemedText style={styles.metaText}>{item.sitio_name}</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return prevProps.item.family_member_id === nextProps.item.family_member_id;
});

RecordCard.displayName = 'RecordCard';

export default function GeneralHealthListScreen() {
  const router = useRouter();
  const [allRecords, setAllRecords] = useState<GeneralHealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [quarters, setQuarters] = useState<Quarter[]>([]);
  const [sitios, setSitios] = useState<string[]>([]);

  const [filters, setFilters] = useState<Filters>({
    quarter_id: null,
    sitio_name: null,
    sex: null,
  });

  // Filtered records
  const filteredRecords = useMemo(() => {
    let result = [...allRecords];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(record =>
        record.full_name.toLowerCase().includes(query) ||
        record.family_code.toLowerCase().includes(query) ||
        record.household_number.toLowerCase().includes(query) ||
        record.age.toLowerCase().includes(query) ||
        `R${record.resident_id.toString().padStart(5, '0')}`.toLowerCase().includes(query)
      );
    }

    // Sitio filter
    if (filters.sitio_name) {
      result = result.filter(record => record.sitio_name === filters.sitio_name);
    }

    // Sex filter
    if (filters.sex) {
      result = result.filter(record => record.sex.toLowerCase() === filters.sex!.toLowerCase());
    }

    return result;
  }, [allRecords, filters, searchQuery]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.quarter_id) count++;
    if (filters.sex) count++;
    if (filters.sitio_name) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [filters, searchQuery]);

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch quarters and records in parallel
      const [quartersRes, recordsRes] = await Promise.all([
        fetch(`${API_BASE_URL}${API_ENDPOINTS.QUARTERS}`),
        fetch(`${API_BASE_URL}${API_ENDPOINTS.GENERAL_HEALTH_LIST}?limit=500${filters.quarter_id ? `&quarter_id=${filters.quarter_id}` : ''}`)
      ]);

      const quartersData = await quartersRes.json();
      const recordsData = await recordsRes.json();

      // Set quarters
      if (Array.isArray(quartersData)) {
        setQuarters(quartersData);
      } else if (quartersData.results) {
        setQuarters(quartersData.results);
      }

      // Set records
      if (recordsData.success) {
        setAllRecords(recordsData.data || []);

        // Extract unique sitios
        const uniqueSitios = Array.from(
          new Set(
            recordsData.data
              .map((r: GeneralHealthRecord) => r.sitio_name)
              .filter((s: string | null) => s !== null)
          )
        ).sort() as string[];
        setSitios(uniqueSitios);

        console.log(`✅ Loaded ${recordsData.count} general health records`);
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters.quarter_id]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
  }, [loadAllData]);

  const handleRecordPress = useCallback((familyMemberId: number) => {
    router.push(`/(bhw)/general-health/${familyMemberId}` as any);
  }, [router]);

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({ quarter_id: null, sitio_name: null, sex: null });
    setSearchQuery('');
  }, []);

  const handleBackPress = () => {
    router.push('/(bhw)/menu');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="General Health Information" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading records...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="General Health Information" onBackPress={handleBackPress} />

      {/* Search & Filter Header */}
      <View style={styles.headerSection}>
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={theme.colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, family code..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={theme.colors.textMuted}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons
              name="options-outline"
              size={18}
              color={activeFilterCount > 0 ? '#FFFFFF' : theme.colors.primary}
            />
            {activeFilterCount > 0 && (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>{activeFilterCount}</ThemedText>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <View style={styles.activeFilters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            {searchQuery && (
              <View style={styles.filterChip}>
                <ThemedText style={styles.filterChipText}>Search: {searchQuery}</ThemedText>
              </View>
            )}
            {filters.quarter_id && (
              <View style={styles.filterChip}>
                <ThemedText style={styles.filterChipText}>
                  Quarter: {quarters.find(q => q.quarter_id === filters.quarter_id)?.quarter_name} {quarters.find(q => q.quarter_id === filters.quarter_id)?.year}
                </ThemedText>
              </View>
            )}
            {filters.sex && (
              <View style={styles.filterChip}>
                <ThemedText style={styles.filterChipText}>Sex: {filters.sex}</ThemedText>
              </View>
            )}
            {filters.sitio_name && (
              <View style={styles.filterChip}>
                <ThemedText style={styles.filterChipText}>Sitio: {filters.sitio_name}</ThemedText>
              </View>
            )}
            <TouchableOpacity style={styles.clearAllChip} onPress={clearAllFilters}>
              <ThemedText style={styles.clearAllChipText}>Clear All</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Stats */}
      {/* <View style={styles.stats}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{allRecords.length}</ThemedText>
          <ThemedText style={styles.statLabel}>Total</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: theme.colors.male }]}>
            {allRecords.filter(r => r.sex.toLowerCase() === 'male').length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Male</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: theme.colors.female }]}>
            {allRecords.filter(r => r.sex.toLowerCase() === 'female').length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Female</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: theme.colors.success }]}>
            {filteredRecords.length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Showing</ThemedText>
        </View>
      </View> */}

      {/* Records List */}
      <FlatList
        data={filteredRecords}
        keyExtractor={item => item.family_member_id.toString()}
        renderItem={({ item }) => <RecordCard item={item} onPress={handleRecordPress} />}
        contentContainerStyle={[
          styles.listContent,
          filteredRecords.length === 0 && styles.emptyListContent
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <MaterialIcons name="health-and-safety" size={32} color={theme.colors.textMuted} />
            </View>
            <ThemedText style={styles.emptyTitle}>No Records Found</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              {activeFilterCount > 0 
                ? 'Try adjusting your filters or search query'
                : 'No general health records available'}
            </ThemedText>
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
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  headerSection: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  filterButton: {
    backgroundColor: theme.colors.borderLight,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    position: 'relative',
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.danger,
    borderRadius: 6,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  activeFilters: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    paddingVertical: theme.spacing.sm,
  },
  filtersScroll: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.sm,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  clearAllChip: {
    backgroundColor: theme.colors.danger + '20',
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  clearAllChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.danger,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.xl,
    marginVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    ...theme.shadow,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.borderLight,
    marginHorizontal: theme.spacing.lg,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 1,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 80,
    gap: theme.spacing.md,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  
  // ✅ SIMPLIFIED Card Styles
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    ...theme.shadow,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  householdNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  fullName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },

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
    backgroundColor: theme.colors.borderLight,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Filter Modal Styles
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
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
    color: theme.colors.textPrimary,
  },
  filterModalBody: {
    maxHeight: 350,
  },
  filterRow: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: theme.colors.textPrimary,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
  },
  picker: {
    color: theme.colors.textPrimary,
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
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    padding: 15,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});