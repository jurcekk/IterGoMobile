import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BottomSheet from '@gorhom/bottom-sheet';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';
import { ref, get, onValue } from 'firebase/database';
import useOrder from '../hooks/useOrder';
import useDistance from '../hooks/useDistance';

const ActiveOrderSheet = ({ setEndLocation, setIsEndLocationVisible }) => {
  const [activeOrder, setActiveOrder] = useState(null);
  const [driverData, setDriverData] = useState(null);

  // const { checkIfUserHasActiveOrder } = useOrder();
  const { getDistance } = useDistance();

  const activeOrderSheetRef = useRef(null);
  const navigation = useNavigation();

  const auth = FIREBASE_AUTH;
  const db = FIREBASE_DB;

  const snapPointsActiveOrder = useMemo(() => ['40%'], []);

  const handleOpen = useCallback(() => {
    activeOrderSheetRef.current.snapToIndex(0);
  }, []);

  const handleClose = useCallback(() => {
    activeOrderSheetRef.current.close();
  }, []);

  const getTime = () => {
    const distance = getDistance(
      {
        latitude: activeOrder?.startLocation?.latitude,
        longitude: activeOrder?.startLocation?.longitude,
      },
      {
        latitude: driverData?.location?.latitude,
        longitude: driverData?.location?.longitude,
      }
    );

    return Math.round((distance / 30) * 60);
  };

  const getDriverData = (driverId) => {
    try {
      const dbRef = ref(db, 'users/' + driverId);
      get(dbRef).then((snapshot) => {
        if (!snapshot.exists()) {
          return;
        }
        const user = snapshot.val();
        console.log('DRIVER', user);
        setDriverData(user);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const checkOrder = () => {
    try {
      const dbRef = ref(db, 'orders');

      const drRefUser = ref(db, 'users/' + auth.currentUser.uid);

      get(drRefUser).then((snapshot) => {
        if (!snapshot.exists()) {
          return;
        }
        const user = snapshot.val();
        if (user.role === 'driver') return;
        onValue(dbRef, (snapshot) => {
          if (!snapshot.exists()) {
            return;
          }
          const orders = snapshot.val();
          const order = Object.values(orders).find(
            (order) =>
              order.userId === auth.currentUser.uid &&
              order.status === 'accepted' &&
              order.driverId !== ''
          );
          console.log('order', order);

          if (order?.status === 'accepted') {
            handleOpen();
            getDriverData(order?.driverId);
            setActiveOrder(order);

            setEndLocation({
              latitude: order?.endLocation?.latitude,
              longitude: order?.endLocation?.longitude,
            });

            setIsEndLocationVisible(true);
          } else {
            handleClose();
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkOrder();
  }, []);

  return (
    <BottomSheet
      ref={activeOrderSheetRef}
      index={-1}
      snapPoints={snapPointsActiveOrder}
      style={styles.bottomSheet}
      keyboardBehavior='interactive'
    >
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Aktivna vožnja</Text>
          <Text style={styles.subHeaderText}>
            {activeOrder?.endLocation?.locationString} {activeOrder?.distance}{' '}
            km
          </Text>
        </View>

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {activeOrder && driverData && getTime()} min
          </Text>
        </View>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.profileContainer}>
          <View style={styles.profileIconContainer}>
            <Text style={styles.profileIconText}>
              {driverData?.firstName[0]}
            </Text>
          </View>

          <View style={styles.profileInfoContainer}>
            <Text style={styles.profileInfoText}>
              {driverData?.firstName} {driverData?.lastName}
            </Text>
            <Text style={styles.profileInfoTextBold}>
              {driverData?.vehicle?.licencePlate}
            </Text>
            <Text style={styles.profileInfoText}>
              {driverData?.vehicle?.model}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => {
            Linking.openURL(`tel:${driverData?.phone}`);
          }}
        >
          <Text style={styles.callButtonText}>Pozovi vozača</Text>
          <FontAwesome5 name='phone' size={20} color='white' />
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderColor: '#E5E5E5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  subHeaderText: {
    fontSize: 14,
    alignSelf: 'flex-start',
  },
  timerContainer: {
    height: 40,
    width: 40,
    borderRadius: 10,
    backgroundColor: '#ff6e2a',
  },
  timerText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    padding: 3,
  },
  contentContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#E5E5E5',
  },
  profileContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileIconContainer: {
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: '#ff6e2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconText: {
    color: 'white',
    textAlign: 'center',
    padding: 15,
    fontSize: 25,
    fontWeight: 'bold',
  },
  profileInfoContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginLeft: 10,
    alignItems: 'flex-end',
    gap: 2,
  },
  profileInfoText: {
    fontSize: 14,
    color: '#666',
  },
  profileInfoTextBold: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  callButton: {
    height: 40,
    width: '70%',
    borderRadius: 10,
    backgroundColor: '#ff6e2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 15,
  },
  callButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    padding: 3,
  },
});

export default ActiveOrderSheet;
