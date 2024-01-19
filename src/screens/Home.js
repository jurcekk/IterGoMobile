import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Keyboard,
  Pressable,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import BottomSheet from '@gorhom/bottom-sheet';
import MenuButton from '../components/MenuButton';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as file from '../data/export.json';
import MapMarker from '../components/MapMarker';
import SuggestedLocations from '../components/SuggestedLocations';
import NoDriverModal from '../components/NoDriverModal';
import WaitingModal from '../components/WaitingModal';
import DriverAccepted from '../components/DriverAccepted';
import useDistance from '../hooks/useDistance';
import useOrder from '../hooks/useOrder';
import useLocation from '../hooks/useLocation';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../firebaseConfig';
import Toast from 'react-native-toast-message';

const Home = () => {
  // const [location, setLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [isEndLocationVisible, setIsEndLocationVisible] = useState(false);
  const [suggestedList, setSuggestedList] = useState([]);

  const [driverAccepted, setDriverAccepted] = useState(false);
  const [noDriverModalVisible, setNoDriverModalVisible] = useState(false);
  const [waitingModalVisible, setWaitingModalVisible] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const auth = FIREBASE_AUTH;
  const db = FIREBASE_DB;

  const { getDistance } = useDistance();
  const location = useLocation();
  const {
    cancelOrder,
    getOrderStatus,
    createOrder,
    checkIfUserHasActiveOrder,
  } = useOrder();

  const timeoutRef = useRef(null);
  const mapRef = useRef(null);

  const handleInputChanges = (text) => {
    setEndLocation((prevState) => {
      return {
        ...prevState,
        locationString: text,
      };
    });
    if (text.length < 3) return;
    clearTimeout(timeoutRef.current);
    let timer;

    if (file?.features) {
      timer = setTimeout(() => {
        const result = file?.features?.filter((item) =>
          item?.properties['name:sr-Latn']
            ?.toLowerCase()
            .includes(text.toLowerCase())
        );
        setSuggestedList(result);
      }, 1000);
    }
  };

  const navigation = useNavigation();

  const bottomSheetRef = useRef(null);

  const snapPoints = useMemo(() => ['50%', '90%'], []);

  const handleClose = useCallback(() => {
    bottomSheetRef.current.close();
    Keyboard.dismiss();
  }, []);

  const handleOpen = useCallback(() => {
    bottomSheetRef.current.snapToIndex(0);
  }, []);

  const handleOnFocusKeyboard = useCallback(() => {
    bottomSheetRef.current.snapToPosition('90%');
  }, []);

  const handleCancelOrder = () => {
    if (!driverAccepted) setEndLocation(null);
    if (waitingModalVisible) cancelOrder();
    setWaitingModalVisible(false);
    setNoDriverModalVisible(false);
    setDriverAccepted(false);
    clearInterval(intervalId);
  };

  const checkOrderStatus = async () => {
    try {
      const MAX_CHECKS = 10;
      let checks = 0;

      const interval = setInterval(async () => {
        checks++;

        const order = await getOrderStatus();

        if (order.status === 'accepted') {
          setWaitingModalVisible(false);
          setDriverAccepted(true);
          clearInterval(interval);
        } else if (checks === MAX_CHECKS) {
          setWaitingModalVisible(false);
          setNoDriverModalVisible(true);
          clearInterval(interval);
          cancelOrder();
        }
      }, 1000);
      setIntervalId(interval);
    } catch (error) {
      console.error('Greška:', error);
      setWaitingModalVisible(false);
    }
  };

  const requestTaxi = async () => {
    setWaitingModalVisible(true);

    createOrder(location, endLocation);

    checkOrderStatus();
  };

  useEffect(() => {
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

      const distance = getDistance(location, endLocation);

      const northeast = { latitude: maxLat, longitude: maxLng };
      const southwest = { latitude: minLat, longitude: minLng };

      const bounds = [northeast, southwest];

      mapRef.current.fitToCoordinates(bounds, {
        edgePadding: { top: 200, right: 100, bottom: 200, left: 100 },
        animated: true,
      });
    }
  }, [location, endLocation]);

  return (
    <View style={styles.container}>
      {/* <GetLocation location={location} setLocation={setLocation} /> */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={location}
        onPress={handleClose}
        ref={mapRef}
      >
        <MapMarker
          coordinate={location || { latitude: 0, longitude: 0 }}
          title='Your current location'
          iconColor='#ff6e2a'
        />

        {isEndLocationVisible && (
          <MapMarker
            coordinate={endLocation}
            title='Your destination'
            iconColor='#ff6e2a'
          />
        )}
      </MapView>

      <TouchableOpacity
        title='Center Map'
        style={{
          position: 'absolute',
          bottom: 140,
          right: 40,
          borderWidth: 1,
          borderColor: '#fafafa',
          borderRadius: 50,
          width: 60,
          height: 60,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ff6e2a',
        }}
        onPress={() => {
          mapRef.current.animateToRegion(location, 1000);
        }}
      >
        <FontAwesome5 name='crosshairs' size={25} color='white' />
      </TouchableOpacity>

      <Pressable style={styles.orderButton} onPress={handleOpen}>
        <FontAwesome5 name='car-side' size={20} color='white' />
      </Pressable>

      <MenuButton icon='menu-outline' onPress={() => navigation.openDrawer()} />

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        style={styles.bottomSheet}
        keyboardBehavior='interactive'
      >
        <View
          style={{
            height: 200,
            backgroundColor: 'white',
            padding: 20,
            borderBottomWidth: 2,
            borderColor: '#E5E5E5',
          }}
          automaticallyAdjustContentInsets={true}
        >
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
            }}
          >
            <View
              style={{
                alignItems: 'center',
                height: 110,
                paddingVertical: 15,
                marginRight: 10,
              }}
            >
              <FontAwesome5 name='user-circle' size={20} color='#ff6e2a' />
              <View
                style={{
                  width: 1,
                  flex: 1,
                  backgroundColor: '#ff6e2a',
                  marginVertical: 8,
                }}
              ></View>
              <FontAwesome5 name='map-marker-alt' size={24} color='#ff6e2a' />
            </View>

            <View
              style={{
                flex: 1,
                height: 110,
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <TextInput
                style={[styles.textInput, { backgroundColor: '#a7a7a7' }]}
                placeholderTextColor={'gray'}
                placeholder='Trenutna lokacija'
                editable={false}
              />

              <TextInput
                style={styles.textInput}
                placeholder='Željena destinacija?'
                onChangeText={handleInputChanges}
                onFocus={handleOnFocusKeyboard}
                value={endLocation?.locationString}
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={async () => {
                  if (await checkIfUserHasActiveOrder()) {
                    Toast.show({
                      type: 'error',
                      position: 'top',
                      text1: 'Greška',

                      text2: 'Već imate aktivnu vožnju',
                      topOffset: 60,
                    });

                    return;
                  }
                  handleClose();
                  setIsEndLocationVisible(true);
                  requestTaxi();
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                  Pozovi vozilo
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <SuggestedLocations
          location={location}
          suggestedList={suggestedList}
          setSuggestedList={setSuggestedList}
          setEndLocation={setEndLocation}
          setIsEndLocationVisible={setIsEndLocationVisible}
        />
      </BottomSheet>
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
    position: 'absolute',
    bottom: 70,
    right: 40,
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
