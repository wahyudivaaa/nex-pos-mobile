import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { InputProps } from '../../types';

// Define Colors inline for consistency
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

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  error,
  icon,
  editable = true,
  style,
}) => {
  const getInputStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.inputContainer,
    };

    if (error) {
      Object.assign(baseStyle, styles.inputError);
    }

    if (!editable) {
      Object.assign(baseStyle, styles.inputDisabled);
    }

    if (style) {
      Object.assign(baseStyle, style);
    }

    return baseStyle;
  };

  const getTextInputStyle = (): TextStyle[] => {
    const inputStyles: TextStyle[] = [styles.input];

    if (multiline) {
      inputStyles.push(styles.multilineInput);
    }

    if (icon) {
      inputStyles.push(styles.inputWithIcon);
    }

    return inputStyles;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={getInputStyle()}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        
        <TextInput
          style={getTextInputStyle()}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
        />
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  } as ViewStyle,
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  } as TextStyle,
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.border,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  } as ViewStyle,
  inputError: {
    borderColor: Colors.error,
  } as ViewStyle,
  inputDisabled: {
    opacity: 0.6,
  } as ViewStyle,
  iconContainer: {
    paddingLeft: 12,
    paddingRight: 8,
  } as ViewStyle,
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 44,
  } as TextStyle,
  inputWithIcon: {
    paddingLeft: 0,
  } as TextStyle,
  multilineInput: {
    textAlignVertical: 'top',
    paddingTop: 12,
  } as TextStyle,
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  } as TextStyle,
});

export default Input;