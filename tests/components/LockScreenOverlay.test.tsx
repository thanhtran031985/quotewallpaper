import React from 'react';
import { render } from '@testing-library/react-native';
import { LockScreenOverlay } from '@/components/LockScreenOverlay';

describe('LockScreenOverlay Component', () => {
  it('render ngày giờ và có pointerEvents="none"', async () => {
    const { getByTestId, getByText } = await render(
      <LockScreenOverlay
        time="09:41"
        date="Thứ Hai, 15 tháng 6"
        showClockZone={false}
        testID="lock-overlay"
      />,
    );

    const overlay = getByTestId('lock-overlay');
    expect(overlay.props.pointerEvents).toBe('none');
    expect(getByText('09:41')).toBeTruthy();
    expect(getByText('Thứ Hai, 15 tháng 6')).toBeTruthy();
  });

  it('hiển thị khung vùng đồng hồ khi showClockZone = true', async () => {
    const { getByTestId, getByText } = await render(
      <LockScreenOverlay
        time="09:41"
        date="Thứ Hai, 15 tháng 6"
        showClockZone={true}
        testID="lock-overlay"
      />,
    );

    expect(getByTestId('clock-zone-border')).toBeTruthy();
    expect(getByText(/VÙNG ĐỒNG HỒ/i)).toBeTruthy();
  });

  it('ẩn khung vùng đồng hồ khi showClockZone = false', async () => {
    const { queryByTestId } = await render(
      <LockScreenOverlay
        time="09:41"
        date="Thứ Hai, 15 tháng 6"
        showClockZone={false}
        testID="lock-overlay"
      />,
    );

    expect(queryByTestId('clock-zone-border')).toBeNull();
  });
});
