import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, BottomTabInset } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import HealthIdCard from '@/components/HealthIdCard';
import { LoadingState, ScreenHeader, SectionTitle } from '@/components/ui/ScreenComponents';
import SwasthyaBadge from '@/components/ui/SwasthyaBadge';
import { patientApi, ChronicCondition, Consultation, Notification } from '@/services/endpoints';
import { notificationsApi } from '@/services/endpoints';

const getGreeting = (name: string) => {
  const firstName = name.split(' ')[0] || name;
  const hour = new Date().getHours();
  let timeGreeting = 'Good day';
  if (hour < 12) timeGreeting = 'Good morning';
  else if (hour < 17) timeGreeting = 'Good afternoon';
  else timeGreeting = 'Good evening';
  return `${timeGreeting}, ${firstName}`;
};

interface QuickActionProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  tone?: 'primary' | 'gold' | 'signal' | 'clay';
}

const QuickActionTile: React.FC<QuickActionProps> = ({ label, icon, onPress, tone = 'primary' }) => {
  const toneStyles = {
    primary: { bg: Colors.softSage, icon: Colors.primary, border: Colors.primaryLight },
    gold: { bg: '#FFF8E1', icon: '#B8860B', border: '#FFE082' },
    signal: { bg: '#E3F2FD', icon: Colors.signalBlue, border: '#BBDEFB' },
    clay: { bg: '#FFF3EC', icon: Colors.alert, border: '#F8D6BE' },
  }[tone];
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.quickTile,
        { backgroundColor: toneStyles.bg, borderColor: toneStyles.border },
      ]}
    >
      <View style={[styles.quickIcon, { backgroundColor: '#fff', borderColor: toneStyles.border }]}>
        <Ionicons name={icon} size={26} color={toneStyles.icon} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const HomeDashboardScreen: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [conditions, setConditions] = useState<ChronicCondition[]>([]);
  const [recentConsultation, setRecentConsultation] = useState<Consultation | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadSummary = async () => {
    try {
      const [condRes, consRes, notifRes] = await Promise.allSettled([
        patientApi.getChronicConditions(),
        patientApi.getConsultations(),
        notificationsApi.getAll(),
      ]);
      if (condRes.status === 'fulfilled' && condRes.value.success) {
        setConditions(condRes.value.data ?? []);
      }
      if (consRes.status === 'fulfilled' && consRes.value.success) {
        const list = consRes.value.data ?? [];
        setRecentConsultation(list[0] ?? null);
      }
      if (notifRes.status === 'fulfilled' && notifRes.value.success) {
        const unread = (notifRes.value.data ?? []).filter((n: Notification) => !n.is_read).length;
        setUnreadCount(unread);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshProfile(), loadSummary()]);
    setRefreshing(false);
  };

  const gotoNotifications = () => router.push('/notifications' as any);

  if (!profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
        <LoadingState label={t.loading} />
      </SafeAreaView>
    );
  }

  const activeConditions = conditions.filter((c) => c.status?.toLowerCase() !== 'resolved');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>{getGreeting(profile.full_name)}</Text>
            <Text style={styles.subGreeting}>{t.howAreYou}</Text>
          </View>
          <TouchableOpacity
            onPress={gotoNotifications}
            style={styles.notifBell}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.text} />
            {unreadCount > 0 ? (
              <View style={styles.notifDot}>
                <Text style={styles.notifDotText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: Spacing.md }}>
          <ScreenHeader title={t.yourHealthId} />
          <HealthIdCard profile={profile} />
        </View>

        {activeConditions.length > 0 ? (
          <View style={{ marginTop: Spacing.sm }}>
            <SectionTitle>{activeConditions.length === 1 ? 'Chronic Condition' : 'Chronic Conditions'}</SectionTitle>
            <View style={styles.conditionChipRow}>
              {activeConditions.slice(0, 3).map((c) => (
                <SwasthyaBadge
                  key={c.id}
                  label={c.condition_name}
                  tone={c.status?.toLowerCase() === 'managed' ? 'success' : 'warning'}
                  style={{ marginBottom: Spacing.xs }}
                />
              ))}
              {activeConditions.length > 3 ? (
                <SwasthyaBadge label={`+${activeConditions.length - 3} more`} tone="info" />
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={{ marginTop: Spacing.lg }}>
          <SectionTitle>{t.quickActions}</SectionTitle>
          <View style={styles.quickGrid}>
            <QuickActionTile
              label={t.scanPrescription}
              icon="scan-outline"
              tone="primary"
              onPress={() => router.push('/scan' as any)}
            />
            <QuickActionTile
              label={t.myRecords}
              icon="folder-open-outline"
              tone="signal"
              onPress={() => router.push('/records' as any)}
            />
            <QuickActionTile
              label={t.chronicConditions}
              icon="pulse-outline"
              tone="clay"
              onPress={() => router.push('/conditions' as any)}
            />
            <QuickActionTile
              label={t.aiChat}
              icon="chatbubble-ellipses-outline"
              tone="gold"
              onPress={() => router.push('/chat' as any)}
            />
          </View>
        </View>

        {recentConsultation ? (
          <View style={{ marginTop: Spacing.lg }}>
            <SectionTitle>Recent Consultation</SectionTitle>
            <RecentConsultationCard consultation={recentConsultation} />
          </View>
        ) : null}

        <View style={{ height: BottomTabInset + Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const RecentConsultationCard: React.FC<{ consultation: Consultation }> = ({ consultation }) => {
  const dateLabel = (() => {
    try {
      const d = new Date(consultation.consultation_date || consultation.created_at);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  })();

  const statusTone =
    consultation.status === 'completed' ? 'success' : consultation.status === 'awaiting_report' ? 'warning' : 'info';
  const statusLabel =
    consultation.status === 'completed'
      ? 'Completed'
      : consultation.status === 'awaiting_report'
      ? 'Awaiting Report'
      : 'Ongoing';

  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.lg,
        padding: Spacing.md,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: Typography.bodyBold.fontSize, fontWeight: '600', color: Colors.text }}>
            {consultation.probable_diagnosis || consultation.confirmed_diagnosis || 'Consultation'}
          </Text>
          <Text style={{ marginTop: 2, fontSize: Typography.small.fontSize, color: Colors.textSecondary }}>
            {dateLabel}
          </Text>
        </View>
        <SwasthyaBadge label={statusLabel} tone={statusTone} />
      </View>
      {consultation.symptoms ? (
        <Text
          numberOfLines={2}
          style={{
            marginTop: Spacing.sm,
            fontSize: Typography.small.fontSize,
            color: Colors.text,
            lineHeight: Typography.small.lineHeight,
          }}
        >
          {consultation.symptoms}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  greetingText: {
    fontSize: Typography.h1.fontSize,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: Typography.h1.lineHeight,
    letterSpacing: -0.5,
  },
  subGreeting: {
    marginTop: 2,
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
  },
  notifBell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.alert,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notifDotText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  conditionChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  quickTile: {
    width: '50%',
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.md,
  },
  quickIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  quickLabel: {
    fontSize: Typography.smallBold.fontSize,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: Typography.smallBold.lineHeight,
  },
});

export default HomeDashboardScreen;
