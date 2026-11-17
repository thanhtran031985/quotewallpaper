import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import QuotesScreen from '@/../app/(tabs)/quotes';
import { useLibraryStore } from '@/store/useLibraryStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Quote } from '@/domain/types';

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

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light' },
  NotificationFeedbackType: { Success: 'success' },
}));

const mockQuotes: Quote[] = [
  {
    id: 'q-1',
    text: 'Bình yên bắt đầu từ một nụ cười.',
    author: 'Mẹ Teresa',
    enabled: true,
    favorite: false,
    source: 'default',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'q-2',
    text: 'Học, học nữa, học mãi.',
    author: 'Lênin',
    enabled: true,
    favorite: true,
    source: 'default',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'q-3',
    text: 'Đời thay đổi khi chúng ta thay đổi.',
    author: 'Andrew Matthews',
    enabled: false,
    favorite: false,
    source: 'user',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];

describe('QuotesScreen (Tab Danh ngôn)', () => {
  beforeEach(() => {
    mockPush.mockClear();
    useLibraryStore.getState().resetAll();
    useSettingsStore.getState().resetSettings();

    useLibraryStore.setState({
      quotes: mockQuotes,
      images: [],
      templates: [],
      current: null,
      pinned: { image: false, quote: false, template: false },
      history: [],
    });
  });

  it('render danh sách danh ngôn và dòng thống kê số lượng', async () => {
    const { getByText } = await render(<QuotesScreen />);

    expect(getByText(/Bình yên bắt đầu/)).toBeTruthy();
    expect(getByText(/Học, học nữa/)).toBeTruthy();
    expect(getByText(/Đời thay đổi/)).toBeTruthy();
    expect(getByText(/3 danh ngôn/i)).toBeTruthy();
  });

  it('tìm kiếm không dấu lọc chính xác kết quả', async () => {
    const { getByPlaceholderText, getByText, queryByText } = await render(<QuotesScreen />);

    const searchInput = getByPlaceholderText(/Tìm kiếm/i);
    await act(async () => {
      fireEvent.changeText(searchInput, 'binh yen');
    });

    expect(getByText(/Bình yên bắt đầu/)).toBeTruthy();
    expect(queryByText(/Học, học nữa/)).toBeNull();
    expect(queryByText(/Đời thay đổi/)).toBeNull();
  });

  it('lọc theo tab: Đang bật, Yêu thích, Tự tạo', async () => {
    const { getByText, queryByText } = await render(<QuotesScreen />);

    // Bấm tab "Đang bật"
    const enabledTab = getByText('Đang bật');
    await act(async () => {
      fireEvent.press(enabledTab);
    });
    expect(getByText(/Bình yên bắt đầu/)).toBeTruthy();
    expect(getByText(/Học, học nữa/)).toBeTruthy();
    expect(queryByText(/Đời thay đổi/)).toBeNull(); // q-3 enabled = false

    // Bấm tab "Yêu thích"
    const favTab = getByText('Yêu thích');
    await act(async () => {
      fireEvent.press(favTab);
    });
    expect(getByText(/Học, học nữa/)).toBeTruthy(); // q-2 favorite = true
    expect(queryByText(/Bình yên bắt đầu/)).toBeNull();

    // Bấm tab "Tự tạo"
    const userTab = getByText('Tự tạo');
    await act(async () => {
      fireEvent.press(userTab);
    });
    expect(getByText(/Đời thay đổi/)).toBeTruthy(); // q-3 source = user
    expect(queryByText(/Bình yên bắt đầu/)).toBeNull();
  });

  it('bấm công tắc toggleQuote thay đổi trạng thái enabled', async () => {
    const toggleSpy = jest.spyOn(useLibraryStore.getState(), 'toggleQuote');
    const { getByTestId } = await render(<QuotesScreen />);

    const switchBtn = getByTestId('switch-q-1');
    await act(async () => {
      fireEvent(switchBtn, 'valueChange', false);
    });

    expect(toggleSpy).toHaveBeenCalledWith('q-1');
  });

  it('bấm nút Thêm (+) chuyển tới màn /quote-edit', async () => {
    const { getByTestId } = await render(<QuotesScreen />);

    const addBtn = getByTestId('btn-add-quote');
    await act(async () => {
      fireEvent.press(addBtn);
    });

    expect(mockPush).toHaveBeenCalledWith('/quote-edit');
  });
});
