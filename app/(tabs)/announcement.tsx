import React from 'react';
import {
  View,
  StyleSheet,
  SectionList,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';

type Announcement = { id: number | string; date: string; text: string };

const COLORS = {
  primary: '#FF3D33',
  bg: '#F9FAFB',
  card: '#FFFFFF',
  ink: '#1F2937',
  sub: '#6B7280',
  border: '#E5E7EB',
  subtle: '#F1F5F9',
};

// ---- Robust date utils ----
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const MONTH_MAP = Object.fromEntries(MONTHS.map((m,i)=>[m.toLowerCase(), i]));

// Accepts: YYYY-MM-DD, YYYY/MM/DD, or "Month DD, YYYY"
function parseDateSafe(input: string): number | null {
  if (!input) return null;

  // ISO 8601 or Date.parse-friendly first
  const parsed = Date.parse(input);
  if (!Number.isNaN(parsed)) return parsed;

  // YYYY-MM-DD
  let m = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) {
    const [, y, mo, d] = m;
    const dt = new Date(Number(y), Number(mo) - 1, Number(d));
    return Number.isNaN(+dt) ? null : dt.getTime();
  }

  // YYYY/MM/DD
  m = input.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (m) {
    const [, y, mo, d] = m;
    const dt = new Date(Number(y), Number(mo) - 1, Number(d));
    return Number.isNaN(+dt) ? null : dt.getTime();
  }

  // "Month DD, YYYY"
  m = input.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (m) {
    const [, monthName, day, year] = m;
    const mi = MONTH_MAP[monthName.toLowerCase()];
    if (mi != null) {
      const dt = new Date(Number(year), mi, Number(day));
      return Number.isNaN(+dt) ? null : dt.getTime();
    }
  }

  return null; // could not parse
}

function monthKey(ts: number | null): string {
  if (ts == null) return 'Unknown date';
  const d = new Date(ts);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatShort(ts: number | null): string {
  if (ts == null) return '—';
  const d = new Date(ts);
  const m = d.toLocaleString('en-US', { month: 'short' });
  const day = String(d.getDate()).padStart(2, '0');
  return `${m} ${day}, ${d.getFullYear()}`;
}

export default function AnnounecmentScreen() {
  // You can keep your original strings; parser will normalize them.
  const announcements: Announcement[] = [
    { id: 1, date: 'July 25, 2025', text: 'Barangay Cansaga will hold a community clean-up drive this Saturday at 7:00 AM. All residents are encouraged to participate.' },
    { id: 2, date: '2025-06-13', text: 'Ayuda' },
    { id: 3, date: 'May 30, 2025', text: 'Vaccine' },
    { id: 4, date: '2025/05/15', text: 'Pulong-pulong' },
    { id: 5, date: 'April 20, 2025', text: 'Scatter' },
    { id: 6, date: 'March 10, 2025', text: 'Bingo Plus my location' },
  ];

  // Normalize once
  const normalized = React.useMemo(() => {
    return announcements.map(a => {
      const ts = parseDateSafe(a.date);
      return { ...a, ts, monthKey: monthKey(ts) };
    });
  }, [announcements]);

  // --- Chips only (removed search) ---
  const [scope, setScope] = React.useState<'all' | 'month' | 'year'>('all');

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const filtered = React.useMemo(() => {
    let list = normalized;

    if (scope !== 'all') {
      list = list.filter(a => {
        if (a.ts == null) return false;
        const d = new Date(a.ts);
        if (scope === 'month') {
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        }
        if (scope === 'year') {
          return d.getFullYear() === thisYear;
        }
        return true;
      });
    }

    return list;
  }, [normalized, scope, thisMonth, thisYear]);

  // Group by monthKey, sort sections & items by ts desc (unknowns last)
  const sections = React.useMemo(() => {
    const groups = new Map<string, typeof filtered>();

    for (const a of filtered) {
      const key = a.monthKey;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(a);
    }

    const out = Array.from(groups.entries()).map(([title, data]) => ({
      title,
      data: data.sort((x, y) => (y.ts ?? 0) - (x.ts ?? 0)),
      // helper to sort sections by newest in that section
      maxTs: Math.max(...data.map(d => d.ts ?? 0)),
    }));

    return out.sort((A, B) => (B.maxTs ?? 0) - (A.maxTs ?? 0));
  }, [filtered]);

  const ListHeader = () => (
    <View style={styles.topBar}>
      <View style={styles.chips}>
        <Chip label="All" active={scope === 'all'} onPress={() => setScope('all')} />
        <Chip label="This month" active={scope === 'month'} onPress={() => setScope('month')} />
        <Chip label="This year" active={scope === 'year'} onPress={() => setScope('year')} />
      </View>

      <View style={styles.countPill}>
        <Ionicons name="notifications" size={14} color={COLORS.primary} />
        <ThemedText style={styles.countText}>
          {filtered.length} announcement{filtered.length === 1 ? '' : 's'}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <CustomHeader title="Announcements" showBackButton={false} />
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        stickySectionHeadersEnabled
        ListHeaderComponent={<ListHeader />}
        contentContainerStyle={{ paddingBottom: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={60} color="#d1d5db" />
            <ThemedText style={styles.emptyText}>No announcements yet!</ThemedText>
          </View>
        }
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              {title}
            </ThemedText>
          </View>
        )}
        renderItem={({ item, index, section }) => {
          const isLast = index === section.data.length - 1;
          return (
            <View style={styles.timelineRow}>
              {/* Timeline rail */}
              <View style={styles.timelineCol}>
                <View style={styles.dot} />
                {!isLast && <View style={styles.rail} />}
              </View>

              {/* Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.dateBadge}>
                    <Ionicons name="calendar" size={14} color="#fff" />
                    <ThemedText style={styles.dateBadgeText}>
                      {formatShort(item.ts)}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.text}>
                  {item.text}
                </ThemedText>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active ? { backgroundColor: COLORS.primary } : { backgroundColor: COLORS.subtle },
      ]}
    >
      <ThemedText
        style={[styles.chipText, active ? { color: '#fff' } : { color: COLORS.sub }]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 10,
  },

  chips: { flexDirection: 'row', gap: 8 },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipText: { fontSize: 12, fontWeight: '700' },

  countPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.subtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  countText: { color: COLORS.sub, fontSize: 12 },

  sectionHeader: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { color: COLORS.ink, fontSize: 13 },

  timelineRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  timelineCol: {
    width: 20,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    marginTop: 8,
  },
  rail: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginTop: 4,
    marginBottom: 12,
  },

  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginLeft: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 6,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  dateBadgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  text: { color: COLORS.ink, fontSize: 15, lineHeight: 22 },

  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 24,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});
