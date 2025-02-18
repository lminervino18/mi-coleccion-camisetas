import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faDownload 
} from '@fortawesome/free-solid-svg-icons';
import './Camisetas.css'; // Usa los mismos estilos

function SharedCollection() {
  const [camisetas, setCamisetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCamisetas = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/shared/camisetas/${token}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'No se pudieron cargar las camisetas');
        }

        const data = await response.json();
        setCamisetas(data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar camisetas:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchCamisetas();
  }, [token]);

  const handleDownloadImage = (camiseta) => {
    if (camiseta.imagenCompletaBase64) {
      const link = document.createElement('a');
      link.href = `data:image/jpeg;base64,${camiseta.imagenCompletaBase64}`;
      link.download = `${camiseta.club || camiseta.pais}_${camiseta.temporada}.jpg`;
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="camisetas-container">
        <div className="loading">Cargando camisetas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="camisetas-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn btn-secondary">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const filteredCamisetas = camisetas.filter((camiseta) => {
    const searchTerm = search.toLowerCase();
    return (
      camiseta.club.toLowerCase().includes(searchTerm) ||
      camiseta.pais.toLowerCase().includes(searchTerm) ||
      camiseta.temporada.toLowerCase().includes(searchTerm) ||
      camiseta.numeroEquipacion.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="camisetas-container">
      <div className="top-bar">
        <div className="search-container">
          <div className="search-controls">
            <input
              type="text"
              placeholder="Buscar camisetas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button 
              className="back-button" 
              onClick={() => navigate('/')}
              title="Volver al inicio"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid-container">
        {filteredCamisetas.map((camiseta) => (
          <div 
            key={camiseta.id} 
            className="camiseta-item"
          >
            <div className="camiseta-image-wrapper">
              {camiseta.imagenRecortadaBase64 ? (
                <img
                  src={`data:image/jpeg;base64,${camiseta.imagenRecortadaBase64}`}
                  alt={camiseta.club}
                  className="camiseta-image"
                />
              ) : (
                <div className="no-image">Sin imagen</div>
              )}
            </div>
            <div className="camiseta-info">
              <h3>
                {camiseta.tipoDeCamiseta === 'Club' 
                  ? `${camiseta.club} - ${camiseta.temporada}`
                  : `${camiseta.pais} - ${camiseta.temporada}`
                }
              </h3>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: '10px'
              }}>
                <span>{camiseta.numeroEquipacion}</span>
                <button 
                  onClick={() => handleDownloadImage(camiseta)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <FontAwesomeIcon icon={faDownload} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SharedCollection;