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

  it('LockScreenOverlay được ẩn khỏi cây VoiceOver để tránh làm rối người khiếm thị', async () => {
    const { getByTestId } = await render(
      <LockScreenOverlay showClockZone={true} />,
    );

    const overlay = getByTestId('lock-screen-overlay', {
      includeHiddenElements: true,
    });
    expect(overlay.props.accessibilityElementsHidden).toBe(true);
    expect(overlay.props.importantForAccessibility).toBe('no-hide-descendants');
  });
});
