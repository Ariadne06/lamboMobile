import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import CustomHeader from "@/components/ui/CustomHeader";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/apiConfig";

interface MaternalRecord {
  maternal_health_id: number;
  maternal_id: number;
  maternal_full_name: string;
  dob: string;
  household_number: string | null;
  family_code: string | null;
  record_status: string;
  date_created: string;
}

const theme = {
  colors: {
    background: "#F8FAFC",
    surface: "#FFFFFF",
    border: "#E5E7EB",
    primary: "#EC4899",
    primaryLight: "#FDF2F8",
    success: "#10B981",
    successLight: "#D1FAE5",
    warning: "#F59E0B",
    warningLight: "#FEF3C7",
    danger: "#EF4444",
    info: "#3B82F6",
    textPrimary: "#111827",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16 },
};

export default function NurseMaternalHealthListScreen() {
  const router = useRouter();

  const [records, setRecords] = useState<MaternalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 20;

  /** 🟢 Fetch with search + filter + pagination */
  const fetchMaternalHealthRecords = useCallback(
    async (reset = false) => {
      try {
        if (reset) {
          setLoading(true);
          setOffset(0);
        }

        const effectiveOffset = reset ? 0 : offset;

        const params = new URLSearchParams({
          limit: PAGE_SIZE.toString(),
          offset: effectiveOffset.toString(),
        });

        const cleanQuery = searchQuery.trim();
        if (cleanQuery !== "") params.append("p_query", cleanQuery);

        if (statusFilter !== null)
          params.append("p_record_status_id", statusFilter.toString());

        console.log("📡 API Request:", params.toString());

        const response = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.MATERNAL_RECORDS_LIST}?${params.toString()}`
        );

        const data = await response.json();
        console.log("📥 API Response:", data);

        if (data.success) {
          const newRecords = reset ? data.data : [...records, ...data.data];
          setRecords(newRecords);

          setHasMore(data.data.length === PAGE_SIZE);
        }
      } catch (error) {
        console.error("❌ Failed to load maternal health records:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchQuery, statusFilter, offset, records]
  );

  useEffect(() => {
    fetchMaternalHealthRecords(true);
  }, [searchQuery, statusFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMaternalHealthRecords(true);
  };

  const loadMore = () => {
    if (!hasMore) return;
    setOffset((prev) => prev + PAGE_SIZE);
    fetchMaternalHealthRecords();
  };

  const handleBackPress = () => {
    router.push("/(nurse)/menu");
  };

  const handleCardPress = (id: number) => {
    router.push(`/(nurse)/maternal-health/${id}`);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "ongoing":
        return theme.colors.info;
      case "completed":
        return theme.colors.success;
      default:
        return theme.colors.textMuted;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "ongoing":
        return "#EFF6FF";
      case "completed":
        return theme.colors.successLight;
      default:
        return "#F3F4F6";
    }
  };

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
          <ThemedText style={styles.loadingText}>
            Loading maternal records...
          </ThemedText>
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

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or ID..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.textMuted}
        />
        {searchQuery !== "" && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {[{ id: null, label: "All" }, { id: 1, label: "Ongoing" }, { id: 2, label: "Completed" }].map(
          (f) => (
            <TouchableOpacity
              key={f.label}
              style={[
                styles.filterPill,
                statusFilter === f.id && styles.filterPillActive,
              ]}
              onPress={() => setStatusFilter(f.id)}
            >
              <ThemedText
                style={[
                  styles.filterPillText,
                  statusFilter === f.id && styles.filterPillTextActive,
                ]}
              >
                {f.label}
              </ThemedText>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{records.length}</ThemedText>
          <ThemedText style={styles.statLabel}>Total</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: theme.colors.info }]}>
            {records.filter((r) => r.record_status.toLowerCase() === "ongoing")
              .length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Ongoing</ThemedText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <ThemedText
            style={[styles.statValue, { color: theme.colors.success }]}
          >
            {
              records.filter(
                (r) => r.record_status.toLowerCase() === "completed"
              ).length
            }
          </ThemedText>
          <ThemedText style={styles.statLabel}>Completed</ThemedText>
        </View>
      </View>

      {/* List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {records.map((record, index) => (
          <TouchableOpacity
            key={record.maternal_health_id}
            style={[styles.card, index === records.length - 1 && styles.lastCard]}
            onPress={() => handleCardPress(record.maternal_health_id)}
          >
            {/* Header */}
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.avatarContainer,
                  { backgroundColor: theme.colors.primaryLight },
                ]}
              >
                <MaterialIcons
                  name="pregnant-woman"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>

              <View style={styles.motherInfo}>
                <ThemedText style={styles.motherName} numberOfLines={1}>
                  {record.maternal_full_name}
                </ThemedText>

                <View style={styles.motherMeta}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusBgColor(record.record_status) },
                    ]}
                  >
                    <Ionicons
                      name={
                        record.record_status.toLowerCase() === "ongoing"
                          ? "time-outline"
                          : "checkmark-circle-outline"
                      }
                      size={12}
                      color={getStatusColor(record.record_status)}
                    />
                    <ThemedText
                      style={[
                        styles.statusText,
                        { color: getStatusColor(record.record_status) },
                      ]}
                    >
                      {record.record_status}
                    </ThemedText>
                  </View>
                </View>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textMuted}
              />
            </View>

            {/* Body */}
            <View style={styles.cardBody}>
              <View style={styles.infoRow}>
                <Ionicons
                  name="person-outline"
                  size={16}
                  color={theme.colors.textSecondary}
                />
                <ThemedText style={styles.infoLabel}>ID:</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {record.maternal_health_id}
                </ThemedText>
              </View>

              <View style={styles.infoRow}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={theme.colors.textSecondary}
                />
                <ThemedText style={styles.infoLabel}>DOB:</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {formatDate(record.dob)}
                </ThemedText>
              </View>

              <View style={styles.infoRow}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={theme.colors.textSecondary}
                />
                <ThemedText style={styles.infoLabel}>Created:</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {formatDate(record.date_created)}
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {hasMore && (
          <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
            <ThemedText style={styles.loadMoreText}>Load More</ThemedText>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* --------------------------------------------------------
   COMPLETE STYLES (NO ERRORS)
-------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
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

  filterRow: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  filterPillActive: {
    backgroundColor: theme.colors.primaryLight,
  },
  filterPillText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  filterPillTextActive: {
    color: theme.colors.primary,
  },

  statsCard: {
    flexDirection: "row",
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
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  motherInfo: {
    flex: 1,
  },
  motherName: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  motherMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },

  cardBody: {
    gap: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: "500",
    minWidth: 60,
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: "500",
  },

  loadMoreBtn: {
    marginTop: 10,
    marginBottom: 30,
    padding: 14,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
  },
  loadMoreText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "600",
  },
});
