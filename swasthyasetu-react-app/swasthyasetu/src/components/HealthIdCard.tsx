import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Colors, Typography, Spacing, Radius, Fonts } from '@/constants/theme';
import { PatientProfile } from '@/services/endpoints';

interface HealthIdCardProps {
  profile: PatientProfile;
  compact?: boolean;
}

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
};

const ageFromDob = (iso: string) => {
  try {
    const d = new Date(iso);
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return `${age} yrs`;
  } catch {
    return '';
  }
};

const HealthIdCard: React.FC<HealthIdCardProps> = ({ profile, compact = false }) => {
  return (
    <View style={[styles.cardOuter, compact && styles.cardOuterCompact]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.brandText}>SwasthyaSetu</Text>
          <Text style={styles.brandSubtitle}>National Health ID</Text>
        </View>
        <View style={styles.govBadge}>
          <Text style={styles.govBadgeText}>ID</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nameText}>{profile.full_name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>DOB</Text>
            <Text style={styles.metaValue}>{formatDate(profile.date_of_birth)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Age</Text>
            <Text style={styles.metaValue}>{ageFromDob(profile.date_of_birth)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Gender</Text>
            <Text style={styles.metaValue}>
              {profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : '—'}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Blood</Text>
            <Text style={[styles.metaValue, { color: Colors.alert, fontFamily: Platform.select({ web: (Fonts as any).web.mono }) }]}>
              {profile.blood_group || '—'}
            </Text>
          </View>
        </View>

        <View style={styles.qrWrapper}>
          <View style={styles.qrInner}>
            <QRCode
              value={profile.health_id}
              size={compact ? 80 : 96}
              color={Colors.primary}
              backgroundColor="#FFFFFF"
            />
          </View>
          <Text style={styles.healthIdText} numberOfLines={1}>
            {profile.health_id}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.footerText}>
          Emergency: {profile.emergency_contact || 'Not provided'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardOuter: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 4,
    marginBottom: Spacing.md,
  },
  cardOuterCompact: {
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softSage,
  },
  brandText: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    marginTop: 2,
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  govBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  govBadgeText: {
    color: '#fff',
    fontSize: Typography.smallBold.fontSize,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardBody: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  nameText: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: Spacing.md,
  },
  metaLabel: {
    width: 56,
    fontSize: Typography.caption.fontSize,
    fontWeight: '500',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: Typography.small.fontSize,
    fontWeight: '500',
    color: Colors.text,
  },
  qrWrapper: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  qrInner: {
    backgroundColor: '#fff',
    padding: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  healthIdText: {
    fontFamily: Platform.select({ web: (Fonts as any).web.mono }),
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 0.5,
    maxWidth: 110,
  },
  cardFooter: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.softSage,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.small.fontSize,
    color: Colors.textSecondary,
  },
});

export default HealthIdCard;
