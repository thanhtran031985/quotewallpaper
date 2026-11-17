import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import TemplateEditorScreen from '@/../app/template-edit/[id]';
import { useLibraryStore } from '@/store/useLibraryStore';

// Mock router
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    push: jest.fn(),
  }),
  useLocalSearchParams: () => ({
    id: 'new',
  }),
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
  selectionAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success' },
}));

describe('TemplateEditor (09-template-editor)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('render đầy đủ header, canvas xem trước có đồng hồ mờ và thanh 5 tab', async () => {
    const { getByTestId, getByText } = await render(<TemplateEditorScreen />);

    // Header
    expect(getByTestId('btn-editor-cancel')).toBeTruthy();
    expect(getByTestId('btn-editor-save')).toBeTruthy();
    expect(getByTestId('btn-editor-undo')).toBeTruthy();
    expect(getByText('Mẫu tự tạo')).toBeTruthy();

    // Canvas
    expect(getByTestId('editor-canvas-wrapper')).toBeTruthy();
    expect(getByTestId('editor-canvas')).toBeTruthy();

    // 5 Tab công cụ
    expect(getByTestId('tab-text')).toBeTruthy();
    expect(getByTestId('tab-box')).toBeTruthy();
    expect(getByTestId('tab-overlay')).toBeTruthy();
    expect(getByTestId('tab-image')).toBeTruthy();
    expect(getByTestId('tab-frame')).toBeTruthy();

    // Mặc định tab Chữ mở
    expect(getByTestId('panel-text')).toBeTruthy();
  });

  it('chuyển tab công cụ hiển thị đúng panel tương ứng', async () => {
    const { getByTestId, queryByTestId } = await render(<TemplateEditorScreen />);

    // Chuyển sang tab Khối
    await act(async () => {
      fireEvent.press(getByTestId('tab-box'));
    });
    expect(getByTestId('panel-box')).toBeTruthy();
    expect(queryByTestId('panel-text')).toBeNull();

    // Chuyển sang tab Phủ
    await act(async () => {
      fireEvent.press(getByTestId('tab-overlay'));
    });
    expect(getByTestId('panel-overlay')).toBeTruthy();

    // Chuyển sang tab Ảnh
    await act(async () => {
      fireEvent.press(getByTestId('tab-image'));
    });
    expect(getByTestId('panel-image')).toBeTruthy();

    // Chuyển sang tab Khung
    await act(async () => {
      fireEvent.press(getByTestId('tab-frame'));
    });
    expect(getByTestId('panel-frame')).toBeTruthy();
  });

  it('TC-UI-01: đổi font chữ và màu cập nhật trực tiếp style', async () => {
    const { getByTestId } = await render(<TemplateEditorScreen />);

    // Đổi font sang Mono
    await act(async () => {
      fireEvent.press(getByTestId('font-Mono'));
    });

    // Đổi màu sang đỏ
    await act(async () => {
      fireEvent.press(getByTestId('color-text-#FF3B30'));
    });

    // Nút Hoàn tác kích hoạt sau khi sửa
    const undoBtn = getByTestId('btn-editor-undo');
    expect(undoBtn.props.accessibilityState?.disabled).toBeFalsy();
  });

  it('TC-UI-02: bấm Hủy khi đã chỉnh sửa hiển thị hộp thoại xác nhận bỏ thay đổi', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByTestId } = await render(<TemplateEditorScreen />);

    // Chỉnh sửa style
    await act(async () => {
      fireEvent.press(getByTestId('font-Handwriting'));
    });

    // Bấm Hủy
    await act(async () => {
      fireEvent.press(getByTestId('btn-editor-cancel'));
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Bỏ thay đổi?',
      expect.stringContaining('chưa lưu sẽ bị mất'),
      expect.any(Array),
    );

    // Bấm "Bỏ thay đổi" trong alert gọi router.back()
    const alertButtons = alertSpy.mock.calls[0][2];
    const discardBtn = alertButtons?.find((b) => b.text === 'Bỏ thay đổi');
    expect(discardBtn).toBeDefined();

    await act(async () => {
      discardBtn?.onPress?.();
    });

    expect(mockBack).toHaveBeenCalled();
  });

  it('bấm Hoàn tác quay lại style trước đó', async () => {
    const { getByTestId } = await render(<TemplateEditorScreen />);

    // Đổi font
    await act(async () => {
      fireEvent.press(getByTestId('font-Mono'));
    });

    // Bấm Hoàn tác
    await act(async () => {
      fireEvent.press(getByTestId('btn-editor-undo'));
    });

    // Undo stack về 0 -> nút disabled
    const undoBtn = getByTestId('btn-editor-undo');
    expect(undoBtn.props.accessibilityState?.disabled).toBe(true);
  });

  it('lưu template mới gọi addTemplate của store và quay lại màn trước', async () => {
    const addTemplateSpy = jest.spyOn(useLibraryStore.getState(), 'addTemplate');
    const { getByTestId } = await render(<TemplateEditorScreen />);

    // Bấm Lưu
    await act(async () => {
      fireEvent.press(getByTestId('btn-editor-save'));
    });

    expect(addTemplateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Mẫu tự tạo',
        source: 'user',
        enabled: true,
      }),
    );
    expect(mockBack).toHaveBeenCalled();
  });

  it('đổi tên mẫu qua modal đổi tên', async () => {
    const { getByTestId, getByText } = await render(<TemplateEditorScreen />);

    // Mở modal đổi tên
    await act(async () => {
      fireEvent.press(getByTestId('btn-editor-rename'));
    });

    expect(getByText('Đổi tên mẫu')).toBeTruthy();

    const input = getByTestId('input-rename-template');
    await act(async () => {
      fireEvent.changeText(input, 'Mẫu Đêm Trăng');
    });

    await act(async () => {
      fireEvent.press(getByTestId('btn-confirm-rename'));
    });

    expect(getByText('Mẫu Đêm Trăng')).toBeTruthy();
  });
});
