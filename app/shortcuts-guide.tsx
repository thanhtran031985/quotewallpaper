import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';
import { useSettingsStore } from '@/store/useSettingsStore';
import { haptics } from '@/services/haptics';

export default function ShortcutsGuideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const exportAlbumName = useSettingsStore((s) => s.exportAlbumName) || 'Quote Wallpaper';

  const handleOpenShortcuts = async () => {
    haptics.impact('light');
    const url = 'shortcuts://';
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback mở trang hướng dẫn Apple
        await Linking.openURL('https://support.apple.com/guide/shortcuts/welcome/ios');
      }
    } catch {
      Alert.alert(
        'Không thể mở ứng dụng Phím tắt',
        'Vui lòng mở ứng dụng "Phím tắt" (Shortcuts) từ màn hình chính của iPhone.',
      );
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Mở ứng dụng Phím tắt (Shortcuts)',
      desc: 'Tìm và mở ứng dụng "Phím tắt" có sẵn trên iPhone của bạn. Chuyển sang tab "Tự động hóa" (Automation) ở thanh điều hướng phía dưới.',
      icon: 'flash-outline',
    },
    {
      num: 2,
      title: 'Tạo Tự động hóa mới',
      desc: 'Bấm dấu "+" ở góc trên hoặc nút "Tạo mục tự động hóa cá nhân". Chọn điều kiện kích hoạt là "Thời gian trong ngày" (ví dụ: 06:00 mỗi sáng).',
      icon: 'time-outline',
    },
    {
      num: 3,
      title: 'Thêm 3 tác vụ',
      desc: `Lần lượt thêm 3 tác vụ sau:
1. "Tìm ảnh" (Find Photos): Thêm bộ lọc "Album là ${exportAlbumName}".
2. "Lấy mục từ danh sách" (Get Item from List): Đổi thành "Mục ngẫu nhiên" (Random Item).
3. "Đặt hình nền" (Set Wallpaper): Chọn màn hình khóa (hoặc cả hai), bấm mũi tên tắt "Hiển thị bản xem trước".`,
      icon: 'layers-outline',
    },
    {
      num: 4,
      title: 'Tắt "Hỏi trước khi chạy"',
      desc: 'Tắt công tắc "Hỏi trước khi chạy" (Ask Before Running) để hình nền tự động đổi mà không cần xác nhận. Bấm "Xong" để lưu.',
      icon: 'checkmark-circle-outline',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.primary }]}>
      {/* Grabber */}
      <View style={styles.grabberContainer}>
        <View style={[styles.grabber, { backgroundColor: theme.colors.border.subtle }]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Hướng dẫn Phím tắt
        </Text>
        <TouchableOpacity
          testID="btn-close-guide"
          onPress={() => router.back()}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Đóng hướng dẫn"
        >
          <Ionicons name="close-circle" size={26} color={theme.colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          Cấu hình một lần để iPhone tự động lấy ngẫu nhiên một hình nền từ album "{exportAlbumName}
          " và đổi màn hình khóa mỗi ngày.
        </Text>

        {/* 4 Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((st) => (
            <View
              key={st.num}
              style={[
                styles.stepCard,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : theme.colors.bg.card },
              ]}
            >
              <View style={styles.stepHeader}>
                <View style={[styles.stepBadge, { backgroundColor: theme.colors.tint.primary }]}>
                  <Text style={styles.stepBadgeText}>{st.num}</Text>
                </View>
                <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
                  {st.title}
                </Text>
              </View>
              <Text style={[styles.stepDesc, { color: theme.colors.text.secondary }]}>
                {st.desc}
              </Text>
            </View>
          ))}
        </View>

        {/* Action button */}
        <TouchableOpacity
          testID="btn-open-shortcuts"
          onPress={handleOpenShortcuts}
          style={[styles.openShortcutsBtn, { backgroundColor: theme.colors.tint.primary }]}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Mở ứng dụng Phím tắt"
        >
          <Ionicons name="open-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.openShortcutsText}>Mở ứng dụng Phím tắt</Text>
        </TouchableOpacity>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  stepsContainer: {
    gap: 16,
    marginBottom: 28,
  },
  stepCard: {
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  stepDesc: {
    fontSize: 14,
    lineHeight: 21,
  },
  openShortcutsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 14,
  },
  openShortcutsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
