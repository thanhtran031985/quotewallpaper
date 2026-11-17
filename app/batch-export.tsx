import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLibraryStore } from '@/store/useLibraryStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTheme } from '@/theme/useTheme';
import { WallpaperCanvas } from '@/components/WallpaperCanvas';
import { captureAndSaveWallpaper } from '@/services/exportWallpaper';
import { executeBatchExport } from '@/services/batchExport';
import { Selection } from '@/domain/types';
import { haptics } from '@/services/haptics';

export const BATCH_COUNT_OPTIONS = [5, 10, 20, 30, 50];

export default function BatchExportScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();

  const quotes = useLibraryStore((s) => s.quotes);
  const images = useLibraryStore((s) => s.images);
  const templates = useLibraryStore((s) => s.templates);
  const settings = useSettingsStore();

  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progress, setProgress] = useState({
    current: 0,
    total: 10,
    success: 0,
    error: 0,
  });
  const [summary, setSummary] = useState<{
    completed: boolean;
    totalRequested: number;
    successCount: number;
    errorCount: number;
    isCancelled: boolean;
  } | null>(null);

  const [currentRenderItem, setCurrentRenderItem] = useState<{
    image: any;
    quote: any;
    template: any;
  } | null>(null);

  const isCancelledRef = useRef<boolean>(false);
  const hiddenCanvasRef = useRef<React.ElementRef<typeof View>>(null);
  const dims = Dimensions.get('window');

  // Bắt đầu quá trình xuất hàng loạt
  const handleStartExport = async () => {
    isCancelledRef.current = false;
    setIsExporting(true);
    setSummary(null);
    setProgress({ current: 0, total: selectedCount, success: 0, error: 0 });
    haptics.impact('medium');

    const result = await executeBatchExport({
      count: selectedCount,
      quotes,
      images,
      templates,
      templateMode: settings.templateMode,
      fixedTemplateId: settings.fixedTemplateId,
      noRepeat: settings.noRepeat,
      favoritesBoost: settings.favoritesBoost,
      isCancelled: () => isCancelledRef.current,
      onProgress: (current, total, success, error) => {
        setProgress({ current, total, success, error });
      },
      renderItem: async (selection: Selection) => {
        const itemImage = images.find((i) => i.id === selection.imageId);
        const itemQuote = quotes.find((q) => q.id === selection.quoteId);
        const itemTemplate = templates.find((t) => t.id === selection.templateId);

        if (!itemImage || !itemQuote || !itemTemplate) {
          return { ok: false, code: 'NOT_FOUND', message: 'Không tìm thấy dữ liệu mục' };
        }

        setCurrentRenderItem({
          image: itemImage,
          quote: itemQuote,
          template: itemTemplate,
        });

        // Cho React kịp vẽ layout 1 frame
        await new Promise((resolve) => setTimeout(resolve, 50));

        const albumName = settings.exportAlbumName || 'Quote Wallpaper';
        const captureRes = await captureAndSaveWallpaper(hiddenCanvasRef, albumName);
        return captureRes;
      },
    });

    setIsExporting(false);
    setSummary({
      completed: true,
      totalRequested: result.totalRequested,
      successCount: result.successCount,
      errorCount: result.errorCount,
      isCancelled: result.isCancelled,
    });

    if (result.successCount > 0) {
      haptics.notification('success');
    } else {
      haptics.notification('error');
    }
  };

  // Hủy tiến trình
  const handleCancelExport = () => {
    isCancelledRef.current = true;
    haptics.impact('heavy');
  };

  const albumName = settings.exportAlbumName || 'Quote Wallpaper';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.primary }]}>
      {/* Grabber indicator */}
      <View style={styles.grabberContainer}>
        <View style={[styles.grabber, { backgroundColor: theme.colors.border.subtle }]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Xuất hàng loạt vào album
        </Text>
        <TouchableOpacity
          testID="btn-close-batch"
          onPress={() => router.back()}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Đóng"
        >
          <Ionicons name="close-circle" size={26} color={theme.colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {/* Album info pill */}
        <View
          style={[
            styles.albumInfoCard,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : theme.colors.bg.card },
          ]}
        >
          <Ionicons name="images" size={24} color={theme.colors.tint.primary} />
          <View style={styles.albumInfoText}>
            <Text style={[styles.albumInfoLabel, { color: theme.colors.text.secondary }]}>
              Album đích
            </Text>
            <Text style={[styles.albumInfoName, { color: theme.colors.text.primary }]}>
              "{albumName}"
            </Text>
          </View>
        </View>

        {/* Chưa xuất: Chọn số lượng */}
        {!isExporting && !summary && (
          <View style={styles.setupSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary }]}>
              SỐ LƯỢNG HÌNH NỀN
            </Text>
            <View style={styles.countOptionsRow}>
              {BATCH_COUNT_OPTIONS.map((count) => {
                const isSelected = selectedCount === count;
                return (
                  <TouchableOpacity
                    key={count}
                    testID={`option-count-${count}`}
                    onPress={() => {
                      haptics.selection();
                      setSelectedCount(count);
                    }}
                    style={[
                      styles.countChip,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.tint.primary
                          : isDark
                            ? 'rgba(255,255,255,0.08)'
                            : theme.colors.bg.card,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.countChipText,
                        {
                          color: isSelected ? '#FFFFFF' : theme.colors.text.primary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {count}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.helpText, { color: theme.colors.text.tertiary }]}>
              Mỗi hình nền được ghép ngẫu nhiên độc lập từ kho ảnh, danh ngôn và template đang bật
              theo quy tắc không lặp lại.
            </Text>

            <TouchableOpacity
              testID="btn-start-batch"
              onPress={handleStartExport}
              style={[styles.primaryActionBtn, { backgroundColor: theme.colors.tint.primary }]}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Bắt đầu xuất ${selectedCount} hình`}
            >
              <Ionicons
                name="download-outline"
                size={20}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.primaryActionText}>Bắt đầu xuất {selectedCount} hình</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Đang xuất: Tiến độ */}
        {isExporting && (
          <View style={styles.progressSection} testID="batch-progress-section">
            <ActivityIndicator size="large" color={theme.colors.tint.primary} />
            <Text style={[styles.progressTitle, { color: theme.colors.text.primary }]}>
              Đang xuất {progress.current} / {progress.total} hình...
            </Text>

            {/* Thanh tiến độ */}
            <View style={[styles.progressBarBg, { backgroundColor: theme.colors.border.subtle }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: theme.colors.tint.primary,
                    width: `${Math.round((progress.current / progress.total) * 100)}%`,
                  },
                ]}
              />
            </View>

            <Text style={[styles.progressSubtitle, { color: theme.colors.text.secondary }]}>
              Thành công: {progress.success} · Lỗi: {progress.error}
            </Text>

            <TouchableOpacity
              testID="btn-cancel-batch"
              onPress={handleCancelExport}
              style={[styles.cancelBtn, { borderColor: theme.colors.tint.destructive }]}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Hủy xuất"
            >
              <Text style={[styles.cancelBtnText, { color: theme.colors.tint.destructive }]}>
                Hủy quá trình
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Đã hoàn thành / Đã hủy: Tổng kết */}
        {summary && (
          <View style={styles.summarySection} testID="batch-summary-section">
            <Ionicons
              name={summary.isCancelled ? 'pause-circle' : 'checkmark-circle'}
              size={52}
              color={summary.isCancelled ? '#FF9500' : '#34C759'}
            />
            <Text style={[styles.summaryTitle, { color: theme.colors.text.primary }]}>
              {summary.isCancelled ? 'Đã dừng xuất hàng loạt' : 'Xuất hàng loạt thành công'}
            </Text>

            <View style={[styles.summaryCard, { backgroundColor: theme.colors.bg.card }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.text.secondary }]}>
                  Số hình đã lưu vào album:
                </Text>
                <Text style={[styles.summaryValue, { color: theme.colors.text.primary }]}>
                  {summary.successCount}
                </Text>
              </View>
              {summary.errorCount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.colors.tint.destructive }]}>
                    Số hình bị lỗi:
                  </Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.tint.destructive }]}>
                    {summary.errorCount}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              testID="btn-shortcuts-guide-link"
              onPress={() => {
                router.push('/shortcuts-guide');
              }}
              style={[styles.guideLinkBtn, { backgroundColor: theme.colors.tint.primary }]}
              activeOpacity={0.7}
            >
              <Ionicons name="flash" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.guideLinkText}>Hướng dẫn tạo Tự động hóa Phím tắt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="btn-done-batch"
              onPress={() => router.back()}
              style={styles.doneBtn}
            >
              <Text style={[styles.doneBtnText, { color: theme.colors.text.secondary }]}>Xong</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Hidden offscreen view to capture wallpapers at screen pixel dimensions */}
      {currentRenderItem && (
        <View
          ref={hiddenCanvasRef}
          collapsable={false}
          style={[styles.hiddenCanvas, { width: dims.width, height: dims.height }]}
          pointerEvents="none"
        >
          <WallpaperCanvas
            image={currentRenderItem.image}
            quote={currentRenderItem.quote}
            template={currentRenderItem.template}
            width={dims.width}
            height={dims.height}
            showAuthor={settings.showAuthor}
            testID="batch-hidden-canvas"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grabberContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  albumInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 24,
    gap: 14,
  },
  albumInfoText: {
    flex: 1,
  },
  albumInfoLabel: {
    fontSize: 13,
  },
  albumInfoName: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 2,
  },
  setupSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  countOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  countChip: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countChipText: {
    fontSize: 17,
  },
  helpText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 16,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  progressSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 18,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressBarBg: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressSubtitle: {
    fontSize: 14,
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  summarySection: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  summaryCard: {
    width: '100%',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginVertical: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  guideLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  guideLinkText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  doneBtn: {
    paddingVertical: 10,
  },
  doneBtnText: {
    fontSize: 16,
  },
  hiddenCanvas: {
    position: 'absolute',
    top: -9999,
    left: -9999,
    opacity: 0,
  },
});
