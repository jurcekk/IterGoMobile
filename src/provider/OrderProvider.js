import React, { createContext, useState, useEffect, useContext } from 'react';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';
import { AuthContext } from './AuthProvider';
import { get, onValue, push, ref, set } from 'firebase/database';
import { LocationContext } from '../context/LocationContext';

// ORDER STATUS LIST
// pending - waiting for a driver to accept the order
// accepted - driver has accepted the order
// completed - driver has completed the order
// canceled - user has canceled the order

const OrderContext = createContext();
const OrderProvider = (props) => {
  const { userData } = useContext(AuthContext);
  const { location, endLocation } = useContext(LocationContext);
  const [order, setOrder] = useState(null);

  const auth = FIREBASE_AUTH;
  const db = FIREBASE_DB;

  const getAllUserOrders = async () => {
    const snapshot = await get(ref(db, 'orders'));
    if (snapshot.exists()) {
      const orders = snapshot.val();
      const userOrders = Object.values(orders).filter(
        (order) => order.userId === auth.currentUser.uid
      );
      return userOrders?.length;
    } else {
      console.log('No data available');
    }
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

  const createOrder = async () => {
    const order = {
      orderId: '',
      userId: auth.currentUser.uid,
      driverId: '',
      taxiId: '',
      status: 'pending',
      startLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
        locationString: location?.locationString,
      },
      endLocation: {
        latitude: endLocation.latitude,
        longitude: endLocation.longitude,
        locationString: endLocation?.locationString,
      },
      distance: endLocation.distance,
      price: 150 + endLocation.distance * 100,
    };

    const orderRef = push(ref(db, 'orders'));
    order.orderId = orderRef.key;
    orderKey = orderRef.key;

    set(orderRef, order)
      .then(() => {
        console.log('Order stored in database');
        setOrder(order);
      })
      .catch(() => {
        console.log('Error storing order in database:');
      });
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

  function checkOrder() {
    try {
      if (userData) {
        const dbRef = ref(db, 'orders');
        onValue(dbRef, (snapshot) => {
          if (!snapshot.exists()) {
            return;
          }
          const orders = snapshot.val();
          const order = Object.values(orders).find((order) => {
            console.log(order);
            console.log(auth.currentUser.uid);
            return (
              (order.userId === auth.currentUser.uid &&
                order.status === 'accepted') ||
              (order.driverId === auth.currentUser.uid &&
                order.status === 'accepted')
            );
          });
          setOrder(order);
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    checkOrder();
  }, [userData]);

  useEffect(() => {
    if (!order) return;
    try {
      const timer = setTimeout(() => {
        cancelOrder();
      }, 10000);

      onValue(ref(db, 'orders/' + order.orderId + '/status'), (snapshot) => {
        if (!snapshot.exists()) {
          return;
        }
        const order = snapshot.val();
        if (order === 'canceled') {
          setOrder(null);
        } else if (order === 'accepted') {
          console.log('Order accepted');
          clearTimeout(timer);
        }
      });
      return () => clearTimeout(timer);
    } catch (e) {
      console.log(e);
    }
  }, [order]);

  return (
    <OrderContext.Provider
      value={{
        order,
        getOrderStatus,
        cancelOrder,
        createOrder,
        checkIfUserHasActiveOrder,
        getAllUserOrders,
      }}
    >
      {props.children}
    </OrderContext.Provider>
  );
};

export { OrderContext, OrderProvider };
