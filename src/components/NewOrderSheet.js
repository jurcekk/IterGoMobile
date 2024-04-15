import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useContext,
} from 'react';
import {
  View,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  TextInput,
  Text,
} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';

import { FontAwesome5 } from '@expo/vector-icons';

import SuggestedLocations from './SuggestedLocations';

import * as Haptics from 'expo-haptics';

import Toast from 'react-native-toast-message';
import { LocationContext } from '../context/LocationContext';
import { OrderContext } from '../provider/OrderProvider';
import * as streets from '../data/streets.json';

const NewOrderSheet = ({
  bottomSheetRef,
  handleClose,
  setIsEndLocationVisible,
}) => {
  const [suggestedList, setSuggestedList] = useState([]);
  const timeoutRef = useRef(null);
  // const [intervalId, setIntervalId] = useState(null);
  const endLocationRef = useRef(null);

  const snapPoints = useMemo(() => ['50%', '90%'], []);

  const { checkOrderStatus, createOrder, checkIfUserHasActiveOrder } =
    useContext(OrderContext);

  const { location, setLocation, endLocation, setEndLocation } =
    useContext(LocationContext);

  const handleOnFocusKeyboard = useCallback(() => {
    bottomSheetRef.current.snapToPosition('90%');
  }, []);

  // const checkOrderStatus = async () => {
  //   try {
  //     const MAX_CHECKS = 20;
  //     let checks = 0;

  //     const interval = setInterval(async () => {
  //       checks++;

  //       const order = await getOrderStatus();
  //       console.log('order:', order);
  //       if (order.status === 'accepted') {
  //         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  //         Toast.show({
  //           type: 'success',
  //           position: 'top',
  //           text1: 'Uspešno',
  //           text2: 'Vozač je prihvatio vaš zahtev',
  //           topOffset: 60,
  //         });
  //         setWaitingModalVisible(false);

  //         clearInterval(interval);
  //       } else if (checks === MAX_CHECKS) {
  //         Toast.show({
  //           type: 'error',
  //           position: 'top',
  //           text1: 'Greška',
  //           text2: 'Nema slobodnih vozača',
  //           topOffset: 60,
  //         });

  //         setWaitingModalVisible(false);
  //         setNoDriverModalVisible(true);
  //         clearInterval(interval);
  //         cancelOrder();
  //       }
  //     }, 1000);
  //     setIntervalId(interval);
  //   } catch (error) {
  //     console.error('Greška:', error);
  //     setWaitingModalVisible(false);
  //   }
  // };

  const handleInputChanges = (text) => {
    bottomSheetRef.current.snapToPosition('90%');

    setEndLocation((prevState) => {
      return {
        ...prevState,
        locationString: text,
      };
    });
    if (text.length < 3) return;
    clearTimeout(timeoutRef.current);
    let timer;
    if (streets.default.newArr) {
      timer = setTimeout(() => {
        const result = streets?.default?.newArr.filter((item) =>
          item?.streetName?.toLowerCase().includes(text.toLowerCase())
        );
        setSuggestedList(result);
      }, 1000);
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      style={styles.bottomSheet}
      keyboardBehavior='interactive'
    >
      <View
        style={{
          height: 200,
          backgroundColor: 'white',
          padding: 20,
          borderBottomWidth: 2,
          borderColor: '#E5E5E5',
        }}
        automaticallyAdjustContentInsets={true}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
          }}
        >
          <View
            style={{
              alignItems: 'center',
              height: 110,
              paddingVertical: 15,
              marginRight: 10,
            }}
          >
            <FontAwesome5 name='user-circle' size={20} color='#ff6e2a' />
            <View
              style={{
                width: 1,
                flex: 1,
                backgroundColor: '#ff6e2a',
                marginVertical: 8,
              }}
            ></View>
            <FontAwesome5 name='map-marker-alt' size={24} color='#ff6e2a' />
          </View>

          <View
            style={{
              flex: 1,
              height: 110,
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <TextInput
              style={[styles.textInput, { backgroundColor: '#a7a7a7' }]}
              placeholderTextColor={'gray'}
              placeholder='Trenutna lokacija'
              editable={false}
            />
            <View>
              <TextInput
                ref={endLocationRef}
                style={styles.textInput}
                placeholder='Željena destinacija?'
                onChangeText={handleInputChanges}
                onFocus={handleOnFocusKeyboard}
                value={endLocation?.locationString}
              />
              {endLocation?.locationString && (
                <View style={styles.clearIconContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      setEndLocation(null);
                      setSuggestedList([]);
                      bottomSheetRef.current.snapToPosition('30%');
                      Keyboard.dismiss();
                    }}
                    style={{
                      marginRight: 10,
                    }}
                  >
                    <FontAwesome5 name='times' size={20} color='gray' />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={async () => {
                if (await checkIfUserHasActiveOrder()) {
                  Toast.show({
                    type: 'error',
                    position: 'top',
                    text1: 'Greška',
                    text2: 'Već imate aktivnu vožnju',
                    topOffset: 60,
                  });
                  return;
                }
                if (
                  !endLocation?.locationString ||
                  !endLocation.latitude ||
                  !endLocation.longitude
                ) {
                  Toast.show({
                    type: 'error',
                    position: 'top',
                    text1: 'Greška',
                    text2: 'Morate uneti ispravnu destinaciju',
                    topOffset: 60,
                  });
                  return;
                }

                handleClose();
                setIsEndLocationVisible(true);
                createOrder(location, endLocation).then(() => {
                  checkOrderStatus();
                });
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>
                Pozovi vozilo
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <SuggestedLocations
        bottomSheetRef={bottomSheetRef}
        suggestedList={suggestedList}
        setSuggestedList={setSuggestedList}
        setIsEndLocationVisible={setIsEndLocationVisible}
      />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  bottomSheet: {
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    backgroundColor: '#f2f2f2',
    elevation: 7,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 10,
    fontSize: 16,
    lineHeight: 20,
    padding: 8,
    backgroundColor: 'rgba(151, 151, 151, 0.25)',
  },

  textInput: {
    alignSelf: 'stretch',
    marginHorizontal: 6,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#E2E2E2',
  },

  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },

  errorText: {
    color: 'red',
    fontSize: 12,
    alignSelf: 'flex-start',
  },

  submitButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#ff6e2a',
    padding: 10,
    borderRadius: 10,
    margin: 10,
    width: '100%',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },

  orderButton: {
    // position: 'absolute',
    // bottom: 70,
    // right: 40,
    borderWidth: 1,
    borderColor: '#fafafa',
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff6e2a',
  },

  clearIconContainer: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
});

export default NewOrderSheet;
