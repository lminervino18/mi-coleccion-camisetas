import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DetalleCamiseta.css';
import EditarCamiseta from './EditarCamiseta'; // Importa el nuevo componente

function DetalleCamiseta() {
  const [camiseta, setCamiseta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  // Función auxiliar para normalizar nombres de colores
  const normalizeColorName = (color) => {
    const colorMap = {
      'ROJO': 'rojo',
      'AZUL': 'azul',
      'VERDE': 'verde',
      'AMARILLO': 'amarillo',
      'NEGRO': 'negro',
      'BLANCO': 'blanco',
      'GRIS': 'gris',
      'MARRON': 'marron',
      'MORADO': 'morado',
      'ROSA': 'rosa',
      'NARANJA': 'naranja'
    };
    return colorMap[color.toUpperCase()] || color.toLowerCase();
  };

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

  const handleDelete = async () => {
    try {
      const usuarioId = localStorage.getItem('usuarioId');
      const response = await fetch(
        `http://localhost:8080/api/camisetas/usuario/${usuarioId}/camiseta/${id}`, 
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        navigate('/camisetas');
      } else {
        setError('Error al eliminar la camiseta');
      }
    } catch (error) {
      setError('Error de conexión');
      console.error('Error:', error);
    }
  };

  const handleUpdate = (updatedCamiseta) => {
    setCamiseta(updatedCamiseta);
    setShowEditForm(false);
  };

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

  // Si está en modo edición, muestra el componente EditarCamiseta
  if (showEditForm) {
    return (
      <EditarCamiseta
        camisetaSeleccionada={camiseta}
        onClose={() => setShowEditForm(false)}
        onActualizar={handleUpdate}
      />
    );
  }

  return (
    <div className="detalle-overlay">
      <div className="detalle-container">
        <div className="detalle-header">
          <div className="header-buttons">
            <button className="btn-back" onClick={() => navigate('/camisetas')}>
              ← Volver
            </button>
            <div className="action-buttons">
              <button 
                className="btn-edit" 
                onClick={() => setShowEditForm(true)}
              >
                Editar
              </button>
              <button 
                className="btn-delete" 
                onClick={() => setShowDeleteModal(true)}
              >
                Eliminar
              </button>
            </div>
          </div>
          <h1 className="detalle-titulo">
            {camiseta.club} {camiseta.temporada}
          </h1>
        </div>

        <div className="detalle-content">
          <div className="detalle-imagen-container">
            {camiseta.imagenCompletaBase64 ? (
              <img
                src={`data:image/jpeg;base64,${camiseta.imagenCompletaBase64}`}
                alt={camiseta.club}
                className="camiseta-imagen-completa"
              />
            ) : (
              <div className="no-image">Sin imagen</div>
            )}
          </div>

          <div className="detalle-info">
            <div className="info-section">
              <div className="info-item">
                <span className="info-label">País:</span>
                <span className="info-value">{camiseta.pais}</span>
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
                    <span 
                      key={index} 
                      className="color-tag"
                      data-color={normalizeColorName(color)}
                    >
                      {color}
                    </span>
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

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>¿Estás seguro?</h2>
            <p>Esta acción eliminará permanentemente la camiseta y toda su información.</p>
            <div className="modal-buttons">
              <button 
                className="btn-confirm" 
                onClick={handleDelete}
              >
                Sí, eliminar
              </button>
              <button 
                className="btn-cancel" 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetalleCamiseta;