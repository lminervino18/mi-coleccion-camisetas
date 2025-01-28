import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DetalleCamiseta.css';

function DetalleCamiseta() {
  const [camiseta, setCamiseta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCamiseta = async () => {
      try {
        const usuarioId = localStorage.getItem('usuarioId');
        const response = await fetch(`http://localhost:8080/api/camisetas/usuario/${usuarioId}/camiseta/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCamiseta(data);
        } else {
          setError('Error al obtener la camiseta');
          console.error('Error al obtener la camiseta');
        }
      } catch (error) {
        setError('Error de conexión');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCamiseta();
  }, [id]);

  if (loading) {
    return <div className="detalle-loading">Cargando...</div>;
  }

  if (error || !camiseta) {
    return (
      <div className="detalle-error">
        <p>{error || 'No se encontró la camiseta'}</p>
        <button className="btn-back" onClick={() => navigate('/camisetas')}>
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="detalle-overlay">
      <div className="detalle-container">
        <div className="detalle-header">
          <button className="btn-back" onClick={() => navigate('/camisetas')}>
            ← Volver
          </button>
        </div>

        <div className="detalle-content">
          <div className="detalle-imagen">
            {camiseta.imagenBase64 ? (
              <img
                src={`data:image/jpeg;base64,${camiseta.imagenBase64}`}
                alt={camiseta.club}
                className="camiseta-imagen-completa"
              />
            ) : (
              <div className="no-image">Sin imagen</div>
            )}
          </div>

          <div className="detalle-info">
            <h1>{camiseta.club}</h1>
            
            <div className="info-section">
              <div className="info-item">
                <span className="info-label">País:</span>
                <span className="info-value">{camiseta.pais}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Temporada:</span>
                <span className="info-value">{camiseta.temporada}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Equipación:</span>
                <span className="info-value">{camiseta.numeroEquipacion}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Talle:</span>
                <span className="info-value">{camiseta.talle}</span>
              </div>
              {camiseta.nombre && (
                <div className="info-item">
                  <span className="info-label">Nombre:</span>
                  <span className="info-value">{camiseta.nombre}</span>
                </div>
              )}
              {camiseta.dorsal && (
                <div className="info-item">
                  <span className="info-label">Dorsal:</span>
                  <span className="info-value">{camiseta.dorsal}</span>
                </div>
              )}
            </div>

            {camiseta.colores && camiseta.colores.length > 0 && (
              <div className="colores-section">
                <h3>Colores</h3>
                <div className="colores-container">
                  {camiseta.colores.map((color, index) => (
                    <span key={index} className="color-tag">{color}</span>
                  ))}
                </div>
              </div>
            )}

            {camiseta.comentarios && (
              <div className="comentarios-section">
                <h3>Comentarios</h3>
                <p>{camiseta.comentarios}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetalleCamiseta;