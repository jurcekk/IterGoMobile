import { useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../firebaseConfig';

export const LocationPermissionsService = () => {
  const auth = FIREBASE_AUTH;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Dozvola za pristup lokaciji je odbijena',
          'Molimo omogućite lokacijske usluge za ovu aplikaciju u podešavanjima.',
          [
            {
              text: 'Omogući pristup',
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
    })();
  }, []);

  return null;
};
