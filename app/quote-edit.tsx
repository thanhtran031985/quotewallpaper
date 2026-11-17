import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/theme/useTheme';
import { useLibraryStore } from '../src/store/useLibraryStore';
import { isQuoteDuplicate, normalizeText } from '../src/domain/validate';
import { haptics } from '../src/services/haptics';

export default function QuoteEditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const quotes = useLibraryStore((state) => state.quotes);
  const addQuote = useLibraryStore((state) => state.addQuote);
  const updateQuote = useLibraryStore((state) => state.updateQuote);

  const existingQuote = useMemo(() => {
    if (!id) return null;
    return quotes.find((q) => q.id === id) ?? null;
  }, [id, quotes]);

  const [text, setText] = useState<string>(existingQuote?.text ?? '');
  const [author, setAuthor] = useState<string>(existingQuote?.author ?? '');

  const isEditing = Boolean(existingQuote);

  // Validation
  const trimmedText = normalizeText(text);
  const trimmedAuthor = normalizeText(author);

  const textError = useMemo(() => {
    if (text.length > 220) {
      return 'Nội dung không được vượt quá 220 ký tự';
    }
    if (trimmedText.length > 0 && isQuoteDuplicate(trimmedText, quotes, existingQuote?.id)) {
      return 'Danh ngôn này đã tồn tại trong kho';
    }
    return null;
  }, [text.length, trimmedText, quotes, existingQuote?.id]);

  const authorError = useMemo(() => {
    if (trimmedAuthor.length > 60) {
      return 'Tác giả không được vượt quá 60 ký tự';
    }
    return null;
  }, [trimmedAuthor]);

  const isValid =
    trimmedText.length > 0 &&
    text.length <= 220 &&
    trimmedAuthor.length <= 60 &&
    !textError &&
    !authorError;

  const handleSave = () => {
    if (!isValid) {
      haptics.notification('warning');
      return;
    }

    if (isEditing && existingQuote) {
      const res = updateQuote(existingQuote.id, text, author.length > 0 ? author : undefined);
      if (res.ok) {
        haptics.notification('success');
        router.back();
      }
    } else {
      const res = addQuote(text, author.length > 0 ? author : undefined);
      if (res.ok) {
        haptics.notification('success');
        router.back();
      }
    }
  };

  const handleCancel = () => {
    haptics.impact('light');
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.bg.primary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Sheet Grabber */}
      <View style={styles.grabberContainer}>
        <View style={[styles.grabber, { backgroundColor: theme.colors.text.tertiary }]} />
      </View>

      {/* Header bar */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border.subtle }]}>
        <TouchableOpacity
          onPress={handleCancel}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Hủy"
        >
          <Text style={[styles.headerBtnText, { color: theme.colors.tint.primary }]}>Hủy</Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          {isEditing ? 'Sửa danh ngôn' : 'Thêm danh ngôn'}
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={!isValid}
          style={[styles.headerBtn, { alignItems: 'flex-end' }]}
          accessibilityRole="button"
          accessibilityLabel="Lưu"
        >
          <Text
            style={[
              styles.headerBtnText,
              styles.saveBtnText,
              {
                color: isValid ? theme.colors.tint.primary : theme.colors.text.tertiary,
                opacity: isValid ? 1 : 0.4,
              },
            ]}
          >
            Lưu
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Text Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>
            NỘI DUNG
          </Text>
          <Text
            style={[
              styles.counter,
              {
                color:
                  text.length > 220 ? theme.colors.tint.destructive : theme.colors.text.tertiary,
              },
            ]}
          >
            {text.length}/220
          </Text>
        </View>
        <View style={[styles.card, { backgroundColor: theme.colors.bg.card }]}>
          <TextInput
            style={[styles.textArea, { color: theme.colors.text.primary }]}
            placeholder="Nhập nội dung danh ngôn..."
            placeholderTextColor={theme.colors.text.tertiary}
            multiline
            numberOfLines={4}
            value={text}
            onChangeText={setText}
            autoFocus={!isEditing}
            textAlignVertical="top"
          />
        </View>
        {textError && (
          <Text style={[styles.errorText, { color: theme.colors.tint.destructive }]}>
            {textError}
          </Text>
        )}

        {/* Author Section */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>TÁC GIẢ</Text>
          <Text
            style={[
              styles.counter,
              {
                color:
                  trimmedAuthor.length > 60
                    ? theme.colors.tint.destructive
                    : theme.colors.text.tertiary,
              },
            ]}
          >
            {trimmedAuthor.length}/60
          </Text>
        </View>
        <View style={[styles.card, { backgroundColor: theme.colors.bg.card }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.text.primary }]}
            placeholder="Tên tác giả (không bắt buộc)"
            placeholderTextColor={theme.colors.text.tertiary}
            value={author}
            onChangeText={setAuthor}
            autoCapitalize="words"
          />
        </View>
        {authorError && (
          <Text style={[styles.errorText, { color: theme.colors.tint.destructive }]}>
            {authorError}
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grabberContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  headerBtnText: {
    fontSize: 17,
  },
  saveBtnText: {
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  counter: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  textArea: {
    minHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 22,
  },
  input: {
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 13,
    marginTop: 6,
    paddingHorizontal: 4,
  },
});
