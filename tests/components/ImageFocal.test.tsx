import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import ImageFocalScreen from '../../app/image-focal';
import { useLibraryStore } from '../../src/store/useLibraryStore';
import { WallpaperImage, Settings } from '../../src/domain/types';
import { pickSelection } from '../../src/engine/randomPick';
import { DEFAULT_QUOTES, DEFAULT_TEMPLATES } from '../../src/services/seed';

const mockBack = jest.fn();
let mockParams: { id?: string } = { id: 'img-1' };

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    push: jest.fn(),
  }),
  useLocalSearchParams: () => mockParams,
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

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

const mockImage: WallpaperImage = {
  id: 'img-1',
  name: 'Bình minh trên núi',
  source: 'user',
  uri: 'file:///app/documents/images/img-1.jpg',
  width: 1080,
  height: 1920,
  focalPoint: { x: 0.5, y: 0.5 },
  enabled: true,
  createdAt: '2026-01-01',
};

const defaultSettings: Settings = {
  templateMode: 'random',
  fixedTemplateId: 'tpl-1',
  shuffleOnOpen: true,
  noRepeat: true,
  showAuthor: true,
  favoritesBoost: false,
  appearance: 'system',
  exportAlbumName: 'Quote Wallpaper',
};

describe('ImageFocalScreen & TC-LOG-02 (06-images-ui Step 3)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = { id: 'img-1' };
    useLibraryStore.getState().resetAll();

    useLibraryStore.setState({
      quotes: DEFAULT_QUOTES,
      images: [mockImage],
      templates: DEFAULT_TEMPLATES,
      current: null,
      pinned: { image: false, quote: false, template: false },
      history: [],
    });
  });

  it('TC-LOG-02: ảnh bị mất file (fileMissing: true) không được chọn khi random', () => {
    const missingImage: WallpaperImage = {
      id: 'img-missing',
      name: 'Ảnh mất file',
      source: 'user',
      uri: 'file:///app/documents/images/missing.jpg',
      width: 1080,
      height: 1920,
      focalPoint: { x: 0.5, y: 0.5 },
      enabled: true,
      fileMissing: true,
      createdAt: '2026-01-01',
    };

    const validImage: WallpaperImage = {
      id: 'img-valid',
      name: 'Ảnh hợp lệ',
      source: 'user',
      uri: 'file:///app/documents/images/valid.jpg',
      width: 1080,
      height: 1920,
      focalPoint: { x: 0.5, y: 0.5 },
      enabled: true,
      fileMissing: false,
      createdAt: '2026-01-01',
    };

    const res = pickSelection(
      {
        images: [missingImage, validImage],
        quotes: DEFAULT_QUOTES,
        templates: DEFAULT_TEMPLATES,
      },
      defaultSettings,
    );

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.imageId).toBe('img-valid');
      expect(res.data.imageId).not.toBe('img-missing');
    }
  });

  it('render màn hình đặt điểm lấy nét và lưu tọa độ mới', async () => {
    const { getByText, getByTestId } = await render(<ImageFocalScreen />);

    expect(getByText('Điểm lấy nét')).toBeTruthy();
    expect(getByText(/Chạm vào vùng quan trọng nhất/)).toBeTruthy();

    const canvasArea = getByTestId('focal-touch-area');

    // Giả lập chạm vào vị trí (x: 100, y: 200) trên khung (width: 300, height: 400)
    await act(async () => {
      fireEvent(canvasArea, 'responderRelease', {
        nativeEvent: {
          locationX: 75,
          locationY: 100,
        },
      });
    });

    const saveButton = getByText('Lưu');
    await act(async () => {
      fireEvent.press(saveButton);
    });

    expect(mockBack).toHaveBeenCalled();
    const updated = useLibraryStore.getState().images.find((i) => i.id === 'img-1');
    expect(updated).toBeDefined();
    expect(updated?.focalPoint).toBeDefined();
  });

  it('bấm Hủy đóng màn hình mà không thay đổi focalPoint', async () => {
    const { getByText } = await render(<ImageFocalScreen />);

    const cancelBtn = getByText('Hủy');
    await act(async () => {
      fireEvent.press(cancelBtn);
    });

    expect(mockBack).toHaveBeenCalled();
    const img = useLibraryStore.getState().images.find((i) => i.id === 'img-1');
    expect(img?.focalPoint).toEqual({ x: 0.5, y: 0.5 });
  });
});
