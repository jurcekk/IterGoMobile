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
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import MapMarker from '../components/MapMarker';
import { OrderContext } from '../provider/OrderProvider';
import MapViewDirections from 'react-native-maps-directions';
import { GOOGLE_MAPS_API_KEY } from '../../firebaseConfig';

const UserOrders = () => {
  const { setOrder, userOrders } = useContext(OrderContext);

  const navigation = useNavigation();
  const mapRef = useRef(null);

  const centerMap = (item) => {
    if (item.startLocation === undefined || item.endLocation === undefined) {
      return;
    }

    let minLat = item.startLocation.latitude.toFixed(6);
    let maxLat = item.endLocation.latitude.toFixed(6);
    let minLng = item.startLocation.longitude.toFixed(6);
    let maxLng = item.endLocation.longitude.toFixed(6);

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
  };

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

        {!userOrders.length && (
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
              Još uvek nemate vožnji
            </Text>
          </View>
        )}
        <FlatList
          data={userOrders}
          renderItem={({ item }) => {
            return (
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
                      latitude: item.startLocation.latitude,
                      longitude: item.startLocation.longitude,
                      latitudeDelta: process.env.EXPO_PUBLIC_LATITUDE_DELTA,
                      longitudeDelta: process.env.EXPO_PUBLIC_LONGITUDE_DELTA,
                    }}
                    ref={mapRef}
                    onMapReady={() => centerMap(item)}
                  >
                    <MapMarker
                      coordinate={{
                        latitude: item.startLocation.latitude,
                        longitude: item.startLocation.longitude,
                      }}
                      iconColor='#ff6e2a'
                    />
                    <MapMarker
                      coordinate={{
                        latitude: item.endLocation.latitude,
                        longitude: item.endLocation.longitude,
                      }}
                      iconColor='#ff6e2a'
                    />
                    <MapViewDirections
                      origin={{
                        latitude: item.startLocation?.latitude,
                        longitude: item.startLocation?.longitude,
                      }}
                      destination={{
                        latitude: item.endLocation?.latitude,
                        longitude: item.endLocation?.longitude,
                      }}
                      apikey={GOOGLE_MAPS_API_KEY}
                      strokeColor='#ff6e2a'
                      strokeWidth={3}
                      mode='DRIVING'
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
                    {item.startLocation.locationString} {'  -->  '}
                    {item.endLocation.locationString}
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
                  {/* <TouchableOpacity
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
                  </TouchableOpacity> */}
                </View>
              </View>
            );
          }}
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

export default UserOrders;
