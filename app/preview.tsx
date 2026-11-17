import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableWithoutFeedback,
  PanResponder,
  AccessibilityInfo,
  Animated,
  Alert,
  Modal,
  TouchableOpacity,
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
import { captureAndSaveWallpaper } from '../src/services/exportWallpaper';
import { resolveBoxLayout } from '../src/engine/layout';
import { fitText } from '../src/engine/fitText';
import { haptics } from '../src/services/haptics';

export default function PreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showControls, setShowControls] = useState(true);
  const [showClockZone, setShowClockZone] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const exportViewRef = useRef<React.ElementRef<typeof View>>(null);

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

  // Thực hiện lưu hình nền
  const executeSave = async () => {
    setIsSaving(true);
    haptics.impact('light');

    const albumName = settings.exportAlbumName || 'Quote Wallpaper';
    const res = await captureAndSaveWallpaper(exportViewRef, albumName);
    setIsSaving(false);

    if (res.ok) {
      haptics.notification('success');
      setToastMessage(`Đã lưu vào album "${albumName}"`);
      setShowToast(true);
      setShowGuideModal(true);
    } else {
      haptics.notification('error');
      if (res.code === 'PERMISSION_DENIED') {
        Alert.alert('Cần quyền truy cập', res.message);
      } else {
        Alert.alert('Không thể lưu', res.message);
      }
    }
  };

  // Bấm nút Lưu: kiểm tra overflow (R14) trước khi lưu
  const handleSavePress = () => {
    if (!curQuote || !curTemplate) return;

    const boxLayout = resolveBoxLayout(curTemplate.style.box, dims.width, dims.height);
    const padding = curTemplate.style.box.padding;
    const borderLeftWidth = curTemplate.style.box.borderLeft ? 4 : 0;
    const availableTextWidth = Math.max(10, boxLayout.width - padding * 2 - borderLeftWidth);
    const availableTextHeight = Math.max(20, dims.height * 0.45);

    const fitRes = fitText(curQuote.text, {
      containerWidth: availableTextWidth,
      containerHeight: availableTextHeight,
      fontFamily: curTemplate.style.text.fontFamily,
      baseFontSize: (dims.width * curTemplate.style.text.sizePct) / 100,
      minFontSize: (dims.width * curTemplate.style.text.minSizePct) / 100,
      lineHeightMultiplier: curTemplate.style.text.lineHeight,
      uppercase: curTemplate.style.text.uppercase,
    });

    if (fitRes.overflow) {
      Alert.alert(
        'Chữ có thể bị cắt',
        'Nội dung danh ngôn khá dài nên một phần chữ có thể bị rút gọn bằng dấu "…". Bạn có muốn tiếp tục lưu không?',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Vẫn lưu',
            onPress: executeSave,
          },
        ],
      );
    } else {
      executeSave();
    }
  };

  if (!curImage || !curQuote || !curTemplate) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={!showControls} barStyle="light-content" />

      {/* 1. Canvas toàn màn hình người dùng thấy */}
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

      {/* 2. Hidden Canvas chụp chuẩn kích thước pixel màn hình không chứa đồng hồ hay khung */}
      <View
        ref={exportViewRef}
        collapsable={false}
        style={[styles.hiddenCanvas, { width: dims.width, height: dims.height }]}
        pointerEvents="none"
      >
        <WallpaperCanvas
          image={curImage}
          quote={curQuote}
          template={curTemplate}
          width={dims.width}
          height={dims.height}
          showAuthor={settings.showAuthor}
          testID="export-hidden-canvas"
        />
      </View>

      {/* 3. Thanh nút điều khiển kính mờ ở đáy (ẩn/hiện khi chạm) */}
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
            label={isSaving ? 'Đang lưu…' : 'Lưu'}
            icon={<Ionicons name="download-outline" size={20} color="#FFFFFF" />}
            onPress={handleSavePress}
            accessibilityLabel="Lưu hình nền vào Thư viện Ảnh"
            variant="primary"
            testID="btn-save-preview"
          />
        </View>
      )}

      {/* 4. Toast thông báo */}
      <Toast visible={showToast} message={toastMessage} onDismiss={() => setShowToast(false)} />

      {/* 5. Sheet hướng dẫn cài hình nền iOS (3 bước) */}
      <Modal visible={showGuideModal} transparent animationType="slide">
        <View style={styles.guideOverlay}>
          <View style={styles.guideCard}>
            <View style={styles.guideGrabber} />

            <View style={styles.guideHeader}>
              <Ionicons name="checkmark-circle" size={32} color="#34C759" />
              <Text style={styles.guideTitle}>Cách đặt hình nền</Text>
            </View>

            <View style={styles.guideSteps}>
              <View style={styles.stepRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>
                  Mở ứng dụng <Text style={styles.bold}>Cài đặt &gt; Hình nền</Text> (hoặc ứng dụng{' '}
                  <Text style={styles.bold}>Ảnh</Text>).
                </Text>
              </View>

              <View style={styles.stepRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>
                  Bấm <Text style={styles.bold}>Thêm hình nền mới</Text>, chọn album{' '}
                  <Text style={styles.bold}>"{settings.exportAlbumName || 'Quote Wallpaper'}"</Text>
                  .
                </Text>
              </View>

              <View style={styles.stepRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>
                  Chọn hình vừa lưu và bấm <Text style={styles.bold}>Đặt làm hình nền</Text> màn
                  hình khóa.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.guideDismissBtn}
              onPress={() => setShowGuideModal(false)}
              accessibilityRole="button"
              accessibilityLabel="Đã hiểu"
            >
              <Text style={styles.guideDismissText}>Đã hiểu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  hiddenCanvas: {
    position: 'absolute',
    left: -10000,
    top: -10000,
    opacity: 0,
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
  guideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  guideCard: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    alignItems: 'center',
  },
  guideGrabber: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#8E8E93',
    marginBottom: 16,
    opacity: 0.5,
  },
  guideHeader: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  guideTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  guideSteps: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#D1D1D6',
  },
  bold: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  guideDismissBtn: {
    width: '100%',
    height: 50,
    backgroundColor: '#0A84FF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideDismissText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
