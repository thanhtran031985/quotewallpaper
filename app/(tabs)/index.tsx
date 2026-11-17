import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLibraryStore } from '../../src/store/useLibraryStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { useShuffleOnOpen } from '../../src/engine/useShuffleOnOpen';
import { calculateCombinationsCount } from '../../src/engine/randomPick';
import { useTheme } from '../../src/theme/useTheme';
import { WallpaperCanvas } from '../../src/components/WallpaperCanvas';
import { EmptyState } from '../../src/components/EmptyState';
import { Chip } from '../../src/components/Chip';
import { GlassButton } from '../../src/components/GlassButton';

export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  // Tự động shuffle khi mở app / foreground (R6)
  useShuffleOnOpen();

  const current = useLibraryStore((state) => state.current);
  const images = useLibraryStore((state) => state.images);
  const quotes = useLibraryStore((state) => state.quotes);
  const templates = useLibraryStore((state) => state.templates);
  const pinned = useLibraryStore((state) => state.pinned);
  const togglePin = useLibraryStore((state) => state.togglePin);
  const shuffle = useLibraryStore((state) => state.shuffle);
  const settings = useSettingsStore();

  const enabledImages = images.filter((img) => img.enabled);
  const enabledQuotes = quotes.filter((q) => q.enabled);
  const enabledTemplates = templates.filter((t) => t.enabled);

  const curImage = current ? images.find((img) => img.id === current.imageId) : null;
  const curQuote = current ? quotes.find((q) => q.id === current.quoteId) : null;
  const curTemplate = current ? templates.find((t) => t.id === current.templateId) : null;

  const screenWidth = Dimensions.get('window').width;
  const heroWidth = screenWidth - 32;
  const heroHeight = 470;

  // Lấy ngày hiện tại dạng tiếng Việt
  const dateFormatted = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  const dateStr = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  const combinations = calculateCombinationsCount({ quotes, images, templates }, settings);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: 110 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Navbar */}
      <View style={styles.navbar}>
        <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>{dateStr}</Text>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.colors.fill }]}
          onPress={() => router.push('/(tabs)/settings')}
          accessibilityRole="button"
          accessibilityLabel="Cài đặt"
        >
          <Ionicons name="settings-outline" size={20} color={theme.colors.accent} />
        </TouchableOpacity>
      </View>

      {/* 2. Large Title */}
      <Text style={[styles.largeTitle, { color: theme.colors.text }]}>Hôm nay</Text>

      {/* 3. Hero Card hoặc EmptyState */}
      {(!current || !curImage || !curQuote || !curTemplate) ? (
        <View style={styles.emptyContainer}>
          {enabledImages.length === 0 ? (
            <EmptyState
              icon="images-outline"
              title="Chưa có ảnh nào đang bật"
              message="Hãy bật ít nhất 1 ảnh trong kho để bắt đầu tạo hình nền."
              actionLabel="Đi tới kho ảnh"
              onAction={() => router.push('/(tabs)/images')}
            />
          ) : enabledQuotes.length === 0 ? (
            <EmptyState
              icon="chatbubble-ellipses-outline"
              title="Chưa có danh ngôn nào đang bật"
              message="Hãy bật ít nhất 1 câu danh ngôn trong kho để tiếp tục."
              actionLabel="Đi tới kho danh ngôn"
              onAction={() => router.push('/(tabs)/quotes')}
            />
          ) : enabledTemplates.length === 0 ? (
            <EmptyState
              icon="color-palette-outline"
              title="Chưa có mẫu nào đang bật"
              message="Hãy bật ít nhất 1 mẫu template để tạo hình nền."
              actionLabel="Đi tới kho mẫu"
              onAction={() => router.push('/(tabs)/templates')}
            />
          ) : (
            <EmptyState
              icon="refresh-outline"
              title="Chưa chọn được hình nền"
              message="Bấm nút bên dưới để chọn ngẫu nhiên một hình nền mới."
              actionLabel="Đổi ngẫu nhiên"
              onAction={() => shuffle()}
            />
          )}
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={[styles.heroCard, { width: heroWidth, height: heroHeight }]}
            onPress={() => router.push('/preview')}
            activeOpacity={0.92}
            accessibilityRole="button"
            accessibilityLabel="Xem toàn màn hình"
          >
            <WallpaperCanvas
              image={curImage}
              quote={curQuote}
              template={curTemplate}
              width={heroWidth}
              height={heroHeight}
              showAuthor={settings.showAuthor}
            />
            <View style={styles.chipWrapper}>
              <Chip label={curTemplate.name} />
            </View>
          </TouchableOpacity>

          {/* 4. Thanh Ghim (Pin bar) */}
          <View style={styles.pinBar}>
            <Text style={[styles.pinLabel, { color: theme.colors.textSecondary }]}>Ghim:</Text>
            <Chip
              label="Ảnh"
              icon={<Ionicons name={pinned.image ? 'pin' : 'pin-outline'} size={13} color="#fff" />}
              active={pinned.image}
              onPress={() => togglePin('image')}
              testID="pin-image"
            />
            <Chip
              label="Câu"
              icon={<Ionicons name={pinned.quote ? 'pin' : 'pin-outline'} size={13} color="#fff" />}
              active={pinned.quote}
              onPress={() => togglePin('quote')}
              testID="pin-quote"
            />
            <Chip
              label="Mẫu"
              icon={
                <Ionicons
                  name={pinned.template ? 'pin' : 'pin-outline'}
                  size={13}
                  color="#fff"
                />
              }
              active={pinned.template}
              onPress={() => togglePin('template')}
              testID="pin-template"
            />
          </View>

          {/* 5. 2 Nút chính: Đổi ngẫu nhiên & Xem & lưu */}
          <View style={styles.actions}>
            <GlassButton
              label="Đổi ngẫu nhiên"
              icon={<Ionicons name="shuffle" size={18} color={theme.colors.accent} />}
              onPress={() => shuffle()}
              variant="tinted"
              style={styles.actionBtn}
            />
            <GlassButton
              label="Xem & lưu"
              icon={<Ionicons name="expand" size={18} color="#FFFFFF" />}
              onPress={() => router.push('/preview')}
              variant="primary"
              style={styles.actionBtn}
            />
          </View>

          {/* 6. Dòng thống kê */}
          <View style={styles.metaLine}>
            <Ionicons name="sparkles-outline" size={13} color={theme.colors.textSecondary} />
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
              {combinations} tổ hợp khả dụng
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.35,
    marginBottom: 16,
  },
  heroCard: {
    borderRadius: 26,
    overflow: 'hidden',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 10,
  },
  chipWrapper: {
    position: 'absolute',
    top: 14,
    left: 14,
    zIndex: 5,
  },
  pinBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    justifyContent: 'center',
  },
  pinLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginRight: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    height: 50,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '400',
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
