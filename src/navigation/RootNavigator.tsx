import React, { useCallback, useState } from 'react';
import { DefaultTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { SplashScreen } from '../screens/SplashScreen';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

/**
 * Root switch.
 *
 * The splash stays mounted until two things are true: the persisted session has been read
 * (`isBootstrapping`) and the brand animation has played out. Only then does the stack
 * swap to Auth or Main, so the app never flashes the wrong screen on a cold start.
 */
export function RootNavigator() {
  const { isBootstrapping, isAuthenticated } = useAuth();
  const [isSplashComplete, setSplashComplete] = useState(false);

  const handleSplashComplete = useCallback(() => setSplashComplete(true), []);

  const showSplash = isBootstrapping || !isSplashComplete;

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          // Cross-fade between the three top-level states; a slide would look like a push.
          animation: 'fade',
          animationDuration: 260,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {showSplash ? (
          <Stack.Screen name="Splash">
            {() => <SplashScreen onAnimationComplete={handleSplashComplete} />}
          </Stack.Screen>
        ) : isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
