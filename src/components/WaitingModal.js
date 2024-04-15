import React from 'react';
import { View, Modal, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import Toast from 'react-native-toast-message';

const WaitingModal = ({ visible, onCancel }) => (
  <Modal visible={visible} onRequestClose={onCancel} transparent>
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require('../../assets/car.gif')}
        contentFit='scale-down'
        transition={500}
      />
      <TouchableOpacity
        style={{
          backgroundColor: '#fff',
          padding: 10,
          borderRadius: 10,
          marginTop: 10,
        }}
        onPress={onCancel}
      >
        <Text>Otkaži</Text>
      </TouchableOpacity>
    </View>
    <Toast />
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff6e2a',
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    width: '100%',
    height: 300,
    borderRadius: 10,
  },
});

export default WaitingModal;
