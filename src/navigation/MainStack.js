import React, { useContext } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import Home from '../screens/Home';
import EditProfile from '../screens/EditProfile';
import BecomeDriver from '../screens/BecomeDriver';
import Driver from '../screens/Driver';
import DrawerContent from '../components/DrawerContent';
import First from '../screens/onboarding/First';
import { AuthContext } from '../provider/AuthProvider';

const Drawer = createDrawerNavigator();
const Main = () => {
  const { userData } = useContext(AuthContext);

  console.log('USER DATA123123123', userData?.phone === '');

  return (
    <Drawer.Navigator
      initialRouteName={userData?.phone === '' ? 'First' : 'Home'}
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
        name='First'
        component={First}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
};

export default Main;
