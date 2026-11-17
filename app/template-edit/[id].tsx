import React, { useState, useRef, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  PanResponder,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLibraryStore } from '@/store/useLibraryStore';
import { useTheme } from '@/theme/useTheme';
import { TemplateStyle, FontFamily } from '@/domain/types';
import { BUILTIN_TEMPLATES } from '@/templates/builtin';
import { WallpaperCanvas } from '@/components/WallpaperCanvas';
import { LockScreenOverlay } from '@/components/LockScreenOverlay';
import { clampBoxPosition } from '@/engine/layout';
import { haptics } from '@/services/haptics';

export const PRESET_COLORS = [
  '#FFFFFF',
  '#000000',
  '#F2F2F7',
  '#8E8E93',
  '#FF3B30',
  '#FF9500',
  '#FFCC00',
  '#34C759',
  '#007AFF',
  '#5856D6',
  '#AF52DE',
  '#FBF0D9',
];

export default function TemplateEditorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDark } = useTheme();

  const templates = useLibraryStore((s) => s.templates);
  const images = useLibraryStore((s) => s.images);
  const quotes = useLibraryStore((s) => s.quotes);
  const addTemplate = useLibraryStore((s) => s.addTemplate);
  const updateTemplate = useLibraryStore((s) => s.updateTemplate);

  // Mẫu hiện tại hoặc tạo mới
  const existingTemplate = useMemo(() => {
    if (id && id !== 'new') {
      return templates.find((t) => t.id === id);
    }
    return null;
  }, [id, templates]);

  // Khởi tạo state
  const isNew = !existingTemplate;
  const [templateName, setTemplateName] = useState(
    existingTemplate ? existingTemplate.name : 'Mẫu tự tạo',
  );
  const [style, setStyle] = useState<TemplateStyle>(() => {
    if (existingTemplate) {
      return JSON.parse(JSON.stringify(existingTemplate.style));
    }
    return JSON.parse(JSON.stringify(BUILTIN_TEMPLATES[0].style));
  });

  const [undoStack, setUndoStack] = useState<TemplateStyle[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'box' | 'overlay' | 'image' | 'frame'>(
    'text',
  );
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newNameInput, setNewNameInput] = useState(templateName);

  // Kích thước canvas xem trước
  const windowDims = Dimensions.get('window');
  const canvasHeight = Math.round(windowDims.height * 0.44);
  const canvasWidth = Math.round(windowDims.width * 0.76);

  // Ảnh và danh ngôn demo
  const demoImage = images[0] || {
    id: 'demo-img',
    name: 'Ảnh mẫu',
    source: 'default' as const,
    uri: 'default-1',
    width: 1080,
    height: 1920,
    focalPoint: { x: 0.5, y: 0.5 },
    enabled: true,
    createdAt: '2026-01-01',
  };
  const demoQuote = quotes[0] || {
    id: 'demo-quote',
    text: 'Bình yên bắt đầu từ một nụ cười.',
    author: 'Mẹ Teresa',
    enabled: true,
    favorite: false,
    source: 'default',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  // Cập nhật style và đẩy vào undo stack
  const updateStyle = (updater: (prev: TemplateStyle) => TemplateStyle) => {
    setStyle((prev) => {
      const next = updater(prev);
      setUndoStack((stack) => [...stack.slice(-5), prev]);
      setIsDirty(true);
      return next;
    });
  };

  // Hoàn tác 1 bước
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    haptics.impact('light');
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((stack) => stack.slice(0, stack.length - 1));
    setStyle(prev);
  };

  // Kéo khối chữ (PanResponder)
  const panStartRef = useRef(style.box.yPct);
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          panStartRef.current = style.box.yPct;
        },
        onPanResponderMove: (_, gestureState) => {
          const deltaPct = (gestureState.dy / canvasHeight) * 100;
          const targetY = panStartRef.current + deltaPct;
          const clamped = clampBoxPosition(targetY, style.box.anchor);
          if (clamped.isClamped) {
            haptics.impact('light');
          }
          setStyle((prev) => ({
            ...prev,
            box: {
              ...prev.box,
              yPct: Math.round(clamped.yPct),
            },
          }));
          setIsDirty(true);
        },
      }),
    [style.box.anchor, style.box.yPct, canvasHeight],
  );

  // Thoát màn hình
  const handleCancel = () => {
    haptics.impact('light');
    if (isDirty) {
      Alert.alert(
        'Bỏ thay đổi?',
        'Các chỉnh sửa chưa lưu sẽ bị mất. Bạn có chắc chắn muốn thoát?',
        [
          { text: 'Tiếp tục sửa', style: 'cancel' },
          {
            text: 'Bỏ thay đổi',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ],
      );
    } else {
      router.back();
    }
  };

  // Lưu template
  const handleSave = () => {
    haptics.impact('medium');
    const trimmedName = templateName.trim() || 'Mẫu tự tạo';

    if (isNew) {
      const res = addTemplate({
        name: trimmedName,
        source: 'user',
        style,
        enabled: true,
      });
      if (res.ok) {
        haptics.notification('success');
        router.back();
      } else {
        Alert.alert('Không thể tạo mẫu', res.message);
      }
    } else {
      const res = updateTemplate(existingTemplate.id, {
        name: trimmedName,
        style,
      });
      if (res.ok) {
        haptics.notification('success');
        router.back();
      } else {
        Alert.alert('Không thể lưu mẫu', res.message);
      }
    }
  };

  // Đổi tên template
  const handleConfirmRename = () => {
    const trimmed = newNameInput.trim();
    if (trimmed) {
      setTemplateName(trimmed);
      setIsDirty(true);
      haptics.selection();
    }
    setShowRenameModal(false);
  };

  // Giả lập template object để render xem trước
  const previewTemplate = useMemo(
    () => ({
      id: existingTemplate ? existingTemplate.id : 'preview-temp-id',
      name: templateName,
      source: 'user' as const,
      style,
      enabled: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    }),
    [existingTemplate, templateName, style],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.primary }]}>
      {/* 1. Header Bar */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          testID="btn-editor-cancel"
          onPress={handleCancel}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Hủy chỉnh sửa"
        >
          <Text style={[styles.headerBtnText, { color: theme.colors.text.secondary }]}>Hủy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="btn-editor-rename"
          onPress={() => {
            setNewNameInput(templateName);
            setShowRenameModal(true);
          }}
          style={styles.headerTitleContainer}
          accessibilityRole="button"
          accessibilityLabel="Đổi tên mẫu"
        >
          <Text
            style={[styles.headerTitle, { color: theme.colors.text.primary }]}
            numberOfLines={1}
          >
            {templateName}
          </Text>
          <Ionicons
            name="pencil"
            size={14}
            color={theme.colors.tint.primary}
            style={styles.pencilIcon}
          />
        </TouchableOpacity>

        <View style={styles.headerRightGroup}>
          <TouchableOpacity
            testID="btn-editor-undo"
            onPress={handleUndo}
            disabled={undoStack.length === 0}
            style={[styles.headerIconBtn, undoStack.length === 0 && { opacity: 0.3 }]}
            accessibilityRole="button"
            accessibilityLabel="Hoàn tác"
          >
            <Ionicons name="arrow-undo" size={20} color={theme.colors.tint.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            testID="btn-editor-save"
            onPress={handleSave}
            style={[styles.headerSaveBtn, { backgroundColor: theme.colors.tint.primary }]}
            accessibilityRole="button"
            accessibilityLabel="Lưu mẫu"
          >
            <Text style={styles.headerSaveText}>Lưu</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Live Canvas Preview with LockScreenOverlay (≈ 45% screen) */}
      <View style={styles.previewContainer}>
        <View
          testID="editor-canvas-wrapper"
          style={[
            styles.canvasWrapper,
            {
              width: canvasWidth,
              height: canvasHeight,
              borderRadius: 20,
              overflow: 'hidden',
              backgroundColor: '#000000',
            },
          ]}
          {...panResponder.panHandlers}
        >
          <WallpaperCanvas
            image={demoImage}
            quote={demoQuote}
            template={previewTemplate}
            width={canvasWidth}
            height={canvasHeight}
            showAuthor={style.author.show}
            testID="editor-canvas"
          />

          {/* LockScreen Overlay mờ để định vị vùng an toàn đồng hồ */}
          <View style={styles.overlayWrapper} pointerEvents="none">
            <LockScreenOverlay showClockZone={true} />
          </View>

          {/* Chỉ dẫn kéo thả */}
          <View style={styles.dragHintPill}>
            <Ionicons name="swap-vertical" size={12} color="#FFFFFF" />
            <Text style={styles.dragHintText}>Kéo để chỉnh vị trí</Text>
          </View>
        </View>
      </View>

      {/* 3. 5 Tool Tabs (Chữ · Khối · Phủ · Ảnh · Khung) */}
      <View style={[styles.tabBar, { backgroundColor: theme.colors.bg.secondary }]}>
        {(['text', 'box', 'overlay', 'image', 'frame'] as const).map((tabKey) => {
          const titles: Record<string, string> = {
            text: 'Chữ',
            box: 'Khối',
            overlay: 'Phủ',
            image: 'Ảnh',
            frame: 'Khung',
          };
          const isActive = activeTab === tabKey;
          return (
            <TouchableOpacity
              key={tabKey}
              testID={`tab-${tabKey}`}
              onPress={() => {
                haptics.selection();
                setActiveTab(tabKey);
              }}
              style={[
                styles.tabItem,
                isActive && [
                  styles.tabItemActive,
                  { backgroundColor: isDark ? '#3A3A3C' : '#FFFFFF' },
                ],
              ]}
              accessibilityRole="tab"
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive ? theme.colors.tint.primary : theme.colors.text.secondary,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {titles[tabKey]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 4. Controls ScrollView */}
      <ScrollView
        style={styles.controlsScroll}
        contentContainerStyle={[styles.controlsContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* TAB 1: CHỮ */}
        {activeTab === 'text' && (
          <View testID="panel-text" style={styles.panel}>
            {/* Font family */}
            <Text style={[styles.controlLabel, { color: theme.colors.text.secondary }]}>
              FONT CHỮ
            </Text>
            <View style={styles.optionsRow}>
              {(['Serif', 'Sans', 'Rounded', 'Mono', 'Handwriting'] as FontFamily[]).map((f) => (
                <TouchableOpacity
                  key={f}
                  testID={`font-${f}`}
                  onPress={() => updateStyle((s) => ({ ...s, text: { ...s.text, fontFamily: f } }))}
                  style={[
                    styles.chipBtn,
                    {
                      backgroundColor:
                        style.text.fontFamily === f
                          ? theme.colors.tint.primary
                          : theme.colors.bg.card,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: style.text.fontFamily === f ? '#FFFFFF' : theme.colors.text.primary,
                      },
                    ]}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Cỡ chữ */}
            <Text style={[styles.controlLabel, { color: theme.colors.text.secondary }]}>
              CỠ CHỮ ({Math.round(style.text.sizePct)}%)
            </Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                testID="btn-size-minus"
                onPress={() =>
                  updateStyle((s) => ({
                    ...s,
                    text: { ...s.text, sizePct: Math.max(3.5, s.text.sizePct - 0.5) },
                  }))
                }
                style={[styles.stepperBtn, { backgroundColor: theme.colors.bg.card }]}
              >
                <Ionicons name="remove" size={18} color={theme.colors.text.primary} />
              </TouchableOpacity>
              <Text style={[styles.stepperValue, { color: theme.colors.text.primary }]}>
                {style.text.sizePct.toFixed(1)}%
              </Text>
              <TouchableOpacity
                testID="btn-size-plus"
                onPress={() =>
                  updateStyle((s) => ({
                    ...s,
                    text: { ...s.text, sizePct: Math.min(9.0, s.text.sizePct + 0.5) },
                  }))
                }
                style={[styles.stepperBtn, { backgroundColor: theme.colors.bg.card }]}
              >
                <Ionicons name="add" size={18} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Căn lề */}
            <Text style={[styles.controlLabel, { color: theme.colors.text.secondary }]}>
              CĂN LỀ
            </Text>
            <View style={styles.optionsRow}>
              {(['left', 'center', 'right'] as const).map((a) => (
                <TouchableOpacity
                  key={a}
                  testID={`align-${a}`}
                  onPress={() => updateStyle((s) => ({ ...s, text: { ...s.text, align: a } }))}
                  style={[
                    styles.chipBtn,
                    {
                      backgroundColor:
                        style.text.align === a ? theme.colors.tint.primary : theme.colors.bg.card,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: style.text.align === a ? '#FFFFFF' : theme.colors.text.primary },
                    ]}
                  >
                    {a === 'left' ? 'Trái' : a === 'center' ? 'Giữa' : 'Phải'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tùy chọn in hoa, nghiêng, đổ bóng */}
            <Text style={[styles.controlLabel, { color: theme.colors.text.secondary }]}>
              KIỂU CHỮ
            </Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity
                testID="toggle-uppercase"
                onPress={() =>
                  updateStyle((s) => ({
                    ...s,
                    text: { ...s.text, uppercase: !s.text.uppercase },
                  }))
                }
                style={[
                  styles.chipBtn,
                  {
                    backgroundColor: style.text.uppercase
                      ? theme.colors.tint.primary
                      : theme.colors.bg.card,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: style.text.uppercase ? '#FFFFFF' : theme.colors.text.primary },
                  ]}
                >
                  IN HOA
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="toggle-italic"
                onPress={() =>
                  updateStyle((s) => ({
                    ...s,
                    text: { ...s.text, italic: !s.text.italic },
                  }))
                }
                style={[
                  styles.chipBtn,
                  {
                    backgroundColor: style.text.italic
                      ? theme.colors.tint.primary
                      : theme.colors.bg.card,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: style.text.italic ? '#FFFFFF' : theme.colors.text.primary },
                  ]}
                >
                  Nghiêng
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="toggle-shadow"
                onPress={() =>
                  updateStyle((s) => ({
                    ...s,
                    text: { ...s.text, shadow: !s.text.shadow },
                  }))
                }
                style={[
                  styles.chipBtn,
                  {
                    backgroundColor: style.text.shadow
                      ? theme.colors.tint.primary
                      : theme.colors.bg.card,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: style.text.shadow ? '#FFFFFF' : theme.colors.text.primary },
                  ]}
                >
                  Bóng chữ
                </Text>
              </TouchableOpacity>
            </View>

            {/* Màu chữ (12 swatches) */}
            <Text style={[styles.controlLabel, { color: theme.colors.text.secondary }]}>
              MÀU CHỮ
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.swatchScroll}
            >
              {PRESET_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  testID={`color-text-${c}`}
                  onPress={() => updateStyle((s) => ({ ...s, text: { ...s.text, color: c } }))}
                  style={[
                    styles.swatchCircle,
                    { backgroundColor: c },
                    style.text.color === c && styles.swatchCircleSelected,
                  ]}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* TAB 2: KHỐI */}
        {activeTab === 'box' && (
          <View testID="panel-box" style={styles.panel}>
            {/* Kiểu nền khối */}
            <Text style={[styles.controlLabel, { color: theme.colors.text.secondary }]}>
              NỀN KHỐI
            </Text>
            <View style={styles.optionsRow}>
              {(['none', 'solid', 'blur', 'paper'] as const).map((bg) => (
                <TouchableOpacity
                  key={bg}
                  testID={`box-bg-${bg}`}
                  onPress={() =>
                    updateStyle((s) => ({
                      ...s,
                      box: {
                        ...s.box,
                        background: bg,
                        backgroundOpacity: bg === 'none' ? 0 : s.box.backgroundOpacity || 0.6,
                      },
                    }))
                  }
                  style={[
                    styles.chipBtn,
                    {
                      backgroundColor:
                        style.box.background === bg
                          ? theme.colors.tint.primary
                          : theme.colors.bg.card,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: style.box.background === bg ? '#FFFFFF' : theme.colors.text.primary,
                      },
                    ]}
                  >
                    {bg === 'none'
                      ? 'Không'
                      : bg === 'solid'
                        ? 'Màu'
                        : bg === 'blur'
                          ? 'Kính mờ'
                          : 'Giấy'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Bo góc khối */}
            <Text style={[styles.controlLabel, { color: theme.colors.text.secondary }]}>
              BO GÓC ({style.box.radius}px)
            </Text>
            <View style={styles.optionsRow}>
              {[0, 8, 14, 20, 26].map((r) => (
                <TouchableOpacity
                  key={r}
                  testID={`box-radius-${r}`}
                  onPress={() => updateStyle((s) => ({ ...s, box: { ...s.box, radius: r } }))}
                  style={[
                    styles.chipBtn,
                    {
                      backgroundColor:
                        style.box.radius === r ? theme.colors.tint.primary : theme.colors.bg.card,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: style.box.radius === r ? '#FFFFFF' : theme.colors.text.primary },
                    ]}
                  >
                    {r}px
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Viền trái */}
            <Text style={[styles.controlLabel, { color: theme.colors.text.secondary }]}>
              VIỀN TRÁI
            </Text>
            <TouchableOpacity
              testID="toggle-border-left"
              onPress={() =>
                updateStyle((s) => ({ ...s, box: { ...s.box, borderLeft: !s.box.borderLeft } }))
              }
              style={[
                styles.chipBtn,
                {
                  backgroundColor: style.box.borderLeft
                    ? theme.colors.tint.primary
                    : theme.colors.bg.card,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: style.box.borderLeft ? '#FFFFFF' : theme.colors.text.primary },
                ]}
              >
                {style.box.borderLeft ? 'Đang bật viền trái' : 'Không có viền'}
              </Text>
            </TouchableOpacity>

            {/* Màu nền khối */}
            <Text style={[styles.controlLabel, { color: theme.colors.text.secondary }]}>
              MÀU NỀN
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.swatchScroll}
            >
              {PRESET_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  testID={`color-box-${c}`}
                  onPress={() =>
                    updateStyle((s) => ({ ...s, box: { ...s.box, backgroundColor: c } }))
                  }
                  style={[
                    styles.swatchCircle,
                    { backgroundColor: c },
                    style.box.backgroundColor === c && styles.swatchCircleSelected,
                  ]}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* TAB 3: PHỦ */}
        {activeTab === 'overlay' && (
          <View testID="panel-overlay" style={styles.panel}>
            <Text style={[styles.controlLabel, { color: theme.colors.text.secondary }]}>
              KIỂU PHỦ
            </Text>
            <View style={styles.optionsRow}>
              {(['none', 'solid', 'gradient-bottom', 'gradient-left', 'vignette'] as const).map(
                (ot) => {
                  const labels: Record<string, string> = {
                    none: 'Không',
                    solid: 'Đơn sắc',
                    'gradient-bottom': 'Đáy',
                    'gradient-left': 'Trái',
                    vignette: 'Góc',
                  };
                  return (
                    <TouchableOpacity
                      key={ot}
                      testID={`overlay-type-${ot}`}
                      onPress={() =>
                        updateStyle((s) => ({
                          ...s,
                          overlay: {
                            ...s.overlay,
                            type: ot,
                            opacity: ot === 'none' ? 0 : s.overlay.opacity || 0.4,
                          },
                        }))
                      }
                      style={[
                        styles.chipBtn,
                        {
                          backgroundColor:
                            style.overlay.type === ot
                              ? theme.colors.tint.primary
                              : theme.colors.bg.card,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color:
                              style.overlay.type === ot ? '#FFFFFF' : theme.colors.text.primary,
                          },
                        ]}
                      >
                        {labels[ot]}
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
            </View>

            {/* Màu phủ */}
            <Text style={[styles.controlLabel, { color: theme.colors.text.secondary }]}>
              MÀU PHỦ
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.swatchScroll}
            >
              {PRESET_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  testID={`color-overlay-${c}`}
                  onPress={() =>
                    updateStyle((s) => ({ ...s, overlay: { ...s.overlay, color: c } }))
                  }
                  style={[
                    styles.swatchCircle,
                    { backgroundColor: c },
                    style.overlay.color === c && styles.swatchCircleSelected,
                  ]}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* TAB 4: ẢNH */}
        {activeTab === 'image' && (
          <View testID="panel-image" style={styles.panel}>
            {/* Làm mờ ảnh */}
            <Text style={[styles.controlLabel, { color: theme.colors.text.secondary }]}>
              LÀM MỜ ẢNH ({style.image.blur}px)
            </Text>
            <View style={styles.optionsRow}>
              {[0, 6, 12, 18].map((b) => (
                <TouchableOpacity
                  key={b}
                  testID={`image-blur-${b}`}
                  onPress={() => updateStyle((s) => ({ ...s, image: { ...s.image, blur: b } }))}
                  style={[
                    styles.chipBtn,
                    {
                      backgroundColor:
                        style.image.blur === b ? theme.colors.tint.primary : theme.colors.bg.card,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: style.image.blur === b ? '#FFFFFF' : theme.colors.text.primary },
                    ]}
                  >
                    {b === 0 ? 'Rõ nét' : `${b}px`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* TAB 5: KHUNG */}
        {activeTab === 'frame' && (
          <View testID="panel-frame" style={styles.panel}>
            <Text style={[styles.controlLabel, { color: theme.colors.text.secondary }]}>
              KHUNG VIỀN
            </Text>
            <TouchableOpacity
              testID="toggle-frame-enabled"
              onPress={() =>
                updateStyle((s) => ({
                  ...s,
                  frame: {
                    show: !s.frame?.show,
                    color: s.frame?.color || '#FFFFFF',
                    widthPct: s.frame?.widthPct || 3,
                  },
                }))
              }
              style={[
                styles.chipBtn,
                {
                  backgroundColor: style.frame?.show
                    ? theme.colors.tint.primary
                    : theme.colors.bg.card,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: style.frame?.show ? '#FFFFFF' : theme.colors.text.primary },
                ]}
              >
                {style.frame?.show ? 'Đang bật khung viền' : 'Không có khung'}
              </Text>
            </TouchableOpacity>

            {style.frame?.show && (
              <>
                <Text style={[styles.controlLabel, { color: theme.colors.text.secondary }]}>
                  MÀU KHUNG
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.swatchScroll}
                >
                  {PRESET_COLORS.map((c) => (
                    <TouchableOpacity
                      key={c}
                      testID={`color-frame-${c}`}
                      onPress={() =>
                        updateStyle((s) => ({
                          ...s,
                          frame: { ...s.frame!, color: c },
                        }))
                      }
                      style={[
                        styles.swatchCircle,
                        { backgroundColor: c },
                        style.frame?.color === c && styles.swatchCircleSelected,
                      ]}
                    />
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal Đổi tên mẫu */}
      <Modal
        visible={showRenameModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRenameModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.bg.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
              Đổi tên mẫu
            </Text>
            <TextInput
              testID="input-rename-template"
              style={[
                styles.modalInput,
                {
                  color: theme.colors.text.primary,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                },
              ]}
              value={newNameInput}
              onChangeText={setNewNameInput}
              placeholder="Tên mẫu"
              placeholderTextColor={theme.colors.text.tertiary}
              autoFocus={true}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                onPress={() => setShowRenameModal(false)}
                style={[styles.modalBtn, { backgroundColor: theme.colors.bg.secondary }]}
              >
                <Text style={[styles.modalBtnText, { color: theme.colors.text.secondary }]}>
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="btn-confirm-rename"
                onPress={handleConfirmRename}
                style={[styles.modalBtn, { backgroundColor: theme.colors.tint.primary }]}
              >
                <Text style={[styles.modalBtnText, { color: '#FFFFFF', fontWeight: '600' }]}>
                  Xong
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  headerBtnText: {
    fontSize: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '48%',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  pencilIcon: {
    marginLeft: 6,
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    padding: 6,
  },
  headerSaveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
  },
  headerSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  canvasWrapper: {
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  overlayWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.45,
  },
  dragHintPill: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  dragHintText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 3,
    marginBottom: 8,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tabItemActive: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
  },
  controlsScroll: {
    flex: 1,
  },
  controlsContent: {
    paddingHorizontal: 16,
  },
  panel: {
    gap: 12,
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginTop: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  chipText: {
    fontSize: 14,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'center',
  },
  swatchScroll: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  swatchCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  swatchCircleSelected: {
    borderColor: '#007AFF',
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 18,
    padding: 20,
    gap: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalInput: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
  },
  modalBtnText: {
    fontSize: 15,
  },
});
