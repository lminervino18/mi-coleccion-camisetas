import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import './Camisetas.css';
import AgregarCamiseta from './AgregarCamiseta';

function Camisetas() {
  const [camisetas, setCamisetas] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 'auto', height: 'auto' });
  const [selectorPosition, setSelectorPosition] = useState({ x: 0, y: 0 });
  const [imageFormat, setImageFormat] = useState('image/jpeg');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

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
      setImageFormat(file.type || 'image/jpeg');
      setImageLoaded(false);
      setZoom(1);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSelect = () => {
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

      canvas.toBlob(
        async (blob) => {
          if (blob) {
            try {
              const reader = new FileReader();
              reader.onloadend = async () => {
                const base64data = reader.result;
                
                const response = await fetch(`http://localhost:8080/api/usuarios/${localStorage.getItem('usuarioId')}/foto-perfil`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                  },
                  body: JSON.stringify({ fotoDePerfil: base64data }),
                });

                if (response.ok) {
                  const updatedUser = await response.json();
                  setUserData(updatedUser);
                  setShowProfileModal(false);
                  setOriginalImage(null);
                }
              };
              reader.readAsDataURL(blob);
            } catch (error) {
              console.error('Error al actualizar la foto de perfil:', error);
            }
          }
        },
        imageFormat,
        1
      );
    } catch (error) {
      console.error('Error al recortar la imagen:', error);
    }
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
        </div>
      </div>

      {showProfileModal && (
        <div className="modal-overlay">
          <div className="profile-modal">
            <h3>Elige el área para tu foto de perfil</h3>
            <div 
              className="profile-image-container" 
              ref={containerRef}
              onWheel={handleWheel}
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
                      transformOrigin: 'top left'
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
                <div className="upload-prompt">
                  <p>Selecciona una imagen para tu foto de perfil</p>
                </div>
              )}
            </div>
            <div className="profile-modal-controls">
              {!originalImage ? (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  className="profile-file-input"
                />
              ) : (
                <div className="profile-modal-buttons">
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
                      setShowProfileModal(false);
                      setOriginalImage(null);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
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