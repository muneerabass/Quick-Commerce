import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminProvider } from '../context/AdminContext';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminInventoryScreen } from '../screens/admin/AdminInventoryScreen';
import { AdminCatalogScreen } from '../screens/admin/AdminCatalogScreen';
import { AdminMoreScreen } from '../screens/admin/AdminMoreScreen';
import { AdminProductFormScreen } from '../screens/admin/AdminProductFormScreen';
import { AdminCategoriesScreen } from '../screens/admin/AdminCategoriesScreen';
import { AdminStoresScreen } from '../screens/admin/AdminStoresScreen';
import { AdminStoreFormScreen } from '../screens/admin/AdminStoreFormScreen';
import { AdminDeliveryUsersScreen } from '../screens/admin/AdminDeliveryUsersScreen';
import { AdminTabBar } from './AdminTabBar';
import { colors } from '../theme';
import type { AdminStackParamList, AdminTabParamList } from './types';

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createNativeStackNavigator<AdminStackParamList>();

function AdminTabs() {
  return (
    <Tab.Navigator tabBar={(props) => <AdminTabBar {...props} />} screenOptions={{ headerShown: false, animation: 'shift' }}>
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Inventory" component={AdminInventoryScreen} options={{ title: 'Inventory' }} />
      <Tab.Screen name="Catalog" component={AdminCatalogScreen} options={{ title: 'Catalog' }} />
      <Tab.Screen name="More" component={AdminMoreScreen} options={{ title: 'More' }} />
    </Tab.Navigator>
  );
}

export function AdminNavigator() {
  return (
    <AdminProvider>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="AdminTabs" component={AdminTabs} />
        <Stack.Screen name="ProductForm" component={AdminProductFormScreen} />
        <Stack.Screen name="Categories" component={AdminCategoriesScreen} />
        <Stack.Screen name="Stores" component={AdminStoresScreen} />
        <Stack.Screen name="StoreForm" component={AdminStoreFormScreen} />
        <Stack.Screen name="DeliveryUsers" component={AdminDeliveryUsersScreen} />
      </Stack.Navigator>
    </AdminProvider>
  );
}
