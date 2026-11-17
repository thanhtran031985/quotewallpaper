import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Rung phản hồi nhẹ khi chạm hoặc đổi hình (Apple HIG).
 */
export function triggerImpact(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
) {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Haptics.impactAsync(style).catch(() => {});
  }
}

/**
 * Rung phản hồi khi hoàn thành tác vụ (lưu thành công, v.v.).
 */
export function triggerNotification(
  type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success,
) {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Haptics.notificationAsync(type).catch(() => {});
  }
}
