import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius } from '../../utils/theme';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  icon?: ReactNode;
  style?: ViewStyle;
}

const variantStyles = {
  success: {
    backgroundColor: colors.success[50],
    textColor: colors.success[700],
    borderColor: colors.success[100],
  },
  warning: {
    backgroundColor: colors.warning[50],
    textColor: colors.warning[700],
    borderColor: colors.warning[100],
  },
  danger: {
    backgroundColor: colors.danger[50],
    textColor: colors.danger[700],
    borderColor: colors.danger[100],
  },
  info: {
    backgroundColor: colors.primary[50],
    textColor: colors.primary[700],
    borderColor: colors.primary[100],
  },
  neutral: {
    backgroundColor: colors.slate[100],
    textColor: colors.slate[700],
    borderColor: colors.slate[200],
  },
};

export function Badge({ children, variant = 'neutral', icon, style }: BadgeProps) {
  const variantStyle = variantStyles[variant];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
        },
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.text, { color: variantStyle.textColor }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});
