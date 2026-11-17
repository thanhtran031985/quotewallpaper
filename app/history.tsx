import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/theme/useTheme';
import { useLibraryStore } from '../src/store/useLibraryStore';
import { EmptyState } from '../src/components/EmptyState';
import { haptics } from '../src/services/haptics';

export default function HistoryScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const history = useLibraryStore((s) => s.history);
  const images = useLibraryStore((s) => s.images);
  const quotes = useLibraryStore((s) => s.quotes);
  const templates = useLibraryStore((s) => s.templates);
  const setCurrentSelection = useLibraryStore((s) => s.setCurrentSelection);

  const handleClearHistory = () => {
    haptics.impact('medium');
    Alert.alert(
      'Xóa lịch sử?',
      'Bạn có chắc chắn muốn xóa toàn bộ lịch sử các hình nền đã xem?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            haptics.notification('success');
            useLibraryStore.setState({ history: [] });
          },
        },
      ],
    );
  };

  const handleSelectHistoryItem = (item: {
    imageId: string;
    quoteId: string;
    templateId: string;
    pickedAt: string;
  }) => {
    const foundImage = images.find((i) => i.id === item.imageId);
    const foundQuote = quotes.find((q) => q.id === item.quoteId);
    const foundTemplate = templates.find((t) => t.id === item.templateId);

    if (!foundImage || !foundQuote || !foundTemplate) {
      haptics.notification('warning');
      Alert.alert(
        'Không thể xem lại',
        'Hình nền này không thể mở lại vì ảnh, câu danh ngôn hoặc mẫu đã bị xóa khỏi kho.',
      );
      return;
    }

    setCurrentSelection({
      imageId: item.imageId,
      quoteId: item.quoteId,
      templateId: item.templateId,
      pickedAt: item.pickedAt,
    });
    haptics.selection();
    router.push('/preview');
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      return `${hours}:${mins} • ${day}/${month}`;
    } catch {
      return '';
    }
  };

  // Đảo ngược danh sách để mục mới nhất ở trên
  const reversedHistory = [...history].reverse();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.primary }]}>
      {/* Grabber */}
      <View style={styles.grabberContainer}>
        <View style={[styles.grabber, { backgroundColor: theme.colors.border.subtle }]} />
      </View>

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border.separator }]}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Đóng"
        >
          <Text style={[styles.headerBtnText, { color: theme.colors.text.secondary }]}>
            Đóng
          </Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Lịch sử hình nền
        </Text>

        {history.length > 0 ? (
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={handleClearHistory}
            accessibilityRole="button"
            accessibilityLabel="Xóa lịch sử"
          >
            <Text style={[styles.headerBtnText, { color: theme.colors.tint.destructive }]}>
              Xóa
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {/* Content */}
      {history.length === 0 ? (
        <EmptyState
          icon="time-outline"
          title="Chưa có lịch sử"
          message="Mỗi lần bạn đổi ngẫu nhiên hoặc mở ứng dụng, các hình nền đã xem sẽ được lưu tại đây (tối đa 50 mục)."
        />
      ) : (
        <FlatList
          data={reversedHistory}
          keyExtractor={(item, index) => `${item.pickedAt}-${index}`}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => (
            <View
              style={[styles.separator, { backgroundColor: theme.colors.border.separator }]}
            />
          )}
          renderItem={({ item }) => {
            const foundImage = images.find((i) => i.id === item.imageId);
            const foundQuote = quotes.find((q) => q.id === item.quoteId);
            const foundTemplate = templates.find((t) => t.id === item.templateId);

            return (
              <TouchableOpacity
                style={[
                  styles.historyRow,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.04)'
                      : theme.colors.bg.card,
                  },
                ]}
                onPress={() => handleSelectHistoryItem(item)}
                activeOpacity={0.7}
              >
                <View style={styles.rowMain}>
                  <Text
                    style={[styles.quoteText, { color: theme.colors.text.primary }]}
                    numberOfLines={2}
                  >
                    {foundQuote ? `"${foundQuote.text}"` : '(Danh ngôn không còn)'}
                  </Text>

                  <View style={styles.metaRow}>
                    <Text
                      style={[styles.metaText, { color: theme.colors.text.secondary }]}
                      numberOfLines={1}
                    >
                      {foundImage ? foundImage.name : '(Ảnh không còn)'} •{' '}
                      {foundTemplate ? foundTemplate.name : '(Mẫu không còn)'}
                    </Text>
                  </View>
                </View>

                <View style={styles.rowRight}>
                  <Text style={[styles.timeText, { color: theme.colors.text.tertiary }]}>
                    {formatTimestamp(item.pickedAt)}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={theme.colors.text.quaternary}
                  />
                </View>
              </TouchableOpacity>
            );
          }}
        />
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
    borderRadius: 2.5,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  headerBtnText: {
    fontSize: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 44,
  },
  listContent: {
    padding: 16,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  rowMain: {
    flex: 1,
    paddingRight: 10,
  },
  quoteText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
  },
  separator: {
    height: 8,
  },
});
