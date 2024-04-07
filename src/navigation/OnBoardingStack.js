import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import First from '../screens/onboarding/First';

const OnBoardingStack = createNativeStackNavigator();

const OnBoarding = () => {
  return (
    <OnBoardingStack.Navigator
      initialRouteName='First'
      screenOptions={{ headerShown: false }}
    >
      <OnBoardingStack.Screen name='First' component={First} />
    </OnBoardingStack.Navigator>
  );
};

export default OnBoarding;
