import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';
import { get, ref } from 'firebase/database';

const AuthContext = createContext();
const AuthProvider = (props) => {
  const auth = FIREBASE_AUTH;
  const db = FIREBASE_DB;
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  const checkLogin = () => {
    onAuthStateChanged(auth, (u) => {
      if (u) {
        console.log('LOGIN');
        const dbRef = ref(db, 'users/' + auth?.currentUser?.uid);

        get(dbRef).then((snapshot) => {
          if (!snapshot.exists()) {
            console.log('No data available');
            return;
          }
          const userValue = snapshot.val();
          console.log('USER VALUE', JSON.stringify(userValue, null, 2));
          if (userValue?.phone === '') {
            setUser('onBoarding');
          } else {
            setUser('true');
          }

          setUserData(userValue);
        });
      } else {
        setUser('false');
        setUserData(null);

        signOut(auth);
      }
    });
  };

  useEffect(() => {
    checkLogin();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        userData,
        setUserData,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
