import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebaseConfig';
import { get, ref } from 'firebase/database';

const LocationContext = createContext();
const LocationProvider = (props) => {
  const auth = FIREBASE_AUTH;
  const db = FIREBASE_DB;

  const getLocationString = async (desc) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${desc}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      console.log('ADRESA', data?.results[0]?.formatted_address.split(',')[0]);

      return data?.results[0]?.formatted_address.split(',')[0];
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        endLocation,
      }}
    >
      {props.children}
    </LocationContext.Provider>
  );
};

export { LocationContext, LocationProvider };
