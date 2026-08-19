import React, { useEffect, useState, useCallback } from 'react';
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
import { Colors, Typography, Spacing, Radius, BottomTabInset } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import SwasthyaBadge from '@/components/ui/SwasthyaBadge';
import {
  LoadingState,
  EmptyState,
  ErrorState,
  ScreenHeader,
} from '@/components/ui/ScreenComponents';
import { notificationsApi, Notification } from '@/services/endpoints';
import { getErrorMessage } from '@/services/api';

const formatRelative = (iso: string) => {
  try {
    const d = new Date(iso).getTime();
    const now = Date.now();
    const diff = Math.max(0, now - d);
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Just now';
    if (min < 60) return `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hr ago`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day} day${day > 1 ? 's' : ''} ago`;
    const w = Math.floor(day / 7);
    if (w < 5) return `${w} week${w > 1 ? 's' : ''} ago`;
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

const typeIcon = (type?: string): keyof typeof Ionicons.glyphMap => {
  const t = (type || '').toLowerCase();
  if (t.includes('report')) return 'document-text-outline';
  if (t.includes('drug') || t.includes('interaction') || t.includes('alert')) return 'alert-circle-outline';
  if (t.includes('appointment') || t.includes('consultation')) return 'calendar-outline';
  if (t.includes('scan') || t.includes('prescription')) return 'scan-outline';
  return 'notifications-outline';
};

const typeTone = (type?: string): 'info' | 'warning' | 'success' | 'primary' => {
  const t = (type || '').toLowerCase();
  if (t.includes('report')) return 'success';
  if (t.includes('drug') || t.includes('interaction') || t.includes('alert')) return 'warning';
  if (t.includes('appointment')) return 'primary';
  return 'info';
};

const NotificationsScreen: React.FC = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await notificationsApi.getAll();
      if (res.success) {
        const arr = res.data ?? [];
        arr.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
        setItems(arr);
        setError(null);
      } else {
        setError(res.message || 'Failed to load notifications.');
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

  const onTap = async (item: Notification) => {
    if (item.is_read) return;
    setMarkingId(item.id);
    try {
      const res = await notificationsApi.markRead(item.id);
      if (res.success) {
        setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)));
      }
    } catch (_e) {
      // ignore
    } finally {
      setMarkingId(null);
    }
  };

  const unreadCount = items.filter((n) => !n.is_read).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        title={t.notificationsTitle}
        subtitle={
          unreadCount > 0
            ? `${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}`
            : 'All caught up'
        }
        rightIcon={
          unreadCount > 0 ? (
            <SwasthyaBadge tone="warning" label={`${unreadCount} new`} size="md" />
          ) : undefined
        }
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
            title="Couldn't load notifications"
            subtitle={error}
            onRetry={onRefresh}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title={t.noNotifications}
            subtitle="Updates about your reports, prescriptions, and visits will appear here."
            icon="notifications-off-outline"
          />
        ) : (
          items.map((it, idx) => (
            <TouchableOpacity
              key={it.id}
              activeOpacity={0.8}
              onPress={() => onTap(it)}
              style={[
                styles.notifCard,
                !it.is_read && styles.notifCardUnread,
                markingId === it.id && { opacity: 0.7 },
              ]}
            >
              <View style={[styles.iconPill, !it.is_read && styles.iconPillUnread]}>
                <Ionicons
                  name={typeIcon(it.type)}
                  size={20}
                  color={!it.is_read ? Colors.primary : Colors.textSecondary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                  <Text
                    style={[
                      styles.notifTitle,
                      !it.is_read && { fontWeight: '700', color: Colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {it.title}
                  </Text>
                  {!it.is_read ? <View style={styles.unreadDot} /> : null}
                </View>
                <Text style={styles.notifMessage} numberOfLines={3}>
                  {it.message}
                </Text>
                <View style={{ marginTop: Spacing.xs, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                  <Text style={styles.notifTime}>{formatRelative(it.created_at)}</Text>
                  <SwasthyaBadge
                    tone={typeTone(it.type)}
                    label={(it.type || 'info').replace(/_/g, ' ')}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: BottomTabInset + Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.md },
  list: { paddingTop: Spacing.xs },
  notifCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  notifCardUnread: {
    backgroundColor: '#FCFFFE',
    borderColor: Colors.primaryLight,
    shadowColor: Colors.primary,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  iconPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillUnread: {
    backgroundColor: Colors.softSage,
  },
  notifTitle: {
    flex: 1,
    fontSize: Typography.bodyBold.fontSize,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  notifMessage: {
    marginTop: 2,
    fontSize: Typography.small.fontSize,
    color: Colors.text,
    lineHeight: Typography.small.lineHeight + 2,
  },
  notifTime: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});

export default NotificationsScreen;
