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

  const getLocationString = async (desc) => {
    // get location string from this link https://maps.googleapis.com/maps/api/geocode/json?latlng=44.4647452,7.3553838&key=YOUR_API_KEY
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${desc}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FlatList
      data={suggestedList}
      //item?.properties['@id']
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
          //item?.properties['@id']
          <TouchableOpacity
            style={styles.container}
            onPress={() => {
              setEndLocation({
                latitude: item?.coordinates?.lat,
                longitude: item?.coordinates?.lng,
                latitudeDelta: process.env.EXPO_PUBLIC_LATITUDE_DELTA,
                longitudeDelta: process.env.EXPO_PUBLIC_LONGITUDE_DELTA,
                locatonString: item?.streetName,
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

            <View>
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
              <Text style={{ fontSize: 14, color: 'gray', fontWeight: 'bold' }}>
                {((distance / 50) * 60).toFixed(0) + ' min'}
              </Text>
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
