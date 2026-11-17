import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import PreviewScreen from '../../app/preview';
import { useLibraryStore } from '../../src/store/useLibraryStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import * as exportWallpaperService from '../../src/services/exportWallpaper';
import { DEFAULT_QUOTES, DEFAULT_IMAGES, DEFAULT_TEMPLATES } from '../../src/services/seed';

// Mock router
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    push: jest.fn(),
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
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

describe('PreviewScreen Export & Wallpaper Setup Guide (08-export-settings-mvp Step 2)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLibraryStore.getState().resetAll();
    useSettingsStore.getState().resetSettings();

    useLibraryStore.setState({
      quotes: DEFAULT_QUOTES,
      images: DEFAULT_IMAGES,
      templates: DEFAULT_TEMPLATES,
      current: {
        imageId: DEFAULT_IMAGES[0].id,
        quoteId: DEFAULT_QUOTES[0].id,
        templateId: DEFAULT_TEMPLATES[0].id,
        pickedAt: '2026-01-01',
      },
      pinned: { image: false, quote: false, template: false },
      history: [],
    });
  });

  it('lưu hình nền thành công, gọi captureAndSaveWallpaper và hiển thị thông báo', async () => {
    jest.spyOn(exportWallpaperService, 'captureAndSaveWallpaper').mockResolvedValue({
      ok: true,
      data: { assetId: 'asset-1', uri: 'file:///tmp/saved.jpg' },
    });

    const { getByTestId, getByText } = await render(<PreviewScreen />);

    const saveBtn = getByTestId('btn-save-preview');
    await act(async () => {
      fireEvent.press(saveBtn);
    });

    expect(exportWallpaperService.captureAndSaveWallpaper).toHaveBeenCalled();
    // Hiển thị sheet hướng dẫn cài hình nền
    expect(getByText('Cách đặt hình nền')).toBeTruthy();
    expect(getByText('Cài đặt > Hình nền')).toBeTruthy();
  });

  it('TC-UI-01: khi câu danh ngôn bị overflow, hiện hộp thoại xác nhận trước khi lưu', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');

    // Tạo câu danh ngôn siêu dài gây overflow
    const longQuote = {
      ...DEFAULT_QUOTES[0],
      id: 'quote-overflow',
      text: 'Văn bản rất dài này sẽ chắc chắn bị tràn khi hiển thị trong khung màn hình. '.repeat(20),
    };

    useLibraryStore.setState({
      quotes: [longQuote, ...DEFAULT_QUOTES],
      current: {
        imageId: DEFAULT_IMAGES[0].id,
        quoteId: 'quote-overflow',
        templateId: DEFAULT_TEMPLATES[0].id,
        pickedAt: '2026-01-01',
      },
    });

    const { getByTestId } = await render(<PreviewScreen />);
    const saveBtn = getByTestId('btn-save-preview');

    await act(async () => {
      fireEvent.press(saveBtn);
    });

    // Xác nhận có cảnh báo chữ bị cắt
    expect(alertSpy).toHaveBeenCalledWith(
      'Chữ có thể bị cắt',
      expect.stringContaining('rút gọn'),
      expect.any(Array),
    );
  });
});
