import { useState } from 'react';
import 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import { LocationPermissionsService } from './src/services/LocationPermissionsService';
import { LocationContext } from './src/context/LocationContext';
import Navigation from './src/navigation';
import { AuthProvider } from './src/provider/AuthProvider';
import { OrderProvider } from './src/provider/OrderProvider';

export default function App() {
  const [location, setLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);

  return (
    <AuthProvider>
      <LocationContext.Provider
        value={{ location, endLocation, setLocation, setEndLocation }}
      >
        <OrderProvider>
          <Navigation />
          <Toast />
          <LocationPermissionsService />
        </OrderProvider>
      </LocationContext.Provider>
    </AuthProvider>
  );
}
