import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const PrivateRoute: React.FC = () => {
    const authContext = useContext(AuthContext);

    if (!authContext) {
        return null; // Sau puteți afișa un mesaj de eroare sau o redirecționare către o pagină de eroare
    }

    const { isAuthenticated } = authContext;

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
