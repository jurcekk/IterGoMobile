import React, { useEffect } from 'react';
import { View, Modal, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';

const DriverAccepted = ({ visible, onClose }) => {

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        onClose();
      }, 5000);
    }
  }, []);

  return (
    <Modal visible={visible} onRequestClose={onClose} transparent>
      <View style={styles.container}>
        <Image
          style={styles.image}
          source={require('../../assets/confetti.gif')}
          contentFit='scale-down'
          transition={500}
        />
        <Text style={{ color: '#fff', fontSize: 26, fontWeight: 'bold' }}>
          Vozač je prihvatio vaš zahtev
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#fff',
            padding: 10,
            borderRadius: 10,
            marginTop: 10,
          }}
          onPress={onClose}
        >
          <Text>Zatvori</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff6e2a',
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    width: '100%',
    height: 500,
    borderRadius: 10,
    margin: 40,
  },
});

export default DriverAccepted;
