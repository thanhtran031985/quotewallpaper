import React from 'react';
import { render } from '@testing-library/react-native';
import { GlassButton } from '../../src/components/GlassButton';
import { LockScreenOverlay } from '../../src/components/LockScreenOverlay';

describe('Accessibility & VoiceOver Audit (13-polish-performance Step 2)', () => {
  it('GlassButton có accessibilityRole button và accessibilityLabel rõ ràng cho VoiceOver', async () => {
    const { getByTestId, getByLabelText } = await render(
      <GlassButton
        label="Đổi ngẫu nhiên"
        onPress={() => {}}
        accessibilityLabel="Đổi hình nền ngẫu nhiên"
      />,
    );

    const btn = getByTestId('glass-button');
    expect(btn.props.accessibilityRole).toBe('button');

    const btnLabel = getByLabelText('Đổi hình nền ngẫu nhiên');
    expect(btnLabel).toBeTruthy();
  });

  it('LockScreenOverlay có accessibilityLabel rõ ràng cho vùng đồng hồ mô phỏng', async () => {
    const { getByLabelText } = await render(
      <LockScreenOverlay showClockZone={true} />,
    );

    const clockZone = getByLabelText('Đồng hồ màn hình khóa mô phỏng');
    expect(clockZone).toBeTruthy();
  });
});
