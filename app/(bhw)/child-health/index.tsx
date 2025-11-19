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

interface ChildHealthRecord {
  child_health_id: number;
  child_id: number;
  child_full_name: string;
  sex: string;
  dob: string;
  age: string;
  family_code: string | null;
  feeding_method_name: string | null;
  tt_status_name: string | null;
  tt_status_date: string | null;
  created_at: string;
}

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#2563EB',
    primaryLight: '#EFF6FF',
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#EF4444',
    info: '#3B82F6',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    male: '#3B82F6',
    female: '#EC4899',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

export default function ChildHealthListScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<ChildHealthRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchChildHealthRecords();
  }, []);

  const handleBackPress = () => {
    router.push('/(bhw)/menu');
  };

  const handleAddChild = () => {
    router.push('/(bhw)/child-health/create-child-health-record');
  };

  const fetchChildHealthRecords = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `${API_BASE_URL}/household_api/child-health-records/?limit=1000`
      );
      const data = await response.json();

      if (data.success) {
        setRecords(data.data || []);
        console.log(`Loaded ${data.count || 0} child health records`);
      }
    } catch (error) {
      console.error('Failed to load child health records:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchChildHealthRecords();
  };

  const handleCardPress = (childHealthId: number) => {
    router.push(`/(bhw)/child-health/${childHealthId}` as any);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredRecords = records.filter(record => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    const childName = (record.child_full_name || '').toLowerCase();
    const familyCode = (record.family_code || '').toLowerCase();
    
    return (
      childName.includes(query) ||
      familyCode.includes(query)
    );
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader 
          title="Child Health Records" 
          showBackButton={true}
          onBackPress={handleBackPress}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.loadingText}>Loading child records...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader 
        title="Child Health Records" 
        showBackButton={true}
        onBackPress={handleBackPress}
      />

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, family, address..."
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

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{records.length}</ThemedText>
          <ThemedText style={styles.statLabel}>Total Children</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: theme.colors.success }]}>
            {filteredRecords.length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Showing</ThemedText>
        </View>
      </View>

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
            <MaterialIcons name="child-care" size={64} color={theme.colors.textMuted} />
            <ThemedText style={styles.emptyTitle}>
              {searchQuery ? 'No matching children found' : 'No child health records yet'}
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              {searchQuery
                ? 'Try a different search term'
                : 'Tap the + button to add your first child health record'}
            </ThemedText>
          </View>
        ) : (
          filteredRecords.map((record, index) => (
            <TouchableOpacity
              key={record.child_health_id}
              style={[styles.card, index === filteredRecords.length - 1 && styles.lastCard]}
              onPress={() => handleCardPress(record.child_health_id)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={[
                  styles.avatarContainer,
                  { backgroundColor: record.sex === 'Male' ? '#EFF6FF' : '#FCE7F3' }
                ]}>
                  <MaterialIcons
                    name="child-care"
                    size={24}
                    color={record.sex === 'Male' ? theme.colors.male : theme.colors.female}
                  />
                </View>
                
                <View style={styles.childInfo}>
                  <ThemedText style={styles.childName} numberOfLines={1}>
                    {record.child_full_name}
                  </ThemedText>
                  <View style={styles.childMeta}>
                    <View style={[
                      styles.sexBadge,
                      { backgroundColor: record.sex === 'Male' ? '#DBEAFE' : '#FCE7F3' }
                    ]}>
                      <Ionicons
                        name={record.sex === 'Male' ? 'male' : 'female'}
                        size={12}
                        color={record.sex === 'Male' ? theme.colors.male : theme.colors.female}
                      />
                      <ThemedText style={[
                        styles.sexText,
                        { color: record.sex === 'Male' ? theme.colors.male : theme.colors.female }
                      ]}>
                        {record.sex}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.ageText}>
                      {record.age}
                    </ThemedText>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                  <ThemedText style={styles.infoLabel}>Born:</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {formatDate(record.dob)}
                  </ThemedText>
                </View>

                {record.family_code && (
                  <View style={styles.infoRow}>
                    <Ionicons name="home-outline" size={16} color={theme.colors.textSecondary} />
                    <ThemedText style={styles.infoLabel}>Family:</ThemedText>
                    <ThemedText style={styles.infoValue}>
                      {record.family_code}
                    </ThemedText>
                  </View>
                )}
              </View>

              <View style={styles.cardFooter}>
                {record.feeding_method_name && (
                  <View style={[styles.badge, styles.feedingBadge]}>
                    <MaterialIcons name="local-dining" size={12} color={theme.colors.info} />
                    <ThemedText style={[styles.badgeText, { color: theme.colors.info }]}>
                      {record.feeding_method_name}
                    </ThemedText>
                  </View>
                )}

                {record.tt_status_name && (
                  <View style={[styles.badge, styles.ttBadge]}>
                    <MaterialIcons name="vaccines" size={12} color={theme.colors.primary} />
                    <ThemedText style={[styles.badgeText, { color: theme.colors.primary }]}>
                      {record.tt_status_name}
                    </ThemedText>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddChild}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
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
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  childMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  sexBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    gap: 4,
  },
  sexText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ageText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  cardBody: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
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
  cardFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    gap: 4,
  },
  feedingBadge: {
    backgroundColor: '#EFF6FF',
  },
  ttBadge: {
    backgroundColor: '#EFF6FF',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});