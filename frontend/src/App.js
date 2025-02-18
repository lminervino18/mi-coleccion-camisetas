import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Route, 
  Routes, 
  Navigate
} from 'react-router-dom';

// Importar componentes
import Login from './components/Login';
import Camisetas from './components/Camisetas';
import DetalleCamiseta from './components/DetalleCamiseta';
import EstadisticasCamisetas from './components/EstadisticasCamisetas';
import SharedCollection from './components/SharedCollection';

// Componente de transición simple usando React.memo para evitar re-renders innecesarios
const PageTransition = React.memo(({ children }) => {
  return (
    <div className="page-transition">
      {children}
    </div>
  );
});

// Asignar un displayName para mejor debugging
PageTransition.displayName = 'PageTransition';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    // Función para verificar el estado de autenticación
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    // Verificar autenticación inicial
    checkAuth();

    // Escuchar cambios en localStorage
    window.addEventListener('storage', checkAuth);
    
    // Crear un intervalo para verificar el token periódicamente
    const authInterval = setInterval(checkAuth, 1000);

    // Cleanup: remover event listener y limpiar intervalo
    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(authInterval);
    };
  }, []);

  // Función para verificar si el token es válido (opcional)
  const isTokenValid = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      // Verificar si el token ha expirado
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  };

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
                  <Login />
                </PageTransition>
              )
            } 
          />

          <Route 
            path="/camisetas" 
            element={
              isLoggedIn ? (
                <PageTransition>
                  <Camisetas />
                </PageTransition>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          <Route 
            path="/camiseta/:id" 
            element={
              isLoggedIn ? (
                <PageTransition>
                  <DetalleCamiseta />
                </PageTransition>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          <Route 
            path="/estadisticas-camisetas" 
            element={
              isLoggedIn ? (
                <PageTransition>
                  <EstadisticasCamisetas />
                </PageTransition>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Ruta para colección compartida (sin autenticación) */}
          <Route 
            path="/shared/:token" 
            element={<SharedCollection />} 
          />

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