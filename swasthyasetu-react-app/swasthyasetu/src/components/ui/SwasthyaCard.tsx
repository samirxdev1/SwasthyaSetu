import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'soft';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const SwasthyaCard: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'md',
}) => {
  const paddingValue =
    padding === 'none' ? 0 : padding === 'sm' ? Spacing.sm : padding === 'lg' ? Spacing.lg : Spacing.md;

  return (
    <View
      style={[
        styles.base,
        {
          padding: paddingValue,
          backgroundColor: variant === 'soft' ? Colors.softSage : Colors.surface,
          shadowColor: variant === 'elevated' ? Colors.primary : Colors.text,
          shadowOpacity: variant === 'elevated' ? 0.12 : 0.05,
          shadowOffset: { width: 0, height: variant === 'elevated' ? 4 : 1 },
          shadowRadius: variant === 'elevated' ? 12 : 4,
          elevation: variant === 'elevated' ? 4 : 1,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

export default SwasthyaCard;
