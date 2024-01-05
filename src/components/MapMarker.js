import React from 'react';
import { View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Marker } from 'react-native-maps';

const MapMarker = ({ coordinate, title, iconColor }) => {
  return (
    <Marker coordinate={coordinate} title={title}>
      <View>
        <FontAwesome5 name='map-marker-alt' size={40} color={iconColor} />
      </View>
    </Marker>
  );
};

export default MapMarker;
