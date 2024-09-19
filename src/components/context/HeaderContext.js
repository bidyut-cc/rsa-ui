import { createContext, useState, useContext, useEffect } from 'react';

// Create Context
export const HeaderContext = createContext();

// Create Provider component
export const HeaderProvider = ({ children }) => {
    const [headerTitle, setHeaderTitle] = useState('RSA Admin'); // Default title

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            const { first_name, last_name } = JSON.parse(user);
            setHeaderTitle(`${first_name} ${last_name}`);
        }
    }, []);

    return (
        <HeaderContext.Provider value={{ headerTitle, setHeaderTitle }}>
            {children}
        </HeaderContext.Provider>
    );
};

// Custom Hook to use the Header context
export const useHeader = () => useContext(HeaderContext);
