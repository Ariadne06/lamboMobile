import React from 'react';
import {
  View,
  StyleSheet,
  SectionList,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import CustomHeader from '@/components/ui/CustomHeader';
import { API_BASE_URL } from '@/constants/apiConfig'; // ✅ use your existing config

type Announcement = {
  id: number | string;
  title: string;
  text: string;
  date: string | null;
  image_path?: string | null;
};

// Relative endpoints – same style as MOBILE_LOGIN: '/api/mobile-login/'
const ANNOUNCEMENTS_LATEST = '/api/mobile/announcements/latest/';
const ANNOUNCEMENTS_ALL = '/api/mobile/announcements/';

const COLORS = {
  primary: '#FF3D33',
  bg: '#F9FAFB',
  card: '#FFFFFF',
  ink: '#1F2937',
  sub: '#6B7280',
  border: '#E5E7EB',
  subtle: '#F1F5F9',
};

// ---- Date utils ----
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const MONTH_MAP: Record<string, number> = Object.fromEntries(
  MONTHS.map((m, i) => [m.toLowerCase(), i])
);

function parseDateSafe(input: string | null | undefined): number | null {
  if (!input) return null;

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

  return null;
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

type Mode = 'latest' | 'all';

export default function AnnouncementScreen() {
  const [mode, setMode] = React.useState<Mode>('latest');
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);

        const relativeEndpoint =
        mode === 'latest' ? ANNOUNCEMENTS_LATEST : ANNOUNCEMENTS_ALL;

      // For "Latest", always fetch only the top 3.
      // For "All", use a high limit so effectively all are returned.
      const query =
        mode === 'latest'
          ? '?limit=3'
          : '?limit=200';

      const endpoint = `${API_BASE_URL}${relativeEndpoint}${query}`;


        console.log('Fetching announcements from:', endpoint);

        const res = await fetch(endpoint);
        const rawText = await res.text();

        if (!res.ok) {
          console.log('Error response body:', rawText);
          throw new Error(`HTTP ${res.status} - ${rawText}`);
        }

        let data: any;
        try {
          data = JSON.parse(rawText);
        } catch (parseErr) {
          console.log('Failed to parse JSON:', parseErr);
          throw new Error('Invalid JSON from server');
        }

        const normalized: Announcement[] = (data || []).map((item: any) => ({
          id: item.id ?? item.announcement_id,
          title: item.title ?? item.header_title ?? '',
          text: item.text ?? item.details ?? '',
          date: item.date ?? item.created_date ?? null,
          image_path: item.image_path ?? item.announcement_image_path ?? null,
        }));

        setAnnouncements(normalized);
      } catch (err: any) {
        console.error('Failed to load announcements', err);
        setError(err?.message || 'Failed to load announcements.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [mode]);

  const normalizedWithDates = React.useMemo(() => {
    return announcements.map((a) => {
      const ts = parseDateSafe(a.date ?? undefined);
      return {
        ...a,
        ts,
        monthKey: monthKey(ts),
      };
    });
  }, [announcements]);

  // Group by monthKey, sort sections & items by ts desc
  const sections = React.useMemo(() => {
    const groups = new Map<string, typeof normalizedWithDates>();

    for (const a of normalizedWithDates) {
      const key = a.monthKey;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(a);
    }

    const out = Array.from(groups.entries()).map(([title, data]) => ({
      title,
      data: data.sort((x, y) => (y.ts ?? 0) - (x.ts ?? 0)),
      maxTs: Math.max(...data.map((d) => d.ts ?? 0)),
    }));

    return out.sort((A, B) => (B.maxTs ?? 0) - (A.maxTs ?? 0));
  }, [normalizedWithDates]);

  const ListHeader = () => (
    <View style={styles.topBar}>
      <View style={styles.chips}>
        <Chip
          label="Latest"
          active={mode === 'latest'}
          onPress={() => setMode('latest')}
        />
        <Chip label="All" active={mode === 'all'} onPress={() => setMode('all')} />
      </View>

      <View style={styles.countPill}>
        <Ionicons name="notifications" size={14} color={COLORS.primary} />
        <ThemedText style={styles.countText}>
          {announcements.length} announcement{announcements.length === 1 ? '' : 's'}
        </ThemedText>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.emptyText}>Loading announcements...</ThemedText>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle" size={60} color="#f43f5e" />
          <ThemedText style={styles.emptyText}>{error}</ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="notifications-off" size={60} color="#d1d5db" />
        <ThemedText style={styles.emptyText}>No announcements yet!</ThemedText>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <CustomHeader title="Announcements" showBackButton={false} />
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        stickySectionHeadersEnabled
        ListHeaderComponent={<ListHeader />}
        contentContainerStyle={{ paddingBottom: 16 }}
        ListEmptyComponent={renderEmpty()}
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

                {/* Title */}
                <ThemedText
                  style={{
                    color: COLORS.ink,
                    fontSize: 16,
                    fontWeight: '700',
                    marginBottom: 4,
                  }}
                  numberOfLines={2}
                >
                  {item.title}
                </ThemedText>

                {/* Body / details */}
                <ThemedText style={styles.text}>{item.text}</ThemedText>
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
        active
          ? { backgroundColor: COLORS.primary }
          : { backgroundColor: COLORS.subtle },
      ]}
    >
      <ThemedText
        style={[
          styles.chipText,
          active ? { color: '#fff' } : { color: COLORS.sub },
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

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
