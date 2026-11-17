import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { triggerImpact } from '../services/haptics';

export interface ChipProps {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  onPress?: () => void;
  testID?: string;
}

export function Chip({
  label,
  icon,
  active = false,
  onPress,
  testID = 'chip',
}: ChipProps) {
  const handlePress = () => {
    if (onPress) {
      triggerImpact();
      onPress();
    }
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      testID={testID}
      style={[styles.container, active && styles.activeContainer]}
      onPress={onPress ? handlePress : undefined}
      activeOpacity={0.7}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
      {icon}
      <Text style={[styles.text, active && styles.activeText]}>{label}</Text>
    </Component>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  activeContainer: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#FFFFFF',
  },
});
