import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  LayoutChangeEvent,
  GestureResponderEvent,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLibraryStore } from '../src/store/useLibraryStore';
import { useTheme } from '../src/theme/useTheme';
import { haptics } from '../src/services/haptics';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PREVIEW_WIDTH = SCREEN_WIDTH - 48;
const PREVIEW_HEIGHT = Math.floor(PREVIEW_WIDTH * 1.5);

export default function ImageFocalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const images = useLibraryStore((state) => state.images);
  const updateImageFocalPoint = useLibraryStore((state) => state.updateImageFocalPoint);

  const image = useMemo(() => images.find((img) => img.id === id) ?? null, [images, id]);

  const [focal, setFocal] = useState<{ x: number; y: number }>({
    x: image?.focalPoint?.x ?? 0.5,
    y: image?.focalPoint?.y ?? 0.5,
  });

  const [canvasLayout, setCanvasLayout] = useState<{ width: number; height: number }>({
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
  });

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setCanvasLayout({ width, height });
    }
  };

  const handleTouch = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    const fx = Math.max(0, Math.min(1, locationX / canvasLayout.width));
    const fy = Math.max(0, Math.min(1, locationY / canvasLayout.height));

    haptics.impact('light');
    setFocal({
      x: Number(fx.toFixed(2)),
      y: Number(fy.toFixed(2)),
    });
  };

  const handleSave = () => {
    if (image) {
      updateImageFocalPoint(image.id, focal);
      haptics.notification('success');
    }
    router.back();
  };

  const handleCancel = () => {
    haptics.impact('light');
    router.back();
  };

  const handleResetCenter = () => {
    haptics.impact('light');
    setFocal({ x: 0.5, y: 0.5 });
  };

  const imageSource = image?.uri.startsWith('default-')
    ? require('../assets/images/icon.png')
    : { uri: image?.uri };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.primary }]}>
      {/* Sheet Grabber */}
      <View style={styles.grabberContainer}>
        <View style={[styles.grabber, { backgroundColor: theme.colors.text.tertiary }]} />
      </View>

      {/* Header bar */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border.subtle }]}>
        <TouchableOpacity
          onPress={handleCancel}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Hủy"
        >
          <Text style={[styles.headerBtnText, { color: theme.colors.tint.primary }]}>Hủy</Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Điểm lấy nét</Text>

        <TouchableOpacity
          onPress={handleSave}
          style={[styles.headerBtn, { alignItems: 'flex-end' }]}
          accessibilityRole="button"
          accessibilityLabel="Lưu"
        >
          <Text
            style={[styles.headerBtnText, styles.saveBtnText, { color: theme.colors.tint.primary }]}
          >
            Lưu
          </Text>
        </TouchableOpacity>
      </View>

      {/* Description */}
      <View style={styles.descriptionBox}>
        <Text style={[styles.descriptionText, { color: theme.colors.text.secondary }]}>
          Chạm vào vùng quan trọng nhất của bức ảnh. Hình nền sẽ ưu tiên giữ vùng này ở trung tâm
          khi cắt theo tỉ lệ màn hình.
        </Text>
      </View>

      {/* Main Preview Container */}
      <View style={[styles.previewContainer, { paddingBottom: insets.bottom + 24 }]}>
        <View
          style={[
            styles.touchArea,
            {
              width: PREVIEW_WIDTH,
              height: PREVIEW_HEIGHT,
              backgroundColor: theme.colors.bg.card,
              borderColor: theme.colors.border.subtle,
            },
          ]}
          onLayout={handleLayout}
          onStartShouldSetResponder={() => true}
          onResponderRelease={handleTouch}
          testID="focal-touch-area"
        >
          {image && <Image source={imageSource} style={styles.image} contentFit="cover" />}

          {/* Target Reticle Indicator */}
          <View
            style={[
              styles.reticle,
              {
                left: focal.x * canvasLayout.width - 24,
                top: focal.y * canvasLayout.height - 24,
              },
            ]}
            pointerEvents="none"
          >
            <View style={styles.reticleOuter}>
              <View style={styles.reticleInner} />
            </View>
          </View>
        </View>

        {/* Focal Coordinate & Reset */}
        <View style={styles.footerRow}>
          <Text style={[styles.coordText, { color: theme.colors.text.tertiary }]}>
            Tọa độ: X: {Math.round(focal.x * 100)}% · Y: {Math.round(focal.y * 100)}%
          </Text>

          <TouchableOpacity
            style={[styles.resetBtn, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}
            onPress={handleResetCenter}
          >
            <Ionicons name="refresh" size={14} color={theme.colors.tint.primary} />
            <Text style={[styles.resetText, { color: theme.colors.tint.primary }]}>Về giữa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grabberContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  headerBtnText: {
    fontSize: 17,
  },
  saveBtnText: {
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  descriptionBox: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 24,
  },
  touchArea: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  reticle: {
    position: 'absolute',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 122, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  reticleInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: PREVIEW_WIDTH,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  coordText: {
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  resetText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
