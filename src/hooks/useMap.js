import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale } from 'react-native-size-matters';

import { mapRideSheetIndexToMapPadding } from 'constants/bottomSheetSnapPoints';
import { LocationContext } from '../context/LocationContext';

const LATITUDE_DELTA = 0.0922 / 4;
const LONGITUDE_DELTA = 0.0421 / 4;

export const useMap = () => {
  const mapRef = useRef(null);
  const [mapMarkers, setMapMarkers] = useState([]);
  const [mapDirections, setMapDirections] = useState();
  const insets = useSafeAreaInsets();

  const { userLocation, setUserLocation } = useContext(LocationContext);

  const isRouteVisible = mapMarkers.length === 2;

  const centerToUserLocation = useCallback(() => {
    if (userLocation) {
      mapRef.current?.animateToRegion({
        longitude: userLocation.coords.longitude,
        latitude: userLocation.coords.latitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    }
  }, [userLocation]);

  useEffect(() => {
    centerToUserLocation();
  }, [centerToUserLocation]);

  const closeDestinationModal = () => {
    setModalVisible(false);
  };

  const handleUserLocationChange = ({ nativeEvent: { coordinate } }) => {
    if (coordinate) {
      setUserLocation({
        coords: {
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
        },
      });
    }
  };

  const handleMapSearchBarPress = () => {
    setModalVisible(true);
  };

  const handlePlaceItemPress = (coords) => {
    if (userLocation?.coords) {
      setMapMarkers([userLocation?.coords, coords]);
      setModalVisible(false);
    }
  };

  const handleMapDirectionsReady = (routeInfo) => {
    setMapDirections(routeInfo);
  };

  const handleRoundButtonPress = () => {
    if (isRouteVisible) {
      setMapMarkers([]);
      centerToUserLocation();
    }
  };

  const handleBottomSheetChange = (index) => {
    if (mapDirections?.coordinates) {
      mapRef.current?.fitToCoordinates(mapDirections?.coordinates, {
        edgePadding: {
          top: insets.top + scale(30),
          bottom: mapRideSheetIndexToMapPadding[index],
          left: scale(15),
          right: scale(15),
        },
      });
    }
  };

  return {
    models: {
      mapRef,
      modalVisible,
      mapMarkers,
      isRouteVisible,
      mapDirections,
    },
    operations: {
      handleUserLocationChange,
    },
  };
};
