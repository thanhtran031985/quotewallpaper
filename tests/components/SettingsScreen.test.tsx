import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SettingsScreen from '@/../app/(tabs)/settings';
import { useSettingsStore, DEFAULT_SETTINGS } from '@/store/useSettingsStore';
import { useLibraryStore } from '@/store/useLibraryStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock safe-area
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
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success' },
}));

describe('SettingsScreen (08-export-settings-mvp Step 3)', () => {
  beforeEach(() => {
    useSettingsStore.setState({ ...DEFAULT_SETTINGS });
    jest.clearAllMocks();
  });

  it('render đầy đủ các nhóm cài đặt: Ngẫu nhiên, Giao diện, Xuất & Tự động hóa, Dữ liệu, Giới thiệu', async () => {
    const { getByText } = await render(<SettingsScreen />);

    expect(getByText('Cài đặt')).toBeTruthy();
    expect(getByText('NGẪU NHIÊN')).toBeTruthy();
    expect(getByText('GIAO DIỆN')).toBeTruthy();
    expect(getByText('XUẤT & TỰ ĐỘNG HÓA')).toBeTruthy();
    expect(getByText('DỮ LIỆU')).toBeTruthy();
    expect(getByText('GIỚI THIỆU')).toBeTruthy();
  });

  it('chuyển đổi chế độ giao diện: Hệ thống / Sáng / Tối cập nhật useSettingsStore', async () => {
    const { getByTestId } = await render(<SettingsScreen />);

    const optDark = getByTestId('appearance-dark');
    await act(async () => {
      fireEvent.press(optDark);
    });
    expect(useSettingsStore.getState().appearance).toBe('dark');

    const optLight = getByTestId('appearance-light');
    await act(async () => {
      fireEvent.press(optLight);
    });
    expect(useSettingsStore.getState().appearance).toBe('light');

    const optSystem = getByTestId('appearance-system');
    await act(async () => {
      fireEvent.press(optSystem);
    });
    expect(useSettingsStore.getState().appearance).toBe('system');
  });

  it('bật/tắt các công tắc ngẫu nhiên cập nhật store', async () => {
    const { getByTestId } = await render(<SettingsScreen />);

    // Công tắc Đổi khi mở
    const switchShuffleOnOpen = getByTestId('switch-shuffle-on-open');
    await act(async () => {
      fireEvent(switchShuffleOnOpen, 'valueChange', false);
    });
    expect(useSettingsStore.getState().shuffleOnOpen).toBe(false);

    // Công tắc Không lặp
    const switchNoRepeat = getByTestId('switch-no-repeat');
    await act(async () => {
      fireEvent(switchNoRepeat, 'valueChange', false);
    });
    expect(useSettingsStore.getState().noRepeat).toBe(false);

    // Công tắc Ưu tiên yêu thích
    const switchFavoritesBoost = getByTestId('switch-favorites-boost');
    await act(async () => {
      fireEvent(switchFavoritesBoost, 'valueChange', true);
    });
    expect(useSettingsStore.getState().favoritesBoost).toBe(true);

    // Công tắc Hiển thị tác giả
    const switchShowAuthor = getByTestId('switch-show-author');
    await act(async () => {
      fireEvent(switchShowAuthor, 'valueChange', false);
    });
    expect(useSettingsStore.getState().showAuthor).toBe(false);
  });

  it('thay đổi tên album xuất cập nhật useSettingsStore', async () => {
    const { getByTestId } = await render(<SettingsScreen />);

    const albumInput = getByTestId('input-album-name');
    await act(async () => {
      fireEvent.changeText(albumInput, 'My Daily Wallpapers');
    });
    await act(async () => {
      fireEvent(albumInput, 'endEditing', {
        nativeEvent: { text: 'My Daily Wallpapers' },
      });
    });

    expect(useSettingsStore.getState().exportAlbumName).toBe('My Daily Wallpapers');
  });

  it('đặt lại dữ liệu yêu cầu 2 lần xác nhận trước khi khôi phục mặc định', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const resetLibrarySpy = jest.spyOn(useLibraryStore.getState(), 'resetAll');
    const resetSettingsSpy = jest.spyOn(useSettingsStore.getState(), 'resetSettings');

    const { getByTestId } = await render(<SettingsScreen />);

    const resetBtn = getByTestId('btn-reset-data');
    await act(async () => {
      fireEvent.press(resetBtn);
    });

    // Lần 1: Cảnh báo đầu tiên
    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenLastCalledWith(
      'Đặt lại toàn bộ dữ liệu?',
      expect.any(String),
      expect.any(Array),
    );

    // Nhấn tiếp tục ở lần 1
    const buttonsFirstAlert = alertSpy.mock.calls[0][2];
    const continueBtn = buttonsFirstAlert?.find((b) => b.text === 'Tiếp tục');
    expect(continueBtn).toBeDefined();

    await act(async () => {
      continueBtn?.onPress?.();
    });

    // Lần 2: Cảnh báo lần cuối
    expect(alertSpy).toHaveBeenCalledTimes(2);
    expect(alertSpy).toHaveBeenLastCalledWith(
      'Xác nhận lần cuối',
      expect.any(String),
      expect.any(Array),
    );

    // Nhấn "Đặt lại tất cả" ở lần 2
    const buttonsSecondAlert = alertSpy.mock.calls[1][2];
    const confirmBtn = buttonsSecondAlert?.find((b) => b.text === 'Đặt lại tất cả');
    expect(confirmBtn).toBeDefined();

    await act(async () => {
      confirmBtn?.onPress?.();
    });

    // Xác nhận đã gọi reset
    expect(resetLibrarySpy).toHaveBeenCalled();
    expect(resetSettingsSpy).toHaveBeenCalled();
  });
});
