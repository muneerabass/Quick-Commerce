import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { SearchScreen } from '../screens/home/SearchScreen';
import { ProductDetailsScreen } from '../screens/home/ProductDetailsScreen';
import { CategoryProductsScreen } from '../screens/categories/CategoryProductsScreen';
import { AddressListScreen } from '../screens/profile/AddressListScreen';
import { AddressFormScreen } from '../screens/profile/AddressFormScreen';
import { AddressMapPickerScreen } from '../screens/profile/AddressMapPickerScreen';
import { OrderListScreen } from '../screens/orders/OrderListScreen';
import { OrderDetailsScreen } from '../screens/orders/OrderDetailsScreen';
import { colors } from '../theme';
import type { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

/** Screens pushed above the tabs. Checkout flow and account surfaces belong here. */
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
        options={{ animation: 'fade_from_bottom', animationDuration: 220 }}
      />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="CategoryProducts" component={CategoryProductsScreen} />
      <Stack.Screen name="AddressList" component={AddressListScreen} />
      <Stack.Screen name="AddressForm" component={AddressFormScreen} />
      <Stack.Screen name="AddressMapPicker" component={AddressMapPickerScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="OrderList" component={OrderListScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    </Stack.Navigator>
  );
}
