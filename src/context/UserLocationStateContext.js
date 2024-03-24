import React, { createContext, useContext, useState } from 'react';

const useUserLocationStateContextValue = () => {
  const [location, setLocation] = useState();
  const [endLocation, setEndLocation] = useState();

  return { location, setLocation, endLocation, setEndLocation };
};

const UserLocationStateContext = createContext(null);

export const UserLocationStateContextProvider = ({ children }) => {
  const userLocationStateContextValue = useUserLocationStateContextValue();

  return (
    <UserLocationStateContext.Provider value={userLocationStateContextValue}>
      {children}
    </UserLocationStateContext.Provider>
  );
};

export const useUserLocationStateContext = () => {
  const context = useContext(UserLocationStateContext);

  if (!context) {
    throw new Error(
      'useUserLocationStateContext must be used inside UserLocationStateContextProvider'
    );
  }

  return context;
};
