import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

export default function QuotesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
      <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>Danh ngôn</Text>
      <Text style={[styles.subtitle, { color: isDark ? '#8E8E93' : '#6C6C70' }]}>
        Kho danh ngôn của bạn
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});
