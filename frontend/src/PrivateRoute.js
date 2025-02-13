import React from 'react';
import { Navigate } from 'react-router-dom';

// Componente de ruta privada que verifica si hay un token en localStorage
const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem('token');

  return token ? element : <Navigate to="/login" />;
};

export default PrivateRoute;
