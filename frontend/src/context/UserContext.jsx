import React, { createContext, useState, useEffect, useContext } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');

    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const updateEmail = (newEmail) => {
    if (newEmail) {
      setEmail(newEmail);
      localStorage.setItem('userEmail', newEmail);
    } else {
      setEmail('');
      localStorage.removeItem('userEmail');
    }
  };

  const logout = () => {
    setEmail('');
    localStorage.removeItem('userEmail');
  };

  return (
    <UserContext.Provider
      value={{
        email,
        updateEmail,
        logout,
        loading,
        setLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
