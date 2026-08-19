import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, MinTapTarget } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const SwasthyaButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  fullWidth = false,
}) => {
  const isDisabled = disabled || loading;

  const getBackgroundColor = () => {
    if (isDisabled) {
      return variant === 'ghost' ? 'transparent' : Colors.border;
    }
    switch (variant) {
      case 'primary':
        return Colors.primary;
      case 'secondary':
        return Colors.softSage;
      case 'outline':
      case 'ghost':
        return 'transparent';
      case 'danger':
        return Colors.alert;
      default:
        return Colors.primary;
    }
  };

  const getBorderColor = () => {
    if (isDisabled) return Colors.border;
    switch (variant) {
      case 'outline':
        return Colors.primary;
      case 'primary':
        return Colors.primary;
      case 'secondary':
        return Colors.softSage;
      case 'danger':
        return Colors.alert;
      default:
        return 'transparent';
    }
  };

  const getTextColor = () => {
    if (isDisabled) return Colors.textSecondary;
    switch (variant) {
      case 'primary':
      case 'danger':
        return '#FFFFFF';
      case 'secondary':
      case 'outline':
      case 'ghost':
        return Colors.primary;
      default:
        return '#FFFFFF';
    }
  };

  const paddingVertical = size === 'sm' ? Spacing.sm : size === 'lg' ? Spacing.md : Spacing.sm + 2;
  const paddingHorizontal = size === 'sm' ? Spacing.md : size === 'lg' ? Spacing.xl : Spacing.lg;

  return (
    <TouchableOpacity
      activeOpacity={isDisabled ? 1 : 0.85}
      onPress={isDisabled ? undefined : onPress}
      style={[
        styles.base,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          paddingVertical,
          paddingHorizontal,
          minHeight: MinTapTarget,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        variant !== 'ghost' && variant !== 'outline'
          ? { shadowColor: Colors.primary, shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 }
          : {},
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {icon ? icon : null}
          <Text
            style={[
              {
                color: getTextColor(),
                fontSize: size === 'sm' ? Typography.smallBold.fontSize : Typography.bodyBold.fontSize,
                fontWeight: '600',
                marginLeft: icon ? Spacing.xs : 0,
                ...Platform.select({ web: { userSelect: 'none' } }),
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
});

export default SwasthyaButton;
