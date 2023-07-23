import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import 'react-native-gesture-handler';

import Home from './src/screens/Home';
import Login from './src/screens/Login';
import Register from './src/screens/Register';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

export default function App() {
  const [userToken, setUserToken] = useState(1);

  return (
    <NavigationContainer>
      {userToken ? (
        <Drawer.Navigator initialRouteName='Home'>
          <Drawer.Screen
            name='Home'
            component={Home}
            options={{ headerShown: false }}
          />
        </Drawer.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen
            name='Login'
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name='Register'
            component={Register}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
