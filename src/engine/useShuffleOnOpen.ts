import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useLibraryStore } from '../store/useLibraryStore';
import { useSettingsStore } from '../store/useSettingsStore';

/**
 * Hook lắng nghe khởi động ứng dụng và trạng thái AppState.
 * Tự động shuffle khi:
 * 1. Khởi động app (mount) nếu shuffleOnOpen bật (hoặc chưa có current).
 * 2. App chuyển từ background/inactive sang active nếu shuffleOnOpen bật (R6).
 */
export function useShuffleOnOpen() {
  const shuffle = useLibraryStore((state) => state.shuffle);
  const current = useLibraryStore((state) => state.current);
  const shuffleOnOpen = useSettingsStore((state) => state.shuffleOnOpen);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    // Khi mở app lần đầu: nếu shuffleOnOpen bật hoặc chưa từng có selection nào
    if (shuffleOnOpen || !current) {
      shuffle();
    }

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const isForegrounding =
        /inactive|background/.test(appStateRef.current) && nextAppState === 'active';

      if (isForegrounding && useSettingsStore.getState().shuffleOnOpen) {
        useLibraryStore.getState().shuffle();
      }

      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return current;
}
