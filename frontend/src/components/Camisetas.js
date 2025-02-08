import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import './Camisetas.css';
import AgregarCamiseta from './AgregarCamiseta';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignOutAlt, 
  faFilter, 
  faSort, 
  faSortAmountUp, 
  faSortAmountDown,
  faTimes,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

// Componente para cada camiseta individual
const CamisetaItem = React.memo(({ 
  camiseta, 
  isDraggingCamiseta, 
  draggedCamiseta,
  onMouseDown,
  onMouseUp,
  onMouseMove,
  onClick 
}) => {
  const isBeingDragged = draggedCamiseta === camiseta.id;
  
  return (
    <div 
      className={`camiseta-item ${isBeingDragged ? 'dragging' : ''}`}
      style={{
        cursor: isDraggingCamiseta ? 'grabbing' : 'pointer',
        zIndex: isBeingDragged ? 999 : 1
      }}
      onMouseDown={(e) => onMouseDown(e, camiseta.id)}
      onMouseUp={onMouseUp}
      onMouseMove={(e) => onMouseMove(e, camiseta.id)}
      onClick={() => onClick(camiseta.id)}
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
        <h3>{camiseta.club} {camiseta.temporada}</h3>
        <h3>{camiseta.numeroEquipacion}</h3>
      </div>
    </div>
  );
});

CamisetaItem.displayName = 'CamisetaItem';
function Camisetas() {

  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [camisetas, setCamisetas] = useState([]);
  const [filteredCamisetas, setFilteredCamisetas] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [userData, setUserData] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 'auto', height: 'auto' });
  const [selectorPosition, setSelectorPosition] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
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
  const [availableClubs, setAvailableClubs] = useState([]);
  const [availablePaises, setAvailablePaises] = useState([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedPais, setSelectedPais] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedEquipacion, setSelectedEquipacion] = useState('');
  const [isDraggingCamiseta, setIsDraggingCamiseta] = useState(false);
  const [draggedCamiseta, setDraggedCamiseta] = useState(null);
  const [dragTimeout, setDragTimeout] = useState(null);
  const [customOrder, setCustomOrder] = useState([]);
  const [tempSortBy, setTempSortBy] = useState(null);
  const [tempSortDirection, setTempSortDirection] = useState('asc');

  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const SELECTOR_SIZE = 200;

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
    const fetchUserData = async () => {
      try {
        const usuarioId = localStorage.getItem('usuarioId');
        const response = await fetch(`http://localhost:8080/api/usuarios/${usuarioId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario', error);
      }
    };

    const fetchCamisetas = async () => {
      try {
        const usuarioId = localStorage.getItem('usuarioId');
        const response = await fetch(`http://localhost:8080/api/camisetas/${usuarioId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCamisetas(data);
          setFilteredCamisetas(data);
          
          const savedOrder = localStorage.getItem(`customOrder_${usuarioId}`);
          if (savedOrder) {
            setCustomOrder(JSON.parse(savedOrder));
          } else {
            const newOrder = data.map(c => c.id);
            setCustomOrder(newOrder);
            localStorage.setItem(`customOrder_${usuarioId}`, JSON.stringify(newOrder));
          }
        }
      } catch (error) {
        console.error('Error al obtener camisetas', error);
      }
    };

    fetchUserData();
    fetchCamisetas();
  }, []);

  useEffect(() => {
    const clubs = [...new Set(camisetas.map(c => c.club))].sort();
    const paises = [...new Set(camisetas.map(c => c.pais))].sort();
    
    setAvailableClubs(clubs);
    setAvailablePaises(paises);
  }, [camisetas]);

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
  };

  const applyFilters = () => {
    let filtered = [...camisetas];

    if (activeFilters.talle.length > 0) {
      filtered = filtered.filter(camiseta => 
        activeFilters.talle.includes(camiseta.talle)
      );
    }

    if (activeFilters.dorsal !== null) {
      filtered = filtered.filter(camiseta => 
        activeFilters.dorsal ? camiseta.dorsal : !camiseta.dorsal
      );
    }

    if (activeFilters.colores.length > 0) {
      filtered = filtered.filter(camiseta => 
        camiseta.colores.some(color => activeFilters.colores.includes(color))
      );
    }

    if (activeFilters.temporada.length > 0) {
      filtered = filtered.filter(camiseta =>
        activeFilters.temporada.includes(camiseta.temporada)
      );
    }

    if (activeFilters.pais.length > 0) {
      filtered = filtered.filter(camiseta =>
        activeFilters.pais.includes(camiseta.pais)
      );
    }

    if (activeFilters.club.length > 0) {
      filtered = filtered.filter(camiseta =>
        activeFilters.club.includes(camiseta.club)
      );
    }

    if (activeFilters.numeroEquipacion.length > 0) {
      filtered = filtered.filter(camiseta =>
        activeFilters.numeroEquipacion.includes(camiseta.numeroEquipacion)
      );
    }

    setFilteredCamisetas(filtered);
    setShowFilters(false);
  };

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
        
        switch (tempSortBy) {
          case 'talle':
            const talleOrder = { 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6, 'Otro': 7 };
            comparison = talleOrder[a.talle] - talleOrder[b.talle];
            break;
          
          case 'temporada':
            const getYear = (temp) => {
              const year = temp.split('/')[0];
              return parseInt(year);
            };
            comparison = getYear(a.temporada) - getYear(b.temporada);
            break;
          
          default:
            comparison = a[tempSortBy].localeCompare(b[tempSortBy]);
        }
        
        return tempSortDirection === 'asc' ? comparison : -comparison;
      });
    } else {
      sorted.sort((a, b) => {
        return customOrder.indexOf(a.id) - customOrder.indexOf(b.id);
      });
    }

    setFilteredCamisetas(sorted);
    setShowSort(false);
  };

  const handleCamisetaMouseDown = (e, camisetaId) => {
    e.preventDefault();
    const timeout = setTimeout(() => {
      setIsDraggingCamiseta(true);
      setDraggedCamiseta(camisetaId);
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 200);

    setDragTimeout(timeout);
  };

  const handleCamisetaMouseUp = () => {
    if (dragTimeout) {
      clearTimeout(dragTimeout);
    }
    if (!isDraggingCamiseta) {
      if (draggedCamiseta) {
        handleCamisetaClick(draggedCamiseta);
      }
    }
    setIsDraggingCamiseta(false);
    setDraggedCamiseta(null);
  };

  const handleCamisetaMouseMove = (e, targetCamisetaId) => {
    if (isDraggingCamiseta && draggedCamiseta && draggedCamiseta !== targetCamisetaId) {
      const newOrder = [...customOrder];
      const draggedIndex = newOrder.indexOf(draggedCamiseta);
      const targetIndex = newOrder.indexOf(targetCamisetaId);
      
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedCamiseta);
      
      setCustomOrder(newOrder);
      
      const usuarioId = localStorage.getItem('usuarioId');
      localStorage.setItem(`customOrder_${usuarioId}`, JSON.stringify(newOrder));
      
      const reorderedCamisetas = [...filteredCamisetas].sort((a, b) => {
        return newOrder.indexOf(a.id) - newOrder.indexOf(b.id);
      });
      
      setFilteredCamisetas(reorderedCamisetas);
    }
  };

  
// Actualiza también el manejador de arrastre
const handleMouseDown = (e) => {
  if (e.target.closest('.profile-selector')) {
    return; // No iniciar arrastre si el clic es en el selector
  }
  
  if (e.button === 0) { // Solo botón izquierdo
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imageOffset.x,
      y: e.clientY - imageOffset.y
    });
    e.preventDefault();
  }
};

useEffect(() => {
  if (isDragging) {
    const handleMouseMove = (e) => {
      if (imageRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        // Calcular límites
        const maxX = containerRect.width - (imageSize.width * zoom);
        const maxY = containerRect.height - (imageSize.height * zoom);
        
        setImageOffset({
          x: Math.min(Math.max(newX, maxX), 0),
          y: Math.min(Math.max(newY, maxY), 0)
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }
}, [isDragging, dragStart, imageSize, zoom]);

const handleWheel = (e) => {
  if (e.ctrlKey) {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    
    // Calcula el punto central del contenedor
    const containerRect = containerRef.current.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;
    
    setZoom(prevZoom => {
      const newZoom = Math.max(0.5, Math.min(3, prevZoom * (1 - delta)));
      
      // Ajusta la posición para mantener el centro
      const scaleChange = newZoom / prevZoom;
      setImagePosition(prev => ({
        x: centerX - ((centerX - prev.x) * scaleChange),
        y: centerY - ((centerY - prev.y) * scaleChange)
      }));
      
      return newZoom;
    });
  }
};

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageLoaded(false);
      setZoom(1);
      setImageOffset({ x: 0, y: 0 });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageMouseDown = (e) => {
    if (e.target.closest('.profile-selector')) {
      return; // No iniciar arrastre si el clic es en el selector
    }
    
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      });
      e.preventDefault();
    }
  };
  
  const handleImageMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setImagePosition({ x: newX, y: newY });
    }
  };
  
  const handleImageMouseUp = () => {
    setIsDragging(false);
  };

  const handleImageSelect = async () => {
    if (!imageRef.current || !imageLoaded) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = SELECTOR_SIZE;
    canvas.height = SELECTOR_SIZE;
  
    const img = imageRef.current;
    
    const displayedWidth = imageSize.width * zoom;
    const displayedHeight = imageSize.height * zoom;
    
    const scaleX = img.naturalWidth / displayedWidth;
    const scaleY = img.naturalHeight / displayedHeight;
  
    const sourceX = ((selectorPosition.x - imageOffset.x - imagePosition.x) * scaleX);
    const sourceY = ((selectorPosition.y - imageOffset.y - imagePosition.y) * scaleY);
    const sourceWidth = SELECTOR_SIZE * scaleX;
    const sourceHeight = SELECTOR_SIZE * scaleY;
  
    try {
      ctx.beginPath();
      ctx.arc(SELECTOR_SIZE/2, SELECTOR_SIZE/2, SELECTOR_SIZE/2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
  
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        SELECTOR_SIZE,
        SELECTOR_SIZE
      );
  
      const base64Image = canvas.toDataURL('image/jpeg', 0.8);
      
      const response = await fetch(`http://localhost:8080/api/usuarios/${localStorage.getItem('usuarioId')}/foto-perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ fotoDePerfil: base64Image }),
      });
  
      if (response.ok) {
        const updatedUser = await response.json();
        setUserData(updatedUser);
        setShowProfileModal(false);
        setOriginalImage(null);
        setZoom(1);
        setImageOffset({ x: 0, y: 0 });
      } else {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al actualizar la foto de perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar la foto de perfil. Por favor, intenta nuevamente.');
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioId');
    navigate('/login');
  };

  const handleAgregarCamiseta = (nuevaCamiseta) => {
    setCamisetas(prev => [...prev, nuevaCamiseta]);
    setFilteredCamisetas(prev => [...prev, nuevaCamiseta]);
    setCustomOrder(prev => [...prev, nuevaCamiseta.id]);
    setShowForm(false);
  };

  const handleCamisetaClick = (camisetaId) => {
    if (!isDraggingCamiseta) {
      navigate(`/camiseta/${camisetaId}`);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const handleCloseModal = () => {
    setShowProfileModal(false);
    setOriginalImage(null);
    setImageLoaded(false);
    setZoom(1);
    setImageOffset({ x: 0, y: 0 });
  };

  return (
    <div className="camisetas-container">
      <div className="top-bar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar camisetas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="filter-button" onClick={() => setShowFilters(true)} title="Filtrar">
            <FontAwesomeIcon icon={faFilter} />
          </button>
          <button className="sort-button" onClick={() => setShowSort(true)} title="Ordenar">
            <FontAwesomeIcon icon={faSort} />
          </button>
          <button className="add-button" onClick={() => setShowForm(true)} title="Agregar camiseta">
            +
          </button>
        </div>
        <div className="user-profile">
          <span className="username">{userData?.username}</span>
          <div 
            className="profile-photo" 
            onClick={() => setShowProfileModal(true)}
          >
            {userData?.fotoDePerfil ? (
              <img src={userData.fotoDePerfil} alt="Perfil" />
            ) : (
              <div className="initials">
                {userData?.username && getInitials(userData.username)}
              </div>
            )}
          </div>
          <FontAwesomeIcon 
            icon={faSignOutAlt} 
            className="logout-icon"
            onClick={handleLogout}
            title="Cerrar sesión"
          />
        </div>
      </div>

      {showFilters && (
        <div className="modal-overlay">
          <div className="modal-content filters-modal">
            <div className="filters-header">
              <button className="back-button" onClick={() => setShowFilters(false)}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h3>Filtros</h3>
              <button className="close-button" onClick={() => setShowFilters(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
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

              {/* Dorsal */}
              <div className="filter-section">
                <h4>Dorsal</h4>
                <div className="filter-options">
                  <label className="radio-label">
                    <input
                      type="radio"
                      checked={activeFilters.dorsal === true}
                      onChange={() => handleFilterChange('dorsal', true)}
                    />
                    Con dorsal
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      checked={activeFilters.dorsal === false}
                      onChange={() => handleFilterChange('dorsal', false)}
                    />
                    Sin dorsal
                  </label>
                </div>
              </div>
            </div>

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
      )}

      {showSort && (
        <div className="modal-overlay">
          <div className="modal-content sort-modal">
            <div className="sort-header">
              <button className="back-button" onClick={() => {
                setShowSort(false);
                setTempSortBy(sortBy);
                setTempSortDirection(sortDirection);
              }}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h3>Ordenar por</h3>
              <button className="close-button" onClick={() => setShowSort(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="sort-options">
              {[
                { value: 'club', label: 'Club' },
                { value: 'pais', label: 'País' },
                { value: 'talle', label: 'Talle' },
                { value: 'temporada', label: 'Temporada' }
              ].map(option => (
                <label key={option.value} className="sort-option">
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
              >
                Aplicar ordenamiento
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <h3>¿Estás seguro que deseas cerrar sesión?</h3>
            <div className="confirm-modal-buttons">
              <button className="confirm-btn" onClick={confirmLogout}>
                Sí, cerrar sesión
              </button>
              <button className="cancel-btn" onClick={() => setShowLogoutConfirm(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

{showProfileModal && (
        <div className="modal-overlay">
          <div className="modal-content profile-modal">
            <div className="profile-modal-header">
              <h3>Foto de perfil</h3>
              <button className="close-button" onClick={handleCloseModal}>×</button>
            </div>

            {userData?.fotoDePerfil && !originalImage && (
              <img 
                src={userData.fotoDePerfil} 
                alt="Foto actual" 
                className="profile-current-image"
              />
            )}

            <div 
              className="profile-image-container" 
              ref={containerRef}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              {originalImage ? (
                <>
            <img
            ref={imageRef}
            src={originalImage}
            alt="Original"
            className="profile-original-image"
            onLoad={(e) => {
              const img = e.target;
              const containerRect = containerRef.current.getBoundingClientRect();
              const scale = Math.min(
                containerRect.width / img.naturalWidth,
                containerRect.height / img.naturalHeight
              );
              
              setImageSize({
                width: img.naturalWidth * scale,
                height: img.naturalHeight * scale
              });
              
              const offsetX = (containerRect.width - (img.naturalWidth * scale)) / 2;
              const offsetY = (containerRect.height - (img.naturalHeight * scale)) / 2;
              
              setImageOffset({ x: offsetX, y: offsetY });
              setImagePosition({ x: 0, y: 0 });
              
              setSelectorPosition({
                x: (containerRect.width - SELECTOR_SIZE) / 2,
                y: (containerRect.height - SELECTOR_SIZE) / 2
              });
              
              setImageLoaded(true);
            }}
            style={{
              position: 'absolute',
              left: `${imageOffset.x + imagePosition.x}px`,
              top: `${imageOffset.y + imagePosition.y}px`,
              width: `${imageSize.width * zoom}px`,
              height: `${imageSize.height * zoom}px`,
              transformOrigin: 'top left',
              pointerEvents: 'none'
            }}
          />
                  {imageLoaded && (
                    <Rnd
                      size={{ width: SELECTOR_SIZE, height: SELECTOR_SIZE }}
                      position={selectorPosition}
                      onDragStop={(e, d) => {
                        setSelectorPosition({ x: d.x, y: d.y });
                      }}
                      bounds="parent"
                      enableResizing={false}
                      className="profile-selector"
                    >
                      <div className="profile-selector-overlay" />
                    </Rnd>
                  )}
                </>
              ) : (
                <div className="profile-controls-container">
                <p>Selecciona una imagen para tu foto de perfil</p>
                <div className="file-input-wrapper">
                  <label className="file-input-button">
                    Seleccionar imagen
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoChange}
                      className="profile-file-input"
                    />
                  </label>
                </div>
              </div>
              )}
            </div>

            <div className="profile-modal-footer">
              {originalImage ? (
                <div className="btn-group">
                  <button 
                    className="btn primary"
                    onClick={handleImageSelect}
                    disabled={!imageLoaded}
                  >
                    Guardar
                  </button>
                  <button 
                    className="btn secondary"
                    onClick={() => {
                      setOriginalImage(null);
                      setImageLoaded(false);
                      setZoom(1);
                      setImageOffset({ x: 0, y: 0 });
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button 
                  className="btn secondary"
                  onClick={handleCloseModal}
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showForm ? (
        <AgregarCamiseta onClose={() => setShowForm(false)} onAgregar={handleAgregarCamiseta} />
      ) : (
        <div className="grid-container">
          {filteredCamisetas
            .filter((camiseta) => camiseta.club.toLowerCase().includes(search.toLowerCase()))
            .map((camiseta) => (
              <CamisetaItem
                key={camiseta.id}
                camiseta={camiseta}
                isDraggingCamiseta={isDraggingCamiseta}
                draggedCamiseta={draggedCamiseta}
                onMouseDown={handleCamisetaMouseDown}
                onMouseUp={handleCamisetaMouseUp}
                onMouseMove={handleCamisetaMouseMove}
                onClick={handleCamisetaClick}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default Camisetas;