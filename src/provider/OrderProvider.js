import React, { createContext, useState, useEffect } from 'react';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';

const OrderContext = createContext();
const OrderProvider = (props) => {
  const auth = FIREBASE_AUTH;
  const db = FIREBASE_DB;
  const [order, setOrder] = useState(null);

  useEffect(() => {
    checkOrder();
  }, []);

  function checkOrder() {
    try {
      if (user) {
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

  return (
    <OrderContext.Provider
      value={{
        order,
      }}
    >
      {props.children}
    </OrderContext.Provider>
  );
};

export { OrderContext, OrderProvider };
