import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useLibraryStore } from '@/store/useLibraryStore';
import { haptics } from '@/services/haptics';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const settings = useSettingsStore();
  const resetLibrary = useLibraryStore((s) => s.resetAll);

  const [albumInput, setAlbumInput] = useState(settings.exportAlbumName || 'Quote Wallpaper');

  const handleAppearanceChange = (mode: 'system' | 'light' | 'dark') => {
    haptics.selection();
    settings.setAppearance(mode);
  };

  const handleResetData = () => {
    haptics.impact('medium');
    Alert.alert(
      'Đặt lại toàn bộ dữ liệu?',
      'Tất cả cài đặt và kho danh ngôn, ảnh, template sẽ được khôi phục về trạng thái ban đầu.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Tiếp tục',
          style: 'destructive',
          onPress: () => {
            haptics.impact('heavy');
            Alert.alert(
              'Xác nhận lần cuối',
              'Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa mọi thay đổi và đặt lại toàn bộ?',
              [
                { text: 'Hủy', style: 'cancel' },
                {
                  text: 'Đặt lại tất cả',
                  style: 'destructive',
                  onPress: () => {
                    haptics.notification('success');
                    resetLibrary();
                    settings.resetSettings();
                    setAlbumInput('Quote Wallpaper');
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.primary }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Large Title Header */}
        <View style={styles.header}>
          <Text style={[styles.largeTitle, { color: theme.colors.text.primary }]}>Cài đặt</Text>
        </View>

        {/* Section 1: NGẪU NHIÊN */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary }]}>NGẪU NHIÊN</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.bg.card }]}>
          {/* Đổi khi mở ứng dụng */}
          <View style={styles.row}>
            <View style={styles.rowTextContainer}>
              <Text style={[styles.rowLabel, { color: theme.colors.text.primary }]}>
                Đổi khi mở ứng dụng
              </Text>
            </View>
            <Switch
              testID="switch-shuffle-on-open"
              value={settings.shuffleOnOpen}
              onValueChange={(val) => {
                haptics.selection();
                settings.setShuffleOnOpen(val);
              }}
              trackColor={{ false: theme.colors.border.subtle, true: theme.colors.tint.primary }}
            />
          </View>
          <View style={[styles.separator, { backgroundColor: theme.colors.border.separator }]} />

          {/* Không lặp lại liên tiếp */}
          <View style={styles.row}>
            <View style={styles.rowTextContainer}>
              <Text style={[styles.rowLabel, { color: theme.colors.text.primary }]}>
                Không lặp lại liên tiếp
              </Text>
            </View>
            <Switch
              testID="switch-no-repeat"
              value={settings.noRepeat}
              onValueChange={(val) => {
                haptics.selection();
                settings.setNoRepeat(val);
              }}
              trackColor={{ false: theme.colors.border.subtle, true: theme.colors.tint.primary }}
            />
          </View>
          <View style={[styles.separator, { backgroundColor: theme.colors.border.separator }]} />

          {/* Ưu tiên câu yêu thích */}
          <View style={styles.row}>
            <View style={styles.rowTextContainer}>
              <Text style={[styles.rowLabel, { color: theme.colors.text.primary }]}>
                Ưu tiên câu yêu thích
              </Text>
            </View>
            <Switch
              testID="switch-favorites-boost"
              value={settings.favoritesBoost}
              onValueChange={(val) => {
                haptics.selection();
                settings.setFavoritesBoost(val);
              }}
              trackColor={{ false: theme.colors.border.subtle, true: theme.colors.tint.primary }}
            />
          </View>
          <View style={[styles.separator, { backgroundColor: theme.colors.border.separator }]} />

          {/* Hiển thị tác giả */}
          <View style={styles.row}>
            <View style={styles.rowTextContainer}>
              <Text style={[styles.rowLabel, { color: theme.colors.text.primary }]}>
                Hiển thị tác giả
              </Text>
            </View>
            <Switch
              testID="switch-show-author"
              value={settings.showAuthor}
              onValueChange={(val) => {
                haptics.selection();
                settings.setShowAuthor(val);
              }}
              trackColor={{ false: theme.colors.border.subtle, true: theme.colors.tint.primary }}
            />
          </View>
        </View>
        <Text style={[styles.sectionFooter, { color: theme.colors.text.tertiary }]}>
          Khi mở ứng dụng hoặc quay lại từ màn hình chính, hình nền sẽ tự động đổi ngẫu nhiên.
        </Text>

        {/* Section 2: GIAO DIỆN */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary }]}>GIAO DIỆN</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.bg.card, padding: 6 }]}>
          <View style={styles.segmentedContainer}>
            <TouchableOpacity
              testID="appearance-system"
              style={[
                styles.segmentedOption,
                settings.appearance === 'system' && {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.18)' : '#FFFFFF',
                  shadowColor: '#000',
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                },
              ]}
              onPress={() => handleAppearanceChange('system')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.segmentedText,
                  {
                    color:
                      settings.appearance === 'system'
                        ? theme.colors.text.primary
                        : theme.colors.text.secondary,
                    fontWeight: settings.appearance === 'system' ? '600' : '400',
                  },
                ]}
              >
                Hệ thống
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="appearance-light"
              style={[
                styles.segmentedOption,
                settings.appearance === 'light' && {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.18)' : '#FFFFFF',
                  shadowColor: '#000',
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                },
              ]}
              onPress={() => handleAppearanceChange('light')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.segmentedText,
                  {
                    color:
                      settings.appearance === 'light'
                        ? theme.colors.text.primary
                        : theme.colors.text.secondary,
                    fontWeight: settings.appearance === 'light' ? '600' : '400',
                  },
                ]}
              >
                Sáng
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="appearance-dark"
              style={[
                styles.segmentedOption,
                settings.appearance === 'dark' && {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.18)' : '#FFFFFF',
                  shadowColor: '#000',
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                },
              ]}
              onPress={() => handleAppearanceChange('dark')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.segmentedText,
                  {
                    color:
                      settings.appearance === 'dark'
                        ? theme.colors.text.primary
                        : theme.colors.text.secondary,
                    fontWeight: settings.appearance === 'dark' ? '600' : '400',
                  },
                ]}
              >
                Tối
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 3: XUẤT & TỰ ĐỘNG HÓA */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary }]}>
          XUẤT & TỰ ĐỘNG HÓA
        </Text>
        <View style={[styles.card, { backgroundColor: theme.colors.bg.card }]}>
          {/* Tên album */}
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.colors.text.primary }]}>Tên album</Text>
            <TextInput
              testID="input-album-name"
              style={[styles.albumInput, { color: theme.colors.text.primary }]}
              value={albumInput}
              onChangeText={setAlbumInput}
              onEndEditing={(e) => {
                const text = e.nativeEvent?.text !== undefined ? e.nativeEvent.text : albumInput;
                const trimmed = (text || '').trim() || 'Quote Wallpaper';
                setAlbumInput(trimmed);
                settings.setExportAlbumName(trimmed);
              }}
              placeholder="Quote Wallpaper"
              placeholderTextColor={theme.colors.text.tertiary}
              returnKeyType="done"
            />
          </View>
          <View style={[styles.separator, { backgroundColor: theme.colors.border.separator }]} />

          {/* Xuất hàng loạt */}
          <TouchableOpacity
            testID="btn-settings-batch-export"
            style={styles.row}
            onPress={() => {
              haptics.impact('light');
              router.push('/batch-export');
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Xuất hàng loạt vào album"
          >
            <Text style={[styles.rowLabel, { color: theme.colors.text.primary }]}>
              Xuất hàng loạt vào album
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
          <View style={[styles.separator, { backgroundColor: theme.colors.border.separator }]} />

          {/* Hướng dẫn phím tắt */}
          <TouchableOpacity
            testID="btn-settings-shortcuts-guide"
            style={styles.row}
            onPress={() => {
              haptics.impact('light');
              router.push('/shortcuts-guide');
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Hướng dẫn Phím tắt"
          >
            <Text style={[styles.rowLabel, { color: theme.colors.text.primary }]}>
              Hướng dẫn Phím tắt (Shortcuts)
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* Section 4: DỮ LIỆU */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary }]}>DỮ LIỆU</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.bg.card }]}>
          {/* Nhập/xuất sao lưu */}
          <View style={[styles.row, { opacity: 0.5 }]}>
            <Text style={[styles.rowLabel, { color: theme.colors.text.primary }]}>
              Nhập / Sao lưu danh ngôn
            </Text>
            <Text style={[styles.rowValue, { color: theme.colors.text.tertiary }]}>Task 11</Text>
          </View>
          <View style={[styles.separator, { backgroundColor: theme.colors.border.separator }]} />

          {/* Lịch sử */}
          <View style={[styles.row, { opacity: 0.5 }]}>
            <Text style={[styles.rowLabel, { color: theme.colors.text.primary }]}>
              Lịch sử hình nền
            </Text>
            <Text style={[styles.rowValue, { color: theme.colors.text.tertiary }]}>Task 11</Text>
          </View>
          <View style={[styles.separator, { backgroundColor: theme.colors.border.separator }]} />

          {/* Đặt lại dữ liệu */}
          <TouchableOpacity
            testID="btn-reset-data"
            style={styles.row}
            onPress={handleResetData}
            activeOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel="Đặt lại toàn bộ dữ liệu"
          >
            <Text style={[styles.rowLabel, { color: theme.colors.tint.destructive }]}>
              Đặt lại tất cả dữ liệu
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section 5: GIỚI THIỆU */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text.tertiary }]}>GIỚI THIỆU</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.bg.card }]}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.colors.text.primary }]}>Phiên bản</Text>
            <Text style={[styles.rowValue, { color: theme.colors.text.secondary }]}>
              1.0.0 (MVP)
            </Text>
          </View>
          <View style={[styles.separator, { backgroundColor: theme.colors.border.separator }]} />
          <View style={[styles.row, { flexDirection: 'column', alignItems: 'flex-start', gap: 6 }]}>
            <Text style={[styles.rowLabel, { color: theme.colors.text.primary }]}>
              Quyền riêng tư
            </Text>
            <Text style={[styles.privacyNote, { color: theme.colors.text.tertiary }]}>
              Toàn bộ dữ liệu nằm trên iPhone của bạn. Ứng dụng không gửi bất kỳ dữ liệu nào ra bên
              ngoài.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 20,
    marginTop: 8,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.35,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 16,
  },
  sectionFooter: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 24,
    marginLeft: 16,
    marginRight: 16,
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  rowTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '400',
  },
  rowValue: {
    fontSize: 15,
  },
  separator: {
    height: 0.5,
    marginLeft: 16,
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 9,
    padding: 2,
  },
  segmentedOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  segmentedText: {
    fontSize: 14,
  },
  albumInput: {
    fontSize: 16,
    textAlign: 'right',
    flex: 1,
    paddingLeft: 16,
  },
  privacyNote: {
    fontSize: 13,
    lineHeight: 18,
  },
});
