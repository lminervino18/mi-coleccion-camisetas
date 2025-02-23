import React from 'react';
import './Loading.css';

const Loading = ({ error }) => (
  <div className="loading-container">
    <div className="loading-spinner" />
    {error ? (
      <div className="loading-error">{error}</div>
    ) : (
      <p>Cargando...</p>
    )}
  </div>
);

export default Loading;