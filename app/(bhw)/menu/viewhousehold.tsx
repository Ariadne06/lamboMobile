import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL } from '@/constants/apiConfig';

interface Household {
  household_id: number;
  household_number: string;
  household_head: string | null;
  full_address: string;
  is_visited: boolean;
  date_visited: string | null;
  visited_by: string | null;
  is_active: boolean;
  deactivation_reason: string | null;
  deactivated_by: string | null;
  created_by: string | null;
  quarter_id: number | null;
}

//  OPTIMIZED: Memoized household card component
const HouseholdCard = memo(({ 
  item, 
  onPress 
}: { 
  item: Household; 
  onPress: (id: number) => void;
}) => {
  const getQuarterText = useCallback((quarterId: number | null): string => {
    if (!quarterId) return 'Live';
    return `Q${quarterId}`;
  }, []);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item.household_id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.householdInfo}>
          <View style={styles.headerRow}>
            <ThemedText style={styles.householdId}>{item.household_number}</ThemedText>
            <View style={[
              styles.quarterBadge,
              item.quarter_id ? styles.historicalBadge : styles.liveBadge
            ]}>
              <ThemedText style={styles.quarterText}>
                {getQuarterText(item.quarter_id)}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={styles.householdHead}>
            Head: {item.household_head || 'Not assigned'}
          </ThemedText>
          <ThemedText style={styles.location} numberOfLines={2}>
            {item.full_address}
          </ThemedText>
        </View>
        <View style={styles.rightSection}>
          <View style={[
            styles.statusBadge, 
            item.is_visited ? styles.visitedBadge : styles.notVisitedBadge
          ]}>
            <Ionicons 
              name={item.is_visited ? 'checkmark-circle' : 'time-outline'} 
              size={14} 
              color="#FFFFFF" 
            />
            <ThemedText style={styles.statusText}>
              {item.is_visited ? 'Visited' : 'Pending'}
            </ThemedText>
          </View>
          {item.is_active ? (
            <View style={styles.activeBadge}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#10B981" />
              <ThemedText style={styles.activeText}>Active</ThemedText>
            </View>
          ) : (
            <View style={styles.inactiveBadge}>
              <Ionicons name="close-circle-outline" size={14} color="#EF4444" />
              <ThemedText style={styles.inactiveText}>Inactive</ThemedText>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.dateInfo}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <ThemedText style={styles.dateText}>
            {item.date_visited 
              ? `Visited: ${new Date(item.date_visited).toLocaleDateString()}` 
              : 'Not visited yet'}
          </ThemedText>
        </View>
        {item.created_by && (
          <View style={styles.creatorInfo}>
            <Ionicons name="person-outline" size={14} color="#6B7280" />
            <ThemedText style={styles.creatorText}>By: {item.created_by}</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  //  Custom comparison function - only re-render if data changes
  return (
    prevProps.item.household_id === nextProps.item.household_id &&
    prevProps.item.is_visited === nextProps.item.is_visited &&
    prevProps.item.is_active === nextProps.item.is_active
  );
});

HouseholdCard.displayName = 'HouseholdCard';

export default function ViewHouseholds() {
  const router = useRouter();
  
  //  State management
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  //  Pagination state
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  //  Fetch households with pagination
  const fetchHouseholds = useCallback(async (isLoadMore = false) => {
    if (loadingMore && isLoadMore) return;
    
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    const currentOffset = isLoadMore ? offset : 0;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      console.log(` Fetching households: limit=${LIMIT}, offset=${currentOffset}`);
      
      const response = await fetch(
        `${API_BASE_URL}/household_api/households/?limit=${LIMIT}&offset=${currentOffset}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        const newHouseholds = data.data || [];
        
        if (isLoadMore) {
          setHouseholds(prev => [...prev, ...newHouseholds]);
          setOffset(prev => prev + LIMIT);
        } else {
          setHouseholds(newHouseholds);
          setOffset(LIMIT);
        }

        setHasMore(data.has_more !== false && newHouseholds.length === LIMIT);
        
        console.log(`Loaded ${newHouseholds.length} households`);
      } else {
        throw new Error(data.message || 'Failed to load households');
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      
      if (error.name === 'AbortError') {
        Alert.alert(
          'Connection Timeout',
          'The request took too long. Please check your internet connection and try again.'
        );
      } else {
        Alert.alert(
          'Error',
          `Failed to load households:\n${error.message || 'Unknown error'}\n\nPlease try again.`
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
      clearTimeout(timeoutId);
    }
  }, [offset, loadingMore]);

  //  Initial fetch
  useEffect(() => {
    fetchHouseholds(false);
  }, []);

  //  Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setOffset(0);
    setHasMore(true);
    fetchHouseholds(false);
  }, [fetchHouseholds]);

  //  Handle load more
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading && !loadingMore) {
      fetchHouseholds(true);
    }
  }, [hasMore, loading, loadingMore, fetchHouseholds]);

  //  Memoized navigation handler
  const handleCardPress = useCallback((householdId: number) => {
    router.push(`/(bhw)/household/${householdId}`);
  }, [router]);

  //  Client-side filtering (only for search)
  const filteredHouseholds = useCallback(() => {
    if (!searchQuery) return households;
    
    const query = searchQuery.toLowerCase();
    return households.filter((household) => 
      household.household_number?.toLowerCase().includes(query) ||
      household.household_head?.toLowerCase().includes(query) ||
      household.full_address?.toLowerCase().includes(query)
    );
  }, [households, searchQuery])();

  //  Memoized render item
  const renderHouseholdCard = useCallback(({ item }: { item: Household }) => (
    <HouseholdCard item={item} onPress={handleCardPress} />
  ), [handleCardPress]);

  //  Key extractor
  const keyExtractor = useCallback((item: Household) => 
    `household-${item.household_id}`, 
  []);

  // Get item layout for better performance
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 180, 
    offset: 180 * index,
    index,
  }), []);

  // Render footer
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color="#FF3D33" />
        <ThemedText style={styles.footerText}>Loading more...</ThemedText>
      </View>
    );
  }, [loadingMore]);

  // Render empty component
  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="home-outline" size={80} color="#D1D5DB" />
      <ThemedText style={styles.emptyText}>
        {searchQuery 
          ? 'No households found matching your search' 
          : households.length === 0
            ? 'No households registered yet'
            : 'No households match your filter'}
      </ThemedText>
      {searchQuery && (
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={() => setSearchQuery('')}
        >
          <ThemedText style={styles.clearButtonText}>Clear Search</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  ), [searchQuery, households.length]);

  if (loading && households.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Household List" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3D33" />
          <ThemedText style={styles.loadingText}>Loading households...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Household List" />
      
      <View style={styles.content}>
        <View style={styles.header}>
          {/* Stats Summary */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{households.length}</ThemedText>
              <ThemedText style={styles.statLabel}>Loaded</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: '#10B981' }]}>
                {households.filter(h => h.is_visited).length}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Visited</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: '#F59E0B' }]}>
                {households.filter(h => !h.is_visited).length}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Pending</ThemedText>
            </View>
          </View>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search households..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* PTIMIZED FlatList */}
        <FlatList
          data={filteredHouseholds}
          renderItem={renderHouseholdCard}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#FF3D33']}
              tintColor="#FF3D33"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          // Performance optimizations
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
          removeClippedSubviews={true}
          // Prevent unnecessary re-renders
          extraData={searchQuery}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF3D33',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
  },
  list: {
    gap: 12,
    paddingBottom: 20,
  },
  footerLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  card: {
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
    minHeight: 170, 
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  householdInfo: {
    flex: 1,
    marginRight: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  householdId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3D33',
    marginBottom: 4,
  },
  householdHead: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  location: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  visitedBadge: {
    backgroundColor: '#10B981',
  },
  notVisitedBadge: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  inactiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inactiveText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  cardFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  creatorText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
  clearButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FF3D33',
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  quarterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveBadge: {
    backgroundColor: '#3B82F6',
  },
  historicalBadge: {
    backgroundColor: '#8B5CF6',
  },
  quarterText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});