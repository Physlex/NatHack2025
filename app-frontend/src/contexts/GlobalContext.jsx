import { createContext, useContext } from 'react';
import { useState } from 'react';
import LoadingScreen from '../pages/loading';

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Researcher'
  });

  const logout = () => {
    // Clear any stored authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Clear user state
    setUser(null);
    
    // Navigate to home/login page
    // Note: We'll need to use this in components that have access to navigate
    return true; // Return success indicator
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
