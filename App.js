import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import 'react-native-gesture-handler';

import Home from './src/screens/Home';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import DrawerContent from './src/components/DrawerContent';
import EditProfile from './src/screens/EditProfile';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from './firebaseConfig';
import { signOut } from 'firebase/auth';
import BecomeDriver from './src/screens/BecomeDriver';
import useLocation from './src/hooks/useLocation';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const auth = FIREBASE_AUTH;

  const location = useLocation();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        signOut(auth);
      }
    });
  }, []);

  return (
    <NavigationContainer>
      {user ? (
        <Drawer.Navigator
          initialRouteName='Home'
          drawerContent={(props) => (
            <DrawerContent {...props} location={location} />
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

          <Drawer.Screen
            name='BecomeDriver'
            component={BecomeDriver}
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
