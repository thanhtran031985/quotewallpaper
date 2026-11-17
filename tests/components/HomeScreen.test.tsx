import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import HomeScreen from '@/../app/(tabs)/index';
import { useLibraryStore } from '@/store/useLibraryStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { BUILTIN_TEMPLATES } from '@/templates/builtin';
import { Quote, WallpaperImage } from '@/domain/types';

// Mock router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock useShuffleOnOpen so tests can control current state precisely
jest.mock('@/engine/useShuffleOnOpen', () => ({
  useShuffleOnOpen: jest.fn(),
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

// Mock expo-blur
jest.mock('expo-blur', () => {
  const { View } = require('react-native');
  return {
    BlurView: (props: any) => <View testID="blur-view" {...props} />,
  };
});

// Mock expo-image
jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    Image: (props: any) => <View testID="expo-image" {...props} />,
  };
});

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: (props: any) => <View testID="linear-gradient" {...props} />,
  };
});

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light' },
  NotificationFeedbackType: { Success: 'success' },
}));

const mockImages: WallpaperImage[] = [
  {
    id: 'img-1',
    name: 'Ảnh 1',
    source: 'default',
    uri: 'default-1',
    width: 1080,
    height: 1920,
    focalPoint: { x: 0.5, y: 0.5 },
    enabled: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'img-2',
    name: 'Ảnh 2',
    source: 'default',
    uri: 'default-2',
    width: 1080,
    height: 1920,
    focalPoint: { x: 0.5, y: 0.5 },
    enabled: true,
    createdAt: '2026-01-01',
  },
];

const mockQuotes: Quote[] = [
  {
    id: 'q-1',
    text: 'Câu danh ngôn số 1',
    author: 'Tác giả 1',
    enabled: true,
    favorite: false,
    source: 'default',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'q-2',
    text: 'Câu danh ngôn số 2',
    author: 'Tác giả 2',
    enabled: true,
    favorite: false,
    source: 'default',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];

describe('HomeScreen (Tab Hôm nay)', () => {
  beforeEach(() => {
    mockPush.mockClear();
    useLibraryStore.getState().resetAll();
    useSettingsStore.getState().resetSettings();

    useLibraryStore.setState({
      quotes: mockQuotes,
      images: mockImages,
      templates: BUILTIN_TEMPLATES,
      current: {
        imageId: 'img-1',
        quoteId: 'q-1',
        templateId: BUILTIN_TEMPLATES[0].id,
        pickedAt: '2026-01-01',
      },
      pinned: { image: false, quote: false, template: false },
      history: [],
    });
  });

  it('TC-UI-01: Bấm Đổi ngẫu nhiên -> đổi hình nền', async () => {
    const shuffleSpy = jest.spyOn(useLibraryStore.getState(), 'shuffle');

    const { getByText } = await render(<HomeScreen />);

    const shuffleBtn = getByText('Đổi ngẫu nhiên');
    await act(async () => {
      fireEvent.press(shuffleBtn);
    });

    expect(shuffleSpy).toHaveBeenCalled();
  });

  it('TC-UI-02: Ghim câu rồi đổi -> câu giữ nguyên', async () => {
    const { getByTestId, getByText } = await render(<HomeScreen />);

    const initialQuoteId = useLibraryStore.getState().current?.quoteId;
    expect(initialQuoteId).toBe('q-1');

    // Bấm ghim câu
    const pinQuoteBtn = getByTestId('pin-quote');
    await act(async () => {
      fireEvent.press(pinQuoteBtn);
    });

    expect(useLibraryStore.getState().pinned.quote).toBe(true);

    // Shuffle
    const shuffleBtn = getByText('Đổi ngẫu nhiên');
    await act(async () => {
      fireEvent.press(shuffleBtn);
    });

    const current = useLibraryStore.getState().current;
    expect(current?.quoteId).toBe('q-1');
  });

  it('TC-UI-03: Tắt hết ảnh -> hiện EmptyState và nút tới tab Ảnh', async () => {
    useLibraryStore.setState({
      images: mockImages.map((img) => ({ ...img, enabled: false })),
      current: null,
    });

    const { getByText } = await render(<HomeScreen />);

    expect(getByText(/Chưa có ảnh nào đang bật/i)).toBeTruthy();

    const goToImagesBtn = getByText('Đi tới kho ảnh');
    await act(async () => {
      fireEvent.press(goToImagesBtn);
    });

    expect(mockPush).toHaveBeenCalledWith('/(tabs)/images');
  });

  it('bấm Xem & lưu chuyển tới màn /preview', async () => {
    const { getByText } = await render(<HomeScreen />);

    const previewBtn = getByText('Xem & lưu');
    await act(async () => {
      fireEvent.press(previewBtn);
    });

    expect(mockPush).toHaveBeenCalledWith('/preview');
  });
});
