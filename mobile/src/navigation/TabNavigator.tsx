import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StyleSheet, Text, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {ProductListScreen} from '../features/products/screens/ProductListScreen';
import {CartScreen} from '../features/cart/screens/CartScreen';
import {OrderHistoryScreen} from '../features/orders/screens/OrderHistoryScreen';
import {ProfileScreen} from '../features/profile/screens/ProfileScreen';
import {useAppSelector} from '../store/store';
import {selectCartItemCount} from '../features/cart/store/cartSlice';
import {colors} from '../theme';
import type {TabParamList} from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<string, string> = {
  Discover: 'search',
  Cart: 'shopping-cart',
  Orders: 'clipboard',
  Profile: 'user',
};

const CartTabIcon = ({color, size}: {focused: boolean; color: string; size: number}) => {
  const count = useAppSelector(selectCartItemCount);
  return (
    <View>
      <Feather name="shopping-cart" size={size} color={color} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </View>
  );
};

const TabNavigator = (): React.JSX.Element => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      headerShown: false,
      tabBarIcon: ({focused, color, size}) => {
        if (route.name === 'Cart') {
          return <CartTabIcon focused={focused} color={color} size={size} />;
        }
        return (
          <Feather
            name={TAB_ICONS[route.name] ?? 'circle'}
            size={size}
            color={color}
          />
        );
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textDisabled,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 4,
        height: 56,
      },
      tabBarLabelStyle: {fontSize: 11, fontWeight: '600', marginBottom: 4},
    })}>
    <Tab.Screen name="Discover" component={ProductListScreen} />
    <Tab.Screen name="Cart" component={CartScreen} />
    <Tab.Screen name="Orders" component={OrderHistoryScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
});

export {TabNavigator};
