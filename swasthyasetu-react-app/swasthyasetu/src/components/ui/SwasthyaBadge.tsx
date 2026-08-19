import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Radius, Spacing } from '@/constants/theme';

type BadgeTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'gold';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

const toneStyles: Record<BadgeTone, { bg: string; text: string; border: string }> = {
  primary: { bg: Colors.softSage, text: Colors.primary, border: Colors.primaryLight },
  success: { bg: '#E8F5E9', text: '#2E7D32', border: '#C8E6C9' },
  warning: { bg: '#FFF8E1', text: '#C9754A', border: '#FFE0B2' },
  danger: { bg: '#FFEBEE', text: '#C62828', border: '#FFCDD2' },
  info: { bg: '#E3F2FD', text: '#3B7A9E', border: '#BBDEFB' },
  neutral: { bg: '#F5F5F5', text: '#5A6B69', border: '#E0E0E0' },
  gold: { bg: '#FFF8E1', text: '#B8860B', border: '#FFE082' },
};

const SwasthyaBadge: React.FC<BadgeProps> = ({
  label,
  tone = 'primary',
  style,
  size = 'sm',
}) => {
  const toneS = toneStyles[tone];
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: toneS.bg,
          borderColor: toneS.border,
          paddingVertical: size === 'sm' ? 3 : Spacing.xs,
          paddingHorizontal: size === 'sm' ? Spacing.sm : Spacing.md,
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            color: toneS.text,
            fontSize: size === 'sm' ? Typography.caption.fontSize : Typography.smallBold.fontSize,
            fontWeight: '600',
            letterSpacing: 0.2,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
});

export default SwasthyaBadge;
