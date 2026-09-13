import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { SearchScreen } from '../screens/home/SearchScreen';
import { ProductDetailsScreen } from '../screens/home/ProductDetailsScreen';
import { CategoryProductsScreen } from '../screens/categories/CategoryProductsScreen';
import { colors } from '../theme';
import type { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

/**
 * Screens pushed above the tabs. Anything that should cover the tab bar — search,
 * product details, and later checkout and order tracking — belongs here.
 */
export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Tabs" component={BottomTabNavigator} />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        // Fading in keeps the focus on the input rather than on a sliding panel.
        options={{ animation: 'fade_from_bottom', animationDuration: 220 }}
      />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="CategoryProducts" component={CategoryProductsScreen} />
    </Stack.Navigator>
  );
}
