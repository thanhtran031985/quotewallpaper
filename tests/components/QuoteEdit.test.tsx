import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import QuoteEditScreen from '../../app/quote-edit';
import { useLibraryStore } from '../../src/store/useLibraryStore';

const mockBack = jest.fn();
let mockParams: { id?: string } = {};

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    push: jest.fn(),
  }),
  useLocalSearchParams: () => mockParams,
}));

jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return {
    ...actual,
    useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
    SafeAreaProvider: ({ children }: any) => children,
  };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('QuoteEditScreen (Sheet Thêm/Sửa danh ngôn)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = {};
    useLibraryStore.setState({
      quotes: [
        {
          id: 'q-existing',
          text: 'Câu danh ngôn đã tồn tại sẵn.',
          author: 'Tác giả A',
          enabled: true,
          favorite: false,
          source: 'user',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
    });
  });

  it('render màn hình thêm danh ngôn khi không có id', async () => {
    const { getByText, getByPlaceholderText } = await render(<QuoteEditScreen />);
    expect(getByText('Thêm danh ngôn')).toBeTruthy();
    expect(getByPlaceholderText('Nhập nội dung danh ngôn...')).toBeTruthy();
    expect(getByText('0/220')).toBeTruthy();
  });

  it('TC-UI-01: báo lỗi và vô hiệu hóa nút Lưu khi nhập quá 220 ký tự', async () => {
    const { getByPlaceholderText, getByText } = await render(<QuoteEditScreen />);
    const textInput = getByPlaceholderText('Nhập nội dung danh ngôn...');

    const longText = 'A'.repeat(221);
    await act(async () => {
      fireEvent.changeText(textInput, longText);
    });

    expect(getByText('221/220')).toBeTruthy();
    expect(getByText('Nội dung không được vượt quá 220 ký tự')).toBeTruthy();

    const saveButton = getByText('Lưu');
    await act(async () => {
      fireEvent.press(saveButton);
    });

    // Không gọi router.back vì nút bị disable
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('báo lỗi khi nội dung bị trùng lặp với danh ngôn đã có trong kho', async () => {
    const { getByPlaceholderText, getByText } = await render(<QuoteEditScreen />);
    const textInput = getByPlaceholderText('Nhập nội dung danh ngôn...');

    await act(async () => {
      fireEvent.changeText(textInput, '  Câu danh ngôn ĐÃ TỒN TẠI SẴN.  ');
    });

    expect(getByText('Danh ngôn này đã tồn tại trong kho')).toBeTruthy();

    const saveButton = getByText('Lưu');
    await act(async () => {
      fireEvent.press(saveButton);
    });

    expect(mockBack).not.toHaveBeenCalled();
  });

  it('thêm danh ngôn hợp lệ thành công và quay lại màn trước', async () => {
    const { getByPlaceholderText, getByText } = await render(<QuoteEditScreen />);
    const textInput = getByPlaceholderText('Nhập nội dung danh ngôn...');
    const authorInput = getByPlaceholderText('Tên tác giả (không bắt buộc)');

    await act(async () => {
      fireEvent.changeText(textInput, 'Học, học nữa, học mãi.');
      fireEvent.changeText(authorInput, 'V.I. Lênin');
    });

    const saveButton = getByText('Lưu');
    await act(async () => {
      fireEvent.press(saveButton);
    });

    const state = useLibraryStore.getState();
    const added = state.quotes.find((q) => q.text === 'Học, học nữa, học mãi.');
    expect(added).toBeDefined();
    expect(added?.author).toBe('V.I. Lênin');
    expect(added?.source).toBe('user');
    expect(mockBack).toHaveBeenCalled();
  });

  it('chế độ sửa: nạp dữ liệu cũ và cập nhật thành công', async () => {
    mockParams = { id: 'q-existing' };
    const { getByDisplayValue, getByText, getByPlaceholderText } = await render(
      <QuoteEditScreen />,
    );

    expect(getByText('Sửa danh ngôn')).toBeTruthy();
    expect(getByDisplayValue('Câu danh ngôn đã tồn tại sẵn.')).toBeTruthy();
    expect(getByDisplayValue('Tác giả A')).toBeTruthy();

    const textInput = getByPlaceholderText('Nhập nội dung danh ngôn...');
    await act(async () => {
      fireEvent.changeText(textInput, 'Câu danh ngôn đã được sửa đổi.');
    });

    const saveButton = getByText('Lưu');
    await act(async () => {
      fireEvent.press(saveButton);
    });

    const state = useLibraryStore.getState();
    const updated = state.quotes.find((q) => q.id === 'q-existing');
    expect(updated?.text).toBe('Câu danh ngôn đã được sửa đổi.');
    expect(mockBack).toHaveBeenCalled();
  });
});
