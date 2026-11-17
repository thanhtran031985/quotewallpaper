import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import PreviewScreen from '@/../app/preview';
import { useLibraryStore } from '@/store/useLibraryStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { BUILTIN_TEMPLATES } from '@/templates/builtin';
import { Quote, WallpaperImage } from '@/domain/types';

// Mock router
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
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

// Mock exportWallpaper service
jest.mock('@/services/exportWallpaper', () => ({
  captureAndSaveWallpaper: jest.fn(() => Promise.resolve({ ok: true, data: 'ph://test-asset' })),
  getScreenExportDimensions: jest.fn(() => ({
    width: 1080,
    height: 1920,
    scale: 2,
    pixelWidth: 2160,
    pixelHeight: 3840,
  })),
}));

// Mock react-native-view-shot
jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(() => Promise.resolve('ph://mock-uri')),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light' },
  NotificationFeedbackType: { Success: 'success' },
}));

const mockImage: WallpaperImage = {
  id: 'img-1',
  name: 'Ảnh 1',
  source: 'default',
  uri: 'default-1',
  width: 1080,
  height: 1920,
  focalPoint: { x: 0.5, y: 0.5 },
  enabled: true,
  createdAt: '2026-01-01',
};

const mockQuote: Quote = {
  id: 'q-1',
  text: 'Câu danh ngôn preview',
  author: 'Tác giả',
  enabled: true,
  favorite: false,
  source: 'default',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('PreviewScreen (Màn Xem trước)', () => {
  beforeEach(() => {
    mockBack.mockClear();
    useLibraryStore.getState().resetAll();
    useSettingsStore.getState().resetSettings();

    useLibraryStore.setState({
      quotes: [mockQuote],
      images: [mockImage],
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

  it('TC-IOS-01: render toàn màn hình với LockScreenOverlay', async () => {
    const { getByTestId } = await render(<PreviewScreen />);

    expect(getByTestId('preview-canvas')).toBeTruthy();
    expect(getByTestId('lock-screen-overlay')).toBeTruthy();
  });

  it('bấm nút Đóng gọi router.back()', async () => {
    const { getByTestId } = await render(<PreviewScreen />);

    const closeBtn = getByTestId('btn-close-preview');
    await act(async () => {
      fireEvent.press(closeBtn);
    });

    expect(mockBack).toHaveBeenCalled();
  });

  it('bấm nút Đổi ngẫu nhiên gọi shuffle()', async () => {
    const shuffleSpy = jest.spyOn(useLibraryStore.getState(), 'shuffle');
    const { getByTestId } = await render(<PreviewScreen />);

    const shuffleBtn = getByTestId('btn-shuffle-preview');
    await act(async () => {
      fireEvent.press(shuffleBtn);
    });

    expect(shuffleSpy).toHaveBeenCalled();
  });

  it('bấm nút bật/tắt đồng hồ toggles vùng đồng hồ', async () => {
    const { getByTestId, queryByTestId } = await render(<PreviewScreen />);

    expect(queryByTestId('clock-zone-border')).toBeNull();

    const toggleClockBtn = getByTestId('btn-toggle-clock');
    await act(async () => {
      fireEvent.press(toggleClockBtn);
    });

    expect(getByTestId('clock-zone-border')).toBeTruthy();
  });

  it('bấm nút Lưu hiển thị Toast thông báo', async () => {
    const { getByTestId, getByText } = await render(<PreviewScreen />);

    const saveBtn = getByTestId('btn-save-preview');
    await act(async () => {
      fireEvent.press(saveBtn);
    });

    expect(getByText(/Đã lưu vào album/i)).toBeTruthy();
  });
});
