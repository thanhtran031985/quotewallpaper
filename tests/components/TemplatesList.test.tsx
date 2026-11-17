import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import TemplatesScreen from '../../app/(tabs)/templates';
import { useLibraryStore } from '../../src/store/useLibraryStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { DEFAULT_QUOTES, DEFAULT_IMAGES, DEFAULT_TEMPLATES } from '../../src/services/seed';
import { Template } from '../../src/domain/types';

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

describe('TemplatesScreen (Tab Mẫu)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLibraryStore.getState().resetAll();
    useSettingsStore.getState().resetSettings();

    useLibraryStore.setState({
      quotes: DEFAULT_QUOTES,
      images: DEFAULT_IMAGES,
      templates: DEFAULT_TEMPLATES,
      current: null,
      pinned: { image: false, quote: false, template: false },
      history: [],
    });
  });

  it('render màn hình mẫu, hiển thị segmented control Cố định / Ngẫu nhiên', async () => {
    const { getByText } = await render(<TemplatesScreen />);

    expect(getByText('Mẫu')).toBeTruthy();
    expect(getByText('Cố định')).toBeTruthy();
    expect(getByText('Ngẫu nhiên')).toBeTruthy();
  });

  it('TC-UI-01: chọn Cố định → Kính mờ, đổi ngẫu nhiên 10 lần luôn giữ Kính mờ', async () => {
    useSettingsStore.getState().setTemplateMode('fixed');
    const { getByTestId } = await render(<TemplatesScreen />);

    // Tìm template Kính mờ (id: tpl-glass)
    const blurCard = getByTestId('template-card-tpl-glass');
    await act(async () => {
      fireEvent.press(blurCard);
    });

    expect(useSettingsStore.getState().fixedTemplateId).toBe('tpl-glass');

    // Chạy shuffle 10 lần
    for (let i = 0; i < 10; i++) {
      await act(async () => {
        const res = useLibraryStore.getState().shuffle();
        expect(res.ok).toBe(true);
        if (res.ok) {
          expect(res.data.templateId).toBe('tpl-glass');
        }
      });
    }
  });

  it('TC-UI-02: ở chế độ Ngẫu nhiên, chặn không cho tắt template cuối cùng (R12)', async () => {
    useSettingsStore.getState().setTemplateMode('random');

    // Bật duy nhất 1 template tpl-center, tắt các template còn lại
    const templates = useLibraryStore.getState().templates;
    useLibraryStore.setState({
      templates: templates.map((t) => ({
        ...t,
        enabled: t.id === 'tpl-center',
      })),
    });

    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByTestId } = await render(<TemplatesScreen />);

    const centerCard = getByTestId('template-card-tpl-center');
    await act(async () => {
      fireEvent.press(centerCard);
    });

    // Vẫn bật vì R12 chặn tắt mục cuối
    const centerTpl = useLibraryStore.getState().templates.find((t) => t.id === 'tpl-center');
    expect(centerTpl?.enabled).toBe(true);
    expect(alertSpy).toHaveBeenCalledWith(
      'Không thể tắt',
      expect.stringContaining('ít nhất 1 mẫu'),
      expect.any(Array),
    );
  });

  it('TC-UI-03: nhân bản template tạo bản sao với hậu tố "(bản sao)"', async () => {
    const { getByTestId, getByText } = await render(<TemplatesScreen />);

    const centerCard = getByTestId('template-card-tpl-center');
    await act(async () => {
      fireEvent(centerCard, 'longPress');
    });

    expect(getByText(/Tác vụ mẫu/)).toBeTruthy();
    const cloneAction = getByText('Nhân bản mẫu này');
    await act(async () => {
      fireEvent.press(cloneAction);
    });

    const state = useLibraryStore.getState();
    const cloned = state.templates.find((t) => t.name.includes('(bản sao)'));
    expect(cloned).toBeDefined();
    expect(cloned?.source).toBe('user');
  });

  it('xóa template user đang được đặt làm fixedTemplateId thì tự fallback về builtin đầu (R11)', async () => {
    const userTpl: Template = {
      ...DEFAULT_TEMPLATES[0],
      id: 'tpl-user-1',
      name: 'Mẫu của tôi',
      source: 'user',
      enabled: true,
    };

    useLibraryStore.setState({
      templates: [userTpl, ...DEFAULT_TEMPLATES],
    });
    useSettingsStore.getState().setFixedTemplateId('tpl-user-1');

    jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      const deleteBtn = buttons?.find((b) => b.text === 'Xóa');
      deleteBtn?.onPress?.();
    });

    const { getByTestId, getByText } = await render(<TemplatesScreen />);
    const userCard = getByTestId('template-card-tpl-user-1');
    await act(async () => {
      fireEvent(userCard, 'longPress');
    });

    const deleteAction = getByText('Xóa mẫu này');
    await act(async () => {
      fireEvent.press(deleteAction);
    });

    // R11: fallback về builtin đầu tiên
    const currentFixedId = useSettingsStore.getState().fixedTemplateId;
    expect(currentFixedId).toBe(DEFAULT_TEMPLATES[0].id);
  });
});
