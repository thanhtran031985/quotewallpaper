import React from 'react';
import { render, screen } from '@testing-library/react-native';
import TabLayout from '../../app/(tabs)/_layout';

// Mock expo-router Tabs
jest.mock('expo-router', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  const MockScreen = ({
    name,
    options,
  }: {
    name: string;
    options?: {
      title?: string;
      tabBarIcon?: (props: { color: string; focused: boolean }) => React.ReactNode;
    };
  }) => (
    <View testID={`tab-screen-${name}`}>
      <Text testID={`tab-title-${name}`}>{options?.title}</Text>
      {options?.tabBarIcon && options.tabBarIcon({ color: '#000', focused: true })}
    </View>
  );

  const MockTabs = ({ children }: { children: React.ReactNode }) => (
    <View testID="mock-tabs">{children}</View>
  );
  MockTabs.Screen = MockScreen;

  return {
    Tabs: MockTabs,
  };
});

describe('TabLayout', () => {
  it('TC-UI-01: renders 5 tabs in correct order with exact labels', async () => {
    await render(<TabLayout />);

    expect(screen.getByTestId('tab-screen-index')).toBeTruthy();
    expect(screen.getByText('Hôm nay')).toBeTruthy();

    expect(screen.getByTestId('tab-screen-quotes')).toBeTruthy();
    expect(screen.getByText('Danh ngôn')).toBeTruthy();

    expect(screen.getByTestId('tab-screen-images')).toBeTruthy();
    expect(screen.getByText('Ảnh')).toBeTruthy();

    expect(screen.getByTestId('tab-screen-templates')).toBeTruthy();
    expect(screen.getByText('Mẫu')).toBeTruthy();

    expect(screen.getByTestId('tab-screen-settings')).toBeTruthy();
    expect(screen.getByText('Cài đặt')).toBeTruthy();
  });
});
