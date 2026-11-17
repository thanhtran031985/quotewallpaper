import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ImagesScreen from '../../app/(tabs)/images';
import { useLibraryStore } from '../../src/store/useLibraryStore';
import { WallpaperImage } from '../../src/domain/types';
import * as imageLibraryService from '../../src/services/imageLibrary';

// Mock router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
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

const mockImages: WallpaperImage[] = [
  {
    id: 'default-1',
    name: 'Bình minh trên núi',
    source: 'default',
    uri: 'default-1',
    width: 1080,
    height: 1920,
    focalPoint: { x: 0.5, y: 0.5 },
    enabled: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'user-1',
    name: 'Ảnh gia đình',
    source: 'user',
    uri: 'file:///app/documents/images/user1.jpg',
    width: 1080,
    height: 1920,
    focalPoint: { x: 0.5, y: 0.5 },
    enabled: true,
    createdAt: '2026-01-01',
  },
];

describe('ImagesScreen (Tab Ảnh)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLibraryStore.getState().resetAll();

    useLibraryStore.setState({
      quotes: [],
      images: mockImages,
      templates: [],
      current: null,
      pinned: { image: false, quote: false, template: false },
      history: [],
    });
  });

  it('render màn hình, hiển thị tiêu đề và danh mục Ảnh của tôi, Mặc định', async () => {
    const { getByText } = await render(<ImagesScreen />);

    expect(getByText('Ảnh')).toBeTruthy();
    expect(getByText(/Ảnh của tôi/i)).toBeTruthy();
    expect(getByText(/Mặc định/i)).toBeTruthy();
    expect(getByText(/2 đang bật \/ 2 ảnh/i)).toBeTruthy();
  });

  it('chạm vào ảnh để bật/tắt trạng thái enabled', async () => {
    const { getByTestId } = await render(<ImagesScreen />);

    const item = getByTestId('image-item-default-1');
    await act(async () => {
      fireEvent.press(item);
    });

    const img = useLibraryStore.getState().images.find((i) => i.id === 'default-1');
    expect(img?.enabled).toBe(false);

    // Chạm lần nữa để bật lại
    await act(async () => {
      fireEvent.press(item);
    });
    expect(useLibraryStore.getState().images.find((i) => i.id === 'default-1')?.enabled).toBe(true);
  });

  it('nhấn giữ ảnh user mở menu với nút Xóa; xác nhận xóa thành công', async () => {
    jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      const deleteBtn = buttons?.find((b) => b.text === 'Xóa');
      deleteBtn?.onPress?.();
    });

    const { getByTestId, getByText } = await render(<ImagesScreen />);
    const userImgItem = getByTestId('image-item-user-1');

    await act(async () => {
      fireEvent(userImgItem, 'longPress');
    });

    // Mở modal action
    expect(getByText('Tác vụ ảnh')).toBeTruthy();
    const deleteAction = getByText('Xóa ảnh này');
    await act(async () => {
      fireEvent.press(deleteAction);
    });

    const remainingImages = useLibraryStore.getState().images;
    expect(remainingImages.find((i) => i.id === 'user-1')).toBeUndefined();
  });

  it('ảnh mặc định khi nhấn giữ không có tùy chọn Xóa', async () => {
    const { getByTestId, queryByText } = await render(<ImagesScreen />);
    const defaultImgItem = getByTestId('image-item-default-1');

    await act(async () => {
      fireEvent(defaultImgItem, 'longPress');
    });

    expect(queryByText('Xóa ảnh này')).toBeNull();
  });

  it('menu tác vụ: Bật tất cả và Tắt tất cả', async () => {
    const { getByTestId, getByText } = await render(<ImagesScreen />);

    const menuBtn = getByTestId('btn-images-menu');
    await act(async () => {
      fireEvent.press(menuBtn);
    });

    const disableAllBtn = getByText('Tắt tất cả');
    await act(async () => {
      fireEvent.press(disableAllBtn);
    });

    expect(useLibraryStore.getState().images.every((i) => !i.enabled)).toBe(true);

    await act(async () => {
      fireEvent.press(menuBtn);
    });
    const enableAllBtn = getByText('Bật tất cả');
    await act(async () => {
      fireEvent.press(enableAllBtn);
    });

    expect(useLibraryStore.getState().images.every((i) => i.enabled)).toBe(true);
  });

  it('bấm nút Thêm ảnh (+) gọi pickImagesFromLibrary và thêm ảnh vào store', async () => {
    const mockNewImage: WallpaperImage = {
      id: 'user-new',
      name: 'New Photo',
      source: 'user',
      uri: 'file:///app/documents/images/new.jpg',
      width: 1080,
      height: 1920,
      focalPoint: { x: 0.5, y: 0.5 },
      enabled: true,
      createdAt: '2026-01-01',
    };

    jest.spyOn(imageLibraryService, 'pickImagesFromLibrary').mockResolvedValue({
      ok: true,
      data: [mockNewImage],
    });

    const { getByTestId } = await render(<ImagesScreen />);
    const addBtn = getByTestId('btn-add-image');

    await act(async () => {
      fireEvent.press(addBtn);
    });

    expect(imageLibraryService.pickImagesFromLibrary).toHaveBeenCalled();
    const imagesInStore = useLibraryStore.getState().images;
    expect(imagesInStore.find((i) => i.id === 'user-new')).toBeDefined();
  });
});
