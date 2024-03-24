import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import Home from './src/screens/Home';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import DrawerContent from './src/components/DrawerContent';
import EditProfile from './src/screens/EditProfile';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from './firebaseConfig';
import { signOut } from 'firebase/auth';
import BecomeDriver from './src/screens/BecomeDriver';
import ForgotPassword from './src/screens/ForgotPassword';
import Driver from './src/screens/Driver';
import { UserLocationStateContextProvider } from './src/context/UserLocationStateContext';
import { LocationPermissionsService } from './src/services/LocationPermissionsService';
import { ref, onValue, get } from 'firebase/database';
import { UserContext } from './src/context/UserContext';
import { OrderContext } from './src/context/OrderContext';
import { LocationContext } from './src/context/LocationContext';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);

  const [location, setLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);

  const auth = FIREBASE_AUTH;
  const db = FIREBASE_DB;

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("LOGIN")
        const dbRef = ref(db, 'users/' + user.uid);
        get(dbRef).then((snapshot) => {
          if (!snapshot.exists()) {
            return;
          }
          const user = snapshot.val();
          setUser(user);
        });
      } else {
        setUser(null);
        signOut(auth);
      }
      
    });
  }, []);

  useEffect(() => {
    try {
      if (user) {
        const dbRef = ref(db, 'orders');
        onValue(dbRef, (snapshot) => {
          if (!snapshot.exists()) {
            return;
          }
          const orders = snapshot.val();
          const order = Object.values(orders).find((order) => {
            console.log(order);
            console.log(auth.currentUser.uid);
            return (
              (order.userId === auth.currentUser.uid &&
                order.status === 'accepted') ||
              (order.driverId === auth.currentUser.uid &&
                order.status === 'accepted')
            );
          });
          setActiveOrder(order);
        });
      }
    } catch (e) {
      console.log(e);
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <LocationContext.Provider
        value={{ location, endLocation, setLocation, setEndLocation }}
      >
        {/* <UserLocationStateContextProvider> */}
        <OrderContext.Provider value={{ activeOrder, setActiveOrder }}>
          <NavigationContainer>
            {user ? (
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
                <Stack.Screen
                  name='ForgotPassword'
                  component={ForgotPassword}
                  options={{ headerShown: false }}
                />
              </Stack.Navigator>
            )}
          </NavigationContainer>
          <Toast />
          <LocationPermissionsService />
        </OrderContext.Provider>
        {/* </UserLocationStateContextProvider> */}
      </LocationContext.Provider>
    </UserContext.Provider>
  );
}
