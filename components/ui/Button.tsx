import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { ButtonProps } from '../../types';

// Define Colors inline for now to avoid import issues
const Colors = {
  primary: '#1e3a8a',
  primaryDark: '#1e293b',
  primaryLight: '#3b82f6',
  background: '#0f172a',
  surface: '#1e293b',
  card: '#334155',
  modal: '#475569',
  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  accent: '#06b6d4',
  accentLight: '#22d3ee',
  border: '#475569',
  borderLight: '#64748b',
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...styles[size],
    };

    switch (variant) {
      case 'primary':
        Object.assign(baseStyle, styles.primary);
        break;
      case 'secondary':
        Object.assign(baseStyle, styles.secondary);
        break;
      case 'success':
        Object.assign(baseStyle, styles.success);
        break;
      case 'warning':
        Object.assign(baseStyle, styles.warning);
        break;
      case 'error':
        Object.assign(baseStyle, styles.error);
        break;
      case 'outline':
        Object.assign(baseStyle, styles.outline);
        break;
    }

    if (disabled) {
      Object.assign(baseStyle, styles.disabled);
    }

    if (style) {
      Object.assign(baseStyle, style);
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      ...styles.text,
    };

    // Add size-specific text styles
    switch (size) {
      case 'small':
        Object.assign(baseTextStyle, styles.smallText);
        break;
      case 'medium':
        Object.assign(baseTextStyle, styles.mediumText);
        break;
      case 'large':
        Object.assign(baseTextStyle, styles.largeText);
        break;
    }

    if (variant === 'outline') {
      Object.assign(baseTextStyle, styles.outlineText);
    } else {
      Object.assign(baseTextStyle, styles.primaryText);
    }

    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? Colors.primary : Colors.white}
        />
      ) : (
        <>
          {icon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  } as ViewStyle,
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  } as ViewStyle,
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  } as ViewStyle,
  large: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 52,
  } as ViewStyle,
  primary: {
    backgroundColor: Colors.primary,
  } as ViewStyle,
  secondary: {
    backgroundColor: Colors.border,
  } as ViewStyle,
  success: {
    backgroundColor: Colors.success,
  } as ViewStyle,
  warning: {
    backgroundColor: Colors.warning,
  } as ViewStyle,
  error: {
    backgroundColor: Colors.error,
  } as ViewStyle,
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  } as ViewStyle,
  disabled: {
    opacity: 0.5,
  } as ViewStyle,
  text: {
    fontWeight: '600',
    textAlign: 'center',
  } as TextStyle,
  smallText: {
    fontSize: 14,
  } as TextStyle,
  mediumText: {
    fontSize: 16,
  } as TextStyle,
  largeText: {
    fontSize: 18,
  } as TextStyle,
  primaryText: {
    color: Colors.white,
  } as TextStyle,
  outlineText: {
    color: Colors.primary,
  } as TextStyle,
});

export default Button; 