import type { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Central route map. Screens read their params through these types, so adding a Phase 2
 * screen (Checkout, OrderTracking…) is a one-line change here plus the navigator entry.
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
  CategoryProducts: { categoryId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
