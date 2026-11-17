import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Switch,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLibraryStore } from '../../src/store/useLibraryStore';
import { useTheme } from '../../src/theme/useTheme';
import { matchesSearch } from '../../src/engine/vietnameseSearch';
import { triggerImpact } from '../../src/services/haptics';
import { DEFAULT_QUOTES, DEFAULT_IMAGES, DEFAULT_TEMPLATES } from '../../src/services/seed';
import { Quote } from '../../src/domain/types';

type FilterTab = 'all' | 'enabled' | 'favorite' | 'user';

export default function QuotesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [showMenuModal, setShowMenuModal] = useState(false);

  const quotes = useLibraryStore((state) => state.quotes);
  const toggleQuote = useLibraryStore((state) => state.toggleQuote);
  const toggleFavoriteQuote = useLibraryStore((state) => state.toggleFavoriteQuote);
  const deleteQuote = useLibraryStore((state) => state.deleteQuote);
  const setAllQuotesEnabled = useLibraryStore((state) => state.setAllQuotesEnabled);
  const resetToDefault = useLibraryStore((state) => state.resetToDefault);

  // Lọc theo search và tab
  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      // 1. Lọc theo tab
      if (activeTab === 'enabled' && !q.enabled) return false;
      if (activeTab === 'favorite' && !q.favorite) return false;
      if (activeTab === 'user' && q.source !== 'user') return false;

      // 2. Lọc theo từ khóa tìm kiếm (bỏ dấu)
      if (searchQuery.trim() !== '') {
        const matchText = matchesSearch(q.text, searchQuery);
        const matchAuthor = q.author ? matchesSearch(q.author, searchQuery) : false;
        return matchText || matchAuthor;
      }

      return true;
    });
  }, [quotes, activeTab, searchQuery]);

  const enabledCount = quotes.filter((q) => q.enabled).length;

  const handleToggle = (id: string) => {
    triggerImpact();
    toggleQuote(id);
  };

  const handleToggleFavorite = (id: string) => {
    triggerImpact();
    toggleFavoriteQuote(id);
  };

  const handleDelete = (quote: Quote) => {
    Alert.alert('Xóa danh ngôn', 'Bạn có chắc chắn muốn xóa câu danh ngôn này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          triggerImpact();
          deleteQuote(quote.id);
        },
      },
    ]);
  };

  const handleResetDefaults = () => {
    setShowMenuModal(false);
    Alert.alert(
      'Khôi phục mặc định',
      'Thao tác này sẽ bật lại toàn bộ câu mặc định và giữ nguyên các câu tự tạo của bạn.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Khôi phục',
          onPress: () => {
            triggerImpact();
            resetToDefault(DEFAULT_QUOTES, DEFAULT_IMAGES, DEFAULT_TEMPLATES);
          },
        },
      ],
    );
  };

  const renderQuoteItem = ({ item, index }: { item: Quote; index: number }) => {
    const isFirst = index === 0;
    const isLast = index === filteredQuotes.length - 1;

    return (
      <TouchableOpacity
        style={[
          styles.row,
          { backgroundColor: theme.colors.bg.card },
          isFirst && styles.rowFirst,
          isLast && styles.rowLast,
        ]}
        onPress={() => router.push({ pathname: '/quote-edit', params: { id: item.id } })}
        activeOpacity={0.7}
      >
        <View style={styles.rowContent}>
          <Text style={[styles.quoteText, { color: theme.colors.text.primary }]} numberOfLines={2}>
            {item.text}
          </Text>
          {item.author ? (
            <Text
              style={[styles.authorText, { color: theme.colors.text.secondary }]}
              numberOfLines={1}
            >
              — {item.author}
            </Text>
          ) : null}
        </View>

        <View style={styles.rowActions}>
          {/* Nút Yêu thích */}
          <TouchableOpacity
            style={styles.iconAction}
            onPress={() => handleToggleFavorite(item.id)}
            accessibilityRole="button"
            accessibilityLabel={item.favorite ? 'Bỏ yêu thích' : 'Yêu thích'}
            testID={`fav-${item.id}`}
          >
            <Ionicons
              name={item.favorite ? 'star' : 'star-outline'}
              size={20}
              color={item.favorite ? '#FF9500' : theme.colors.text.tertiary}
            />
          </TouchableOpacity>

          {/* Nút Xóa (chỉ hiện cho user quotes) */}
          {item.source === 'user' && (
            <TouchableOpacity
              style={styles.iconAction}
              onPress={() => handleDelete(item)}
              accessibilityRole="button"
              accessibilityLabel="Xóa"
              testID={`delete-${item.id}`}
            >
              <Ionicons name="trash-outline" size={18} color={theme.colors.tint.destructive} />
            </TouchableOpacity>
          )}

          {/* Công tắc Bật/Tắt tham gia random */}
          <Switch
            value={item.enabled}
            onValueChange={() => handleToggle(item.id)}
            trackColor={{ false: isDark ? '#39393D' : '#E9E9EB', true: '#34C759' }}
            thumbColor="#FFFFFF"
            testID={`switch-${item.id}`}
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
            accessibilityLabel="Tác vụ danh ngôn"
            testID="btn-quotes-menu"
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.tint.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: theme.colors.bg.secondary }]}
            onPress={() => router.push('/quote-edit')}
            accessibilityRole="button"
            accessibilityLabel="Thêm danh ngôn"
            testID="btn-add-quote"
          >
            <Ionicons name="add" size={24} color={theme.colors.tint.primary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.largeTitle, { color: theme.colors.text.primary }]}>Danh ngôn</Text>

        {/* 2. Thanh tìm kiếm */}
        <View style={[styles.searchBox, { backgroundColor: theme.colors.bg.secondary }]}>
          <Ionicons name="search" size={17} color={theme.colors.text.tertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text.primary }]}
            placeholder="Tìm kiếm danh ngôn hoặc tác giả..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            autoCapitalize="none"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* 3. Segmented Control */}
        <View style={[styles.segmentContainer, { backgroundColor: theme.colors.bg.secondary }]}>
          {(['all', 'enabled', 'favorite', 'user'] as FilterTab[]).map((tab) => {
            const labels: Record<FilterTab, string> = {
              all: 'Tất cả',
              enabled: 'Đang bật',
              favorite: 'Yêu thích',
              user: 'Tự tạo',
            };
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.segmentBtn,
                  isActive && [styles.segmentBtnActive, { backgroundColor: theme.colors.bg.card }],
                ]}
                onPress={() => {
                  triggerImpact();
                  setActiveTab(tab);
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: isActive ? theme.colors.text.primary : theme.colors.text.secondary },
                    isActive && styles.segmentTextActive,
                  ]}
                >
                  {labels[tab]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. Section Count */}
        <Text style={[styles.sectionCount, { color: theme.colors.text.secondary }]}>
          {filteredQuotes.length} DANH NGÔN ({enabledCount} ĐANG BẬT)
        </Text>
      </View>

      {/* 5. FlatList danh sách */}
      <FlatList
        data={filteredQuotes}
        keyExtractor={(item) => item.id}
        renderItem={renderQuoteItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
              {searchQuery ? 'Không tìm thấy câu phù hợp.' : 'Chưa có danh ngôn trong mục này.'}
            </Text>
          </View>
        }
      />

      {/* 6. Modal Menu tác vụ hàng loạt */}
      <Modal
        visible={showMenuModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenuModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowMenuModal(false)}
        >
          <View style={[styles.modalCard, { backgroundColor: theme.colors.bg.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
              Tác vụ danh ngôn
            </Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                triggerImpact();
                setAllQuotesEnabled(true);
                setShowMenuModal(false);
              }}
            >
              <Ionicons name="checkmark-done" size={20} color={theme.colors.tint.primary} />
              <Text style={[styles.modalOptionText, { color: theme.colors.text.primary }]}>
                Bật tất cả
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                triggerImpact();
                setAllQuotesEnabled(false);
                setShowMenuModal(false);
              }}
            >
              <Ionicons name="close" size={20} color={theme.colors.tint.destructive} />
              <Text style={[styles.modalOptionText, { color: theme.colors.tint.destructive }]}>
                Tắt tất cả
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={handleResetDefaults}>
              <Ionicons name="refresh" size={20} color={theme.colors.tint.primary} />
              <Text style={[styles.modalOptionText, { color: theme.colors.text.primary }]}>
                Khôi phục mặc định
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalCloseBtn, { backgroundColor: theme.colors.bg.secondary }]}
              onPress={() => setShowMenuModal(false)}
            >
              <Text style={[styles.modalCloseText, { color: theme.colors.text.primary }]}>
                Đóng
              </Text>
            </TouchableOpacity>
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
    paddingBottom: 8,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
    letterSpacing: 0.35,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  segmentContainer: {
    flexDirection: 'row',
    padding: 2,
    borderRadius: 9,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
  },
  segmentBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
  },
  segmentTextActive: {
    fontWeight: '600',
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60, 60, 67, 0.12)',
  },
  rowFirst: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  rowLast: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderBottomWidth: 0,
  },
  rowContent: {
    flex: 1,
    marginRight: 10,
  },
  quoteText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  authorText: {
    fontSize: 13,
    marginTop: 3,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconAction: {
    padding: 6,
  },
  emptyBox: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60, 60, 67, 0.12)',
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalCloseBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
