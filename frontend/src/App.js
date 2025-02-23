import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Route, 
  Routes, 
  Navigate,
  useLocation
} from 'react-router-dom';

// Importar componentes
import Login from './components/Login';
import Camisetas from './components/Camisetas';
import DetalleCamiseta from './components/DetalleCamiseta';
import EstadisticasCamisetas from './components/EstadisticasCamisetas';
import SharedCollection from './components/SharedCollection';
import Loading from './components/Loading';

// Componente de transición
const PageTransition = React.memo(({ children }) => {
  return (
    <div className="page-transition">
      {children}
    </div>
  );
});

PageTransition.displayName = 'PageTransition';

// Componente ProtectedRoute simplificado
const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Simulamos una pequeña demora para evitar parpadeos
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isChecking) {
    return <Loading />;
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Verificar si hay token en localStorage
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    setIsInitializing(false);

    // Evento para sincronizar estado entre pestañas
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        setIsLoggedIn(!!e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (isInitializing) {
    return <Loading />;
  }

  return (
    <Router>
      <div className="page-container">
        <Routes>
          <Route 
            path="/" 
            element={
              isLoggedIn ? 
                <Navigate to="/camisetas" replace /> : 
                <Navigate to="/login" replace />
            } 
          />

          <Route 
            path="/login" 
            element={
              isLoggedIn ? (
                <Navigate to="/camisetas" replace />
              ) : (
                <PageTransition>
                  <Login setIsLoggedIn={setIsLoggedIn} />
                </PageTransition>
              )
            } 
          />

          <Route 
            path="/camisetas" 
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Camisetas />
                </PageTransition>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/camiseta/:id" 
            element={
              <ProtectedRoute>
                <PageTransition>
                  <DetalleCamiseta />
                </PageTransition>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/estadisticas-camisetas" 
            element={
              <ProtectedRoute>
                <PageTransition>
                  <EstadisticasCamisetas />
                </PageTransition>
              </ProtectedRoute>
            } 
          />

          {/* Ruta pública para colección compartida */}
          <Route 
            path="/shared/:token" 
            element={
              <PageTransition>
                <SharedCollection />
              </PageTransition>
            } 
          />

          {/* Ruta para manejar rutas no encontradas */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;