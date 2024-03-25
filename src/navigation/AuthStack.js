import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import ForgotPassword from '../screens/auth/ForgotPassword';

const AuthStack = createNativeStackNavigator();
const Auth = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name='Login' component={Login} />
      <AuthStack.Screen name='Register' component={Register} />
      <AuthStack.Screen name='ForgotPassword' component={ForgotPassword} />
    </AuthStack.Navigator>
  );
};

export default Auth;
