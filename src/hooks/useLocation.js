import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { ref, set } from 'firebase/database';
import { Alert, Linking, Platform } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';

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
      signOut(auth);
      return;
    }
  };

  const getCurrentLocation = async () => {
    let location = await Location.getCurrentPositionAsync({});
    const locationString = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    setLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922 / 4,
      longitudeDelta: 0.0421 / 4,
      locationString: locationString[0]?.street,
    });
    if (!auth?.currentUser?.uid) return;

    set(ref(db, 'users/' + auth?.currentUser?.uid + '/location'), {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      locationString: locationString[0]?.street,
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
        }
        await checkLocationPermission();
        await getCurrentLocation();
      })();
    }, 10000);
    setIntervalId2(interval);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      const isAndroid = Platform.OS == 'android';
      const location = await Location.getCurrentPositionAsync({
        accuracy: isAndroid ? Location.Accuracy.Low : Location.Accuracy.Lowest,
      });

      const locationString = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      console.log(locationString[0].street);

      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922 / 4,
        longitudeDelta: 0.0421 / 4,
        locationString: locationString[0].street,
      });

      if (!auth?.currentUser?.uid) return;

      set(ref(db, 'users/' + auth?.currentUser?.uid + '/location'), {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        locationString: locationString[0]?.street,
      })
        .then(() => {
          console.log('User location stored in database');
        })
        .catch(() => {
          console.log('Error storing user location in database:');
        });
    })();
  }, []);

  return location;
};

export default useLocation;
