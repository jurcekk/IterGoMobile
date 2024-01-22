import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { GOOGLE_MAPS_API_KEY } from '../../firebaseConfig';

const SuggestedLocations = ({
  location,
  suggestedList,
  setSuggestedList,
  setEndLocation,
  endLocation,
  setIsEndLocationVisible,
}) => {
  var rad = function (x) {
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

    // let distance;
    // const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${p1.latitude},${p1.longitude}&destinations=${p2.latitude},${p2.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
    // fetch(url)
    //   .then((response) => response.json())
    //   .then((data) => {
    //     console.log('DISTANCE', data.rows[0].elements[0].distance.text);
    //     distance = data.rows[0].elements[0].distance.text;
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });

    // return distance;
  };

  const getLocationString = async (desc) => {
    const location2 = await Location.geocodeAsync(desc);
    if (!location2) return null;
    return location2;
  };

  return (
    <FlatList
      data={suggestedList}
      keyExtractor={(item) => item?.properties['@id']}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={10}
      renderItem={({ item }) => {
        return (
          <View style={styles.container} key={item?.properties['@id']}>
            <FontAwesome5 name='search-location' size={30} color='#ff6e2a' />
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                // setEndLocation({
                //   latitude: item.location.latitude,
                //   longitude: item.location.longitude,
                //   latitudeDelta: 0.0922 / 4,
                //   longitudeDelta: 0.0421 / 4,
                //   locationString: item?.description,
                // });

                setEndLocation({
                  latitude:
                    item?.geometry?.coordinates[
                      (item?.geometry?.coordinates.length / 2).toFixed(0)
                    ][1],
                  longitude:
                    item?.geometry?.coordinates[
                      (item?.geometry?.coordinates.length / 2).toFixed(0)
                    ][0],
                  latitudeDelta: 0.0922 / 4,
                  longitudeDelta: 0.0421 / 4,
                  locationString: item?.properties['name:sr-Latn'],
                  distance: getDistance(location, {
                    latitude:
                      item?.geometry?.coordinates[
                        (item?.geometry?.coordinates.length / 2).toFixed(0)
                      ][1],
                    longitude:
                      item?.geometry?.coordinates[
                        (item?.geometry?.coordinates.length / 2).toFixed(0)
                      ][0],
                    latitudeDelta: 0.0922 / 4,
                    longitudeDelta: 0.0421 / 4,
                  }),
                });
                setIsEndLocationVisible(true);
                setSuggestedList([]);
              }}
            >
              <Text style={styles.text}>
                {item?.properties['name:sr-Latn']}
                {/* {item?.description} */}
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 16,
                color: 'black',
                fontWeight: 'bold',
                marginRight: 20,
              }}
            >
              {getDistance(
                location,
                {
                  latitude:
                    item?.geometry?.coordinates[
                      (item?.geometry?.coordinates.length / 2).toFixed(0)
                    ][1],
                  longitude:
                    item?.geometry?.coordinates[
                      (item?.geometry?.coordinates.length / 2).toFixed(0)
                    ][0],
                  latitudeDelta: 0.0922 / 4,
                  longitudeDelta: 0.0421 / 4,
                }
                // {
                //   latitude: item?.location?.latitude,
                //   longitude: item?.location?.longitude,
                //   locationString: item?.description,
                // }
              ) + ' km'}
            </Text>
          </View>
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
