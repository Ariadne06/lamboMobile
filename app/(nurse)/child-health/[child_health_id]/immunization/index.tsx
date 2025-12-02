import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/apiConfig';

const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#E11D2F',
    primaryLight: '#FFE4E6',
    success: '#16A34A',
    successLight: '#DCFCE7',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    chipBg: '#F3F4F6',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  radius: { sm: 6, md: 8, lg: 12, xl: 16, pill: 999 },
};

interface ImmunizationRecord {
  vaccine_type_id: number;
  vaccine_name: string;

  at_birth_date: string | null;
  first_dose_date: string | null;
  second_dose_date: string | null;
  third_dose_date: string | null;

  last_administered: string | null;
  next_recommended_date: string | null;
  is_delayed: boolean;
}

export default function NurseImmunizationListScreen() {
  const { child_health_id } = useLocalSearchParams<{ child_health_id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<ImmunizationRecord[]>([]);
  const [childName, setChildName] = useState('');

  useEffect(() => {
    fetchImmunizations();
  }, []);

  const handleBackPress = () => {
    router.push(`/(nurse)/child-health/${child_health_id}`);
  };

  const handleAddImmunization = () => {
    router.push(`/(nurse)/child-health/${child_health_id}/immunization/add-immunization`);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchImmunizations();
      const handler = BackHandler.addEventListener("hardwareBackPress", () => {
        handleBackPress();
        return true;
      });
      return () => handler.remove();
    }, [])
  );

  const fetchImmunizations = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CHILD_IMMUNIZATIONS_LIST(
          parseInt(child_health_id as string)
        )}`
      );

      const data = await res.json();

      if (data.success) {
        setChildName(data.child_name);
        setRecords(data.data);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (val: string | null) => {
    if (!val) return "—";
    return new Date(val).toLocaleDateString("en-US");
  };

  const renderDoseChip = (label: string, given: boolean, disabled = false) => (
    <View style={[
      styles.doseChip,
      given && styles.doseChipGiven,
      disabled && styles.doseChipDisabled
    ]}>
      <Ionicons
        name={given ? "checkmark-circle" : "ellipse-outline"}
        size={14}
        color={
          disabled ? theme.colors.textMuted :
          given ? theme.colors.success : theme.colors.textMuted
        }
        style={{ marginRight: 4 }}
      />
      <ThemedText style={[
        styles.doseChipText,
        given && styles.doseChipTextGiven,
        disabled && styles.doseChipTextDisabled
      ]}>
        {label}
      </ThemedText>
    </View>
  );

  const getStatusInfo = (rec: ImmunizationRecord) => {
    const anyGiven =
      rec.at_birth_date ||
      rec.first_dose_date ||
      rec.second_dose_date ||
      rec.third_dose_date;

    if (!anyGiven) {
      return {
        label: "Not started",
        color: theme.colors.textMuted,
        bgColor: "#E5E7EB",
        icon: "ellipse",
        border: theme.colors.border
      };
    }

    if (rec.is_delayed) {
      return {
        label: "Delayed",
        color: theme.colors.danger,
        bgColor: theme.colors.dangerLight,
        icon: "alert",
        border: theme.colors.warning
      };
    }

    if (!rec.next_recommended_date) {
      return {
        label: "Complete",
        color: theme.colors.success,
        bgColor: theme.colors.successLight,
        icon: "checkmark-circle",
        border: theme.colors.success
      };
    }

    return {
      label: "In progress",
      color: theme.colors.primary,
      bgColor: theme.colors.primaryLight,
      icon: "time",
      border: theme.colors.border
    };
  };

  const renderCard = (rec: ImmunizationRecord) => {
    const lower = rec.vaccine_name.toLowerCase();
    const isBCG = lower.includes("bcg");
    const isHepa = lower.includes("hepa");
    const isABOnly = isBCG || isHepa;

    const doses = [
      rec.at_birth_date,
      rec.first_dose_date,
      rec.second_dose_date,
      rec.third_dose_date
    ].filter(Boolean).length;

    const info = getStatusInfo(rec);

    return (
      <View key={rec.vaccine_type_id} style={[styles.card, { borderColor: info.border }]}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <ThemedText style={styles.vaccineName}>{rec.vaccine_name}</ThemedText>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={[styles.statusPill, { backgroundColor: info.bgColor }]}>
                <Ionicons name={info.icon as any} size={12} color={info.color} />
                <ThemedText style={{ fontSize: 11, color: info.color, marginLeft: 4 }}>
                  {info.label}
                </ThemedText>
              </View>

              <ThemedText style={styles.doseSummary}>
                {doses === 0 ? "No doses" : `${doses} dose(s)`}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.doseRow}>
          {renderDoseChip("At birth", !!rec.at_birth_date)}
          {renderDoseChip("1st dose", !!rec.first_dose_date, isABOnly)}
          {renderDoseChip("2nd dose", !!rec.second_dose_date, isABOnly)}
          {renderDoseChip("3rd dose", !!rec.third_dose_date, isABOnly)}
        </View>

        <View style={styles.dateRow}>
          <View>
            <ThemedText style={styles.dateLabel}>Last given</ThemedText>
            <ThemedText style={styles.dateValue}>{formatDate(rec.last_administered)}</ThemedText>
          </View>

          <View>
            <ThemedText style={styles.dateLabel}>Next due</ThemedText>
            <ThemedText style={[
              styles.dateValue,
              rec.is_delayed && { color: theme.colors.danger }
            ]}>
              {formatDate(rec.next_recommended_date)}
            </ThemedText>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Child Immunization" onBackPress={handleBackPress} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={{ marginTop: 10, color: theme.colors.textSecondary }}>
            Loading...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Child Immunization" onBackPress={handleBackPress} />

      <View style={{ flex: 1 }}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchImmunizations} />
          }
          contentContainerStyle={{ padding: 16, paddingBottom: 150 }}
        >
          {records.length === 0 ? (
            <View style={styles.centered}>
              <Ionicons name="medical-outline" size={60} color={theme.colors.textMuted} />
              <ThemedText>No immunization records</ThemedText>
            </View>
          ) : (
            records.map(rec => renderCard(rec))
          )}
        </ScrollView>

        {/* ADD IMMUNIZATION BUTTON (ALWAYS VISIBLE) */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddImmunization}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  vaccineName: { fontSize: 16, fontWeight: "700" },
  statusPill: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignItems: "center",
    marginRight: 8,
  },
  doseSummary: { fontSize: 11, color: theme.colors.textSecondary },

  doseRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 8,
  },

  doseChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  doseChipGiven: {
    backgroundColor: theme.colors.successLight,
    borderColor: theme.colors.success,
  },

  doseChipDisabled: { opacity: 0.5 },

  doseChipText: { fontSize: 12, fontWeight: "500", color: theme.colors.textPrimary },

  doseChipTextGiven: { color: theme.colors.success },

  doseChipTextDisabled: { color: theme.colors.textMuted },

  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: 12,
    paddingTop: 12,
  },

  dateLabel: { fontSize: 11, color: theme.colors.textSecondary },

  dateValue: { fontSize: 13, fontWeight: "600", color: theme.colors.textPrimary },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: theme.colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 12,
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
