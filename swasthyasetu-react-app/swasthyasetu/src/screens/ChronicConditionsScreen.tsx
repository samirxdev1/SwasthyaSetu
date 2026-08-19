import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, BottomTabInset } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import SwasthyaCard from '@/components/ui/SwasthyaCard';
import SwasthyaBadge from '@/components/ui/SwasthyaBadge';
import {
  LoadingState,
  EmptyState,
  ErrorState,
  ScreenHeader,
  Separator,
} from '@/components/ui/ScreenComponents';
import { patientApi, ChronicCondition } from '@/services/endpoints';
import { getErrorMessage } from '@/services/api';

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return '';
  }
};

const statusMeta = (status: string) => {
  const s = (status || '').toLowerCase();
  if (s === 'active') return { tone: 'warning' as const, label: 'Active', dot: Colors.alert };
  if (s === 'managed') return { tone: 'success' as const, label: 'Managed', dot: Colors.success };
  if (s === 'resolved') return { tone: 'info' as const, label: 'Resolved', dot: Colors.signalBlue };
  return { tone: 'neutral' as const, label: status || 'Unknown', dot: Colors.textSecondary };
};

const ConditionCard: React.FC<{ item: ChronicCondition; index: number }> = ({ item }) => {
  const meta = statusMeta(item.status);
  return (
    <SwasthyaCard style={styles.card}>
      <View style={styles.cardHead}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 }}>
          <View style={[styles.iconPill, { backgroundColor: '#FFF3EC' }]}>
            <Ionicons name="pulse-outline" size={22} color={Colors.alert} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nameText}>{item.condition_name}</Text>
            {item.diagnosed_date ? (
              <Text style={styles.dateText}>
                Diagnosed {formatDate(item.diagnosed_date)}
              </Text>
            ) : null}
          </View>
        </View>
        <SwasthyaBadge tone={meta.tone} label={meta.label} size="md" />
      </View>
      {item.notes ? (
        <>
          <Separator style={{ marginVertical: Spacing.md }} />
          <View>
            <Text style={styles.notesLabel}>Clinician Notes</Text>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        </>
      ) : null}
      <View style={styles.statusBar}>
        <View style={[styles.statusDot, { backgroundColor: meta.dot }]} />
        <Text style={styles.statusBarText}>
          {meta.label.charAt(0).toUpperCase() + meta.label.slice(1)}
        </Text>
      </View>
    </SwasthyaCard>
  );
};

const ChronicConditionsScreen: React.FC = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<ChronicCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await patientApi.getChronicConditions();
      if (res.success) {
        setItems(res.data ?? []);
        setError(null);
      } else {
        setError(res.message || 'Failed to load.');
      }
    } catch (e: any) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        title={t.conditionsTitle}
        subtitle="Long-term conditions your clinician has recorded for you"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {loading ? (
          <LoadingState label={t.loading} />
        ) : error && items.length === 0 ? (
          <ErrorState
            title="Couldn't load conditions"
            subtitle={error}
            onRetry={onRefresh}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="No chronic conditions"
            subtitle={t.noConditions}
            icon="heart-outline"
          />
        ) : (
          <>
            <View style={styles.summaryRow}>
              <SummaryPill
                label="Active"
                count={items.filter((c) => (c.status || '').toLowerCase() === 'active').length}
                tone="warning"
              />
              <SummaryPill
                label="Managed"
                count={items.filter((c) => (c.status || '').toLowerCase() === 'managed').length}
                tone="success"
              />
              <SummaryPill
                label="Resolved"
                count={items.filter((c) => (c.status || '').toLowerCase() === 'resolved').length}
                tone="info"
              />
            </View>
            {items.map((it, i) => (
              <View key={it.id} style={{ marginBottom: Spacing.md }}>
                <ConditionCard item={it} index={i} />
              </View>
            ))}
          </>
        )}
        <View style={{ height: BottomTabInset + Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const SummaryPill: React.FC<{
  label: string;
  count: number;
  tone: 'warning' | 'success' | 'info';
}> = ({ label, count, tone }) => {
  const toneColor =
    tone === 'warning' ? Colors.alert : tone === 'success' ? Colors.success : Colors.signalBlue;
  const bg = tone === 'warning' ? '#FFF3EC' : tone === 'success' ? '#E8F5E9' : '#E3F2FD';
  return (
    <View style={[styles.summaryPill, { backgroundColor: bg }]}>
      <Text style={[styles.summaryCount, { color: toneColor }]}>{count}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.md },
  list: { paddingTop: Spacing.xs },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  summaryPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    justifyContent: 'center',
  },
  summaryCount: { fontSize: Typography.h3.fontSize, fontWeight: '800', letterSpacing: -0.3 },
  summaryLabel: { fontSize: Typography.small.fontSize, fontWeight: '600', color: Colors.text },
  card: { marginBottom: Spacing.xs },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  iconPill: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.text,
  },
  dateText: {
    marginTop: 2,
    fontSize: Typography.small.fontSize,
    color: Colors.textSecondary,
  },
  notesLabel: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  notesText: {
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    lineHeight: Typography.body.lineHeight,
  },
  statusBar: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.background,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusBarText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 0.3,
  },
});

export default ChronicConditionsScreen;
