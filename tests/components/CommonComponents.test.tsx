import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GlassButton } from '@/components/GlassButton';
import { Toast } from '@/components/Toast';
import { EmptyState } from '@/components/EmptyState';
import { Chip } from '@/components/Chip';

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

describe('Common Components', () => {
  describe('GlassButton', () => {
    it('render nhãn và gọi onPress khi bấm', async () => {
      const onPressMock = jest.fn();
      const { getByText, getByTestId } = await render(
        <GlassButton
          label="Đổi ngẫu nhiên"
          onPress={onPressMock}
          accessibilityLabel="Đổi ngẫu nhiên hình nền"
          testID="btn-glass"
        />,
      );

      const btn = getByTestId('btn-glass');
      expect(getByText('Đổi ngẫu nhiên')).toBeTruthy();
      expect(btn.props.accessibilityLabel).toBe('Đổi ngẫu nhiên hình nền');

      fireEvent.press(btn);
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Toast', () => {
    it('hiển thị nội dung khi visible = true', async () => {
      const { getByText } = await render(
        <Toast visible={true} message="Đã lưu thành công" testID="toast-msg" />,
      );
      expect(getByText('Đã lưu thành công')).toBeTruthy();
    });

    it('ẩn khi visible = false', async () => {
      const { queryByText } = await render(
        <Toast visible={false} message="Đã lưu thành công" testID="toast-msg" />,
      );
      expect(queryByText('Đã lưu thành công')).toBeNull();
    });
  });

  describe('EmptyState', () => {
    it('hiển thị tiêu đề, mô tả và nút điều hướng', async () => {
      const onActionMock = jest.fn();
      const { getByText } = await render(
        <EmptyState
          title="Chưa có ảnh nào đang bật"
          message="Hãy bật ít nhất 1 ảnh trong kho để tạo hình nền."
          actionLabel="Đi tới kho ảnh"
          onAction={onActionMock}
          testID="empty-state"
        />,
      );

      expect(getByText('Chưa có ảnh nào đang bật')).toBeTruthy();
      expect(getByText('Hãy bật ít nhất 1 ảnh trong kho để tạo hình nền.')).toBeTruthy();

      const actionBtn = getByText('Đi tới kho ảnh');
      fireEvent.press(actionBtn);
      expect(onActionMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Chip', () => {
    it('render nhãn và phản hồi trạng thái active / pinned', async () => {
      const onPressMock = jest.fn();
      const { getByText, getByTestId } = await render(
        <Chip
          label="Ảnh"
          active={true}
          onPress={onPressMock}
          testID="chip-image"
        />,
      );

      expect(getByText('Ảnh')).toBeTruthy();
      const chip = getByTestId('chip-image');
      fireEvent.press(chip);
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });
  });
});
