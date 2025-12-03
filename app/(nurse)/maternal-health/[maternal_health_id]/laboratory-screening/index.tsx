// FULL IMPROVED UI – View + Add Screening
import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  BackHandler,
  Alert,
} from "react-native";
import {
  useLocalSearchParams,
  useRouter,
  useFocusEffect,
} from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import CustomHeader from "@/components/ui/CustomHeader";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/apiConfig";

const theme = {
  colors: {
    background: "#F9FAFB",
    surface: "#FFFFFF",
    border: "#E5E7EB",
    primary: "#8B5CF6",
    primaryLight: "#F3E8FF",
    primaryText: "#6D28D9",
    success: "#059669",
    successLight: "#ECFDF5",
    pending: "#2563EB",
    pendingLight: "#DBEAFE",
    danger: "#DC2626",
    dangerLight: "#FEE2E2",
    textPrimary: "#1F2937",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
  },
  spacing: { sm: 8, md: 12, lg: 16, xl: 20 },
  radius: { md: 10, lg: 14 },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
};

interface LabScreeningRecord {
  lab_screening_id: number;
  test_type_id: number;
  test_name: string;
  test_date: string;
  result: string | null;
  iron_tablet_given_date: string | null;
  iron_tablet_quantity: number | null;
  created_at: string;
}

export default function LaboratoryScreeningScreen() {
  const { maternal_health_id } =
    useLocalSearchParams<{ maternal_health_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<LabScreeningRecord[]>([]);
  const [maternalName, setMaternalName] = useState("");

  useEffect(() => {
    loadData();
  }, [maternal_health_id]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        router.push(`/(nurse)/maternal-health/${maternal_health_id}`);
        return true;
      };
      const handler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => handler.remove();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);

      const motherRes = await fetch(
        `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/`
      );
      const motherData = await motherRes.json();
      if (motherData.success) setMaternalName(motherData.data.full_name);

      const res = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MATERNAL_LAB_SCREENING_LIST(
          Number(maternal_health_id)
        )}`
      );
      const data = await res.json();

      if (data.success) {
        setRecords(data.data || []);
      } else {
        Alert.alert("Error", data.error);
      }
    } catch (e) {
      Alert.alert("Error", "Unable to load laboratory data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddScreening = () => {
    router.push(
      `/(nurse)/maternal-health/${maternal_health_id}/laboratory-screening/add-screening`
    );
  };

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getResultStyle = (result: string | null) => {
    if (!result) {
      return { bg: theme.colors.pendingLight, text: theme.colors.pending };
    }
    const low = result.toLowerCase();
    if (
      low.includes("normal") ||
      low.includes("negative") ||
      low.includes("non-reactive")
    ) {
      return {
        bg: theme.colors.successLight,
        text: theme.colors.success,
      };
    }
    return {
      bg: theme.colors.dangerLight,
      text: theme.colors.danger,
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader
          title="Laboratory Screening"
          onBackPress={() =>
            router.push(`/(nurse)/maternal-health/${maternal_health_id}`)
          }
        />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title="Laboratory Screening"
        onBackPress={() =>
          router.push(`/(nurse)/maternal-health/${maternal_health_id}`)
        }
      />

      {/* HEADER */}
      <View style={styles.banner}>
        <MaterialCommunityIcons
          name="flask-outline"
          size={28}
          color={theme.colors.primary}
        />
        <View>
          <ThemedText style={styles.maternalName}>{maternalName}</ThemedText>
          <ThemedText style={styles.subtitle}>Laboratory Tests</ThemedText>
        </View>
      </View>

      {/* ADD BUTTON */}
      <TouchableOpacity style={styles.addBtn} onPress={handleAddScreening}>
        <Ionicons name="add-circle" size={22} color="#fff" />
        <ThemedText style={styles.addBtnText}>Add Screening</ThemedText>
      </TouchableOpacity>

      {/* RECORD LIST */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContainer}
      >
        {records.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons
              name="flask-empty-outline"
              size={70}
              color={theme.colors.textMuted}
            />
            <ThemedText style={styles.emptyText}>
              No laboratory results yet.
            </ThemedText>
          </View>
        ) : (
          records.map((rec) => {
            const resultStyle = getResultStyle(rec.result);

            return (
              <View key={rec.lab_screening_id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons
                    name="file-document-outline"
                    size={22}
                    color={theme.colors.primary}
                  />
                  <ThemedText style={styles.cardTitle}>{rec.test_name}</ThemedText>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={theme.colors.textMuted}
                  />
                  <ThemedText style={styles.infoValue}>
                    {formatDate(rec.test_date)}
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.badge,
                    { backgroundColor: resultStyle.bg },
                  ]}
                >
                  <ThemedText style={{ color: resultStyle.text, fontWeight: "700" }}>
                    {rec.result || "Pending"}
                  </ThemedText>
                </View>

                {rec.iron_tablet_given_date && (
                  <View style={styles.ironBox}>
                    <MaterialCommunityIcons
                      name="pill"
                      size={18}
                      color={theme.colors.primary}
                    />
                    <ThemedText style={styles.ironText}>
                      Iron Supplement: {rec.iron_tablet_quantity} tablet(s) •{" "}
                      {formatDate(rec.iron_tablet_given_date)}
                    </ThemedText>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    ...theme.shadow,
  },
  maternalName: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 3,
  },

  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    justifyContent: "center",
    ...theme.shadow,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 6,
  },

  listContainer: { padding: theme.spacing.lg },

  emptyBox: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },

  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },

  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 4,
  },

  ironBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 8,
  },
  ironText: {
    fontSize: 14,
    color: theme.colors.primaryText,
    fontWeight: "600",
  },
});
