import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';
import { get, ref } from 'firebase/database';

const AuthContext = createContext();
const AuthProvider = (props) => {
  const auth = FIREBASE_AUTH;
  const db = FIREBASE_DB;
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    checkLogin();
  }, []);

  function checkLogin() {
    onAuthStateChanged(auth, (u) => {
      if (u) {
        console.log('LOGIN');
        const dbRef = ref(db, 'users/' + u.uid);
        get(dbRef).then((snapshot) => {
          if (!snapshot.exists()) {
            return;
          }
          const userValue = snapshot.val();
          console.log(JSON.stringify(userValue, null, 2));
          setUser(true);
          setUserData(userValue);
        });
      } else {
        setUser(false);
        signOut(auth);
      }
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
