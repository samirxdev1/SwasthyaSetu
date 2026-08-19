import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, BottomTabInset, Fonts } from '@/constants/theme';
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
import {
  patientApi,
  Consultation,
  Prescription,
  LabOrder,
  LabReport,
} from '@/services/endpoints';
import { getErrorMessage } from '@/services/api';

type TabKey = 'consultations' | 'prescriptions' | 'labOrders' | 'labReports';

const TABS: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'consultations', label: 'Consultations', icon: 'medkit-outline' },
  { key: 'prescriptions', label: 'Prescriptions', icon: 'receipt-outline' },
  { key: 'labOrders', label: 'Lab Orders', icon: 'file-tray-outline' },
  { key: 'labReports', label: 'Lab Reports', icon: 'document-text-outline' },
];

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

const formatDateTime = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

const FieldRow: React.FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {typeof value === 'string' ? <Text style={styles.fieldValue}>{value || '—'}</Text> : value}
  </View>
);

const ConsultationCard: React.FC<{ item: Consultation }> = ({ item }) => {
  const statusMap = {
    ongoing: { tone: 'info' as const, label: 'Ongoing' },
    awaiting_report: { tone: 'warning' as const, label: 'Awaiting Report' },
    completed: { tone: 'success' as const, label: 'Completed' },
  };
  const st = statusMap[item.status] || { tone: 'neutral' as const, label: item.status };
  return (
    <SwasthyaCard style={styles.recordCard}>
      <View style={styles.cardHead}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            {item.confirmed_diagnosis || item.probable_diagnosis || 'Consultation Visit'}
          </Text>
          <Text style={styles.cardSubtitle}>{formatDate(item.consultation_date || item.created_at)}</Text>
        </View>
        <SwasthyaBadge label={st.label} tone={st.tone} />
      </View>
      <Separator style={{ marginVertical: Spacing.sm }} />
      <FieldRow label="Symptoms" value={item.symptoms} />
      {item.probable_diagnosis ? (
        <FieldRow label="Diagnosis" value={item.probable_diagnosis} />
      ) : null}
      {item.doctor_notes ? <FieldRow label="Notes" value={item.doctor_notes} /> : null}
    </SwasthyaCard>
  );
};

const PrescriptionCard: React.FC<{ item: Prescription }> = ({ item }) => {
  return (
    <SwasthyaCard style={styles.recordCard}>
      <View style={styles.cardHead}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: Colors.primary }]}>{item.medicine_name}</Text>
          <Text style={styles.cardSubtitle}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={styles.medIcon}>
          <Ionicons name="medkit-outline" size={22} color={Colors.primary} />
        </View>
      </View>
      <Separator style={{ marginVertical: Spacing.sm }} />
      <FieldRow
        label="Dosage"
        value={
          <Text
            style={{
              fontFamily: Platform.select({ web: (Fonts as any).web.mono }),
              fontSize: Typography.small.fontSize,
              fontWeight: '600',
              color: Colors.text,
            }}
          >
            {item.dosage}
          </Text>
        }
      />
      <FieldRow label="Frequency" value={item.frequency} />
      <FieldRow label="Duration" value={item.duration} />
      {item.instructions ? <FieldRow label="Instructions" value={item.instructions} /> : null}
    </SwasthyaCard>
  );
};

const LabOrderCard: React.FC<{ item: LabOrder }> = ({ item }) => {
  const statusMap = {
    pending: { tone: 'warning' as const, label: 'Pending' },
    in_progress: { tone: 'info' as const, label: 'In Progress' },
    completed: { tone: 'success' as const, label: 'Completed' },
  };
  const st = statusMap[item.status as keyof typeof statusMap] || { tone: 'neutral' as const, label: item.status };
  return (
    <SwasthyaCard style={styles.recordCard}>
      <View style={styles.cardHead}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.test_name}</Text>
          <Text style={styles.cardSubtitle}>Ordered {formatDate(item.ordered_at)}</Text>
        </View>
        <SwasthyaBadge tone={st.tone} label={st.label} />
      </View>
      {item.updated_at && item.updated_at !== item.ordered_at ? (
        <FieldRow label="Last Updated" value={formatDate(item.updated_at)} />
      ) : null}
    </SwasthyaCard>
  );
};

const LabReportCard: React.FC<{ item: LabReport }> = ({ item }) => {
  return (
    <SwasthyaCard style={styles.recordCard}>
      <View style={styles.cardHead}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Lab Report</Text>
          <Text style={styles.cardSubtitle}>Uploaded {formatDate(item.uploaded_at)}</Text>
        </View>
        <View style={[styles.medIcon, { backgroundColor: '#E3F2FD' }]}>
          <Ionicons name="document-text-outline" size={22} color={Colors.signalBlue} />
        </View>
      </View>
      <Separator style={{ marginVertical: Spacing.sm }} />
      <FieldRow label="Summary" value={item.report_summary} />
      {item.report_file_url ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            // Basic web open — web-browser not strictly needed; deep-link could go elsewhere
            if (Platform.OS === 'web') {
              window.open(item.report_file_url, '_blank');
            }
          }}
          style={styles.reportLink}
        >
          <Ionicons name="open-outline" size={16} color={Colors.primary} />
          <Text style={styles.reportLinkText}>View Report File</Text>
        </TouchableOpacity>
      ) : null}
    </SwasthyaCard>
  );
};

const MyRecordsScreen: React.FC = () => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<TabKey>('consultations');

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        patientApi.getConsultations(),
        patientApi.getPrescriptions(),
        patientApi.getLabOrders(),
        patientApi.getLabReports(),
      ]);
      const [cons, pres, lo, lr] = results;
      if (cons.status === 'fulfilled' && cons.value.success) setConsultations(cons.value.data ?? []);
      if (pres.status === 'fulfilled' && pres.value.success) setPrescriptions(pres.value.data ?? []);
      if (lo.status === 'fulfilled' && lo.value.success) setLabOrders(lo.value.data ?? []);
      if (lr.status === 'fulfilled' && lr.value.success) setLabReports(lr.value.data ?? []);
      setError(null);
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

  const current: any[] =
    tab === 'consultations'
      ? consultations
      : tab === 'prescriptions'
      ? prescriptions
      : tab === 'labOrders'
      ? labOrders
      : labReports;

  const emptyLabel =
    tab === 'consultations'
      ? t.noConsultations
      : tab === 'prescriptions'
      ? t.noPrescriptions
      : tab === 'labOrders'
      ? t.noLabOrders
      : t.noLabReports;

  const renderCard = (item: any) => {
    if (tab === 'consultations') return <ConsultationCard item={item as Consultation} />;
    if (tab === 'prescriptions') return <PrescriptionCard item={item as Prescription} />;
    if (tab === 'labOrders') return <LabOrderCard item={item as LabOrder} />;
    return <LabReportCard item={item as LabReport} />;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title={t.recordsTitle} subtitle="Your complete medical history at a glance" />

      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
          {TABS.map((tb) => {
            const active = tab === tb.key;
            return (
              <TouchableOpacity
                key={tb.key}
                activeOpacity={0.8}
                onPress={() => setTab(tb.key)}
                style={[styles.tabBtn, active && styles.tabBtnActive]}
              >
                <Ionicons
                  name={tb.icon}
                  size={16}
                  color={active ? Colors.primary : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: active ? Colors.primary : Colors.textSecondary },
                    active && { fontWeight: '700' },
                  ]}
                >
                  {tb.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {loading ? (
          <LoadingState label={t.loading} />
        ) : error && current.length === 0 ? (
          <ErrorState title="Couldn't load records" subtitle={error} onRetry={onRefresh} />
        ) : current.length === 0 ? (
          <EmptyState title="No records yet" subtitle={emptyLabel} />
        ) : (
          current.map((item, idx) => (
            <View key={item.id || idx} style={{ marginBottom: Spacing.md }}>
              {renderCard(item)}
            </View>
          ))
        )}
        <View style={{ height: BottomTabInset + Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.md },
  tabsWrap: {
    marginBottom: Spacing.md,
    marginHorizontal: -Spacing.md,
  },
  tabsContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabBtnActive: {
    backgroundColor: Colors.softSage,
    borderColor: Colors.primary,
  },
  tabLabel: {
    fontSize: Typography.small.fontSize,
    fontWeight: '500',
  },
  listContent: { paddingTop: Spacing.sm },
  recordCard: { marginBottom: Spacing.xs },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  cardTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.text,
  },
  cardSubtitle: {
    marginTop: 2,
    fontSize: Typography.small.fontSize,
    color: Colors.textSecondary,
  },
  medIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.xs,
    gap: Spacing.md,
  },
  fieldLabel: {
    width: 92,
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  fieldValue: {
    flex: 1,
    fontSize: Typography.small.fontSize,
    color: Colors.text,
    lineHeight: Typography.small.lineHeight + 2,
  },
  reportLink: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: Colors.softSage,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  reportLinkText: {
    fontSize: Typography.smallBold.fontSize,
    fontWeight: '600',
    color: Colors.primary,
  },
});

export default MyRecordsScreen;
