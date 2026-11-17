import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import QuoteImportScreen from '../../app/quote-import';
import { useLibraryStore } from '../../src/store/useLibraryStore';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { exportQuotesToJson } from '../../src/services/quoteExport';
import * as Sharing from 'expo-sharing';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock safe area
jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return {
    ...actual,
    useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
    SafeAreaProvider: ({ children }: any) => children,
  };
});

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///mock-cache/',
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    push: jest.fn(),
  }),
}));

describe('Quote Import & Export (11-import-history Step 2)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLibraryStore.setState({
      quotes: [
        {
          id: 'q1',
          text: 'Câu đã có sẵn',
          author: 'Tác giả A',
          enabled: true,
          favorite: false,
          source: 'default',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
    });
  });

  describe('quoteExport service', () => {
    it('xuất file JSON danh ngôn và mở share dialog', async () => {
      const quotes = useLibraryStore.getState().quotes;
      const res = await exportQuotesToJson(quotes);

      expect(res.ok).toBe(true);
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        expect.stringContaining('quotes-export.json'),
        expect.stringContaining('Câu đã có sẵn'),
        { encoding: 'utf8' },
      );
      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        expect.stringContaining('quotes-export.json'),
        expect.objectContaining({ mimeType: 'application/json' }),
      );
    });
  });

  describe('QuoteImportScreen UI', () => {
    it('cho phép chọn file, phân tích và thêm các câu hợp lệ vào kho', async () => {
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
        canceled: false,
        assets: [
          {
            name: 'quotes.csv',
            uri: 'file:///mock/quotes.csv',
          },
        ],
      });

      const csvData =
        'text,author\n' +
        '"Câu mới 1",Tác giả 1\n' +
        '"Câu đã có sẵn",Tác giả A\n' + // Trùng
        '"Câu mới 2",Tác giả 2';

      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(csvData);

      const { getByText, findByText } = await render(<QuoteImportScreen />);

      // Nhấn nút chọn file
      const pickBtn = getByText('Chọn tệp (JSON / CSV)');
      fireEvent.press(pickBtn);

      // Chờ màn hình hiển thị tóm tắt
      await findByText('2 câu hợp lệ');
      expect(getByText(/1 câu trùng lặp/)).toBeTruthy();

      // Bấm nút nhập danh ngôn
      const importBtn = getByText('Nhập 2 câu vào kho');
      fireEvent.press(importBtn);

      await waitFor(() => {
        expect(useLibraryStore.getState().quotes.length).toBe(3);
      });

      await waitFor(
        () => {
          expect(mockBack).toHaveBeenCalled();
        },
        { timeout: 2000 },
      );
    });
  });
});
