import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFilter, 
  faSort, 
  faSortAmountUp, 
  faSortAmountDown,
  faArrowLeft,
  faDownload,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

import './Camisetas.css';
import './SharedCollection.css';


const API_URL = process.env.REACT_APP_API_URL;


const CamisetaItem = React.memo(({ camiseta, camisetas, currentIndex, onNavigate }) => {
    const [showModal, setShowModal] = useState(false);
    
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
        'NARANJA': 'naranja',
        'CELESTE': 'celeste',
        'VIOLETA': 'violeta'
      };
      return colorMap[color.toUpperCase()] || color.toLowerCase();
    };
  
    const handleDownloadImage = () => {
      if (camiseta.imagenCompletaBase64) {
        try {
          let base64Data = camiseta.imagenCompletaBase64;
          
          // Si ya incluye el prefijo data:image, usar directamente
          if (!base64Data.startsWith('data:image')) {
            base64Data = `data:image/jpeg;base64,${base64Data}`;
          }
    
          const link = document.createElement('a');
          link.href = base64Data;
          link.download = `${camiseta.club || camiseta.pais}_${camiseta.temporada}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error('Error al descargar la imagen:', error);
        }
      }
    };

    // Manejo de navegación con teclado
    useEffect(() => {
      const handleKeyDown = (event) => {
        if (!showModal) return;
        
        if (event.key === 'ArrowLeft' && currentIndex > 0) {
          onNavigate(currentIndex - 1);
        } else if (event.key === 'ArrowRight' && currentIndex < camisetas.length - 1) {
          onNavigate(currentIndex + 1);
        } else if (event.key === 'Escape') {
          setShowModal(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showModal, currentIndex, camisetas.length, onNavigate]);
  
    return (
      <>
        <div 
          className="camiseta-item"
          onClick={() => setShowModal(true)}
        >
          <div className="camiseta-image-wrapper">
            {camiseta.imagenRecortadaBase64 ? (
               <img
               src={`data:image/jpeg;base64,${camiseta.imagenRecortadaBase64.replace(/^data:image\/\w+;base64,/, '')}`}
               alt={camiseta.club || camiseta.pais}
               className="camiseta-image"
               />
            ) : (
              <div className="no-image">Sin imagen</div>
            )}
          </div>
          <div className="camiseta-info">
            <h3>{camiseta.tipoDeCamiseta === 'Club' ? camiseta.club : camiseta.pais} {camiseta.temporada}</h3>
            <h3>{camiseta.numeroEquipacion}</h3>
          </div>
        </div>
  
        {showModal && (
          <div className="detalle-overlay">
            <div className="detalle-container" onClick={e => e.stopPropagation()}>
              <div className="detalle-header">
                <div className="header-buttons">
                  <button className="btn-back" onClick={() => setShowModal(false)}>
                    ← Volver
                  </button>
                  {currentIndex > 0 && (
                    <button 
                      className="btn-nav btn-prev"
                      onClick={() => onNavigate(currentIndex - 1)}
                    >
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                  )}
                  <button className="btn-download" onClick={handleDownloadImage}>
                    <FontAwesomeIcon icon={faDownload} /> Descargar
                  </button>
                  {currentIndex < camisetas.length - 1 && (
                    <button 
                      className="btn-nav btn-next"
                      onClick={() => onNavigate(currentIndex + 1)}
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
                    src={`data:image/jpeg;base64,${camiseta.imagenCompletaBase64.replace(/^data:image\/\w+;base64,/, '')}`}
                    alt={camiseta.club || camiseta.pais}
                    className="camiseta-imagen-completa"
                  />
                ) : (
                  <div className="no-image">Sin imagen completa disponible</div>
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
          </div>
        )}
      </>
    );
  });

CamisetaItem.displayName = 'CamisetaItem';

function SharedCollection() {
  // Estados existentes...
  const [camisetas, setCamisetas] = useState([]);
  const [filteredCamisetas, setFilteredCamisetas] = useState([]);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    talle: [],
    dorsal: null,
    colores: [],
    temporada: [],
    pais: [],
    club: [],
    numeroEquipacion: []
  });

  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [quickFilter, setQuickFilter] = useState(null);
  const [availableClubs, setAvailableClubs] = useState([]);
  const [availablePaises, setAvailablePaises] = useState([]);
  const [availableLigas, setAvailableLigas] = useState([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedPais, setSelectedPais] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedEquipacion, setSelectedEquipacion] = useState('');
  const [tempSortBy, setTempSortBy] = useState(null);
  const [tempSortDirection, setTempSortDirection] = useState('asc');
  const [collectionData, setCollectionData] = useState({
    username: '',
    userPhoto: null
  });

  const { token } = useParams();

  // Constantes
  const talles = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Otro'];
  const coloresDisponibles = [
    'Rojo', 'Azul', 'Verde', 'Amarillo', 'Negro', 'Blanco', 'Gris',
    'Naranja', 'Violeta', 'Celeste', 'Bordó', 'Rosa', 'Dorado', 'Plateado', 'Marrón'
  ];
  const equipaciones = [
    'Titular', 'Suplente', 'Tercera', 'Arquero',
    'Arquero Suplente', 'Arquero Tercera', 'Entrenamiento', 'Edición especial', 'Otra'
  ];

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        // Obtener datos de las camisetas
        const camisetasResponse = await fetch(`${API_URL}/api/shared/camisetas/${token}`);
        if (!camisetasResponse.ok) {
          throw new Error('No se pudieron cargar las camisetas');
        }
        const camisetasData = await camisetasResponse.json();
        setCamisetas(camisetasData);
        setFilteredCamisetas(camisetasData);
  
        // Obtener datos del usuario usando el nuevo endpoint
        const userResponse = await fetch(`${API_URL}/api/shared/user/${token}`);
        if (!userResponse.ok) {
          throw new Error('No se pudieron cargar los datos del usuario');
        }
        const userData = await userResponse.json();
        setCollectionData({
          username: userData.username,
          userPhoto: userData.photoUrl
        });
  
        // Extraer datos únicos para los filtros
        const clubs = [...new Set(camisetasData.map(c => c.club))]
          .filter(club => club !== null && club !== '')
          .sort();
        const paises = [...new Set(camisetasData.map(c => c.pais))]
          .filter(pais => pais !== null && pais !== '')
          .sort();
        const ligas = [...new Set(camisetasData.map(c => c.liga))]
          .filter(liga => liga !== null && liga !== '')
          .sort();
  
        setAvailableClubs(clubs);
        setAvailablePaises(paises);
        setAvailableLigas(ligas);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };
  
    fetchCollectionData();
  }, [token]);

  const handleNavigate = (newIndex) => {
    // Esta función se pasará al CamisetaItem para manejar la navegación
    const newCamiseta = filteredCamisetas[newIndex];
    if (newCamiseta) {
      // Aquí puedes agregar lógica adicional si es necesario
      console.log(`Navegando a camiseta ${newCamiseta.id}`);
    }
  };

    // Funciones de filtrado
    const handleFilterChange = (filterType, value, isChecked = null) => {
        setActiveFilters(prev => {
          const newFilters = { ...prev };
          
          if (filterType === 'dorsal') {
            newFilters.dorsal = value;
          } else {
            if (isChecked !== null) {
              if (isChecked) {
                newFilters[filterType] = [...prev[filterType], value];
              } else {
                newFilters[filterType] = prev[filterType].filter(item => item !== value);
              }
            }
          }
          
          return newFilters;
        });
      };
      
      const handleQuickFilterClick = (filter) => {
        if (quickFilter === filter) {
          setQuickFilter(null);
          setFilteredCamisetas([...camisetas]);
        } else {
          setQuickFilter(filter);
          const filtered = filter === 'Club' || filter === 'Seleccion'
            ? camisetas.filter(camiseta => camiseta.tipoDeCamiseta === filter)
            : camisetas.filter(camiseta => camiseta.liga === filter);
          setFilteredCamisetas(filtered);
        }
      };
      
      const removeFilter = (filterType, value) => {
        setActiveFilters(prev => ({
          ...prev,
          [filterType]: prev[filterType].filter(item => item !== value)
        }));
        
        switch(filterType) {
          case 'club':
            setSelectedClub('');
            break;
          case 'pais':
            setSelectedPais('');
            break;
          case 'colores':
            setSelectedColor('');
            break;
          case 'numeroEquipacion':
            setSelectedEquipacion('');
            break;
          default:
            break;
        }
      };
      
      const clearFilters = () => {
        setActiveFilters({
          talle: [],
          dorsal: null,
          colores: [],
          temporada: [],
          pais: [],
          club: [],
          numeroEquipacion: []
        });
        
        setSelectedClub('');
        setSelectedPais('');
        setSelectedColor('');
        setSelectedEquipacion('');
        setFilteredCamisetas([...camisetas]);
        setQuickFilter(null);
        setSortBy(null);
        setSortDirection('asc');
      };
    
      // Funciones de ordenamiento
      const handleSortChange = (value) => {
        setTempSortBy(value);
      };
      
      const applySort = () => {
        setSortBy(tempSortBy);
        setSortDirection(tempSortDirection);
        
        let sorted = [...filteredCamisetas];
        if (tempSortBy) {
          sorted.sort((a, b) => {
            let comparison = 0;
            
            const compareWithNull = (valA, valB) => {
              if (valA === null && valB === null) return 0;
              if (valA === null) return 1;
              if (valB === null) return -1;
              return 0;
            };
      
            switch (tempSortBy) {
              case 'talle':
                const talleOrder = { 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6, 'Otro': 7 };
                const nullCheck = compareWithNull(a.talle, b.talle);
                if (nullCheck !== 0) return nullCheck;
                comparison = talleOrder[a.talle] - talleOrder[b.talle];
                break;
              
              case 'temporada':
                const nullCheckTemp = compareWithNull(a.temporada, b.temporada);
                if (nullCheckTemp !== 0) return nullCheckTemp;
                const getYear = (temp) => {
                  const year = temp.split('/')[0];
                  return parseInt(year);
                };
                comparison = getYear(a.temporada) - getYear(b.temporada);
                break;
              
              case 'liga':
                const nullCheckLiga = compareWithNull(a.liga, b.liga);
                if (nullCheckLiga !== 0) return nullCheckLiga;
                comparison = a.liga.localeCompare(b.liga);
                break;
      
              default:
                const nullCheckDefault = compareWithNull(a[tempSortBy], b[tempSortBy]);
                if (nullCheckDefault !== 0) return nullCheckDefault;
                comparison = a[tempSortBy].localeCompare(b[tempSortBy]);
            }
            
            return tempSortDirection === 'asc' ? comparison : -comparison;
          });
        }
      
        setFilteredCamisetas(sorted);
        setShowSort(false);
      };

      const applyFilters = () => {
        let filtered = [...camisetas];
      
        if (quickFilter) {
          if (quickFilter === 'Club' || quickFilter === 'Seleccion') {
            filtered = filtered.filter(camiseta => 
              camiseta.tipoDeCamiseta === quickFilter
            );
          } else {
            filtered = filtered.filter(camiseta => 
              camiseta.liga === quickFilter
            );
          }
        }
      
        // Aplicar todos los filtros activos
        Object.entries(activeFilters).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            filtered = filtered.filter(camiseta => {
              if (key === 'colores') {
                return camiseta.colores.some(color => value.includes(color));
              }
              return value.includes(camiseta[key]);
            });
          } else if (key === 'dorsal' && value !== null) {
            filtered = filtered.filter(camiseta => 
              value ? camiseta.dorsal : !camiseta.dorsal
            );
          }
        });
      
        setFilteredCamisetas(filtered);
        setShowFilters(false);
      };
      
      // Comienzo del renderizado
      return (
        <div className="shared-collection">
        <div className="camisetas-container">
          <div className="top-bar">
            <div className="search-container">
              <div className="user-info-container">
                <div className="user-info-left">
                  <div className="user-photo-section">
                    {collectionData.userPhoto ? (
                      <img 
                        src={collectionData.userPhoto} 
                        alt="User" 
                        className="user-photo" 
                      />
                    ) : (
                      <div className="user-photo-placeholder">
                        {collectionData.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="collection-title">
                      Colección de {collectionData.username}
                    </span>
                  </div>
                  <span className="collection-stats">
                    {camisetas.length} {
                        camisetas.length === 0 ? 'Camisetas' :
                        camisetas.length === 1 ? 'Camiseta' : 'Camisetas'
                    }
                    </span>
                </div>
                <button 
                  className="create-collection-btn"
                  onClick={() => window.location.href = 'https://micoleccioncamisetas-o2i9s0ka7-lorenzo-minervinos-projects.vercel.app/login'}

                >
                  ¡Crea tu propia colección!
                </button>
              </div>
              <div className="search-controls">
                <input
                  type="text"
                  placeholder="Buscar camisetas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button 
                  className={`filter-button ${Object.values(activeFilters).some(filter => 
                    Array.isArray(filter) ? filter.length > 0 : filter !== null
                  ) ? 'active' : ''}`} 
                  onClick={() => setShowFilters(true)}
                  title="Filtrar"
                >
                  <FontAwesomeIcon icon={faFilter} />
                </button>
                <button 
                  className={`sort-button ${sortBy ? 'active' : ''}`} 
                  onClick={() => setShowSort(true)}
                  title="Ordenar"
                >
                  <FontAwesomeIcon icon={faSort} />
                </button>
              </div>

                        {/* Filtros Rápidos */}
          <div className="quick-filters-container">
            <button 
              className={`quick-filter-button ${quickFilter === 'Club' ? 'active' : ''}`}
              onClick={() => handleQuickFilterClick('Club')}
            >
              Club
            </button>
            <button 
              className={`quick-filter-button ${quickFilter === 'Seleccion' ? 'active' : ''}`}
              onClick={() => handleQuickFilterClick('Seleccion')}
            >
              Selección
            </button>
            {availableLigas.map(liga => (
              <button
                key={liga}
                className={`quick-filter-button ${quickFilter === liga ? 'active' : ''}`}
                onClick={() => handleQuickFilterClick(liga)}
              >
                {liga}
              </button>
            ))}
          </div>
        </div>
      </div>
  
      {/* Modal de Filtros */}
      {showFilters && (
        <div 
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.className === 'modal-overlay') {
              setShowFilters(false);
              setActiveFilters(prev => ({ ...prev }));
              setSelectedClub('');
              setSelectedPais('');
              setSelectedColor('');
              setSelectedEquipacion('');
            }
          }}
        >
          <div className="modal-content filters-modal" onClick={e => e.stopPropagation()}>
            <div className="filters-header">
              <button className="back-button" onClick={() => setShowFilters(false)}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h3>Filtros</h3>
            </div>
            
            <div className="filters-content">
              {/* Talle */}
              <div className="filter-section">
                <h4>Talle</h4>
                <div className="filter-options">
                  {talles.map(talle => (
                    <label key={talle} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={activeFilters.talle.includes(talle)}
                        onChange={(e) => handleFilterChange('talle', talle, e.target.checked)}
                      />
                      {talle}
                    </label>
                  ))}
                </div>
              </div>
  
              {/* Club */}
              <div className="filter-section">
                <h4>Club</h4>
                <div className="filter-select-container">
                  <select 
                    value={selectedClub}
                    onChange={(e) => {
                      setSelectedClub(e.target.value);
                      if (e.target.value && !activeFilters.club.includes(e.target.value)) {
                        handleFilterChange('club', e.target.value, true);
                      }
                    }}
                  >
                    <option value="">Seleccionar club</option>
                    {availableClubs.map(club => (
                      <option key={club} value={club}>{club}</option>
                    ))}
                  </select>
                </div>
              </div>

                            {/* País */}
                            <div className="filter-section">
                <h4>País</h4>
                <div className="filter-select-container">
                  <select 
                    value={selectedPais}
                    onChange={(e) => {
                      setSelectedPais(e.target.value);
                      if (e.target.value && !activeFilters.pais.includes(e.target.value)) {
                        handleFilterChange('pais', e.target.value, true);
                      }
                    }}
                  >
                    <option value="">Seleccionar país</option>
                    {availablePaises.map(pais => (
                      <option key={pais} value={pais}>{pais}</option>
                    ))}
                  </select>
                </div>
              </div>
  
              {/* Colores */}
              <div className="filter-section">
                <h4>Colores</h4>
                <div className="filter-select-container">
                  <select
                    value={selectedColor}
                    onChange={(e) => {
                      setSelectedColor(e.target.value);
                      if (e.target.value && !activeFilters.colores.includes(e.target.value)) {
                        handleFilterChange('colores', e.target.value, true);
                      }
                    }}
                  >
                    <option value="">Seleccionar color</option>
                    {coloresDisponibles.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              </div>
  
              {/* Equipación */}
              <div className="filter-section">
                <h4>Equipación</h4>
                <div className="filter-select-container">
                  <select
                    value={selectedEquipacion}
                    onChange={(e) => {
                      setSelectedEquipacion(e.target.value);
                      if (e.target.value && !activeFilters.numeroEquipacion.includes(e.target.value)) {
                        handleFilterChange('numeroEquipacion', e.target.value, true);
                      }
                    }}
                  >
                    <option value="">Seleccionar equipación</option>
                    {equipaciones.map(equipacion => (
                      <option key={equipacion} value={equipacion}>{equipacion}</option>
                    ))}
                  </select>
                </div>
              </div>
  
              {/* Filtros Activos y Botones */}
              <div className="active-filters">
                {Object.entries(activeFilters).map(([key, value]) => {
                  if (Array.isArray(value) && value.length > 0) {
                    return value.map(v => (
                      <span key={`${key}-${v}`} className="filter-tag">
                        {`${key}: ${v}`}
                        <button onClick={() => removeFilter(key, v)}>×</button>
                      </span>
                    ));
                  }
                  return null;
                })}
              </div>
  
              <div className="filters-footer">
                <button onClick={applyFilters} className="apply-btn">
                  Aplicar
                </button>
                <button onClick={clearFilters} className="clear-btn">
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

            {/* Modal de Ordenamiento */}
            {showSort && (
        <div 
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.className === 'modal-overlay') {
              setShowSort(false);
              setTempSortBy(sortBy);
              setTempSortDirection(sortDirection);
            }
          }}
        >
          <div className="modal-content sort-modal" onClick={e => e.stopPropagation()}>
            <div className="sort-header">
              <button 
                className="back-button" 
                onClick={() => {
                  setShowSort(false);
                  setTempSortBy(sortBy);
                  setTempSortDirection(sortDirection);
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h3>Ordenar por</h3>
            </div>
  
            <div className="sort-options">
              {[
                { value: 'club', label: 'Club' },
                { value: 'pais', label: 'País' },
                { value: 'liga', label: 'Liga' },
                { value: 'talle', label: 'Talle' },
                { value: 'temporada', label: 'Temporada' }
              ].map(option => (
                <label 
                  key={option.value} 
                  className={`sort-option ${tempSortBy === option.value ? 'active' : ''}`}
                >
                  <input
                    type="radio"
                    name="sort"
                    checked={tempSortBy === option.value}
                    onChange={() => handleSortChange(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
  
            {tempSortBy && (
              <div className="sort-direction">
                <button
                  className={`direction-btn ${tempSortDirection === 'asc' ? 'active' : ''}`}
                  onClick={() => setTempSortDirection('asc')}
                >
                  <FontAwesomeIcon icon={faSortAmountUp} />
                </button>
                <button
                  className={`direction-btn ${tempSortDirection === 'desc' ? 'active' : ''}`}
                  onClick={() => setTempSortDirection('desc')}
                >
                  <FontAwesomeIcon icon={faSortAmountDown} />
                </button>
              </div>
            )}
  
            <div className="sort-footer">
              <button 
                className="apply-sort-btn"
                onClick={applySort}
                disabled={!tempSortBy}
              >
                Aplicar ordenamiento
              </button>
              <button 
                className="clear-sort-btn"
                onClick={() => {
                  setTempSortBy(null);
                  setTempSortDirection('asc');
                  setSortBy(null);
                  setSortDirection('asc');
                  setFilteredCamisetas([...camisetas]);
                  setShowSort(false);
                }}
              >
                Limpiar ordenamiento
              </button>
            </div>
          </div>
        </div>
      )}
  
      {/* Grid de Camisetas */}
      <div className="grid-container">
        {filteredCamisetas
          .filter((camiseta) => {
            const searchTerm = search.toLowerCase();
            return (
              camiseta.club?.toLowerCase().includes(searchTerm) ||
              camiseta.pais?.toLowerCase().includes(searchTerm) ||
              camiseta.temporada?.toLowerCase().includes(searchTerm) ||
              camiseta.numeroEquipacion?.toLowerCase().includes(searchTerm) ||
              (camiseta.nombre && camiseta.nombre.toLowerCase().includes(searchTerm)) ||
              (camiseta.dorsal && camiseta.dorsal.toString().includes(searchTerm)) ||
              camiseta.talle?.toLowerCase().includes(searchTerm) ||
              camiseta.colores?.some(color => color.toLowerCase().includes(searchTerm))
            );
          })
          .map((camiseta, index) => (
            <CamisetaItem
              key={camiseta.id}
              camiseta={camiseta}
              camisetas={filteredCamisetas}
              currentIndex={index}
              onNavigate={handleNavigate}
            />
          ))}
      </div>
    </div>
    </div>
  );
}

export default SharedCollection;