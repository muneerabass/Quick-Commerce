import type { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Central route map. Screens read their params through these types, so adding
 * a new screen is a one-line change here plus the navigator entry.
 */

export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Cart: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList>;
  Search: { initialQuery?: string } | undefined;
  ProductDetails: { productId: string };
  CategoryProducts: { categoryId: string | null };
  AddressList: { selectMode?: boolean } | undefined;
  AddressForm: { addressId?: string; selectMode?: boolean } | undefined;
  AddressMapPicker: {
    initialLatitude?: number;
    initialLongitude?: number;
  };
  OrderList: undefined;
  OrderDetails: { orderId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Otp: { phone: string };
  Name: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
  Admin: NavigatorScreenParams<AdminStackParamList>;
  Delivery: NavigatorScreenParams<DeliveryStackParamList>;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  Inventory: undefined;
  Catalog: undefined;
  More: undefined;
};

export type AdminStackParamList = {
  AdminTabs: NavigatorScreenParams<AdminTabParamList>;
  ProductForm: { productId?: string } | undefined;
  Categories: undefined;
  Stores: undefined;
  StoreForm: { storeId?: string } | undefined;
  DeliveryUsers: undefined;
};

export type DeliveryStackParamList = {
  DeliveryHome: undefined;
  DeliveryOrderDetails: { orderId: string };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
