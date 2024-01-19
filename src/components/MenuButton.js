import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    width: 60,
    height: 60,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
    position: 'absolute',
    top: 50,
    left: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,

    elevation: 7,
  },
});

export default RoundButton;
