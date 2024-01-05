import React from 'react';
import { View, Modal, Text, StyleSheet, TouchableOpacity } from 'react-native';

const NoDriverModal = ({ visible, onCancel }) => (
  <Modal visible={visible} onRequestClose={onCancel} transparent>
    <View style={styles.container}>
      <Text
        style={{
          color: '#fafafa',
          fontSize: 20,
          fontWeight: 'bold',
          marginBottom: 20,
        }}
      >
        Trenutno nema dostupnih vozača.
      </Text>
      <Text
        style={{
          color: '#fafafa',
          fontSize: 20,
          fontWeight: 'bold',
          marginBottom: 20,
        }}
      >
        Molimo Vas da pokušate kasnije.
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: '#fff',
          padding: 10,
          borderRadius: 10,
          marginTop: 10,
        }}
        onPress={onCancel}
      >
        <Text>Vrati se na početni ekran.</Text>
      </TouchableOpacity>
    </View>
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

export default NoDriverModal;
