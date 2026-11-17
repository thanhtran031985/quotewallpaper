import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Linking } from 'react-native';
import ShortcutsGuideScreen from '@/../app/shortcuts-guide';
import { useSettingsStore } from '@/store/useSettingsStore';

// Mock router
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
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

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light' },
}));

describe('ShortcutsGuideScreen (10-batch-export-shortcuts Step 3)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSettingsStore.setState({ exportAlbumName: 'Quote Wallpaper' });
  });

  it('render đầy đủ 4 bước hướng dẫn thiết lập Tự động hóa iOS', async () => {
    const { getByText, getByTestId } = await render(<ShortcutsGuideScreen />);

    expect(getByText('Hướng dẫn Phím tắt')).toBeTruthy();
    expect(getByText('Mở ứng dụng Phím tắt (Shortcuts)')).toBeTruthy();
    expect(getByText('Tạo Tự động hóa mới')).toBeTruthy();
    expect(getByText('Thêm 3 tác vụ')).toBeTruthy();
    expect(getByText('Tắt "Hỏi trước khi chạy"')).toBeTruthy();
    expect(getByTestId('btn-open-shortcuts')).toBeTruthy();
  });

  it('bấm nút Mở ứng dụng Phím tắt gọi Linking.openURL với shortcuts://', async () => {
    const canOpenSpy = jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
    const openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as any);

    const { getByTestId } = await render(<ShortcutsGuideScreen />);

    const openBtn = getByTestId('btn-open-shortcuts');
    await act(async () => {
      fireEvent.press(openBtn);
    });

    expect(canOpenSpy).toHaveBeenCalledWith('shortcuts://');
    expect(openURLSpy).toHaveBeenCalledWith('shortcuts://');
  });

  it('bấm nút đóng gọi router.back()', async () => {
    const { getByTestId } = await render(<ShortcutsGuideScreen />);

    const closeBtn = getByTestId('btn-close-guide');
    await act(async () => {
      fireEvent.press(closeBtn);
    });

    expect(mockBack).toHaveBeenCalled();
  });
});
