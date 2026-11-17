import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HistoryScreen from '../../app/history';
import { useLibraryStore } from '../../src/store/useLibraryStore';
import { BUILTIN_TEMPLATES } from '../../src/templates/builtin';
import { Alert } from 'react-native';

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

const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

describe('HistoryScreen UI (11-import-history Step 3)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLibraryStore.setState({
      quotes: [
        {
          id: 'q1',
          text: 'Đường đi khó không khó vì ngăn sông cách núi.',
          author: 'Nguyễn Thái Học',
          enabled: true,
          favorite: false,
          source: 'default',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
      images: [
        {
          id: 'img1',
          name: 'Núi rừng',
          uri: 'file:///images/img1.jpg',
          width: 1080,
          height: 1920,
          source: 'default',
          enabled: true,
          focalPoint: { x: 0.5, y: 0.5 },
          fileMissing: false,
          createdAt: '2026-01-01',
        },
      ],
      templates: [
        {
          ...BUILTIN_TEMPLATES[0],
          id: 'tpl1',
          name: 'Tối giản',
        },
      ],
      history: [
        {
          imageId: 'img1',
          quoteId: 'q1',
          templateId: 'tpl1',
          pickedAt: '2026-11-17T08:00:00.000Z',
        },
        {
          imageId: 'deleted_img',
          quoteId: 'q1',
          templateId: 'tpl1',
          pickedAt: '2026-11-17T07:00:00.000Z',
        },
      ],
    });
  });

  it('hiển thị danh sách lịch sử với thông tin ảnh, câu, mẫu và xử lý mục bị xóa', async () => {
    const { getByText, getAllByText } = await render(<HistoryScreen />);

    // Kiểm tra render câu danh ngôn
    expect(getAllByText(/Đường đi khó không khó/).length).toBeGreaterThan(0);
    expect(getByText(/Núi rừng/)).toBeTruthy();
    expect(getByText(/Ảnh không còn/)).toBeTruthy();
  });

  it('chạm vào mục còn đầy đủ dữ liệu sẽ đặt currentSelection và mở preview', async () => {
    const { getByText } = await render(<HistoryScreen />);

    const item = getByText(/Núi rừng/);
    fireEvent.press(item);

    expect(useLibraryStore.getState().current).toEqual({
      imageId: 'img1',
      quoteId: 'q1',
      templateId: 'tpl1',
      pickedAt: '2026-11-17T08:00:00.000Z',
    });
    expect(mockPush).toHaveBeenCalledWith('/preview');
  });

  it('chạm vào mục thiếu dữ liệu (ảnh bị xóa) sẽ hiện cảnh báo và không mở preview', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = await render(<HistoryScreen />);

    const item = getByText(/Ảnh không còn/);
    fireEvent.press(item);

    expect(alertSpy).toHaveBeenCalledWith(
      'Không thể xem lại',
      expect.stringContaining('đã bị xóa'),
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('xóa lịch sử làm sạch danh sách và hiển thị empty state', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((title, msg, buttons) => {
      // Simulate tapping "Xóa"
      const deleteBtn = buttons?.find((b) => b.text === 'Xóa');
      deleteBtn?.onPress?.();
    });

    const { getByText, findByText } = await render(<HistoryScreen />);

    const clearBtn = getByText('Xóa');
    fireEvent.press(clearBtn);

    await waitFor(() => {
      expect(useLibraryStore.getState().history.length).toBe(0);
    });

    await findByText('Chưa có lịch sử');
  });
});
