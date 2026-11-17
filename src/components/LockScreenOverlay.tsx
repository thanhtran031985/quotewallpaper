import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CLOCK_ZONE } from '../engine/layout';

export interface LockScreenOverlayProps {
  time?: string;
  date?: string;
  showClockZone?: boolean;
  testID?: string;
}

export function LockScreenOverlay({
  time = '09:41',
  date = 'Thứ Hai, 15 tháng 6',
  showClockZone = false,
  testID = 'lock-screen-overlay',
}: LockScreenOverlayProps) {
  return (
    <View testID={testID} style={styles.overlay} pointerEvents="none">
      {/* Vùng đồng hồ: Top 8% - 32% */}
      <View style={styles.clockContainer}>
        <Text style={styles.dateText}>{date}</Text>
        <Text style={styles.timeText}>{time}</Text>
      </View>

      {/* Tùy chọn khung nét đứt hiển thị vùng đồng hồ */}
      {showClockZone && (
        <View
          testID="clock-zone-border"
          style={[
            styles.clockZoneBorder,
            {
              top: `${CLOCK_ZONE.topPct}%`,
              height: `${CLOCK_ZONE.bottomPct - CLOCK_ZONE.topPct}%`,
              left: `${CLOCK_ZONE.leftPct}%`,
              right: `${100 - CLOCK_ZONE.rightPct}%`,
            },
          ]}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeText}>VÙNG ĐỒNG HỒ</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  clockContainer: {
    position: 'absolute',
    top: '12%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
    marginBottom: 4,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 78,
    fontWeight: '700',
    letterSpacing: -1.5,
    lineHeight: 82,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  clockZoneBorder: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    borderStyle: 'dashed',
    borderRadius: 14,
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: -12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
