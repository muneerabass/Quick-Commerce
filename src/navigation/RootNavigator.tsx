import React, { useCallback, useState } from 'react';
import { DefaultTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { AdminNavigator } from './AdminNavigator';
import { DeliveryNavigator } from './DeliveryNavigator';
import { SplashScreen } from '../screens/SplashScreen';
import { StoreProvider } from '../context/StoreContext';
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
 * swap to the role-appropriate top-level navigator.
 */
export function RootNavigator() {
  const { isBootstrapping, isAuthenticated, user } = useAuth();
  const [isSplashComplete, setSplashComplete] = useState(false);

  const handleSplashComplete = useCallback(() => setSplashComplete(true), []);

  const showSplash = isBootstrapping || !isSplashComplete;

  const renderAuthenticated = () => {
    if (user?.role === 'admin') return <Stack.Screen name="Admin" component={AdminNavigator} />;
    if (user?.role === 'delivery') return <Stack.Screen name="Delivery" component={DeliveryNavigator} />;
    // Customer flow needs the StoreProvider; the admin/delivery flows don't call /catalog/nearby.
    return (
      <Stack.Screen name="Main">
        {() => (
          <StoreProvider>
            <MainNavigator />
          </StoreProvider>
        )}
      </Stack.Screen>
    );
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
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
          renderAuthenticated()
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
