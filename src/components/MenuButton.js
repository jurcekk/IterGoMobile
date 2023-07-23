import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { scale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/Ionicons';

import { StyleSheet, TouchableOpacity } from 'react-native';

const RoundButton = ({ icon, onPress }) => {
  const insets = useSafeAreaInsets();
  return (
    <TouchableOpacity
      insets={insets}
      onPress={onPress}
      style={styles.container}
    >
      <Icon name={icon} size={27} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 45,
    height: 45,
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    position: 'absolute',
    top: 70,
    left: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,

    elevation: 7,
    //   ...theme.shadows.primary(theme),
  },
});

export default RoundButton;
