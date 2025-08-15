import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface PrimaryButtonProps {
  text: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export default function PrimaryButton({ 
  text, 
  onPress, 
  disabled = false,
  variant = 'primary',
  size = 'medium'
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled
      ]} 
      onPress={onPress} 
      activeOpacity={0.85}
      disabled={disabled}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Variants
  primary: {
    backgroundColor: '#FF3D33',
  },
  secondary: {
    backgroundColor: '#6b7280',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF3D33',
  },
  // Sizes
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  // States
  disabled: {
    opacity: 0.5,
  },
  // Text styles
  text: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#fff',
  },
  outlineText: {
    color: '#FF3D33',
  },
});