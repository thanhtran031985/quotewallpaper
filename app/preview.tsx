import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableWithoutFeedback,
  PanResponder,
  AccessibilityInfo,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLibraryStore } from '../src/store/useLibraryStore';
import { useSettingsStore } from '../src/store/useSettingsStore';
import { WallpaperCanvas } from '../src/components/WallpaperCanvas';
import { LockScreenOverlay } from '../src/components/LockScreenOverlay';
import { GlassButton } from '../src/components/GlassButton';
import { Toast } from '../src/components/Toast';

export default function PreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showControls, setShowControls] = useState(true);
  const [showClockZone, setShowClockZone] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const current = useLibraryStore((state) => state.current);
  const images = useLibraryStore((state) => state.images);
  const quotes = useLibraryStore((state) => state.quotes);
  const templates = useLibraryStore((state) => state.templates);
  const shuffle = useLibraryStore((state) => state.shuffle);
  const settings = useSettingsStore();

  const curImage = current ? images.find((img) => img.id === current.imageId) : null;
  const curQuote = current ? quotes.find((q) => q.id === current.quoteId) : null;
  const curTemplate = current ? templates.find((t) => t.id === current.templateId) : null;

  const dims = Dimensions.get('window');
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Kiểm tra Reduce Motion
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled);
    });
  }, []);

  // Xử lý vuốt ngang để đổi hình nền
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > 50) {
          if (!reduceMotion) {
            Animated.sequence([
              Animated.timing(slideAnim, {
                toValue: gestureState.dx > 0 ? 50 : -50,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(slideAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
              }),
            ]).start();
          }
          shuffle();
        }
      },
    }),
  ).current;

  if (!curImage || !curQuote || !curTemplate) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={!showControls} barStyle="light-content" />

      {/* 1. Canvas toàn màn hình */}
      <TouchableWithoutFeedback onPress={() => setShowControls(!showControls)}>
        <Animated.View
          style={[styles.canvasWrapper, { transform: [{ translateX: slideAnim }] }]}
          {...panResponder.panHandlers}
        >
          <WallpaperCanvas
            image={curImage}
            quote={curQuote}
            template={curTemplate}
            width={dims.width}
            height={dims.height}
            showAuthor={settings.showAuthor}
            testID="preview-canvas"
          />
          {/* Overlay đồng hồ mô phỏng màn hình khóa iOS */}
          <LockScreenOverlay showClockZone={showClockZone} />
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* 2. Thanh nút điều khiển kính mờ ở đáy (ẩn/hiện khi chạm) */}
      {showControls && (
        <View style={[styles.bottomBar, { bottom: Math.max(34, insets.bottom + 12) }]}>
          <GlassButton
            icon={<Ionicons name="close" size={22} color="#FFFFFF" />}
            onPress={() => router.back()}
            accessibilityLabel="Đóng xem trước"
            testID="btn-close-preview"
          />

          <GlassButton
            icon={
              <Ionicons
                name={showClockZone ? 'time' : 'time-outline'}
                size={22}
                color={showClockZone ? '#0A84FF' : '#FFFFFF'}
              />
            }
            onPress={() => setShowClockZone(!showClockZone)}
            accessibilityLabel="Bật/tắt khung vùng đồng hồ"
            testID="btn-toggle-clock"
          />

          <GlassButton
            icon={<Ionicons name="shuffle" size={22} color="#FFFFFF" />}
            onPress={() => shuffle()}
            accessibilityLabel="Đổi ngẫu nhiên"
            testID="btn-shuffle-preview"
          />

          <GlassButton
            label="Lưu"
            icon={<Ionicons name="download-outline" size={20} color="#FFFFFF" />}
            onPress={() => setShowToast(true)}
            accessibilityLabel="Lưu hình nền"
            variant="primary"
            testID="btn-save-preview"
          />
        </View>
      )}

      {/* 3. Toast thông báo */}
      <Toast
        visible={showToast}
        message="Tính năng Lưu sẽ có ở Task 08"
        onDismiss={() => setShowToast(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  canvasWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
});
