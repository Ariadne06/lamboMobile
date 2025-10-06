import React, { useState, useEffect } from 'react';
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
  is_active: boolean;
  created_by: string | null;
}

export default function ViewHouseholds() {
  const router = useRouter();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch households on mount
  useEffect(() => {
    fetchHouseholds();
  }, []);

  const fetchHouseholds = async () => {
    try {  
      const response = await fetch(`${API_BASE_URL}/household_api/households/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setHouseholds(data.data || []);
        console.log(` Loaded ${data.count} households`);
      } else {
        Alert.alert('Error', data.message || 'Failed to load households');
      }
    } catch (error) {
      console.error(' Fetch error:', error);
      Alert.alert('Error', 'Failed to load households. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHouseholds();
  };

  // Filter households based on search query (frontend filtering)
  const filteredHouseholds = households.filter((household) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      household.household_number?.toLowerCase().includes(query) ||
      household.household_head?.toLowerCase().includes(query) ||
      household.full_address?.toLowerCase().includes(query)
    );
  });

  const renderHouseholdCard = ({ item }: { item: Household }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        // TODO: Navigate to household details
        Alert.alert('Household Details', `Household #${item.household_number}\n\nHead: ${item.household_head || 'Not assigned'}\nAddress: ${item.full_address}`);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.householdInfo}>
          <ThemedText style={styles.householdId}>{item.household_number}</ThemedText>
          <ThemedText style={styles.householdHead}>
            Head: {item.household_head || 'Not assigned'}
          </ThemedText>
          <ThemedText style={styles.location}>{item.full_address}</ThemedText>
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

  if (loading) {
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
              <ThemedText style={styles.statLabel}>Total</ThemedText>
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

        {/* Household List */}
        {filteredHouseholds.length === 0 ? (
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
        ) : (
          <FlatList
            data={filteredHouseholds}
            renderItem={renderHouseholdCard}
            keyExtractor={(item) => item.household_id.toString()}
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
          />
        )}
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
});