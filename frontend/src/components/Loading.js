import React from 'react';
import './Loading.css';
import logo from '../assets/logo.png'; // Asegúrate de que el logo esté en esta ruta

const Loading = ({ error }) => (
  <div className="loading-container">
    <div className="loading-content">
      <div className="loading-logo">
        <img src={logo} alt="Logo" />
      </div>
      <div className="loading-bar">
        <div className="loading-progress"></div>
      </div>
      {error ? (
        <div className="loading-error">{error}</div>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  </div>
);

export default Loading;
