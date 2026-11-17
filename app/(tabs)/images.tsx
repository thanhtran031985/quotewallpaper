import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLibraryStore } from '../../src/store/useLibraryStore';
import { useTheme } from '../../src/theme/useTheme';
import { pickImagesFromLibrary } from '../../src/services/imageLibrary';
import { haptics } from '../../src/services/haptics';
import { DEFAULT_QUOTES, DEFAULT_IMAGES, DEFAULT_TEMPLATES } from '../../src/services/seed';
import { WallpaperImage } from '../../src/domain/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLUMN_COUNT = 3;
const GRID_PADDING = 16;
const GAP = 10;
const ITEM_WIDTH = Math.floor(
  (SCREEN_WIDTH - GRID_PADDING * 2 - GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT,
);
const ITEM_HEIGHT = Math.floor(ITEM_WIDTH * 1.6); // Khung dọc 9:14.4

export default function ImagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<WallpaperImage | null>(null);

  const images = useLibraryStore((state) => state.images);
  const toggleImage = useLibraryStore((state) => state.toggleImage);
  const deleteImage = useLibraryStore((state) => state.deleteImage);
  const addImage = useLibraryStore((state) => state.addImage);
  const setAllImagesEnabled = useLibraryStore((state) => state.setAllImagesEnabled);
  const resetToDefault = useLibraryStore((state) => state.resetToDefault);

  const userImages = useMemo(() => images.filter((img) => img.source === 'user'), [images]);
  const defaultImages = useMemo(() => images.filter((img) => img.source === 'default'), [images]);

  const enabledCount = useMemo(() => images.filter((img) => img.enabled).length, [images]);
  const totalCount = images.length;

  // Xử lý thêm ảnh từ Thư viện
  const handleAddPhotos = async () => {
    haptics.impact('light');
    const res = await pickImagesFromLibrary(20);
    if (!res.ok) {
      if (res.code === 'PERMISSION_DENIED') {
        Alert.alert('Cần quyền truy cập Ảnh', res.message, [{ text: 'Đã hiểu' }]);
      } else {
        Alert.alert('Lỗi', res.message, [{ text: 'Đóng' }]);
      }
      return;
    }

    if (res.data.length > 0) {
      for (const img of res.data) {
        addImage(img);
      }
      haptics.notification('success');
    }
  };

  // Bật/tắt ảnh khi chạm
  const handleToggle = (id: string) => {
    haptics.impact('light');
    toggleImage(id);
  };

  // Nhấn giữ ảnh mở modal tác vụ
  const handleLongPress = (img: WallpaperImage) => {
    haptics.impact('medium');
    setSelectedImage(img);
  };

  // Xóa ảnh user
  const handleDeleteSelected = () => {
    if (!selectedImage) return;
    const target = selectedImage;
    setSelectedImage(null);

    Alert.alert(
      'Xóa ảnh này',
      'Bạn có chắc chắn muốn xóa ảnh này khỏi bộ sưu tập? Ảnh gốc trong Photos sẽ không bị ảnh hưởng.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            haptics.notification('success');
            deleteImage(target.id);
          },
        },
      ],
    );
  };

  // Mở màn đặt điểm lấy nét
  const handleOpenFocal = () => {
    if (!selectedImage) return;
    const targetId = selectedImage.id;
    setSelectedImage(null);
    router.push({ pathname: '/image-focal', params: { id: targetId } });
  };

  // Khôi phục mặc định
  const handleResetDefaults = () => {
    setShowMenuModal(false);
    Alert.alert(
      'Khôi phục mặc định',
      'Thao tác này sẽ bật lại toàn bộ ảnh mặc định và giữ nguyên các ảnh cá nhân của bạn.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Khôi phục',
          onPress: () => {
            haptics.impact('light');
            resetToDefault(DEFAULT_QUOTES, DEFAULT_IMAGES, DEFAULT_TEMPLATES);
          },
        },
      ],
    );
  };

  const renderImageItem = (item: WallpaperImage) => {
    // Với ảnh mặc định lưu key như 'default-1', load placeholder hoặc uri
    const imageSource = item.uri.startsWith('default-')
      ? require('../../assets/images/icon.png')
      : { uri: item.uri };

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.imageCard,
          {
            backgroundColor: theme.colors.bg.card,
            opacity: item.enabled ? 1 : 0.45,
          },
        ]}
        onPress={() => handleToggle(item.id)}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.8}
        testID={`image-item-${item.id}`}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${item.enabled ? 'đang bật' : 'đang tắt'}`}
      >
        <Image source={imageSource} style={styles.imageThumbnail} contentFit="cover" />

        {/* Checkmark Badge */}
        <View
          style={[
            styles.badge,
            {
              backgroundColor: item.enabled ? '#34C759' : 'rgba(0, 0, 0, 0.4)',
            },
          ]}
        >
          <Ionicons
            name={item.enabled ? 'checkmark' : 'close'}
            size={12}
            color="#FFFFFF"
            style={{ fontWeight: '700' }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.primary }]}>
      {/* 1. Header & Actions */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: theme.colors.bg.secondary }]}
            onPress={() => setShowMenuModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Tác vụ kho ảnh"
            testID="btn-images-menu"
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.tint.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: theme.colors.bg.secondary }]}
            onPress={handleAddPhotos}
            accessibilityRole="button"
            accessibilityLabel="Thêm ảnh"
            testID="btn-add-image"
          >
            <Ionicons name="add" size={24} color={theme.colors.tint.primary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.largeTitle, { color: theme.colors.text.primary }]}>Ảnh</Text>

        <Text style={[styles.counterText, { color: theme.colors.text.secondary }]}>
          {enabledCount} đang bật / {totalCount} ảnh
        </Text>
      </View>

      {/* 2. Grid Sections */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80, paddingHorizontal: GRID_PADDING },
        ]}
      >
        {/* Section: Ảnh của tôi */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>
            ẢNH CỦA TÔI ({userImages.length})
          </Text>
        </View>

        <View style={styles.grid}>
          {/* Nút card Thêm ảnh */}
          <TouchableOpacity
            style={[
              styles.imageCard,
              styles.addCard,
              {
                backgroundColor: theme.colors.bg.card,
                borderColor: theme.colors.border.subtle,
              },
            ]}
            onPress={handleAddPhotos}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Chọn ảnh từ Thư viện Photos"
          >
            <View
              style={[
                styles.addIconCircle,
                { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' },
              ]}
            >
              <Ionicons name="add" size={28} color={theme.colors.tint.primary} />
            </View>
            <Text style={[styles.addCardLabel, { color: theme.colors.text.secondary }]}>
              Thêm ảnh
            </Text>
          </TouchableOpacity>

          {userImages.map(renderImageItem)}
        </View>

        {/* Section: Mặc định */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>
            MẶC ĐỊNH ({defaultImages.length})
          </Text>
        </View>

        <View style={styles.grid}>{defaultImages.map(renderImageItem)}</View>
      </ScrollView>

      {/* 3. Modal Tác vụ Menu (...) */}
      <Modal visible={showMenuModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenuModal(false)}
        >
          <View style={[styles.menuSheet, { backgroundColor: theme.colors.bg.card }]}>
            <Text style={[styles.menuTitle, { color: theme.colors.text.secondary }]}>
              TÙY CHỌN HÀNG LOẠT
            </Text>

            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: theme.colors.border.subtle }]}
              onPress={() => {
                setShowMenuModal(false);
                setAllImagesEnabled(true);
                haptics.notification('success');
              }}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={theme.colors.tint.primary}
              />
              <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>
                Bật tất cả
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: theme.colors.border.subtle }]}
              onPress={() => {
                setShowMenuModal(false);
                setAllImagesEnabled(false);
                haptics.notification('success');
              }}
            >
              <Ionicons name="close-circle-outline" size={20} color={theme.colors.text.tertiary} />
              <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>
                Tắt tất cả
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleResetDefaults}>
              <Ionicons name="refresh-outline" size={20} color={theme.colors.tint.primary} />
              <Text style={[styles.menuItemText, { color: theme.colors.tint.primary }]}>
                Khôi phục mặc định
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 4. Modal Tác vụ ảnh khi nhấn giữ */}
      <Modal visible={Boolean(selectedImage)} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedImage(null)}
        >
          <View style={[styles.menuSheet, { backgroundColor: theme.colors.bg.card }]}>
            <Text style={[styles.menuTitle, { color: theme.colors.text.secondary }]}>
              Tác vụ ảnh
            </Text>

            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: theme.colors.border.subtle }]}
              onPress={handleOpenFocal}
            >
              <Ionicons name="locate-outline" size={20} color={theme.colors.tint.primary} />
              <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>
                Đặt điểm lấy nét
              </Text>
            </TouchableOpacity>

            {selectedImage?.source === 'user' && (
              <TouchableOpacity style={styles.menuItem} onPress={handleDeleteSelected}>
                <Ionicons name="trash-outline" size={20} color={theme.colors.tint.destructive} />
                <Text
                  style={[styles.menuItemText, { color: theme.colors.tint.destructive }]}
                >
                  Xóa ảnh này
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.37,
  },
  counterText: {
    fontSize: 13,
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  scrollContent: {
    paddingTop: 8,
  },
  sectionHeaderRow: {
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  imageCard: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  imageThumbnail: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 34,
  },
  menuSheet: {
    borderRadius: 14,
    overflow: 'hidden',
    paddingVertical: 8,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 10,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
