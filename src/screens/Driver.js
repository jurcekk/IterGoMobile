import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Dimensions,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';
import { ref, get, onValue, update } from 'firebase/database';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import MapMarker from '../components/MapMarker';
import Toast from 'react-native-toast-message';
import { OrderContext } from '../provider/OrderProvider';
import { LocationContext } from '../context/LocationContext';

const Driver = (props) => {
  const [data, setData] = useState([]);
  const { setOrder } = useContext(OrderContext);
  const { endLocation, setEndLocation } = useContext(LocationContext);
  const auth = FIREBASE_AUTH;
  const db = FIREBASE_DB;

  const navigation = useNavigation();
  const mapRef = useRef(null);

  const assignOrder = async (item) => {
    const dbRef = ref(db, 'orders/' + item.orderId);

    update(dbRef, {
      status: 'accepted',
      driverId: auth.currentUser.uid,
    })
      .then(() => {
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Uspešno ste prihvatili vožnju',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
        });

        console.log('Driver id added to order');
        setOrder(item);
        setEndLocation({
          latitude: item?.startLocation.latitude,
          longitude: item?.startLocation.longitude,
          locationString: item?.startLocation.locationString,
        });
      })
      .catch(() => {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Greška pri prihvatanju vožnje',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
        });
        console.log('Error adding driver id to order');
      });
  };

  const getPendingOrders = async () => {
    const dbRef = ref(db, 'orders');
    onValue(dbRef, (snapshot) => {
      if (!snapshot.exists()) {
        return;
      }
      const orders = snapshot.val();
      console.log(orders);
      const ordersWithStatusPending = Object.values(orders).filter(
        (order) => order.status === 'pending' && order.driverId === ''
      );
      console.log('ORDERS WITH STATUS PENDING', ordersWithStatusPending);
      const newArr = ordersWithStatusPending.map((order) => {
        const startLocation = [
          order.startLocation.latitude,
          order.startLocation.longitude,
          order.startLocation.locationString,
        ];
        const endLocation = [
          order.endLocation.latitude,
          order.endLocation.longitude,
          order.endLocation.locationString,
        ];
        return {
          ...order,
          startLocation,
          endLocation,
        };
      });
      console.log('NEW ARR', newArr);
      setData(newArr);
    });
  };

  useEffect(() => {
    getPendingOrders();
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#fafafa',
      }}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
          >
            <AntDesign
              name='leftcircle'
              size={25}
              color='#ff6e2a'
              style={{
                zIndex: 1,
                elevation: 1,
              }}
            />
          </TouchableOpacity>
          <Text
            style={{
              zIndex: 1,
              elevation: 1,
              fontSize: 20,
              fontWeight: 'bold',
            }}
          >
            Vožnje
          </Text>
        </View>

        {!data.length && (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Text
              style={{
                fontSize: 25,
                fontWeight: 'bold',
                color: '#00000099',
              }}
            >
              Trenutno nema vožnji
            </Text>
          </View>
        )}
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <View
              style={{
                flex: 1,
                borderRadius: 10,
                borderWidth: 4,
                borderColor: '#00000050',
              }}
            >
              <View
                style={{
                  width: Dimensions.get('window').width - 50,
                  height: Dimensions.get('window').height / 4,
                  borderColor: '#00000050',
                  overflow: 'hidden',
                }}
              >
                <MapView
                  provider={PROVIDER_GOOGLE}
                  pitchEnabled={false}
                  rotateEnabled={false}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 10,
                    borderBottomEndRadius: 0,
                    borderBottomStartRadius: 0,
                  }}
                  initialRegion={{
                    latitude: item.startLocation[0],
                    longitude: item.startLocation[1],
                    latitudeDelta: process.env.EXPO_PUBLIC_LATITUDE_DELTA,
                    longitudeDelta: process.env.EXPO_PUBLIC_LONGITUDE_DELTA,
                  }}
                  ref={mapRef}
                  onMapReady={() => {
                    if (
                      item.startLocation === undefined ||
                      item.endLocation === undefined
                    )
                      return;
                    let minLat = item.startLocation[0];
                    let maxLat = item.endLocation[0];
                    let minLng = item.startLocation[1];
                    let maxLng = item.endLocation[1];

                    const northeast = { latitude: maxLat, longitude: maxLng };
                    const southwest = { latitude: minLat, longitude: minLng };

                    const bounds = [northeast, southwest];
                    mapRef.current.fitToCoordinates(bounds, {
                      edgePadding: {
                        top: 50,
                        right: 50,
                        bottom: 50,
                        left: 50,
                      },
                      animated: true,
                    });
                  }}
                >
                  <MapMarker
                    coordinate={{
                      latitude: item.startLocation[0],
                      longitude: item.startLocation[1],
                    }}
                    title='Your current location'
                    iconColor='#ff6e2a'
                  />
                  <MapMarker
                    coordinate={{
                      latitude: item.endLocation[0],
                      longitude: item.endLocation[1],
                    }}
                    title='Your current location'
                    iconColor='#ff6e2a'
                  />
                </MapView>
              </View>
              <View
                style={{
                  height: 50,
                  width: '100%',
                  marginVertical: 10,
                  paddingHorizontal: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#00000099',
                  }}
                >
                  {item.startLocation[2]} {'  -->  '}
                  {item.endLocation[2]}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: '#00000099',
                    }}
                  >
                    {item.distance} km
                  </Text>

                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: '#00000099',
                    }}
                  >
                    {item.price} din
                  </Text>
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#ff6e2a',
                    width: '100%',
                    height: 40,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                  }}
                  onPress={() => {
                    console.log('PRESSED');
                    assignOrder(item);
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: '#fafafa',
                    }}
                  >
                    Prihvati vožnju
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.orderId}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
  },

  header: {
    width: '100%',
    height: 60,
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    fontSize: 20,
    marginBottom: 20,
  },
});

export default Driver;
