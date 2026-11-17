import React from 'react';
import { render, screen } from '@testing-library/react-native';
import RootLayout from '../../app/_layout';

jest.mock('expo-router', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockScreen = () => null;
  const MockStack = ({ children }: { children: React.ReactNode }) => (
    <View testID="root-stack">{children}</View>
  );
  MockStack.Screen = MockScreen;
  return {
    Stack: MockStack,
  };
});

describe('RootLayout', () => {
  it('renders root stack correctly without crashing', async () => {
    await render(<RootLayout />);
    expect(screen.getByTestId('root-stack')).toBeTruthy();
  });
});
