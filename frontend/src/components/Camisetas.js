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
  faArrowLeft,
  faExclamation,
  faChartSimple,  // Añade este ícono
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';


const API_URL = process.env.REACT_APP_API_URL;



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
      <h3>{camiseta.tipoDeCamiseta === 'Club' ? camiseta.club : camiseta.pais} {camiseta.temporada}</h3>        <h3>{camiseta.numeroEquipacion}</h3>
      </div>
    </div>
  );
});

CamisetaItem.displayName = 'CamisetaItem';
function Camisetas() {



   // Funciones para manejar el localStorage
   const saveToLocalStorage = (key, value) => {
    const usuarioId = localStorage.getItem('usuarioId');
    localStorage.setItem(`${key}_${usuarioId}`, JSON.stringify(value));
  };

    const getFromLocalStorage = (key) => {
      const usuarioId = localStorage.getItem('usuarioId');
      const value = localStorage.getItem(`${key}_${usuarioId}`);
      return value ? JSON.parse(value) : null;
    };


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
  const [activeFilters, setActiveFilters] = useState(() => 
    getFromLocalStorage('activeFilters') || {
      talle: [],
      dorsal: null,
      colores: [],
      temporada: [],
      pais: [],
      club: [],
      numeroEquipacion: []
    }
  );
  
  const [sortBy, setSortBy] = useState(() => getFromLocalStorage('sortBy') || null);
  const [sortDirection, setSortDirection] = useState(() => getFromLocalStorage('sortDirection') || 'asc');
  const [quickFilter, setQuickFilter] = useState(() => getFromLocalStorage('quickFilter') || null);
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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const [availableLigas, setAvailableLigas] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
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


// Agregar este useEffect después de los otros useEffect
useEffect(() => {
  const fetchUserData = async () => {
    try {
      const usuarioId = localStorage.getItem('usuarioId');
      const response = await fetch(`${API_URL}/api/usuarios/${usuarioId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario', error);
    }
  };

  fetchUserData();
}, []);

  useEffect(() => {
    const fetchCamisetas = async () => {
      try {
        const usuarioId = localStorage.getItem('usuarioId');
        const response = await fetch(`${API_URL}/api/camisetas/${usuarioId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setCamisetas(data);
          
          // Aplicar filtros guardados
          const savedFilters = getFromLocalStorage('activeFilters');
          const savedQuickFilter = getFromLocalStorage('quickFilter');
          const savedSortBy = getFromLocalStorage('sortBy');
          const savedSortDirection = getFromLocalStorage('sortDirection');
          
          let filteredData = [...data];
          
          // Aplicar filtros guardados
          if (savedFilters) {
            filteredData = applyStoredFilters(filteredData, savedFilters);
          }
          
          // Aplicar quick filter guardado
          if (savedQuickFilter) {
            filteredData = applyQuickFilter(filteredData, savedQuickFilter);
          }
          
          // Aplicar ordenamiento guardado
          if (savedSortBy) {
            filteredData = applySorting(filteredData, savedSortBy, savedSortDirection);
            setTempSortBy(savedSortBy);
            setTempSortDirection(savedSortDirection);
          }
          
          setFilteredCamisetas(filteredData);
          
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
  
    fetchCamisetas();
  }, []);

  useEffect(() => {
    const clubs = [...new Set(camisetas.map(c => c.club))]
      .filter(club => club !== null && club !== '') // Filtrar null y strings vacíos
      .sort();
    const paises = [...new Set(camisetas.map(c => c.pais))]
      .filter(pais => pais !== null && pais !== '') // También para países
      .sort();
    
    setAvailableClubs(clubs);
    setAvailablePaises(paises);
  }, [camisetas]);


  useEffect(() => {
    const container = containerRef.current;
    if (container && showProfileModal) {
      const handleWheel = (e) => {
        if (e.ctrlKey) {
          e.preventDefault();
          const delta = e.deltaY * -0.01;
          
          const containerRect = container.getBoundingClientRect();
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
  
      const handleMouseDown = (e) => {
        if (e.target.closest('.profile-selector')) return;
        
        if (e.button === 0) {
          setIsDragging(true);
          setDragStart({
            x: e.clientX - imagePosition.x,
            y: e.clientY - imagePosition.y
          });
          e.preventDefault();
        }
      };
  
      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('mousedown', handleMouseDown);
  
      return () => {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('mousedown', handleMouseDown);
      };
    }
  }, [showProfileModal, imagePosition, zoom]);

  
    // Agrega este useEffect para obtener las ligas únicas
    useEffect(() => {
      const ligas = [...new Set(camisetas.map(c => c.liga))].sort();
      setAvailableLigas(ligas);
    }, [camisetas]);


    useEffect(() => {
      saveToLocalStorage('activeFilters', activeFilters);
    }, [activeFilters]);
    
    useEffect(() => {
      saveToLocalStorage('sortBy', sortBy);
    }, [sortBy]);
    
    useEffect(() => {
      saveToLocalStorage('sortDirection', sortDirection);
    }, [sortDirection]);
    
    useEffect(() => {
      saveToLocalStorage('quickFilter', quickFilter);
    }, [quickFilter]);

    const generateShareLink = async () => {
      try {
        const response = await fetch(`${API_URL}/api/shared/generar-link`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
    
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Error generando link compartido');
        }
    
        const data = await response.json();
        
        // Asegúrate de que la respuesta tenga la URL completa
        if (data.urlCompleta) {
          setShareLink(data.urlCompleta);
          setShowShareModal(true);
        } else {
          throw new Error('Respuesta inválida del servidor');
        }
      } catch (error) {
        console.error('Error generando link compartido:', error);
        alert(error.message);
      }
    };


    const copyShareLink = () => {
      navigator.clipboard.writeText(shareLink)
        .then(() => {
          alert('Link copiado al portapapeles');
        })
        .catch(err => {
          console.error('Error copiando link:', err);
          alert('No se pudo copiar el link');
        });
    };

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
      // Forzar actualización de la grilla
      setFilteredCamisetas([...camisetas]);
      
      const usuarioId = localStorage.getItem('usuarioId');
      localStorage.setItem(`filteredCamisetasIds_${usuarioId}`, JSON.stringify(camisetas.map(c => c.id)));
    } else {
      setQuickFilter(filter);
      
      // Filtrar camisetas según el quick filter
      const filtered = filter === 'Club' || filter === 'Seleccion'
        ? camisetas.filter(camiseta => camiseta.tipoDeCamiseta === filter)
        : camisetas.filter(camiseta => camiseta.liga === filter);
      
      setFilteredCamisetas(filtered);
      
      const usuarioId = localStorage.getItem('usuarioId');
      localStorage.setItem(`filteredCamisetasIds_${usuarioId}`, JSON.stringify(filtered.map(c => c.id)));
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
    const usuarioId = localStorage.getItem('usuarioId');
    
    setActiveFilters({
      talle: [],
      dorsal: null,
      colores: [],
      temporada: [],
      pais: [],
      club: [],
      numeroEquipacion: []
    });
    
    localStorage.removeItem(`activeFilters_${usuarioId}`);
    
    setSelectedClub('');
    setSelectedPais('');
    setSelectedColor('');
    setSelectedEquipacion('');
    
    // Restaurar todos los IDs y la lista completa de camisetas
    setFilteredCamisetas([...camisetas]);
    localStorage.setItem(`filteredCamisetasIds_${usuarioId}`, JSON.stringify(camisetas.map(c => c.id)));
  
    setQuickFilter(null);
    setSortBy(null);
    setSortDirection('asc');
    
    localStorage.removeItem(`quickFilter_${usuarioId}`);
    localStorage.removeItem(`sortBy_${usuarioId}`);
    localStorage.removeItem(`sortDirection_${usuarioId}`);
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

    // Guardar IDs de camisetas filtradas en localStorage
    const usuarioId = localStorage.getItem('usuarioId');
    localStorage.setItem(`filteredCamisetasIds_${usuarioId}`, JSON.stringify(filtered.map(c => c.id)));
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
        
        // Función auxiliar para comparar considerando null
        const compareWithNull = (valA, valB) => {
          if (valA === null && valB === null) return 0;
          if (valA === null) return 1; // B es más pequeño (viene primero)
          if (valB === null) return -1; // A es más pequeño (viene primero)
          return 0; // Continuar con la comparación normal
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
            if (tempSortBy === null) {
              return customOrder.indexOf(a.id) - customOrder.indexOf(b.id);
            }
            const nullCheckDefault = compareWithNull(a[tempSortBy], b[tempSortBy]);
            if (nullCheckDefault !== 0) return nullCheckDefault;
            comparison = a[tempSortBy].localeCompare(b[tempSortBy]);
        }
        
        return tempSortDirection === 'asc' ? comparison : -comparison;
      });
    }
  
    setFilteredCamisetas(sorted);
    setShowSort(false);

    const usuarioId = localStorage.getItem('usuarioId');
    localStorage.setItem(`filteredCamisetasIds_${usuarioId}`, JSON.stringify(sorted.map(c => c.id)));
};

// Agregar estas funciones después de tus useState

// Función para aplicar los filtros guardados
const applyStoredFilters = (data, filters) => {
  let filtered = [...data];
  
  if (filters.talle.length > 0) {
    filtered = filtered.filter(camiseta => 
      filters.talle.includes(camiseta.talle)
    );
  }

  if (filters.dorsal !== null) {
    filtered = filtered.filter(camiseta => 
      filters.dorsal ? camiseta.dorsal : !camiseta.dorsal
    );
  }

  if (filters.colores.length > 0) {
    filtered = filtered.filter(camiseta => 
      camiseta.colores.some(color => filters.colores.includes(color))
    );
  }

  if (filters.temporada.length > 0) {
    filtered = filtered.filter(camiseta =>
      filters.temporada.includes(camiseta.temporada)
    );
  }

  if (filters.pais.length > 0) {
    filtered = filtered.filter(camiseta =>
      filters.pais.includes(camiseta.pais)
    );
  }

  if (filters.club.length > 0) {
    filtered = filtered.filter(camiseta =>
      filters.club.includes(camiseta.club)
    );
  }

  if (filters.numeroEquipacion.length > 0) {
    filtered = filtered.filter(camiseta =>
      filters.numeroEquipacion.includes(camiseta.numeroEquipacion)
    );
  }

  return filtered;
};

// Función para aplicar el filtro rápido
const applyQuickFilter = (data, quickFilter) => {
  if (quickFilter === 'Club' || quickFilter === 'Seleccion') {
    return data.filter(camiseta => camiseta.tipoDeCamiseta === quickFilter);
  } else {
    return data.filter(camiseta => camiseta.liga === quickFilter);
  }
};

// Función para aplicar el ordenamiento
const applySorting = (data, sortBy, sortDirection) => {
  if (!sortBy) return data;

  return [...data].sort((a, b) => {
    let comparison = 0;
    
    const compareWithNull = (valA, valB) => {
      if (valA === null && valB === null) return 0;
      if (valA === null) return 1;
      if (valB === null) return -1;
      return 0;
    };

    switch (sortBy) {
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
        const nullCheckDefault = compareWithNull(a[sortBy], b[sortBy]);
        if (nullCheckDefault !== 0) return nullCheckDefault;
        comparison = a[sortBy].localeCompare(b[sortBy]);
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
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


useEffect(() => {
  if (isDragging) {
    const handleMouseMove = (e) => {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setImagePosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseUp);
    };
  }
}, [isDragging, dragStart]);

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
      
      const response = await fetch(`${API_URL}/api/usuarios/${localStorage.getItem('usuarioId')}/foto-perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
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
    const usuarioId = localStorage.getItem('usuarioId');
    
    // Limpiar filtros y ordenamiento
    localStorage.removeItem(`activeFilters_${usuarioId}`);
    localStorage.removeItem(`quickFilter_${usuarioId}`);
    localStorage.removeItem(`sortBy_${usuarioId}`);
    localStorage.removeItem(`sortDirection_${usuarioId}`);
    localStorage.removeItem(`customOrder_${usuarioId}`);
    
    // Limpiar token y usuarioId
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

  // Para el menú de perfil
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-photo-container')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleBackInPhotoEdit = () => {
    if (originalImage) {
      // Si hay una imagen siendo editada, solo vuelve al estado anterior
      setOriginalImage(null);
      setImageLoaded(false);
      setZoom(1);
      setImageOffset({ x: 0, y: 0 });
    } else {
      // Si no hay imagen siendo editada, cierra el modal completamente
      handleCloseModal();
    }
  };

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
      <button className="add-button" onClick={() => setShowForm(true)} title="Agregar camiseta">
        +
      </button>
    </div>
    
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
      {availableLigas.filter(liga => liga).map(liga => (
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

      <div className="user-profile">
      <span className="username">{userData?.username}</span>
      <div className="profile-photo-container">
        <div 
          className="profile-photo" 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          {userData?.fotoDePerfil ? (
            <img src={userData.fotoDePerfil} alt="Perfil" />
          ) : (
            <div className="initials">
              {userData?.username && getInitials(userData.username)}
            </div>
          )}
        </div>
        
        {showShareModal && (
          <div className="share-modal-overlay">
            <div className="share-modal-content">
              <h2>Compartir Colección</h2>
              <input 
                type="text" 
                value={shareLink} 
                readOnly 
                className="share-link-input"
              />
              <div className="share-modal-actions">
                <button onClick={copyShareLink}>Copiar Link</button>
                <button onClick={() => setShowShareModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}

        {showProfileMenu && (
          <div className="profile-menu">
            <button onClick={() => {
              setShowProfileModal(true);
              setShowProfileMenu(false);
            }}>
              Cambiar foto
            </button>
            <button onClick={() => {
              setShowDeleteConfirm(true);
              setShowProfileMenu(false);
            }}>
              Eliminar cuenta
            </button>
          </div>
        )}
      </div>
      
      

      {/* Nuevo botón de estadísticas */}
      <FontAwesomeIcon 
        icon={faChartSimple} 
        className="stats-icon"
        onClick={() => navigate('/estadisticas-camisetas')}
        title="Estadísticas"
      />
      
      <FontAwesomeIcon 
          icon={faExternalLinkAlt} 
          className="share-icon"
          onClick={generateShareLink}
          title="Compartir colección"
        />
      {showShareModal && (
        <div className="share-modal-overlay">
          <div className="share-modal-content">
            <h2>Compartir Colección</h2>
            <input 
              type="text" 
              value={shareLink} 
              readOnly 
              className="share-link-input"
            />
            <div className="share-modal-actions">
              <button onClick={copyShareLink}>Copiar Link</button>
              <button onClick={() => setShowShareModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
      
      <FontAwesomeIcon 
        icon={faSignOutAlt} 
        className="logout-icon"
        onClick={handleLogout}
        title="Cerrar sesión"
      />
    </div>
      </div>
      {showFilters && (
          <div 
            className="modal-overlay"
            onClick={(e) => {
              if (e.target.className === 'modal-overlay') {
                setShowFilters(false);
                // Restaurar los filtros originales guardados en localStorage
                const savedFilters = getFromLocalStorage('activeFilters') || {
                  talle: [],
                  dorsal: null,
                  colores: [],
                  temporada: [],
                  pais: [],
                  club: [],
                  numeroEquipacion: []
                };
                
                // Restaurar los estados de selección
                setActiveFilters(savedFilters);
                
                // Resetear los estados de selección
                setSelectedClub('');
                setSelectedPais('');
                setSelectedColor('');
                setSelectedEquipacion('');
              }
            }}
          >
          <div className="modal-content filters-modal" onClick={e => e.stopPropagation()}>
            <div className="filters-header">
            <button 
              className="back-button" 
              onClick={() => {
                setShowFilters(false);
                // Restaurar los filtros originales guardados en localStorage
                const savedFilters = getFromLocalStorage('activeFilters') || {
                  talle: [],
                  dorsal: null,
                  colores: [],
                  temporada: [],
                  pais: [],
                  club: [],
                  numeroEquipacion: []
                };
                
                // Restaurar los estados de selección
                setActiveFilters(savedFilters);
                
                // Resetear los estados de selección
                setSelectedClub('');
                setSelectedPais('');
                setSelectedColor('');
                setSelectedEquipacion('');
              }}
            >
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
      )}{showFilters && (
        <div 
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.className === 'modal-overlay') {
              setShowFilters(false);
              // Restaurar estado anterior de los filtros
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

            {tempSortBy && tempSortBy !== null && (
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
                  
                  // Restaurar el orden personalizado
                  const reorderedCamisetas = [...filteredCamisetas].sort((a, b) => {
                    return customOrder.indexOf(a.id) - customOrder.indexOf(b.id);
                  });
                  
                  setFilteredCamisetas(reorderedCamisetas);
                  setShowSort(false);
                }}
              >
                Limpiar ordenamiento
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

      {showDeleteConfirm && (
        <div 
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.className === 'modal-overlay') {
              setShowDeleteConfirm(false);
              setPassword('');
            }
          }}
        >
          <div className="modal-content delete-account-modal" onClick={e => e.stopPropagation()}>
            <div className="delete-modal-header">
              <button 
                className="back-button" 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setPassword('');
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h3>Eliminar cuenta</h3>
            </div>

            <div className="delete-modal-content">
              <div className="warning-icon">
                <FontAwesomeIcon icon={faExclamation} />
              </div>
              <p>Esta acción es irreversible. Por favor, ingresa tu contraseña para confirmar:</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="password-input"
              />
            </div>

            <div className="delete-modal-footer">
              <div className="button-group">
                <button 
                  className="delete-btn"
                  onClick={async () => {
                    try {
                      const response = await fetch(`${API_URL}/api/usuarios/${userData.id}`, {
                        method: 'DELETE',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                        credentials: 'include',
                        body: JSON.stringify({ password }),
                      });
                      
                      if (response.ok) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('usuarioId');
                        navigate('/login');
                      } else {
                        alert('Contraseña incorrecta');
                      }
                    } catch (error) {
                      console.error('Error:', error);
                      alert('Error al eliminar la cuenta');
                    }
                  }}
                >
                  Eliminar cuenta
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setPassword('');
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showProfileModal && (
        <div 
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.className === 'modal-overlay') {
              handleCloseModal();
            }
          }}
        >
          <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
            <div className="profile-modal-header">
              <button 
              className="back-button" 
              onClick={handleBackInPhotoEdit}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
              <h3>Foto de perfil</h3>
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
          .filter((camiseta) => {
            const searchTerm = search.toLowerCase();
            if (quickFilter) {
              if (quickFilter === 'Club' || quickFilter === 'Seleccion') {
                if (camiseta.tipoDeCamiseta !== quickFilter) return false;
              } else if (camiseta.liga !== quickFilter) {
                return false;
              }
            }
            return (
              camiseta.club.toLowerCase().includes(searchTerm) ||
              camiseta.pais.toLowerCase().includes(searchTerm) ||
              camiseta.temporada.toLowerCase().includes(searchTerm) ||
              camiseta.numeroEquipacion.toLowerCase().includes(searchTerm) ||
              (camiseta.nombre && camiseta.nombre.toLowerCase().includes(searchTerm)) ||
              (camiseta.dorsal && camiseta.dorsal.toString().includes(searchTerm)) ||
              camiseta.talle.toLowerCase().includes(searchTerm) ||
              camiseta.colores.some(color => color.toLowerCase().includes(searchTerm))
            );
          })
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