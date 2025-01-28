import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Camisetas from './components/Camisetas';
import DetalleCamiseta from './components/DetalleCamiseta';
import PrivateRoute from './PrivateRoute';

function App() {
  const isLoggedIn = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* Redirige a la página correcta según si el usuario está logueado o no */}
        <Route 
          path="/" 
          element={isLoggedIn ? <Navigate to="/camisetas" /> : <Navigate to="/login" />} 
        />

        {/* Ruta pública para login */}
        <Route 
          path="/login" 
          element={<Login />} 
        />

        {/* Rutas protegidas */}
        <Route 
          path="/camisetas" 
          element={<PrivateRoute element={<Camisetas />} />} 
        />
        <Route 
          path="/camiseta/:id" 
          element={<PrivateRoute element={<DetalleCamiseta />} />} 
        />

        {/* Ruta para manejar URLs no encontradas */}
        <Route 
          path="*" 
          element={<Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;