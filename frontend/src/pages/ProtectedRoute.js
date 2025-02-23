// components/ProtectedRoute.js
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const usuarioId = localStorage.getItem('usuarioId');

      if (!token || !usuarioId) {
        setIsAuthenticated(false);
      } else {
        try {
          setIsAuthenticated(response.ok);
        } catch (error) {
          console.error('Error verificando autenticación:', error);
          setIsAuthenticated(false);
        }
      }
      setIsChecking(false);
    };

    checkAuth();
  }, []);

  if (isChecking) {
    return <div className="loading-screen">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;