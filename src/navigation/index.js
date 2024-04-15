import React, { useContext } from 'react';
import { AuthContext } from '../provider/AuthProvider';

import { NavigationContainer } from '@react-navigation/native';

import Main from './MainStack';
import Auth from './AuthStack';
import Loading from '../screens/utils/Loading';
import OnBoarding from './OnBoardingStack';

export default () => {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      {user === null && <Loading />}
      {user === 'false' && <Auth />}
      {user === 'true' && <Main />}
      {user === 'onBoarding' && <OnBoarding />}
    </NavigationContainer>
  );
};
