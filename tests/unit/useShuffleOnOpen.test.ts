import { renderHook, act } from '@testing-library/react-native';
import { AppState, AppStateStatus } from 'react-native';
import { useShuffleOnOpen } from '@/engine/useShuffleOnOpen';
import { useLibraryStore } from '@/store/useLibraryStore';
import { useSettingsStore } from '@/store/useSettingsStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('useShuffleOnOpen', () => {
  let appStateListener: ((state: AppStateStatus) => void) | null = null;

  beforeEach(() => {
    useLibraryStore.getState().resetAll();
    useSettingsStore.getState().resetSettings();

    // Mock AppState.addEventListener
    appStateListener = null;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => {
      appStateListener = listener as (state: AppStateStatus) => void;
      return {
        remove: jest.fn(),
      } as any;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('TC-LOG-07: khi app chuyển từ background sang active -> shuffle đúng 1 lần nếu bật shuffleOnOpen', async () => {
    const shuffleSpy = jest.fn();
    jest.spyOn(useLibraryStore.getState(), 'shuffle').mockImplementation(shuffleSpy);

    useSettingsStore.setState({ shuffleOnOpen: true });

    // Render hook
    await act(async () => {
      renderHook(() => useShuffleOnOpen());
    });

    // Lúc mount có thể gọi shuffle nếu bật
    const initialCallCount = shuffleSpy.mock.calls.length;

    // Giả lập AppState: background -> active
    await act(async () => {
      if (appStateListener) {
        appStateListener('background');
        appStateListener('active');
      }
    });

    expect(shuffleSpy).toHaveBeenCalledTimes(initialCallCount + 1);
  });

  it('TC-LOG-07b: không shuffle khi chuyển sang active nếu tắt shuffleOnOpen', async () => {
    const shuffleSpy = jest.fn();
    jest.spyOn(useLibraryStore.getState(), 'shuffle').mockImplementation(shuffleSpy);

    useSettingsStore.setState({ shuffleOnOpen: false });

    await act(async () => {
      renderHook(() => useShuffleOnOpen());
    });

    const initialCallCount = shuffleSpy.mock.calls.length;

    await act(async () => {
      if (appStateListener) {
        appStateListener('background');
        appStateListener('active');
      }
    });

    expect(shuffleSpy).toHaveBeenCalledTimes(initialCallCount);
  });
});
