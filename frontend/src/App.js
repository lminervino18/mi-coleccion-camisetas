import React from 'react';
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
  const isLoggedIn = localStorage.getItem('token');

  return (
    <Router>
      <div className="page-container">
        <Routes>
          <Route 
            path="/" 
            element={isLoggedIn ? <Navigate to="/camisetas" /> : <Navigate to="/login" />} 
          />

          <Route 
            path="/login" 
            element={
              <PageTransition>
                <Login />
              </PageTransition>
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
                <Navigate to="/login" />
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
                <Navigate to="/login" />
              )
            } 
          />

          <Route 
            path="*" 
            element={<Navigate to="/" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;