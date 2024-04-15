import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useContext,
} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import MenuButton from '../components/MenuButton';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import MapMarker from '../components/MapMarker';
import NoDriverModal from '../components/NoDriverModal';
import WaitingModal from '../components/WaitingModal';
import DriverAccepted from '../components/DriverAccepted';
import useOrder from '../hooks/useOrder';
import useDistance from '../hooks/useDistance';
import MapViewDirections from 'react-native-maps-directions';
import * as Haptics from 'expo-haptics';

import Animated, {
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { get, onValue, ref, update } from 'firebase/database';

import {
  FIREBASE_DB,
  FIREBASE_AUTH,
  GOOGLE_MAPS_API_KEY,
} from '../../firebaseConfig';
import ActiveOrderSheet from '../components/ActiveOrderSheet';
import NewOrderSheet from '../components/NewOrderSheet';
import { LocationContext } from '../context/LocationContext';
import { AuthContext } from '../provider/AuthProvider';
import { OrderContext } from '../provider/OrderProvider';

const Home = () => {
  const [isEndLocationVisible, setIsEndLocationVisible] = useState(false);
  const height = useSharedValue(0);

  const [driverAccepted, setDriverAccepted] = useState(false);
  const [noDriverModalVisible, setNoDriverModalVisible] = useState(false);
  const [waitingModalVisible, setWaitingModalVisible] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const auth = FIREBASE_AUTH;
  const db = FIREBASE_DB;

  const { userData } = useContext(AuthContext);
  const { order, cancelOrder } = useContext(OrderContext);
  const { location, setLocation, endLocation, setEndLocation } =
    useContext(LocationContext);

  const { getDistance } = useDistance();
  // const { cancelOrder } = useOrder();

  const mapRef = useRef(null);

  const navigation = useNavigation();

  const bottomSheetRef = useRef(null);

  const handleClose = useCallback(() => {
    console.log('CLOSE', height.value);
    bottomSheetRef.current.close();
    Keyboard.dismiss();
    if (height.value <= 0) return;
    height.value = withTiming(height.value - height.value, {
      duration: 500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, []);

  const handleOpen = useCallback(() => {
    console.log('OPEN', height.value);

    bottomSheetRef.current.snapToIndex(0);
    if (height.value < height) return;
    height.value = withTiming(Dimensions.get('window').height / 2 - 20, {
      duration: 500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, []);

  const handleCancelOrder = () => {
    if (!driverAccepted) setEndLocation(null);
    if (waitingModalVisible) cancelOrder();
    setWaitingModalVisible(false);
    setNoDriverModalVisible(false);
    setDriverAccepted(false);
    clearInterval(intervalId);
  };

  const centerMap = () => {
    if (
      location?.latitude &&
      location?.longitude &&
      endLocation?.latitude &&
      endLocation?.longitude
    ) {
      let minLat = location.latitude;
      let maxLat = endLocation.latitude;
      let minLng = location.longitude;
      let maxLng = endLocation.longitude;

      const northeast = { latitude: maxLat, longitude: maxLng };
      const southwest = { latitude: minLat, longitude: minLng };

      const bounds = [northeast, southwest];
      console.log('CENTRIRANO SA KRAJNJOM LOKACIJOM');

      mapRef.current.fitToCoordinates(bounds, {
        edgePadding: { top: 200, right: 50, bottom: 300, left: 50 },
        animated: true,
      });
    } else {
      console.log('CENTRIRANO BEZ KRAJNJE LOKACIJE');

      mapRef.current.animateToRegion(
        {
          latitude: location?.latitude,
          longitude: location?.longitude,
          latitudeDelta: process.env.EXPO_PUBLIC_LATITUDE_DELTA,
          longitudeDelta: process.env.EXPO_PUBLIC_LONGITUDE_DELTA,
        },
        500
      );
    }
  };

  const getLocationString = async (desc) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${desc}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      console.log('USAO', data?.results[0]?.formatted_address.split(',')[0]);

      return data?.results[0]?.formatted_address.split(',')[0];
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    centerMap();
  }, [location, endLocation]);

  useEffect(() => {
    if (!order) return;
    setEndLocation(order.endLocation);
  }, []);

  useEffect(() => {
    if (order?.status === 'pending') {
      setWaitingModalVisible(true);
    }
    if (waitingModalVisible && order?.status === 'accepted') {
      setWaitingModalVisible(false);
    }
  }, [order]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={{
          latitude: location?.latitude,
          longitude: location?.longitude,
          latitudeDelta: process.env.EXPO_PUBLIC_LATITUDE_DELTA,
          longitudeDelta: process.env.EXPO_PUBLIC_LONGITUDE_DELTA,
        }}
        onPress={handleClose}
        ref={mapRef}
        showsUserLocation
        onUserLocationChange={({ nativeEvent: { coordinate } }) => {
          const { latitude, longitude } = coordinate;
          // console.log('USER LOCATION CHANGE', coordinate);

          if (
            coordinate.latitude.toFixed(3) === location?.latitude.toFixed(3) &&
            coordinate.longitude.toFixed(3) === location?.longitude.toFixed(3)
          )
            return;

          getLocationString(`${latitude},${longitude}`)
            .then((address) => {
              setLocation({
                latitude,
                longitude,
                locationString: address,
                latitudeDelta: process.env.EXPO_PUBLIC_LATITUDE_DELTA,
                longitudeDelta: process.env.EXPO_PUBLIC_LONGITUDE_DELTA,
              });

              update(ref(db, 'users/' + auth.currentUser.uid + '/location'), {
                latitude: latitude.toFixed(6),
                longitude: longitude.toFixed(6),
                locationString: address,
              });
            })
            .catch((error) => {
              console.error(error);
            });
        }}
      >
        <MapMarker
          coordinate={endLocation}
          title='Your destination'
          iconColor='#ff6e2a'
        />

        {endLocation?.latitude && endLocation?.longitude && (
          <MapViewDirections
            origin={{
              latitude: location?.latitude,
              longitude: location?.longitude,
            }}
            destination={{
              latitude: endLocation?.latitude,
              longitude: endLocation?.longitude,
            }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeColor='#ff6e2a'
            strokeWidth={3}
            mode='DRIVING'
          />
        )}
      </MapView>
      <Animated.View style={styles.animatedView}>
        <TouchableOpacity
          title='Center Map'
          style={styles.centerMapButton}
          onPress={centerMap}
        >
          <FontAwesome5 name='crosshairs' size={25} color='white' />
        </TouchableOpacity>

        {userData?.role === 'user' && (
          <TouchableOpacity style={styles.orderButton} onPress={handleOpen}>
            <FontAwesome5 name='car-side' size={20} color='white' />
          </TouchableOpacity>
        )}
      </Animated.View>

      <MenuButton icon='menu-outline' onPress={() => navigation.openDrawer()} />
      <NewOrderSheet
        bottomSheetRef={bottomSheetRef}
        handleClose={handleClose}
        setIsEndLocationVisible={setIsEndLocationVisible}
      />
      <ActiveOrderSheet
        setEndLocation={setEndLocation}
        setIsEndLocationVisible={setIsEndLocationVisible}
      />

      <NoDriverModal
        visible={noDriverModalVisible}
        onCancel={handleCancelOrder}
      />
      <WaitingModal
        visible={waitingModalVisible}
        onCancel={handleCancelOrder}
      />

      <DriverAccepted visible={driverAccepted} onClose={handleCancelOrder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  bottomSheet: {
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    backgroundColor: '#f2f2f2',
    elevation: 7,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 10,
    fontSize: 16,
    lineHeight: 20,
    padding: 8,
    backgroundColor: 'rgba(151, 151, 151, 0.25)',
  },

  textInput: {
    alignSelf: 'stretch',
    marginHorizontal: 6,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#E2E2E2',
  },

  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },

  errorText: {
    color: 'red',
    fontSize: 12,
    alignSelf: 'flex-start',
  },

  submitButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#ff6e2a',
    padding: 10,
    borderRadius: 10,
    margin: 10,
    width: '100%',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },

  orderButton: {
    // position: 'absolute',
    // bottom: 70,
    // right: 40,
    borderWidth: 1,
    borderColor: '#fafafa',
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff6e2a',
  },

  animatedView: {
    position: 'absolute',
    bottom: 0,
    right: 15,
    width: 100,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },

  centerMapButton: {
    borderWidth: 1,
    borderColor: '#fafafa',
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff6e2a',
  },
});

export default Home;
