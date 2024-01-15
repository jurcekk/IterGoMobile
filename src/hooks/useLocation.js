import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { get, ref, set } from 'firebase/database';
import { Alert, Linking, Platform } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../firebaseConfig';

const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [intervalId2, setIntervalId2] = useState(null);

  const db = FIREBASE_DB;
  const auth = FIREBASE_AUTH;

  const checkLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission to access location was denied',
        'Please enable location services for this app in Settings.',
        [
          {
            text: 'OK',
            onPress: () => {
              Platform.OS === 'ios'
                ? Linking.openURL('app-settings:')
                : Linking.openSettings();
            },
          },
        ]
      );
      auth.signOut();
      return;
    } else {
      await getCurrentLocation();
    }
  };

  const getCurrentLocation = async () => {
    let location = await Location.getCurrentPositionAsync({});
    console.log('LOCATION', location);
    setLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922 / 4,
      longitudeDelta: 0.0421 / 4,
    });

    set(ref(db, 'users/' + auth?.currentUser?.uid + '/location'), {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    })
      .then(() => {
        console.log('User location stored in database');
      })
      .catch(() => {
        console.log('Error storing user location in database:');
      });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      (async () => {
        if (!auth?.currentUser?.uid) {
          clearInterval(intervalId2);
          return;
        }
        await checkLocationPermission();
      })();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return location;
};

export default useLocation;
