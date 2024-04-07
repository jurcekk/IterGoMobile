import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../provider/AuthProvider';

import { NavigationContainer } from '@react-navigation/native';

import Main from './MainStack';
import Auth from './AuthStack';
import Loading from '../screens/utils/Loading';
import OnBoardingStack from './OnBoardingStack';

export default () => {
  const { user, userData } = useContext(AuthContext);
  console.log('USERDATADATA', userData);

  useEffect(() => {
    console.log('PHONE', userData?.phone);
  }, [userData]);

  return (
    <NavigationContainer>
      {userData?.phone === '' && <OnBoardingStack />}
      {user == null && userData?.phone !== '' && <Loading />}
      {user == false && userData?.phone !== '' && <Auth />}
      {user == true && userData?.phone !== '' && <Main />}
    </NavigationContainer>
  );
};
