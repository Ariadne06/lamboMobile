// src/components/BhwDashboard.tsx
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/apiConfig";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type HouseholdsPerPurokItem = {
  sitio_id: number | null;
  sitio_name: string;
  total_households: number;
};

export type BhwDashboardResponse = {
  total_households: number;
  total_families: number;

  total_active_maternal: number;
  total_active_maternal_by_bhw: number;

  total_children_upcoming_immun_5d: number;

  households_visited_today_by_bhw: number;

  total_male: number;
  total_female: number;
  age_group_0_5: number;
  age_group_6_12: number;
  age_group_13_17: number;
  age_group_18_59: number;
  age_group_60_plus: number;

  hh_visited_count: number;
  hh_not_visited_count: number;
  hh_visited_percent: number;

  fam_visited_count: number;
  fam_not_visited_count: number;
  fam_visited_percent: number;

  households_per_purok: HouseholdsPerPurokItem[] | string | null;

  quarter_id: number;
};

interface BhwDashboardProps {
  quarterId?: number;
}

const screenWidth = Dimensions.get("window").width;

const BhwDashboard: React.FC<BhwDashboardProps> = ({ quarterId }) => {
  const [data, setData] = useState<BhwDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl = `${API_BASE_URL}${API_ENDPOINTS.bhwDashboard}`;
      const url =
        quarterId != null ? `${baseUrl}?quarter_id=${quarterId}` : baseUrl;

      console.log("Dashboard URL:", url);

      const res = await fetch(url);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Request failed with status ${res.status}`);
      }

      const json: BhwDashboardResponse = await res.json();
      console.log("Dashboard response:", JSON.stringify(json, null, 2));
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || "Failed to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quarterId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text>No dashboard data available.</Text>
      </View>
    );
  }

  // Normalize households_per_purok to always be an array
  let householdsPerPurok: HouseholdsPerPurokItem[] = [];
  if (Array.isArray(data.households_per_purok)) {
    householdsPerPurok = data.households_per_purok;
  } else if (typeof data.households_per_purok === "string") {
    try {
      const parsed = JSON.parse(data.households_per_purok);
      if (Array.isArray(parsed)) {
        householdsPerPurok = parsed;
      }
    } catch (e) {
      console.warn("Failed to parse households_per_purok JSON:", e);
    }
  }

  // Gender “visual”
  const totalGender = data.total_male + data.total_female || 1;
  const malePercent = (data.total_male / totalGender) * 100;
  const femalePercent = (data.total_female / totalGender) * 100;

  // Age groups bar “chart”
  const ageGroups = [
    { label: "0–5", value: data.age_group_0_5 },
    { label: "6–12", value: data.age_group_6_12 },
    { label: "13–17", value: data.age_group_13_17 },
    { label: "18–59", value: data.age_group_18_59 },
    { label: "60+", value: data.age_group_60_plus },
  ];
  const maxAgeValue = Math.max(
    ...ageGroups.map((g) => g.value),
    1 // avoid divide by zero
  );

  const hhCoverage = Math.min(Math.max(data.hh_visited_percent, 0), 100);
  const famCoverage = Math.min(Math.max(data.fam_visited_percent, 0), 100);

  // For households per purok “chart”
  const totalHouseholdsAll = data.total_households || 1;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Quarter ID: {data.quarter_id}
        </Text>
      </View>

      <View style={styles.container}>
        {/* Overview */}
        <Text style={styles.sectionLabel}>Overview</Text>
        <View style={styles.row}>
          <View style={[styles.card, styles.cardPrimary]}>
            <Text style={[styles.cardLabel, styles.cardLabelLight]}>
              Total Households
            </Text>
            <Text style={[styles.cardValue, styles.cardValueLight]}>
              {data.total_households}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Total Families</Text>
            <Text style={styles.cardValue}>{data.total_families}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Households Visited Today (You)</Text>
            <Text style={styles.cardValue}>
              {data.households_visited_today_by_bhw}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Upcoming Child Immunizations</Text>
            <Text style={styles.cardValue}>
              {data.total_children_upcoming_immun_5d}
            </Text>
          </View>
        </View>

        {/* Maternal */}
        <Text style={styles.sectionLabel}>Maternal Cases</Text>
        <View style={styles.row}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Active Maternal (Total)</Text>
            <Text style={styles.cardValue}>{data.total_active_maternal}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Active Maternal (You)</Text>
            <Text style={styles.cardValue}>
              {data.total_active_maternal_by_bhw}
            </Text>
          </View>
        </View>

        {/* Demographics + simple charts */}
        <Text style={styles.sectionLabel}>Population Breakdown</Text>

        {/* Gender */}
        <View style={styles.rowStack}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Gender</Text>
            <View style={styles.genderRow}>
              <View style={styles.genderLabelCol}>
                <Text style={styles.genderLabel}>Male</Text>
                <Text style={styles.genderLabel}>Female</Text>
              </View>
              <View style={styles.genderBarsCol}>
                {/* Male bar */}
                <View style={styles.genderBarRow}>
                  <View style={styles.genderBarBackground}>
                    <View
                      style={[
                        styles.genderBarFillMale,
                        { width: `${malePercent}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.genderValue}>
                    {data.total_male} ({malePercent.toFixed(0)}%)
                  </Text>
                </View>
                {/* Female bar */}
                <View style={styles.genderBarRow}>
                  <View style={styles.genderBarBackground}>
                    <View
                      style={[
                        styles.genderBarFillFemale,
                        { width: `${femalePercent}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.genderValue}>
                    {data.total_female} ({femalePercent.toFixed(0)}%)
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Age group bar “chart” */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Age Groups</Text>
          <View style={styles.ageChartContainer}>
            {ageGroups.map((group) => {
              const heightPercent = (group.value / maxAgeValue) * 100;
              return (
                <View key={group.label} style={styles.ageBarWrapper}>
                  <View style={styles.ageBarBackground}>
                    <View
                      style={[
                        styles.ageBarFill,
                        { height: `${heightPercent}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.ageBarLabel}>{group.label}</Text>
                  <Text style={styles.ageBarValue}>{group.value}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Visitation progress */}
        <Text style={styles.sectionLabel}>Visitation Progress</Text>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Household Visitation</Text>
          <Text style={styles.progressText}>
            Visited:{" "}
            <Text style={styles.bold}>{data.hh_visited_count}</Text> /{" "}
            <Text style={styles.bold}>
              {data.hh_visited_count + data.hh_not_visited_count}
            </Text>
          </Text>
          <View style={styles.progressBarBackground}>
            <View
              style={[styles.progressBarFill, { width: `${hhCoverage}%` }]}
            />
          </View>
          <Text style={styles.progressPercent}>
            {hhCoverage.toFixed(1)}% coverage
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Family Visitation</Text>
          <Text style={styles.progressText}>
            Visited:{" "}
            <Text style={styles.bold}>{data.fam_visited_count}</Text> /{" "}
            <Text style={styles.bold}>
              {data.fam_visited_count + data.fam_not_visited_count}
            </Text>
          </Text>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFillSecondary,
                { width: `${famCoverage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressPercent}>
            {famCoverage.toFixed(1)}% coverage
          </Text>
        </View>

        {/* Households per Purok – visualized */}
        <Text style={styles.sectionLabel}>Households per Purok / Sitio</Text>
        <View style={styles.card}>
          {householdsPerPurok.length > 0 ? (
            householdsPerPurok.map((item, index) => {
              const sharePercent =
                (item.total_households / totalHouseholdsAll) * 100;
              return (
                <View key={index} style={styles.purokRow}>
                  <View style={styles.purokHeader}>
                    <Text style={[styles.listCell, styles.bold]}>
                      {item.sitio_name}
                    </Text>
                    <Text style={styles.listCell}>
                      {item.total_households}{" "}
                      <Text style={styles.purokPercentText}>
                        ({sharePercent.toFixed(1)}%)
                      </Text>
                    </Text>
                  </View>
                  <View style={styles.purokBarBackground}>
                    <View
                      style={[
                        styles.purokBarFill,
                        { width: `${sharePercent}%` },
                      ]}
                    />
                  </View>
                </View>
              );
            })
          ) : (
            <Text>No sitio data available.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
    backgroundColor: "#f3f4f6", // gray-100
  },
  header: {
    backgroundColor: "#b91c1c", // red-700
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 40,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#fee2e2",
    marginTop: 4,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f3f4f6",
  },
  loadingText: {
    marginTop: 8,
  },
  errorText: {
    color: "#b91c1c",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280", // gray-500
    marginBottom: 4,
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  rowStack: {
    marginBottom: 8,
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardPrimary: {
    backgroundColor: "#ef4444", // red-500
  },
  cardLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  cardLabelLight: {
    color: "#fee2e2",
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  cardValueLight: {
    color: "#fff",
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 8,
    color: "#111827",
  },
  bold: {
    fontWeight: "600",
  },

  // Gender visualization
  genderRow: {
    flexDirection: "row",
  },
  genderLabelCol: {
    width: 60,
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  genderLabel: {
    color: "#374151",
    marginBottom: 8,
  },
  genderBarsCol: {
    flex: 1,
  },
  genderBarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  genderBarBackground: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    marginRight: 6,
    overflow: "hidden",
  },
  genderBarFillMale: {
    height: "100%",
    backgroundColor: "#3b82f6", // blue
  },
  genderBarFillFemale: {
    height: "100%",
    backgroundColor: "#ec4899", // pink
  },
  genderValue: {
    fontSize: 11,
    color: "#4b5563",
  },

  // Age group bar "chart"
  ageChartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 160,
    paddingHorizontal: 4,
  },
  ageBarWrapper: {
    alignItems: "center",
    flex: 1,
  },
  ageBarBackground: {
    width: (screenWidth - 100) / 7,
    height: 110,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  ageBarFill: {
    width: "100%",
    backgroundColor: "#ef4444",
    borderRadius: 8,
  },
  ageBarLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "#4b5563",
  },
  ageBarValue: {
    fontSize: 11,
    color: "#9ca3af",
  },

  // Progress
  progressText: {
    marginBottom: 6,
    color: "#374151",
  },
  progressBarBackground: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#ef4444", // red
  },
  progressBarFillSecondary: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#3b82f6", // blue
  },
  progressPercent: {
    marginTop: 4,
    fontSize: 12,
    color: "#6b7280",
  },

  // Purok visualization
  purokRow: {
    marginBottom: 10,
  },
  purokHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  purokBarBackground: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  purokBarFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#10b981", // emerald-500
  },
  purokPercentText: {
    fontSize: 12,
    color: "#6b7280",
  },

  // Purok text cells
  listCell: {
    fontSize: 14,
    color: "#374151",
  },
});

export default BhwDashboard;