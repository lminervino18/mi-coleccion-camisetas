import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Camisetas from './components/Camisetas';

function App() {
  const isLoggedIn = localStorage.getItem('token'); // Verifica si hay un token guardado

  return (
    <Router>
      <Routes>
        {/* Si el usuario no está autenticado, redirige automáticamente al login */}
        <Route path="/" element={isLoggedIn ? <Navigate to="/camisetas" /> : <Navigate to="/login" />} />

        {/* Ruta para el login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta para la página de camisetas */}
        <Route path="/camisetas" element={isLoggedIn ? <Camisetas /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
