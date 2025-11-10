import { createContext, useContext } from 'react';
import { useState } from 'react';
import LoadingScreen from '../pages/loading';

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});

  const logout = () => {
    setUser({});
    return true;
  };

  const contextValue = {
    loading,
    setLoading,
    user,
    setUser,
    logout
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {loading && <LoadingScreen />}
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
