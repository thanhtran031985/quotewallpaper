import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="preview"
        options={{
          presentation: 'fullScreenModal',
          animation: 'fade',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
