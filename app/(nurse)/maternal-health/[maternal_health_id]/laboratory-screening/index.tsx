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
    background: "#F8FAFC",
    surface: "#FFFFFF",
    border: "#E5E7EB",
    primary: "#8B5CF6",
    primaryLight: "#F3E8FF",
    success: "#10B981",
    successLight: "#ECFDF5",
    info: "#3B82F6",
    infoLight: "#DBEAFE",
    textPrimary: "#111827",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
  },
  spacing: { sm: 8, md: 12, lg: 16, xl: 20 },
  radius: { lg: 12, md: 8 },
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
    }, [maternal_health_id])
  );

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch maternal info
      const motherRes = await fetch(
        `${API_BASE_URL}/household_api/maternal-health-records/${maternal_health_id}/`
      );
      const motherData = await motherRes.json();

      if (motherData.success) {
        setMaternalName(motherData.data.full_name || "");
      }

      // Fetch screening records
      const res = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.MATERNAL_LAB_SCREENING_LIST(
          Number(maternal_health_id)
        )}`
      );
      const data = await res.json();

      if (data.success) {
        setRecords(data.data || []);
      } else {
        Alert.alert("Error", data.error || "Failed to load records");
      }
    } catch (e) {
      console.error("❌ Lab screening load error:", e);
      Alert.alert("Error", "Unable to load laboratory screening records.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
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
      return {
        bg: theme.colors.infoLight,
        text: theme.colors.info,
      };
    }
    const lower = result.toLowerCase();
    if (
      lower.includes("normal") ||
      lower.includes("negative") ||
      lower.includes("non-reactive")
    ) {
      return {
        bg: theme.colors.successLight,
        text: theme.colors.success,
      };
    }
    return {
      bg: "#FEE2E2",
      text: "#EF4444",
    };
  };

  const handleAddScreening = () => {
    router.push(
      `/(nurse)/maternal-health/${maternal_health_id}/laboratory-screening/add-screening`
    );
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText>Loading...</ThemedText>
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

      {/* Maternal Name */}
      <View style={styles.banner}>
        <MaterialCommunityIcons
          name="test-tube"
          size={26}
          color={theme.colors.primary}
        />
        <ThemedText style={styles.maternalName}>
          {maternalName || "Mother"}
        </ThemedText>
      </View>

      {/* Add Screening Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddScreening}>
        <Ionicons name="add-circle" size={22} color="#fff" />
        <ThemedText style={styles.addButtonText}>Add Screening</ThemedText>
      </TouchableOpacity>

      {/* Records */}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {records.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name="flask-empty-outline"
              size={60}
              color={theme.colors.textMuted}
            />
            <ThemedText>No laboratory results yet.</ThemedText>
          </View>
        ) : (
          records.map((rec) => {
            const style = getResultStyle(rec.result);
            return (
              <View key={rec.lab_screening_id} style={styles.card}>
                <ThemedText style={styles.cardTitle}>
                  {rec.test_name}
                </ThemedText>

                <ThemedText>Date: {formatDate(rec.test_date)}</ThemedText>

                <View
                  style={[styles.resultBadge, { backgroundColor: style.bg }]}
                >
                  <ThemedText style={{ color: style.text }}>
                    {rec.result || "Pending"}
                  </ThemedText>
                </View>

                {rec.iron_tablet_given_date && rec.iron_tablet_quantity && (
                  <ThemedText style={styles.ironText}>
                    Iron tablets: {rec.iron_tablet_quantity} pcs on{" "}
                    {formatDate(rec.iron_tablet_given_date)}
                  </ThemedText>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.md,
  },
  maternalName: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    justifyContent: "center",
    marginHorizontal: theme.spacing.lg,
    marginTop: -8,
  },
  addButtonText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
  },
  scrollContent: { padding: theme.spacing.lg, paddingBottom: 50 },
  empty: { alignItems: "center", marginTop: 40 },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  resultBadge: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  ironText: {
    marginTop: 8,
    color: theme.colors.info,
    fontWeight: "600",
  },
});
