import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DeliveryProvider } from '../context/DeliveryContext';
import { DeliveryAvailableScreen } from '../screens/delivery/DeliveryAvailableScreen';
import { DeliveryActiveScreen } from '../screens/delivery/DeliveryActiveScreen';
import { DeliveryHistoryScreen } from '../screens/delivery/DeliveryHistoryScreen';
import { DeliveryOrderDetailsScreen } from '../screens/delivery/DeliveryOrderDetailsScreen';
import { DeliveryTabBar } from './DeliveryTabBar';
import { colors } from '../theme';
import type { DeliveryStackParamList, DeliveryTabParamList } from './types';

const Stack = createNativeStackNavigator<DeliveryStackParamList>();
const Tab = createBottomTabNavigator<DeliveryTabParamList>();

function DeliveryTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
      tabBar={(props) => <DeliveryTabBar {...props} />}
    >
      <Tab.Screen name="Available" component={DeliveryAvailableScreen} options={{ title: 'Available' }} />
      <Tab.Screen name="Active" component={DeliveryActiveScreen} options={{ title: 'Active' }} />
      <Tab.Screen name="History" component={DeliveryHistoryScreen} options={{ title: 'History' }} />
    </Tab.Navigator>
  );
}

export function DeliveryNavigator() {
  return (
    <DeliveryProvider>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="DeliveryTabs" component={DeliveryTabs} />
        <Stack.Screen name="DeliveryOrderDetails" component={DeliveryOrderDetailsScreen} />
      </Stack.Navigator>
    </DeliveryProvider>
  );
}
