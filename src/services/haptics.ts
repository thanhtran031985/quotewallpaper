import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Rung phản hồi nhẹ khi chạm hoặc đổi hình (Apple HIG).
 */
export function triggerImpact(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
) {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      const res = Haptics.impactAsync(style);
      if (res && typeof res.catch === 'function') {
        res.catch(() => {});
      }
    } catch {
      // Bỏ qua lỗi haptics trên môi trường không hỗ trợ
    }
  }
}

/**
 * Rung phản hồi khi hoàn thành tác vụ (lưu thành công, v.v.).
 */
export function triggerNotification(
  type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success,
) {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      const res = Haptics.notificationAsync(type);
      if (res && typeof res.catch === 'function') {
        res.catch(() => {});
      }
    } catch {
      // Bỏ qua lỗi haptics trên môi trường không hỗ trợ
    }
  }
}

export const haptics = {
  impact: (style: 'light' | 'medium' | 'heavy' = 'light') => {
    const map = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    };
    triggerImpact(map[style]);
  },
  notification: (type: 'success' | 'warning' | 'error' = 'success') => {
    const map = {
      success: Haptics.NotificationFeedbackType.Success,
      warning: Haptics.NotificationFeedbackType.Warning,
      error: Haptics.NotificationFeedbackType.Error,
    };
    triggerNotification(map[type]);
  },
};
