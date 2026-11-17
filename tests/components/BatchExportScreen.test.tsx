import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import BatchExportScreen from '@/../app/batch-export';
import { useSettingsStore } from '@/store/useSettingsStore';

// Mock router
const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
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
  selectionAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success' },
}));

// Mock batchExport service
jest.mock('@/services/batchExport', () => ({
  executeBatchExport: jest.fn().mockImplementation(async (options: any) => {
    // Gọi onProgress giả lập
    options.onProgress?.(5, options.count, 5, 0);
    options.onProgress?.(options.count, options.count, options.count, 0);
    return {
      totalRequested: options.count,
      completed: options.count,
      successCount: options.count,
      errorCount: 0,
      isCancelled: false,
    };
  }),
}));

describe('BatchExportScreen (10-batch-export-shortcuts Step 2)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSettingsStore.setState({
      exportAlbumName: 'Quote Wallpaper',
    });
  });

  it('render màn hình với thông tin album và các tùy chọn số lượng (5, 10, 20, 30, 50)', async () => {
    const { getByText, getByTestId } = await render(<BatchExportScreen />);

    expect(getByText('Xuất hàng loạt vào album')).toBeTruthy();
    expect(getByText('"Quote Wallpaper"')).toBeTruthy();
    expect(getByTestId('option-count-5')).toBeTruthy();
    expect(getByTestId('option-count-10')).toBeTruthy();
    expect(getByTestId('option-count-20')).toBeTruthy();
    expect(getByTestId('option-count-30')).toBeTruthy();
    expect(getByTestId('option-count-50')).toBeTruthy();
    expect(getByText('Bắt đầu xuất 10 hình')).toBeTruthy();
  });

  it('chọn số lượng khác cập nhật nút bắt đầu', async () => {
    const { getByTestId, getByText } = await render(<BatchExportScreen />);

    const option20 = getByTestId('option-count-20');
    await act(async () => {
      fireEvent.press(option20);
    });

    expect(getByText('Bắt đầu xuất 20 hình')).toBeTruthy();
  });

  it('bắt đầu xuất hiển thị thanh tiến độ và chuyển sang tổng kết khi hoàn thành', async () => {
    const { getByTestId, getByText } = await render(<BatchExportScreen />);

    const startBtn = getByTestId('btn-start-batch');
    await act(async () => {
      fireEvent.press(startBtn);
    });

    // Sau khi xuất hoàn thành hiển thị tổng kết
    expect(getByTestId('batch-summary-section')).toBeTruthy();
    expect(getByText('Xuất hàng loạt thành công')).toBeTruthy();
    expect(getByText('10')).toBeTruthy();
  });

  it('bấm Hủy ở màn hình gọi router.back()', async () => {
    const { getByTestId } = await render(<BatchExportScreen />);

    const closeBtn = getByTestId('btn-close-batch');
    await act(async () => {
      fireEvent.press(closeBtn);
    });

    expect(mockBack).toHaveBeenCalled();
  });
});
