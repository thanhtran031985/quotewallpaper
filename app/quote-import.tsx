import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useTheme } from '../src/theme/useTheme';
import { useLibraryStore } from '../src/store/useLibraryStore';
import { parseQuotesFile, ParsedQuotesResult } from '../src/services/quoteParser';
import { Toast } from '../src/components/Toast';
import { haptics } from '../src/services/haptics';

export default function QuoteImportScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const existingQuotes = useLibraryStore((s) => s.quotes);
  const addQuote = useLibraryStore((s) => s.addQuote);

  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ParsedQuotesResult | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handlePickDocument = async () => {
    try {
      setLoading(true);
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          'application/json',
          'text/csv',
          'text/comma-separated-values',
          'text/plain',
        ],
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) {
        setLoading(false);
        return;
      }

      const asset = res.assets[0];
      setFileName(asset.name);

      const content = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: 'utf8',
      });

      const parsed = parseQuotesFile(content, existingQuotes);
      setParseResult(parsed);
      setLoading(false);
    } catch {
      setLoading(false);
      haptics.notification('error');
      setToastMessage('Lỗi khi đọc tệp. Vui lòng thử lại.');
    }
  };

  const handleImport = () => {
    if (!parseResult || parseResult.validQuotes.length === 0) return;

    for (const q of parseResult.validQuotes) {
      addQuote(q.text, q.author);
    }

    haptics.notification('success');
    setToastMessage(`Đã nhập ${parseResult.validQuotes.length} câu vào kho`);
    setTimeout(() => {
      router.back();
    }, 600);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg.primary }]}>
      {/* Grabber */}
      <View style={styles.grabberContainer}>
        <View style={[styles.grabber, { backgroundColor: theme.colors.border.subtle }]} />
      </View>

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border.separator }]}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Đóng"
        >
          <Text style={[styles.closeText, { color: theme.colors.text.secondary }]}>Đóng</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Nhập danh ngôn</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.instructions, { color: theme.colors.text.secondary }]}>
          Chọn tệp JSON hoặc CSV từ thiết bị của bạn. Ứng dụng sẽ tự động kiểm tra định dạng và bỏ qua những câu bị trùng lặp hoặc không hợp lệ.
        </Text>

        {/* Nút chọn file */}
        <TouchableOpacity
          style={[
            styles.pickButton,
            { backgroundColor: theme.colors.tint.primary, borderRadius: theme.radii.md },
          ]}
          onPress={handlePickDocument}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Chọn tệp JSON hoặc CSV"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[styles.pickButtonText, { color: '#FFFFFF' }]}>
              Chọn tệp (JSON / CSV)
            </Text>
          )}
        </TouchableOpacity>

        {/* Kết quả phân tích */}
        {parseResult && (
          <View
            style={[
              styles.resultCard,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : theme.colors.bg.card,
                borderRadius: theme.radii.lg,
                borderColor: theme.colors.border.separator,
              },
            ]}
          >
            {fileName && (
              <Text style={[styles.fileLabel, { color: theme.colors.text.secondary }]}>
                Tệp:{' '}
                <Text style={{ color: theme.colors.text.primary, fontWeight: '600' }}>
                  {fileName}
                </Text>
              </Text>
            )}

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.tint.primary }]}>
                  {parseResult.validQuotes.length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
                  hợp lệ
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.tint.warning }]}>
                  {parseResult.duplicatesCount}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
                  trùng lặp
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.tint.destructive }]}>
                  {parseResult.invalidCount}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
                  không hợp lệ
                </Text>
              </View>
            </View>

            <View style={styles.badgeSummary}>
              <Text style={[styles.summaryText, { color: theme.colors.text.primary }]}>
                {parseResult.validQuotes.length} câu hợp lệ
              </Text>
              <Text style={[styles.subSummaryText, { color: theme.colors.text.secondary }]}>
                {parseResult.duplicatesCount} câu trùng lặp • {parseResult.invalidCount} câu bỏ qua
              </Text>
            </View>

            {/* Xem trước vài câu */}
            {parseResult.validQuotes.length > 0 && (
              <View style={styles.previewBox}>
                <Text style={[styles.previewHeading, { color: theme.colors.text.secondary }]}>
                  Xem trước:
                </Text>
                {parseResult.validQuotes.slice(0, 3).map((item, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.previewItem,
                      { borderBottomColor: theme.colors.border.separator },
                    ]}
                  >
                    <Text
                      style={[styles.previewText, { color: theme.colors.text.primary }]}
                      numberOfLines={2}
                    >
                      &quot;{item.text}&quot;
                    </Text>
                    {item.author && (
                      <Text
                        style={[styles.previewAuthor, { color: theme.colors.text.secondary }]}
                      >
                        — {item.author}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Nút thực hiện nhập */}
            <TouchableOpacity
              style={[
                styles.importBtn,
                {
                  backgroundColor:
                    parseResult.validQuotes.length > 0
                      ? theme.colors.tint.primary
                      : theme.colors.text.quaternary,
                  borderRadius: theme.radii.md,
                },
              ]}
              disabled={parseResult.validQuotes.length === 0}
              onPress={handleImport}
              accessibilityRole="button"
            >
              <Text style={[styles.importBtnText, { color: '#FFFFFF' }]}>
                Nhập {parseResult.validQuotes.length} câu vào kho
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Toast
        visible={Boolean(toastMessage)}
        message={toastMessage || ''}
        onDismiss={() => setToastMessage(null)}
      />
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
  closeBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    padding: 20,
  },
  instructions: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  pickButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  fileLabel: {
    fontSize: 13,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  badgeSummary: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  subSummaryText: {
    fontSize: 13,
    marginTop: 4,
  },
  previewBox: {
    marginTop: 8,
    marginBottom: 16,
  },
  previewHeading: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  previewItem: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  previewAuthor: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'right',
  },
  importBtn: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  importBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
