import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import Home from '../screens/Home';
import EditProfile from '../screens/EditProfile';
import BecomeDriver from '../screens/BecomeDriver';
import Driver from '../screens/Driver';
import DrawerContent from '../components/DrawerContent';
import UserOrders from '../screens/UserOrders';

const Drawer = createDrawerNavigator();
const Main = () => {
  return (
    <Drawer.Navigator
      initialRouteName='Home'
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        swipeEdgeWidth: 0,
      }}
    >
      <Drawer.Screen
        name='Home'
        component={Home}
        options={{ headerShown: false }}
      />

      <Drawer.Screen
        name='EditProfile'
        component={EditProfile}
        options={{ headerShown: false }}
      />

      <Drawer.Screen
        name='BecomeDriver'
        component={BecomeDriver}
        options={{ headerShown: false }}
      />

      <Drawer.Screen
        name='Driver'
        component={Driver}
        options={{ headerShown: false }}
      />

      <Drawer.Screen
        name='UserOrders'
        component={UserOrders}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
};

export default Main;
