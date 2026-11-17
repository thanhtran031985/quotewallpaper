import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Stack } from 'expo-router';
import { WallpaperCanvas } from '../src/components/WallpaperCanvas';
import { LockScreenOverlay } from '../src/components/LockScreenOverlay';
import { BUILTIN_TEMPLATES } from '../src/templates/builtin';
import { WallpaperImage, Quote } from '../src/domain/types';

const sampleImage: WallpaperImage = {
  id: 'dev-img',
  name: 'Núi bình minh',
  source: 'default',
  uri: 'default-1',
  width: 1080,
  height: 1920,
  focalPoint: { x: 0.5, y: 0.5 },
  enabled: true,
  createdAt: '2026-01-01',
};

const sampleQuote: Quote = {
  id: 'dev-quote',
  text: 'Cuộc sống không phải là việc chờ đợi cơn bão đi qua, mà là học cách nhảy múa dưới những cơn mưa rào.',
  author: 'Vivian Greene',
  enabled: true,
  favorite: false,
  source: 'default',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

export default function DevCanvasScreen() {
  const [showClockZone, setShowClockZone] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const canvasWidth = Math.min(360, screenWidth - 32);
  const canvasHeight = Math.round(canvasWidth * (16 / 9));

  if (!__DEV__) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Dev: 8 Mẫu Template', headerShown: true }} />

      <View style={styles.header}>
        <Text style={styles.title}>Đối chiếu 8 mẫu builtin</Text>
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() => setShowClockZone(!showClockZone)}
          activeOpacity={0.8}
        >
          <Text style={styles.toggleBtnText}>
            {showClockZone ? 'Ẩn vùng đồng hồ' : 'Hiện vùng đồng hồ'}
          </Text>
        </TouchableOpacity>
      </View>

      {BUILTIN_TEMPLATES.map((tpl, idx) => (
        <View key={tpl.id} style={styles.templateCard}>
          <Text style={styles.templateTitle}>
            #{idx + 1} — {tpl.name} ({tpl.id})
          </Text>
          <View style={[styles.canvasWrapper, { width: canvasWidth, height: canvasHeight }]}>
            <WallpaperCanvas
              image={sampleImage}
              quote={sampleQuote}
              template={tpl}
              width={canvasWidth}
              height={canvasHeight}
              showAuthor={true}
            />
            <LockScreenOverlay showClockZone={showClockZone} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F12',
  },
  content: {
    padding: 16,
    paddingBottom: 60,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  toggleBtn: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  templateCard: {
    marginBottom: 28,
    alignItems: 'center',
  },
  templateTitle: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  canvasWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
});
