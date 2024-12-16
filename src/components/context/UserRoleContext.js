import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const UserRoleContext = createContext();

// Create a provider component
export const UserRoleProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserRole(user.roles[0]); // Assuming the role is stored as 'roles[0]' in localStorage
    }
  }, []);

  return (
    <UserRoleContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </UserRoleContext.Provider>
  );
};

// Custom Hook to use the Header context
export const useUserRole = () => useContext(UserRoleContext);
