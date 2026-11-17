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
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLibraryStore } from '../../src/store/useLibraryStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { useTheme } from '../../src/theme/useTheme';
import { haptics } from '../../src/services/haptics';
import { DEFAULT_QUOTES, DEFAULT_IMAGES, DEFAULT_TEMPLATES } from '../../src/services/seed';
import { Template } from '../../src/domain/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLUMN_COUNT = 2;
const GRID_PADDING = 16;
const GAP = 12;
const CARD_WIDTH = Math.floor(
  (SCREEN_WIDTH - GRID_PADDING * 2 - GAP * (COLUMN_COUNT - 1)) / COLUMN_COUNT,
);
const CARD_HEIGHT = Math.floor(CARD_WIDTH * 1.55); // Khung dọc 9:14

export default function TemplatesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const templates = useLibraryStore((state) => state.templates);
  const toggleTemplate = useLibraryStore((state) => state.toggleTemplate);
  const removeTemplate = useLibraryStore((state) => state.removeTemplate);
  const duplicateTemplate = useLibraryStore((state) => state.duplicateTemplate);
  const setAllTemplatesEnabled = useLibraryStore((state) => state.setAllTemplatesEnabled);
  const resetToDefault = useLibraryStore((state) => state.resetToDefault);
  const current = useLibraryStore((state) => state.current);
  const setCurrentSelection = useLibraryStore((state) => state.setCurrentSelection);

  const templateMode = useSettingsStore((state) => state.templateMode);
  const setTemplateMode = useSettingsStore((state) => state.setTemplateMode);
  const fixedTemplateId = useSettingsStore((state) => state.fixedTemplateId);
  const setFixedTemplateId = useSettingsStore((state) => state.setFixedTemplateId);

  const userTemplates = useMemo(() => templates.filter((t) => t.source === 'user'), [templates]);
  const builtinTemplates = useMemo(
    () => templates.filter((t) => t.source === 'builtin'),
    [templates],
  );

  const handleSelectTemplate = (tpl: Template) => {
    haptics.impact('light');

    if (templateMode === 'fixed') {
      setFixedTemplateId(tpl.id);
      if (current) {
        setCurrentSelection({
          ...current,
          templateId: tpl.id,
        });
      }
    } else {
      const res = toggleTemplate(tpl.id);
      if (!res.ok) {
        haptics.notification('warning');
        Alert.alert('Không thể tắt', res.message, [{ text: 'Đã hiểu' }]);
      }
    }
  };

  const handleLongPress = (tpl: Template) => {
    haptics.impact('medium');
    setSelectedTemplate(tpl);
  };

  const handleDuplicate = () => {
    if (!selectedTemplate) return;
    const res = duplicateTemplate(selectedTemplate.id);
    setSelectedTemplate(null);
    if (res.ok) {
      haptics.notification('success');
    }
  };

  const handleDelete = () => {
    if (!selectedTemplate) return;
    const target = selectedTemplate;
    setSelectedTemplate(null);

    Alert.alert(
      'Xóa mẫu này',
      'Bạn có chắc chắn muốn xóa mẫu tự tạo này? Nếu đang chọn làm mẫu cố định, hệ thống sẽ chuyển về mẫu mặc định đầu tiên.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            const res = removeTemplate(target.id);
            if (res.ok) {
              haptics.notification('success');
            } else {
              Alert.alert('Không thể xóa', res.message);
            }
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    if (!selectedTemplate) return;
    const targetId = selectedTemplate.id;
    setSelectedTemplate(null);
    router.push({ pathname: '/template-edit/[id]', params: { id: targetId } });
  };

  const handleResetDefaults = () => {
    setShowMenuModal(false);
    Alert.alert(
      'Khôi phục mặc định',
      'Thao tác này sẽ bật lại toàn bộ mẫu có sẵn và giữ nguyên các mẫu tự tạo của bạn.',
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

  const renderTemplateCard = (tpl: Template) => {
    const isFixedSelected = templateMode === 'fixed' && fixedTemplateId === tpl.id;
    const isRandomEnabled = tpl.enabled;

    return (
      <TouchableOpacity
        key={tpl.id}
        style={[
          styles.cardContainer,
          {
            backgroundColor: theme.colors.bg.card,
            borderColor: isFixedSelected ? theme.colors.tint.primary : theme.colors.border.subtle,
            borderWidth: isFixedSelected ? 2 : StyleSheet.hairlineWidth,
            opacity: templateMode === 'random' && !isRandomEnabled ? 0.45 : 1,
          },
        ]}
        onPress={() => handleSelectTemplate(tpl)}
        onLongPress={() => handleLongPress(tpl)}
        activeOpacity={0.8}
        testID={`template-card-${tpl.id}`}
        accessibilityRole="button"
        accessibilityLabel={`${tpl.name}, ${isFixedSelected ? 'đang cố định' : tpl.enabled ? 'đang bật' : 'đang tắt'}`}
      >
        {/* Preview Area */}
        <View style={[styles.cardPreview, { backgroundColor: isDark ? '#1C1C1E' : '#2C2C2E' }]}>
          {/* Mini Quote Simulation */}
          <View
            style={[
              styles.miniQuoteBox,
              {
                backgroundColor:
                  tpl.style.box.background === 'solid'
                    ? tpl.style.box.backgroundColor
                    : tpl.style.box.background === 'blur'
                      ? 'rgba(255, 255, 255, 0.25)'
                      : 'transparent',
                borderRadius: tpl.style.box.radius > 0 ? 6 : 0,
                alignItems:
                  tpl.style.text.align === 'center'
                    ? 'center'
                    : tpl.style.text.align === 'right'
                      ? 'flex-end'
                      : 'flex-start',
              },
            ]}
          >
            <Text
              style={[
                styles.miniQuoteText,
                {
                  color: tpl.style.text.color,
                  textAlign: tpl.style.text.align,
                  fontWeight: tpl.style.text.fontWeight,
                  fontStyle: tpl.style.text.italic ? 'italic' : 'normal',
                },
              ]}
              numberOfLines={3}
            >
              Bình yên bắt đầu từ một nụ cười
            </Text>
            {tpl.style.author.show && (
              <Text
                style={[styles.miniAuthorText, { color: tpl.style.text.color, opacity: 0.8 }]}
                numberOfLines={1}
              >
                {tpl.style.author.prefix} Mẹ Teresa
              </Text>
            )}
          </View>

          {/* Badge */}
          {templateMode === 'fixed' ? (
            isFixedSelected ? (
              <View style={[styles.pillBadge, { backgroundColor: theme.colors.tint.primary }]}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                <Text style={styles.pillText}>Đang dùng</Text>
              </View>
            ) : null
          ) : (
            <View
              style={[
                styles.toggleBadge,
                { backgroundColor: isRandomEnabled ? '#34C759' : 'rgba(0, 0, 0, 0.4)' },
              ]}
            >
              <Ionicons name={isRandomEnabled ? 'checkmark' : 'close'} size={12} color="#FFFFFF" />
            </View>
          )}
        </View>

        {/* Name footer */}
        <View style={styles.cardFooter}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
            {tpl.name}
          </Text>
          <Text style={[styles.cardSub, { color: theme.colors.text.secondary }]}>
            {tpl.source === 'builtin' ? 'Mặc định' : 'Của tôi'}
          </Text>
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
            style={[styles.navBtn, { backgroundColor: theme.colors.bg.secondary, marginRight: 8 }]}
            onPress={() => {
              haptics.impact('light');
              router.push('/template-edit/new');
            }}
            accessibilityRole="button"
            accessibilityLabel="Tạo mẫu mới"
            testID="btn-add-template"
          >
            <Ionicons name="add" size={24} color={theme.colors.tint.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: theme.colors.bg.secondary }]}
            onPress={() => setShowMenuModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Tác vụ kho mẫu"
            testID="btn-templates-menu"
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.tint.primary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.largeTitle, { color: theme.colors.text.primary }]}>Mẫu</Text>

        {/* Mode Segmented Control */}
        <View style={[styles.segmentedBox, { backgroundColor: theme.colors.bg.secondary }]}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              templateMode === 'fixed' && [
                styles.segmentBtnActive,
                { backgroundColor: isDark ? '#3A3A3C' : '#FFFFFF' },
              ],
            ]}
            onPress={() => {
              haptics.impact('light');
              setTemplateMode('fixed');
            }}
          >
            <Ionicons
              name="bookmark"
              size={15}
              color={
                templateMode === 'fixed' ? theme.colors.tint.primary : theme.colors.text.secondary
              }
            />
            <Text
              style={[
                styles.segmentText,
                {
                  color:
                    templateMode === 'fixed'
                      ? theme.colors.text.primary
                      : theme.colors.text.secondary,
                  fontWeight: templateMode === 'fixed' ? '600' : '500',
                },
              ]}
            >
              Cố định
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              templateMode === 'random' && [
                styles.segmentBtnActive,
                { backgroundColor: isDark ? '#3A3A3C' : '#FFFFFF' },
              ],
            ]}
            onPress={() => {
              haptics.impact('light');
              setTemplateMode('random');
            }}
          >
            <Ionicons
              name="shuffle"
              size={16}
              color={
                templateMode === 'random' ? theme.colors.tint.primary : theme.colors.text.secondary
              }
            />
            <Text
              style={[
                styles.segmentText,
                {
                  color:
                    templateMode === 'random'
                      ? theme.colors.text.primary
                      : theme.colors.text.secondary,
                  fontWeight: templateMode === 'random' ? '600' : '500',
                },
              ]}
            >
              Ngẫu nhiên
            </Text>
          </TouchableOpacity>
        </View>

        {/* Explanatory note */}
        <Text style={[styles.helperNote, { color: theme.colors.text.secondary }]}>
          {templateMode === 'fixed'
            ? 'Mỗi lần đổi hình nền sẽ luôn áp dụng mẫu được đánh dấu "Đang dùng".'
            : 'Mỗi lần đổi hình nền sẽ chọn ngẫu nhiên trong các mẫu đang bật.'}
        </Text>
      </View>

      {/* 2. Grid Sections */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80, paddingHorizontal: GRID_PADDING },
        ]}
      >
        {/* Section: Của tôi (nếu có) */}
        {userTemplates.length > 0 && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>
                MẪU CỦA TÔI ({userTemplates.length})
              </Text>
            </View>
            <View style={styles.grid}>{userTemplates.map(renderTemplateCard)}</View>
          </>
        )}

        {/* Section: Mẫu có sẵn */}
        <View style={[styles.sectionHeaderRow, { marginTop: userTemplates.length > 0 ? 24 : 8 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>
            MẪU CÓ SẴN ({builtinTemplates.length})
          </Text>
        </View>
        <View style={styles.grid}>{builtinTemplates.map(renderTemplateCard)}</View>
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
                setAllTemplatesEnabled(true);
                haptics.notification('success');
              }}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={theme.colors.tint.primary}
              />
              <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>
                Bật tất cả mẫu
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

      {/* 4. Modal Tác vụ mẫu khi nhấn giữ */}
      <Modal visible={Boolean(selectedTemplate)} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedTemplate(null)}
        >
          <View style={[styles.menuSheet, { backgroundColor: theme.colors.bg.card }]}>
            <Text style={[styles.menuTitle, { color: theme.colors.text.secondary }]}>
              Tác vụ mẫu: {selectedTemplate?.name}
            </Text>

            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: theme.colors.border.subtle }]}
              onPress={handleDuplicate}
            >
              <Ionicons name="copy-outline" size={20} color={theme.colors.tint.primary} />
              <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>
                Nhân bản mẫu này
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: theme.colors.border.subtle }]}
              onPress={handleEdit}
            >
              <Ionicons name="create-outline" size={20} color={theme.colors.tint.primary} />
              <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>
                Sửa mẫu
              </Text>
            </TouchableOpacity>

            {selectedTemplate?.source === 'user' && (
              <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={20} color={theme.colors.tint.destructive} />
                <Text style={[styles.menuItemText, { color: theme.colors.tint.destructive }]}>
                  Xóa mẫu này
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
    justifyContent: 'flex-end',
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
  segmentedBox: {
    flexDirection: 'row',
    borderRadius: 9,
    padding: 2,
    marginTop: 12,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 7,
    gap: 6,
  },
  segmentBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
  },
  helperNote: {
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 2,
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
  cardContainer: {
    width: CARD_WIDTH,
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardPreview: {
    width: '100%',
    height: CARD_HEIGHT,
    padding: 12,
    justifyContent: 'center',
    position: 'relative',
  },
  miniQuoteBox: {
    padding: 8,
    width: '100%',
  },
  miniQuoteText: {
    fontSize: 12,
    lineHeight: 16,
  },
  miniAuthorText: {
    fontSize: 10,
    marginTop: 4,
  },
  pillBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  toggleBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardSub: {
    fontSize: 12,
    marginTop: 2,
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
