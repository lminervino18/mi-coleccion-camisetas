import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDownload, 
  faChevronLeft, 
  faChevronRight 
} from '@fortawesome/free-solid-svg-icons';
import './DetalleCamiseta.css';
import EditarCamiseta from './EditarCamiseta';

function DetalleCamiseta() {
  const [camiseta, setCamiseta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [adjacentCamisetas, setAdjacentCamisetas] = useState({
    anterior: null,
    siguiente: null
  });

  const { id } = useParams();
  const navigate = useNavigate();

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

  // Función para descargar imagen
  const handleDownloadImage = () => {
    if (camiseta.imagenCompletaBase64) {
      const link = document.createElement('a');
      link.href = `data:image/jpeg;base64,${camiseta.imagenCompletaBase64}`;
      link.download = `${camiseta.club || camiseta.pais}_${camiseta.temporada}.jpg`;
      link.click();
    }
  };

  useEffect(() => {
    const fetchCamiseta = async () => {
      try {
        const usuarioId = localStorage.getItem('usuarioId');
        const response = await fetch(`http://localhost:8080/api/camisetas/usuario/${usuarioId}/camiseta/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setCamiseta(data);

          // Obtener los IDs filtrados de localStorage
          const filteredIds = JSON.parse(localStorage.getItem(`filteredCamisetasIds_${usuarioId}`) || '[]');
          
          // Encontrar el índice de la camiseta actual
          const currentIndex = filteredIds.indexOf(Number(id));

          // Establecer camisetas adyacentes
          setAdjacentCamisetas({
            anterior: currentIndex > 0 ? filteredIds[currentIndex - 1] : null,
            siguiente: currentIndex < filteredIds.length - 1 ? filteredIds[currentIndex + 1] : null
          });
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

  // Manejo de navegación con teclado
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft' && adjacentCamisetas.anterior) {
        navigate(`/camiseta/${adjacentCamisetas.anterior}`);
      } else if (event.key === 'ArrowRight' && adjacentCamisetas.siguiente) {
        navigate(`/camiseta/${adjacentCamisetas.siguiente}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [adjacentCamisetas, navigate]);

  const handleDelete = async () => {
    try {
      const usuarioId = localStorage.getItem('usuarioId');
      const response = await fetch(
        `http://localhost:8080/api/camisetas/usuario/${usuarioId}/camiseta/${id}`, 
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include',
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

  if (showEditForm) {
    return (
      <EditarCamiseta
        camisetaSeleccionada={{
          ...camiseta,
          tipoDeCamiseta: camiseta.tipoDeCamiseta || 'Club',
          liga: camiseta.liga || ''
        }}
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
            {/* Botón de navegación izquierda */}
            {adjacentCamisetas.anterior && (
              <button 
                className="btn-nav btn-prev" 
                onClick={() => navigate(`/camiseta/${adjacentCamisetas.anterior}`)}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
            )}

            <button className="btn-back" onClick={() => navigate('/camisetas')}>
              ← Volver
            </button>
            
            <div className="action-buttons">
            <button 
                className="btn-download" 
                onClick={handleDownloadImage}
              >
                <FontAwesomeIcon icon={faDownload} /> Descargar
              </button>
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

            {/* Botón de navegación derecha */}
            {adjacentCamisetas.siguiente && (
              <button 
                className="btn-nav btn-next" 
                onClick={() => navigate(`/camiseta/${adjacentCamisetas.siguiente}`)}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            )}
          </div>
          <h1 className="detalle-titulo">
            {camiseta.tipoDeCamiseta === 'Club' 
              ? `${camiseta.club} - ${camiseta.temporada}`
              : `${camiseta.pais} - ${camiseta.temporada}`
            }
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
                <span className="info-label">Tipo:</span>
                <span className="info-value">{camiseta.tipoDeCamiseta}</span>
              </div>
              <div className="info-item">
                <span className="info-label">País:</span>
                <span className="info-value">{camiseta.pais}</span>
              </div>
              {camiseta.tipoDeCamiseta === 'Club' && (
                <div className="info-item">
                  <span className="info-label">Club:</span>
                  <span className="info-value">{camiseta.club}</span>
                </div>
              )}
              {camiseta.liga && (
                <div className="info-item">
                  <span className="info-label">Liga:</span>
                  <span className="info-value">{camiseta.liga}</span>
                </div>
              )}
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