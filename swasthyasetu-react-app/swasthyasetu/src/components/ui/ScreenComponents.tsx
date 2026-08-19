import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
  padding = 'md',
}) => {
  const paddingVal =
    padding === 'none' ? 0 : padding === 'sm' ? Spacing.sm : padding === 'lg' ? Spacing.lg : Spacing.md;
  return (
    <View style={[styles.container, { paddingHorizontal: paddingVal }, style]}>
      {children}
    </View>
  );
};

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightIcon?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, subtitle, rightIcon }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>
      {rightIcon}
    </View>
  );
};

interface StateProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

export const LoadingState: React.FC<{ label?: string }> = ({ label }) => {
  return (
    <View style={styles.stateContainer}>
      <PulseSkeleton />
      {label ? <Text style={[styles.stateSubtitle, { marginTop: Spacing.lg }]}>{label}</Text> : null}
    </View>
  );
};

export const EmptyState: React.FC<StateProps> = ({ title, subtitle, icon = 'document-text-outline', iconColor }) => {
  return (
    <View style={styles.stateContainer}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: Colors.softSage },
        ]}
      >
        <Ionicons name={icon} size={40} color={iconColor ?? Colors.primary} />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      {subtitle ? <Text style={styles.stateSubtitle}>{subtitle}</Text> : null}
    </View>
  );
};

export const ErrorState: React.FC<
  StateProps & { onRetry?: () => void; retryLabel?: string }
> = ({ title, subtitle, icon = 'alert-circle-outline', iconColor, onRetry, retryLabel }) => {
  return (
    <View style={styles.stateContainer}>
      <View style={[styles.iconCircle, { backgroundColor: '#FFEBEE' }]}>
        <Ionicons name={icon} size={40} color={iconColor ?? Colors.alert} />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      {subtitle ? <Text style={[styles.stateSubtitle, { textAlign: 'center' }]}>{subtitle}</Text> : null}
      {onRetry ? (
        <View style={{ marginTop: Spacing.lg }}>
          <RetryButton label={retryLabel ?? 'Retry'} onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
};

const RetryButton: React.FC<{ label: string; onPress: () => void }> = ({ label, onPress }) => {
  return (
    <View
      style={{
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.sm + 2,
        paddingHorizontal: Spacing.lg,
        borderRadius: Radius.md,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '600', fontSize: Typography.body.fontSize }}>{label}</Text>
    </View>
  );
};

export const PulseSkeleton: React.FC = () => {
  const rows = [70, 90, 60, 100, 75];
  return (
    <View style={{ width: '100%', gap: Spacing.md, paddingHorizontal: Spacing.xl }}>
      {rows.map((w, i) => (
        <View
          key={i}
          style={{
            height: Spacing.lg,
            width: `${w}%`,
            backgroundColor: Colors.softSage,
            borderRadius: Radius.md,
            opacity: 0.5 + (i % 2) * 0.2,
          }}
        />
      ))}
      <View
        style={{
          height: 140,
          width: '100%',
          backgroundColor: Colors.softSage,
          borderRadius: Radius.lg,
          opacity: 0.6,
        }}
      />
    </View>
  );
};

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

export const Separator: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.separator, style]} />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Spacing.md,
  },
  header: {
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
    color: Colors.text,
    lineHeight: Typography.h2.lineHeight,
  },
  headerSubtitle: {
    marginTop: Spacing.xs,
    fontSize: Typography.small.fontSize,
    color: Colors.textSecondary,
    lineHeight: Typography.small.lineHeight,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  stateTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  stateSubtitle: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    lineHeight: Typography.body.lineHeight,
    maxWidth: 320,
  },
  sectionTitle: {
    fontSize: Typography.smallBold.fontSize,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
});
