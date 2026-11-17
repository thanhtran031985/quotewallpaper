import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TextStyle,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { triggerImpact } from '../services/haptics';

export interface GlassButtonProps {
  label?: string;
  icon?: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  testID?: string;
  variant?: 'glass' | 'primary' | 'tinted';
}

export function GlassButton({
  label,
  icon,
  onPress,
  style,
  textStyle,
  accessibilityLabel,
  testID = 'glass-button',
  variant = 'glass',
}: GlassButtonProps) {
  const handlePress = () => {
    triggerImpact();
    onPress();
  };

  const isPrimary = variant === 'primary';
  const isTinted = variant === 'tinted';

  return (
    <TouchableOpacity
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      style={[
        styles.button,
        isPrimary && styles.primaryButton,
        isTinted && styles.tintedButton,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.75}
    >
      {!isPrimary && !isTinted && (
        <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
      )}
      <View style={styles.content}>
        {icon}
        {label ? (
          <Text
            style={[
              styles.label,
              isPrimary && styles.primaryLabel,
              isTinted && styles.tintedLabel,
              textStyle,
            ]}
          >
            {label}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    minWidth: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: '#0A84FF',
    borderColor: 'transparent',
  },
  tintedButton: {
    backgroundColor: 'rgba(10, 132, 255, 0.12)',
    borderColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryLabel: {
    color: '#FFFFFF',
  },
  tintedLabel: {
    color: '#0A84FF',
  },
});
