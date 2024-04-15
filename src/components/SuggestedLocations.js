import React, { useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { GOOGLE_MAPS_API_KEY } from '../../firebaseConfig';
import { LocationContext } from '../context/LocationContext';
import { AntDesign } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

const SuggestedLocations = ({
  bottomSheetRef,
  suggestedList,
  setSuggestedList,
  setIsEndLocationVisible,
}) => {
  const { location, setLocation, endLocation, setEndLocation } =
    useContext(LocationContext);

  const rad = function (x) {
    return (x * Math.PI) / 180;
  };

  var getDistance = function (p1, p2) {
    var R = 6378137;
    var dLat = rad(p2.latitude - p1.latitude);
    var dLong = rad(p2.longitude - p1.longitude);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(p1.latitude)) *
        Math.cos(rad(p2.latitude)) *
        Math.sin(dLong / 2) *
        Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return (d / 1000).toFixed(2);
  };

  return (
    <FlatList
      data={suggestedList}
      keyExtractor={(item) => item?.place_id}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={10}
      renderItem={({ item }) => {
        const distance = getDistance(location, {
          latitude: item?.coordinates?.lat,
          longitude: item?.coordinates?.lng,
          latitudeDelta: 0.0922 / 4,
          longitudeDelta: 0.0421 / 4,
        });
        return (
          <TouchableOpacity
            style={[
              styles.container,
              distance < 1 && {
                backgroundColor: '#00000030',
              },
            ]}
            onPress={() => {
              if (distance < 1) {
                Toast.show({
                  type: 'error',
                  text1: 'Greška',
                  text2: 'Nije moguće izabrati lokaciju koja je bliža od 1 km',
                });

                return;
              }
              setEndLocation({
                latitude: item?.coordinates?.lat,
                longitude: item?.coordinates?.lng,
                latitudeDelta: process.env.EXPO_PUBLIC_LATITUDE_DELTA,
                longitudeDelta: process.env.EXPO_PUBLIC_LONGITUDE_DELTA,
                locationString: item?.streetName,
                distance: distance,
              });
              setIsEndLocationVisible(true);
              setSuggestedList([]);
              bottomSheetRef.current.snapToPosition('30%');
            }}
            key={item?.place_id}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <FontAwesome5 name='search-location' size={30} color='#ff6e2a' />

              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <Text style={styles.text}>{item?.streetName}</Text>
                <Text
                  style={[
                    styles.text,
                    {
                      fontSize: 14,
                      color: 'gray',
                      fontWeight: 'bold',
                    },
                  ]}
                >
                  {(distance * 150 + 150).toFixed(0) + ' din'}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              {distance < 1 && (
                <AntDesign name='exclamationcircle' size={24} color='#FF0000' />
              )}

              <View
                style={{
                  paddingRight: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: 'black',
                    fontWeight: 'bold',
                    marginRight: 20,
                  }}
                >
                  {distance + ' km'}
                </Text>

                <Text
                  style={{
                    fontSize: 14,
                    color: 'gray',
                    fontWeight: 'bold',
                  }}
                >
                  {((distance / 50) * 60).toFixed(0) + ' min'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    width: '100%',
    paddingLeft: 8,
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 15,
  },

  text: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
  },

  button: {
    flex: 1,
    justifyContent: 'center',
    paddginLeft: 10,
  },
});

export default SuggestedLocations;
