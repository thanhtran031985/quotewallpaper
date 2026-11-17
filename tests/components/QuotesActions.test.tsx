import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import QuotesScreen from '../../app/(tabs)/quotes';
import HomeScreen from '../../app/(tabs)/index';
import { useLibraryStore } from '../../src/store/useLibraryStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { Quote } from '../../src/domain/types';
import { DEFAULT_IMAGES, DEFAULT_TEMPLATES } from '../../src/services/seed';

// Mock router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return {
    ...actual,
    useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
    SafeAreaProvider: ({ children }: any) => children,
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock useShuffleOnOpen
jest.mock('../../src/engine/useShuffleOnOpen', () => ({
  useShuffleOnOpen: jest.fn(),
}));

const mockQuotes: Quote[] = [
  {
    id: 'q-default-1',
    text: 'Câu mặc định 1',
    author: 'Tác giả 1',
    enabled: true,
    favorite: false,
    source: 'default',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'q-user-1',
    text: 'Câu do người dùng tạo',
    author: 'Người dùng',
    enabled: true,
    favorite: false,
    source: 'user',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];

const mockImage = DEFAULT_IMAGES[0];
const mockTemplate = DEFAULT_TEMPLATES[0];

describe('Quotes Actions & Batch Menu (05-quotes-ui Step 3)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLibraryStore.getState().resetAll();
    useSettingsStore.getState().resetSettings();

    useLibraryStore.setState({
      quotes: mockQuotes,
      images: [mockImage],
      templates: [mockTemplate],
      current: null,
      pinned: { image: false, quote: false, template: false },
      history: [],
    });
  });

  it('TC-UI-02: câu mặc định chỉ có thao tác Yêu thích, không có nút Xóa; câu của user có nút Xóa', async () => {
    const { getByTestId, queryByTestId } = await render(<QuotesScreen />);

    // Câu mặc định có nút favorite, KHÔNG có nút xóa
    expect(getByTestId('fav-q-default-1')).toBeTruthy();
    expect(queryByTestId('delete-q-default-1')).toBeNull();

    // Câu user có cả nút favorite và nút xóa
    expect(getByTestId('fav-q-user-1')).toBeTruthy();
    expect(getByTestId('delete-q-user-1')).toBeTruthy();
  });

  it('menu tác vụ: Bật tất cả và Tắt tất cả', async () => {
    const { getByTestId, getByText } = await render(<QuotesScreen />);

    // Mở menu modal
    const menuBtn = getByTestId('btn-quotes-menu');
    await act(async () => {
      fireEvent.press(menuBtn);
    });

    // Bấm Tắt tất cả
    const disableAllBtn = getByText('Tắt tất cả');
    await act(async () => {
      fireEvent.press(disableAllBtn);
    });

    const quotesAfterDisable = useLibraryStore.getState().quotes;
    expect(quotesAfterDisable.every((q) => !q.enabled)).toBe(true);

    // Mở lại menu modal và bấm Bật tất cả
    await act(async () => {
      fireEvent.press(menuBtn);
    });
    const enableAllBtn = getByText('Bật tất cả');
    await act(async () => {
      fireEvent.press(enableAllBtn);
    });

    const quotesAfterEnable = useLibraryStore.getState().quotes;
    expect(quotesAfterEnable.every((q) => q.enabled)).toBe(true);
  });

  it('menu tác vụ: Khôi phục mặc định bật lại các câu default bị tắt', async () => {
    // Tự động nhấn "Khôi phục" trong Alert
    jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      const confirmButton = buttons?.find((b) => b.text === 'Khôi phục');
      confirmButton?.onPress?.();
    });

    // Tắt hết câu
    useLibraryStore.getState().setAllQuotesEnabled(false);
    expect(useLibraryStore.getState().quotes.every((q) => !q.enabled)).toBe(true);

    const { getByTestId, getByText } = await render(<QuotesScreen />);
    const menuBtn = getByTestId('btn-quotes-menu');
    await act(async () => {
      fireEvent.press(menuBtn);
    });

    const resetBtn = getByText('Khôi phục mặc định');
    await act(async () => {
      fireEvent.press(resetBtn);
    });

    const state = useLibraryStore.getState();
    const defaultQuote = state.quotes.find((q) => q.source === 'default');
    expect(defaultQuote?.enabled).toBe(true);
  });

  it('TC-UI-03: khi tắt tất cả câu danh ngôn, tab Hôm nay báo thiếu câu và hiển thị nút CTA', async () => {
    // Tắt tất cả câu danh ngôn
    useLibraryStore.getState().setAllQuotesEnabled(false);

    const { getByText } = await render(<HomeScreen />);

    // Kiểm tra hiển thị EmptyState thiếu danh ngôn
    expect(getByText('Chưa có danh ngôn nào đang bật')).toBeTruthy();
    expect(getByText('Hãy bật ít nhất 1 câu danh ngôn trong kho để tiếp tục.')).toBeTruthy();
    expect(getByText('Đi tới kho danh ngôn')).toBeTruthy();
  });
});
