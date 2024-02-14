import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';

const useUser = () => {
  const auth = FIREBASE_AUTH;
  const db = FIREBASE_DB;

  const getRole = async () => {
    const drRefUser = ref(db, 'users/' + auth.currentUser.uid);

    const snapshot = await get(drRefUser);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return data;
    } else {
      console.log('No data available');
    }

    return snapshot;
  };

  return getRole;
};

export default useUser;
