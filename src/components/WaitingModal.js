import React, { useEffect, useContext } from 'react';
import {
  View,
  Modal,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import Toast from 'react-native-toast-message';
import { OrderContext } from '../provider/OrderProvider';

const WaitingModal = ({ visible, onCancel }) => {
  const { order, setOrder } = useContext(OrderContext);
  useEffect(() => {
    if (order?.status === 'canceled') {
      Alert.alert(
        'Narudžba je otkazana',
        'Vaša narudžba je otkazana zbog nedostupnosti vozača.',
        [
          {
            text: 'OK',
            onPress: () => {
              onCancel();
              setOrder(null);
            },
          },
        ]
      );
    }
  }, [order]);

  return (
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
    height: 300,
    borderRadius: 10,
  },
});

export default WaitingModal;
