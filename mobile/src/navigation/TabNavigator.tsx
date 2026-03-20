import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text} from 'react-native';
import {ProductListScreen} from '../features/products/screens/ProductListScreen';
import {CartScreen} from '../features/cart/screens/CartScreen';
import {OrderHistoryScreen} from '../features/orders/screens/OrderHistoryScreen';
import {ProfileScreen} from '../features/profile/screens/ProfileScreen';
import {useAppSelector} from '../store/store';
import {selectCartItemCount} from '../features/cart/store/cartSlice';
import type {TabParamList} from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<string, string> = {
  Discover: '🔍',
  Cart: '🛒',
  Orders: '📋',
  Profile: '👤',
};

const CartTabIcon = ({}: {focused: boolean; color: string; size: number}) => {
  const count = useAppSelector(selectCartItemCount);
  return (
    <Text style={{fontSize: 20}}>
      {TAB_ICONS.Cart}
      {count > 0 ? ` (${count})` : ''}
    </Text>
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
        return <Text style={{fontSize: 20}}>{TAB_ICONS[route.name] ?? '•'}</Text>;
      },
      tabBarActiveTintColor: '#39B78D',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        shadowOpacity: 0,
        elevation: 0,
      },
      tabBarLabelStyle: {fontSize: 11, fontWeight: '600', marginBottom: 2},
    })}>
    <Tab.Screen name="Discover" component={ProductListScreen} />
    <Tab.Screen name="Cart" component={CartScreen} />
    <Tab.Screen name="Orders" component={OrderHistoryScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export {TabNavigator};
