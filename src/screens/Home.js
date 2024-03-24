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
import { UserContext } from '../context/UserContext';
import { OrderContext } from '../context/OrderContext';
import { LocationContext } from '../context/LocationContext';

const Home = () => {
  const [isEndLocationVisible, setIsEndLocationVisible] = useState(false);
  const height = useSharedValue(0);

  const [driverAccepted, setDriverAccepted] = useState(false);
  const [noDriverModalVisible, setNoDriverModalVisible] = useState(false);
  const [waitingModalVisible, setWaitingModalVisible] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const auth = FIREBASE_AUTH;
  const db = FIREBASE_DB;

  const { user } = useContext(UserContext);
  const { activeOrder } = useContext(OrderContext);
  const { location, setLocation, endLocation, setEndLocation } =
    useContext(LocationContext);

  const { getDistance } = useDistance();
  const {
    cancelOrder,
    getOrderStatus,
    createOrder,
    checkIfUserHasActiveOrder,
  } = useOrder();

  const mapRef = useRef(null);

  // const handleDriverOrder = () => {
  //   try {
  //     const dbRef = ref(db, 'orders');

  //     const drRefUser = ref(db, 'users/' + auth.currentUser.uid);

  //     get(drRefUser).then((snapshot) => {
  //       if (!snapshot.exists()) {
  //         return;
  //       }
  //       const user = snapshot.val();
  //       if (user.role !== 'driver') return;
  //       onValue(dbRef, (snapshot) => {
  //         if (!snapshot.exists()) {
  //           return;
  //         }
  //         const orders = snapshot.val();
  //         const order = Object.values(orders).find(
  //           (order) =>
  //             order.driverId === auth.currentUser.uid &&
  //             order.status === 'accepted' &&
  //             order.userId !== ''
  //         );

  //         setEndLocation({
  //           latitude: order?.startLocation?.latitude,
  //           longitude: order?.startLocation?.longitude,
  //           locationString: order?.startLocation?.locationString,
  //           latitudeDelta: process.env.EXPO_PUBLIC_LATITUDE_DELTA,
  //           longitudeDelta: process.env.EXPO_PUBLIC_LONGITUDE_DELTA,
  //         });
  //         setActiveOrder(order);

  //         setIsEndLocationVisible(true);
  //         setDriverAccepted(false);
  //         setWaitingModalVisible(false);
  //       });
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

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

      mapRef.current.animateToRegion(location, 100);
    }
  };

  const getLocationString = async (desc) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${desc}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      console.log('ADRESA', data.results[0].formatted_address.split(',')[0]);

      return data.results[0].formatted_address.split(',')[0];
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    centerMap();
  }, [location, endLocation]);

  // useEffect(() => {
  //   handleDriverOrder();
  // }, []);

  // useEffect(() => {
  //   getRole().then((user) => {
  //     if (user?.role === 'driver' && activeOrder?.status === 'accepted') {
  //       const interval = setInterval(() => {
  //         const dist = getDistance(location, activeOrder?.startLocation);
  //         // const finalDist = getDistance(location, activeOrder?.endLocation);
  //         if (dist <= 99) {
  //           Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

  //           Toast.show({
  //             type: 'success',
  //             position: 'top',
  //             text1: 'Putnik je stigao',
  //             text2: 'Vaša vožnja je počela',
  //             topOffset: 60,
  //           });
  //         }
  //         setEndLocation({
  //           latitude: activeOrder.endLocation.latitude,
  //           longitude: activeOrder.endLocation.latitude,
  //           stringName: activeOrder.endLocation.stringName,
  //           latitudeDelta: process.env.EXPO_PUBLIC_LATITUDE_DELTA,
  //           longitudeDelta: process.env.EXPO_PUBLIC_LONGITUDE_DELTA,
  //         });
  //         clearInterval(interval);
  //       }, 1000);
  //     } else if (user.role === 'user' && activeOrder?.status === 'accepted') {
  //       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  //       Toast.show({
  //         type: 'success',
  //         position: 'top',
  //         text1: 'Vozač je stigao',
  //         text2: 'Vaša vožnja je počela',
  //         topOffset: 60,
  //       });
  //     }
  //   });
  // }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={location}
        onPress={handleClose}
        ref={mapRef}
        showsUserLocation
        onUserLocationChange={({ nativeEvent: { coordinate } }) => {
          const { latitude, longitude } = coordinate;

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
              console.log('ADRESS', address);

              update(ref(db, 'users/' + auth.currentUser.uid + '/location'), {
                latitude,
                longitude,
                locationString: address,
                latitudeDelta: process.env.EXPO_PUBLIC_LATITUDE_DELTA,
                longitudeDelta: process.env.EXPO_PUBLIC_LONGITUDE_DELTA,
              });
            })
            .catch((error) => {
              console.error(error);
            });
        }}
      >
        {/* <MapMarker
          coordinate={location}
          title='Your current location'
          iconColor='#ff6e2a'
        /> */}

        <MapMarker
          coordinate={endLocation}
          title='Your destination'
          iconColor='#ff6e2a'
        />

        <MapViewDirections
          origin={location}
          destination={endLocation}
          apikey={GOOGLE_MAPS_API_KEY}
          strokeColor='#ff6e2a'
          strokeWidth={3}
          mode='DRIVING'
        />
      </MapView>
      <Animated.View
        style={{
          position: 'absolute',
          bottom: height && 0,
          right: 15,
          width: 100,
          height: 200,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 15,
        }}
      >
        <TouchableOpacity
          title='Center Map'
          style={{
            borderWidth: 1,
            borderColor: '#fafafa',
            borderRadius: 50,
            width: 60,
            height: 60,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ff6e2a',
          }}
          onPress={centerMap}
        >
          <FontAwesome5 name='crosshairs' size={25} color='white' />
        </TouchableOpacity>

        {user.role === 'user' && (
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,

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
});

export default Home;
