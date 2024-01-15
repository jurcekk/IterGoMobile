import { get, ref, set, push, onValue } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../firebaseConfig';

const useOrder = () => {
  const db = FIREBASE_DB;
  const auth = FIREBASE_AUTH;

  const checkIfUserHasActiveOrder = async () => {
    const snapshot = await get(ref(db, 'orders'));

    if (snapshot.exists()) {
      const orders = snapshot.val();
      const order = Object.values(orders).find(
        (order) =>
          order.userId === auth.currentUser.uid && order.status === 'pending'
      );
      return order ? true : false;
    } else {
      return false;
    }
  };

  const cancelOrder = () => {
    get(ref(db, 'orders'))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const orders = snapshot.val();
          const order = Object.values(orders).find(
            (order) =>
              order.userId === auth.currentUser.uid &&
              order.status === 'pending'
          );

          if (!order)
            return console.log(
              'No order found with that id and status pending'
            );

          set(ref(db, 'orders/' + order?.orderId + '/status'), 'canceled')
            .then(() => {
              console.log('Order status changed to canceled');
            })
            .catch(() => {
              console.log('Error changing order status to canceled:');
            });
        } else {
          console.log('No data available');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getOrderStatus = async () => {
    const snapshot = await get(ref(db, 'orders'));
    if (snapshot.exists()) {
      const orders = snapshot.val();
      const order = Object.values(orders).find(
        (order) =>
          order.userId === auth.currentUser.uid && order.status !== 'canceled'
      );
      return order;
    } else {
      console.log('No data available');
    }
  };

  const createOrder = (location, endLocation) => {
    const order = {
      orderId: '',
      userId: auth.currentUser.uid,
      driverId: '',
      taxiId: '',
      status: 'pending',
      startLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      endLocation: {
        latitude: endLocation.latitude,
        longitude: endLocation.longitude,
      },
    };

    const orderRef = push(ref(db, 'orders'));
    order.orderId = orderRef.key;
    set(orderRef, order)
      .then(() => {
        console.log('Order stored in database');
      })
      .catch(() => {
        console.log('Error storing order in database:');
      });
  };

  return {
    cancelOrder,
    getOrderStatus,
    createOrder,
    checkIfUserHasActiveOrder,
  };
};

export default useOrder;
