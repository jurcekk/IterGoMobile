import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import 'react-native-gesture-handler';

import Home from './src/screens/Home';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import DrawerContent from './src/components/DrawerContent';
import EditProfile from './src/screens/EditProfile';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

export default function App() {
  const [user, setUser] = useState(1);

  return (
    <NavigationContainer>
      {user ? (
        <Drawer.Navigator
          initialRouteName='Home'
          drawerContent={(props) => (
            <DrawerContent {...props} user={user} setUser={setUser} />
          )}
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
