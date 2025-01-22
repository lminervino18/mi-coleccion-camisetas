import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Camisetas from './components/Camisetas';
import PrivateRoute from './PrivateRoute';  // Importa el componente PrivateRoute

function App() {
  const isLoggedIn = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* Redirige a la página correcta según si el usuario está logueado o no */}
        <Route path="/" element={isLoggedIn ? <Navigate to="/camisetas" /> : <Navigate to="/login" />} />

        {/* Ruta pública para login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta protegida para camisetas */}
        <Route path="/camisetas" element={<PrivateRoute element={<Camisetas />} />} />
      </Routes>
    </Router>
  );
}

export default App;
