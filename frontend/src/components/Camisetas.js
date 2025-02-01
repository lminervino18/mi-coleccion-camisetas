import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import './Camisetas.css';
import AgregarCamiseta from './AgregarCamiseta';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

function Camisetas() {
  const [camisetas, setCamisetas] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userData, setUserData] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 'auto', height: 'auto' });
  const [selectorPosition, setSelectorPosition] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const SELECTOR_SIZE = 200;

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
        }
      } catch (error) {
        console.error('Error al obtener camisetas', error);
      }
    };

    fetchUserData();
    fetchCamisetas();
  }, []);

  useEffect(() => {
    if (showProfileModal && imageRef.current && containerRef.current) {
      const img = imageRef.current;
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();

      const handleImageLoad = () => {
        const imgAspectRatio = img.naturalWidth / img.naturalHeight;
        const containerAspectRatio = containerRect.width / containerRect.height;
        
        let width, height;

        if (imgAspectRatio > containerAspectRatio) {
          width = containerRect.width;
          height = width / imgAspectRatio;
        } else {
          height = containerRect.height;
          width = height * imgAspectRatio;
        }

        setImageSize({ width, height });
        
        const offsetX = Math.max(0, (containerRect.width - width) / 2);
        const offsetY = Math.max(0, (containerRect.height - height) / 2);
        setImageOffset({ x: offsetX, y: offsetY });

        setSelectorPosition({
          x: offsetX + (width - SELECTOR_SIZE) / 2,
          y: offsetY + (height - SELECTOR_SIZE) / 2
        });

        setImageLoaded(true);
      };

      if (img.complete) {
        handleImageLoad();
      } else {
        img.onload = handleImageLoad;
      }
    }
  }, [showProfileModal, originalImage]);

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imageOffset.x,
        y: e.clientY - imageOffset.y
      });
    }
  };


  useEffect(() => {
    if (isDragging) {
      const handleMouseMoveEffect = (e) => {
        if (imageRef.current && containerRef.current) {
          const container = containerRef.current;
          const containerRect = container.getBoundingClientRect();
          
          const newX = e.clientX - dragStart.x;
          const newY = e.clientY - dragStart.y;
          
          const maxX = containerRect.width - (imageSize.width * zoom);
          const maxY = containerRect.height - (imageSize.height * zoom);
          
          setImageOffset({
            x: Math.min(Math.max(newX, maxX), 0),
            y: Math.min(Math.max(newY, maxY), 0)
          });
        }
      };
  
      const handleMouseUpEffect = () => {
        setIsDragging(false);
      };
  
      window.addEventListener('mousemove', handleMouseMoveEffect);
      window.addEventListener('mouseup', handleMouseUpEffect);
  
      return () => {
        window.removeEventListener('mousemove', handleMouseMoveEffect);
        window.removeEventListener('mouseup', handleMouseUpEffect);
      };
    }
  }, [isDragging, dragStart, imageSize.width, imageSize.height, zoom]);

  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      setZoom(prevZoom => {
        const newZoom = Math.max(0.5, Math.min(3, prevZoom * (1 - delta)));
        return Number(newZoom.toFixed(2));
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
  
    const sourceX = (selectorPosition.x - imageOffset.x) * scaleX;
    const sourceY = (selectorPosition.y - imageOffset.y) * scaleY;
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
    setCamisetas([...camisetas, nuevaCamiseta]);
    setShowForm(false);
  };

  const handleCamisetaClick = (camisetaId) => {
    navigate(`/camiseta/${camisetaId}`);
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
          <button className="add-button" onClick={() => setShowForm(true)}>
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

      {showLogoutConfirm && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
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
          <div className="profile-modal">
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
                    style={{
                      position: 'absolute',
                      left: `${imageOffset.x}px`,
                      top: `${imageOffset.y}px`,
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
                    <button className="file-input-button">
                      Seleccionar imagen
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoChange}
                      className="profile-file-input"
                    />
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
          {camisetas
            .filter((camiseta) => camiseta.club.toLowerCase().includes(search.toLowerCase()))
            .map((camiseta) => (
              <div 
                key={camiseta.id} 
                className="camiseta-item"
                onClick={() => handleCamisetaClick(camiseta.id)}
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
            ))}
        </div>
      )}
    </div>
  );
}

export default Camisetas;