import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Camisetas from './components/Camisetas';  // Asegúrate de tener este componente

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal que redirige automáticamente a /login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Ruta para la página de login */}
        <Route path="/login" element={<Login />} />
        
        {/* Ruta para la página de camisetas */}
        <Route path="/camisetas" element={<Camisetas />} />
      </Routes>
    </Router>
  );
}

export default App;
