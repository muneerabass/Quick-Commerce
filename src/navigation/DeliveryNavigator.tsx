import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DeliveryHomeScreen } from '../screens/delivery/DeliveryHomeScreen';
import { DeliveryOrderDetailsScreen } from '../screens/delivery/DeliveryOrderDetailsScreen';
import { colors } from '../theme';
import type { DeliveryStackParamList } from './types';

const Stack = createNativeStackNavigator<DeliveryStackParamList>();

export function DeliveryNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="DeliveryHome" component={DeliveryHomeScreen} />
      <Stack.Screen name="DeliveryOrderDetails" component={DeliveryOrderDetailsScreen} />
    </Stack.Navigator>
  );
}
