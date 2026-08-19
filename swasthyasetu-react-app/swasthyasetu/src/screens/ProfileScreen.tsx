import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, BottomTabInset, Fonts } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLanguage, Language, LanguageStrings } from '@/context/LanguageContext';
import SwasthyaButton from '@/components/ui/SwasthyaButton';
import SwasthyaCard from '@/components/ui/SwasthyaCard';
import SwasthyaBadge from '@/components/ui/SwasthyaBadge';
import HealthIdCard from '@/components/HealthIdCard';
import { ScreenHeader, Separator } from '@/components/ui/ScreenComponents';
import { PatientProfile } from '@/services/endpoints';

const LANGUAGE_OPTIONS: { key: Language; label: string; native: string }[] = [
  { key: 'en', label: 'English', native: 'English' },
  { key: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { key: 'mr', label: 'Marathi', native: 'मराठी' },
  { key: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
];

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
};

const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

const InfoRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | React.ReactNode;
  mono?: boolean;
}> = ({ icon, label, value, mono }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <Ionicons name={icon} size={16} color={Colors.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      {typeof value === 'string' ? (
        <Text
          style={[
            styles.infoValue,
            mono && { fontFamily: Platform.select({ web: (Fonts as any).web.mono }) },
          ]}
        >
          {value || '—'}
        </Text>
      ) : (
        value
      )}
    </View>
  </View>
);

const ProfileScreen: React.FC = () => {
  const { profile, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const [langPickerOpen, setLangPickerOpen] = useState(false);

  const confirmLogout = () => {
    Alert.alert(t.appName, t.logoutConfirm, [
      { text: t.no, style: 'cancel' },
      {
        text: t.yes,
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login' as any);
        },
      },
    ]);
  };

  const currentLang = LANGUAGE_OPTIONS.find((l) => l.key === language) || LANGUAGE_OPTIONS[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ScreenHeader title={t.profileTitle} subtitle="Manage your account and preferences" />

        {profile ? (
          <>
            <HealthIdCard profile={profile as PatientProfile} />

            <SwasthyaCard style={{ marginBottom: Spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {profile.full_name
                      .split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nameText}>{profile.full_name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: 2 }}>
                    <Ionicons name="shield-checkmark-outline" size={14} color={Colors.primary} />
                    <Text style={styles.verifiedText}>Verified Patient</Text>
                  </View>
                </View>
              </View>

              <Separator />

              <Text style={styles.sectionHead}>{t.personalInfo}</Text>

              <InfoRow
                icon="card-outline"
                label={t.healthId}
                value={profile.health_id}
                mono
              />
              <InfoRow icon="mail-outline" label="Email" value={profile.user_id ? (profile as any).email : '—'} />
              <InfoRow icon="calendar-outline" label={t.dob} value={formatDate(profile.date_of_birth)} />
              <InfoRow icon="person-outline" label={t.gender} value={capitalize(profile.gender)} />
              <InfoRow
                icon="water-outline"
                label={t.bloodGroup}
                value={
                  profile.blood_group ? (
                    <Text
                      style={{
                        fontSize: Typography.bodyBold.fontSize,
                        fontWeight: '700',
                        color: Colors.alert,
                      }}
                    >
                      {profile.blood_group}
                    </Text>
                  ) : (
                    '—'
                  )
                }
              />
              <InfoRow icon="location-outline" label={t.address} value={profile.address} />
              <InfoRow icon="call-outline" label={t.emergencyContact} value={profile.emergency_contact} />
            </SwasthyaCard>
          </>
        ) : null}

        <Text style={styles.sectionHead}>{t.settings}</Text>

        <SwasthyaCard style={{ marginBottom: Spacing.md, padding: 0 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setLangPickerOpen(true)}
            style={styles.settingRow}
          >
            <View style={[styles.settingIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="language-outline" size={18} color={Colors.signalBlue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>{t.languagePreference}</Text>
              <Text style={styles.settingValue}>
                {currentLang.label}  •  {currentLang.native}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          <Separator style={{ marginVertical: 0, marginHorizontal: Spacing.md }} />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/notifications' as any)}
            style={styles.settingRow}
          >
            <View style={[styles.settingIcon, { backgroundColor: '#FFF8E1' }]}>
              <Ionicons name="notifications-outline" size={18} color={Colors.honeyGold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>{t.notificationsTitle}</Text>
              <Text style={styles.settingValue}>View updates and alerts</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          <Separator style={{ marginVertical: 0, marginHorizontal: Spacing.md }} />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/conditions' as any)}
            style={styles.settingRow}
          >
            <View style={[styles.settingIcon, { backgroundColor: Colors.softSage }]}>
              <Ionicons name="pulse-outline" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>{t.conditionsTitle}</Text>
              <Text style={styles.settingValue}>Review long-term conditions</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </SwasthyaCard>

        <View style={{ marginTop: Spacing.xs, marginBottom: Spacing.md }}>
          <SwasthyaButton
            title={t.logout}
            icon={<Ionicons name="log-out-outline" size={18} color="#fff" />}
            variant="danger"
            fullWidth
            size="lg"
            onPress={confirmLogout}
          />
        </View>

        <View style={styles.footer}>
          <SwasthyaBadge tone="primary" label={t.appName} />
          <Text style={styles.footerText}>
            Patient Mobile App  •  Your data is protected end-to-end
          </Text>
          <Text style={styles.footerSub}>v1.0.0</Text>
        </View>

        <View style={{ height: BottomTabInset + Spacing.xxl }} />
      </ScrollView>

      <Modal
        visible={langPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setLangPickerOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{t.languagePreference}</Text>
            <View style={{ gap: Spacing.xs, marginTop: Spacing.md }}>
              {LANGUAGE_OPTIONS.map((opt) => {
                const selected = language === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    activeOpacity={0.8}
                    onPress={async () => {
                      await setLanguage(opt.key);
                      setLangPickerOpen(false);
                    }}
                    style={[
                      styles.langOption,
                      selected && {
                        backgroundColor: Colors.softSage,
                        borderColor: Colors.primary,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.langLabel}>{opt.label}</Text>
                      <Text style={styles.langNative}>{opt.native}</Text>
                    </View>
                    {selected ? (
                      <View style={styles.checkCircle}>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={{ marginTop: Spacing.lg }}>
              <SwasthyaButton
                title={t.cancel}
                variant="outline"
                fullWidth
                onPress={() => setLangPickerOpen(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.md },
  content: { paddingTop: Spacing.sm },
  sectionHead: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    letterSpacing: 1,
  },
  nameText: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '700',
    color: Colors.text,
  },
  verifiedText: {
    fontSize: Typography.small.fontSize,
    color: Colors.primary,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.softSage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: Typography.bodyBold.fontSize,
    fontWeight: '600',
    color: Colors.text,
  },
  settingValue: {
    marginTop: 2,
    fontSize: Typography.small.fontSize,
    color: Colors.textSecondary,
  },
  footer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  footerText: {
    fontSize: Typography.small.fontSize,
    color: Colors.textSecondary,
  },
  footerSub: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    opacity: 0.7,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  langLabel: {
    fontSize: Typography.bodyBold.fontSize,
    fontWeight: '600',
    color: Colors.text,
  },
  langNative: {
    marginTop: 2,
    fontSize: Typography.small.fontSize,
    color: Colors.textSecondary,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfileScreen;
