import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import './AgregarCamiseta.css';

function AgregarCamiseta({ onClose, onAgregar }) {
  const [formData, setFormData] = useState({
    imagen: null,
    club: '',
    pais: '',
    temporada: '',
    nombre: '',
    dorsal: '',
    colores: [],
    talle: '',
    numeroEquipacion: '',
    comentarios: '',
  });

  const [selectedColors, setSelectedColors] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
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

  const SELECTOR_SIZE = 300;

  const talles = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Otro'];
  const equipaciones = [
    'Titular', 'Suplente', 'Tercera', 'Arquero',
    'Arquero Suplente', 'Arquero Tercera', 'Entrenamiento', 'Edición especial', 'Otra'
  ];
  const coloresDisponibles = [
    'Rojo', 'Azul', 'Verde', 'Amarillo', 'Negro', 'Blanco', 'Gris',
    'Naranja', 'Violeta', 'Celeste', 'Bordó', 'Rosa', 'Dorado', 'Plateado', 'Marrón'
  ];

  const handlePreviewClick = () => {
    if (originalImage) {
      setZoom(1);
      setShowImageModal(true);
    }
  };

  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      setZoom(prevZoom => {
        const newZoom = prevZoom * (1 - delta);
        return Math.min(Math.max(0.5, newZoom), 3);
      });
    }
  };

  const calculateImageDimensions = (img, containerRect) => {
    if (!img.naturalWidth || !img.naturalHeight) return;

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

    if (isFinite(width) && isFinite(height)) {
      setImageSize({ width, height });
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      
      const offsetX = (containerRect.width - width) / 2;
      const offsetY = (containerRect.height - height) / 2;
      setImageOffset({ x: offsetX, y: offsetY });

      setSelectorPosition({
        x: offsetX + (width - SELECTOR_SIZE) / 2,
        y: offsetY + (height - SELECTOR_SIZE) / 2
      });
    }
  };

  useEffect(() => {
    if (showImageModal && imageRef.current && containerRef.current) {
      const img = imageRef.current;
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();

      const handleImageLoad = () => {
        calculateImageDimensions(img, containerRect);
        setImageLoaded(true);
      };

      if (img.complete) {
        handleImageLoad();
      } else {
        img.onload = handleImageLoad;
      }
    }
  }, [showImageModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFormat(file.type || 'image/jpeg');
      setImageLoaded(false);
      setZoom(1);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result);
        setShowImageModal(true);
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
    
    // Calculamos las dimensiones reales de la imagen mostrada
    const displayedWidth = imageSize.width * zoom;
    const displayedHeight = imageSize.height * zoom;
    
    // Calculamos la relación entre las dimensiones originales y las mostradas
    const scaleX = img.naturalWidth / displayedWidth;
    const scaleY = img.naturalHeight / displayedHeight;
  
    // Calculamos la posición relativa del selector respecto a la imagen
    const imageLeft = imageOffset.x;
    const imageTop = imageOffset.y;
    
    // Calculamos las coordenadas del recorte en la imagen original
    const sourceX = (selectorPosition.x - imageLeft) * scaleX;
    const sourceY = (selectorPosition.y - imageTop) * scaleY;
    const sourceWidth = SELECTOR_SIZE * scaleX;
    const sourceHeight = SELECTOR_SIZE * scaleY;
  
    // Aseguramos que las coordenadas estén dentro de los límites de la imagen
    const clampedSourceX = Math.max(0, Math.min(sourceX, img.naturalWidth - sourceWidth));
    const clampedSourceY = Math.max(0, Math.min(sourceY, img.naturalHeight - sourceHeight));
  
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    try {
      ctx.drawImage(
        img,
        clampedSourceX,
        clampedSourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        SELECTOR_SIZE,
        SELECTOR_SIZE
      );
  
      // Mantenemos el formato original de la imagen
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const croppedImageUrl = URL.createObjectURL(blob);
            setPreviewImage(croppedImageUrl);
            setFormData(prev => ({ ...prev, imagen: blob }));
            setShowImageModal(false);
          }
        },
        imageFormat,
        1
      );
    } catch (error) {
      console.error('Error al recortar la imagen:', error);
    }
  };

  const handleColorChange = (e) => {
    const color = e.target.value;
    if (color && !selectedColors.includes(color)) {
      setSelectedColors(prev => [...prev, color]);
    }
  };

  const removeColor = (color) => {
    setSelectedColors(prev => prev.filter(c => c !== color));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.club || !formData.pais || !formData.temporada) {
      alert('Los campos "Club", "País" y "Temporada" son obligatorios.');
      return;
    }

    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) {
      alert('Error: Usuario no autenticado.');
      return;
    }

    const submitFormData = new FormData();
    submitFormData.append('usuarioId', usuarioId);
    Object.keys(formData).forEach(key => {
      if (key === 'colores') {
        submitFormData.append(key, selectedColors.join(','));
      } else {
        submitFormData.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch('http://localhost:8080/api/camisetas', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: submitFormData,
      });

      if (response.ok) {
        const addedCamiseta = await response.json();
        onAgregar(addedCamiseta);
        onClose();
      } else {
        console.error('Error al agregar la camiseta');
      }
    } catch (error) {
      console.error('Error en la conexión al servidor', error);
    }
  };

  return (
    <div className="form-overlay">
      {showImageModal && (
        <div className="image-modal-overlay">
          <div className="image-modal">
            <h3>Seleccionar área de la imagen</h3>
            <div 
              className="image-container" 
              ref={containerRef}
              onWheel={handleWheel}
              style={{ touchAction: 'none' }}
            >
              {originalImage && (
                <>
                  <img
                    ref={imageRef}
                    src={originalImage}
                    alt="Original"
                    className="original-image"
                    style={{
                      width: imageSize.width * zoom,
                      height: imageSize.height * zoom,
                      left: imageOffset.x,
                      top: imageOffset.y,
                      transform: `scale(${zoom})`,
                      transformOrigin: 'center',
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
                      className="selector"
                    >
                      <div className="selector-overlay" />
                    </Rnd>
                  )}
                </>
              )}
            </div>
            <div className="image-modal-buttons">
              <button 
                type="button" 
                className="modal-button primary"
                onClick={handleImageSelect}
                disabled={!imageLoaded}
              >
                Seleccionar
              </button>
              <button 
                type="button" 
                className="modal-button secondary"
                onClick={() => setShowImageModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      <form className="camiseta-form" onSubmit={handleSubmit}>
        <h2>Agregar Camiseta</h2>

        <input 
          type="text" 
          name="club" 
          placeholder="Club" 
          value={formData.club} 
          onChange={handleChange} 
          required 
        />
        <input 
          type="text" 
          name="pais" 
          placeholder="País" 
          value={formData.pais} 
          onChange={handleChange} 
          required 
        />
        <input 
          type="text" 
          name="temporada" 
          placeholder="Temporada (ej: 2017/2018)" 
          value={formData.temporada} 
          onChange={handleChange} 
          required 
        />

        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange} 
          required 
        />
        {previewImage && (
          <div 
            className="preview-container" 
            onClick={handlePreviewClick}
            style={{ cursor: 'pointer' }}
            title="Haz clic para volver a recortar"
          >
            <img 
              src={previewImage} 
              alt="Previsualización" 
              className="preview-image" 
            />
          </div>
        )}

        <input 
          type="text" 
          name="nombre" 
          placeholder="Nombre" 
          value={formData.nombre} 
          onChange={handleChange} 
        />
        <input 
          type="text" 
          name="dorsal" 
          placeholder="Dorsal" 
          value={formData.dorsal} 
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            dorsal: e.target.value ? parseInt(e.target.value) : '' 
          }))} 
        />

        <select 
          name="talle" 
          value={formData.talle} 
          onChange={handleChange} 
          required 
          className="select-input"
        >
          <option value="" disabled hidden>Selecciona un talle</option>
          {talles.map((talle) => (
            <option key={talle} value={talle}>{talle}</option>
          ))}
        </select>

        <select 
          onChange={handleColorChange} 
          value="" 
          className="select-input"
        >
          <option value="" disabled hidden>Seleccione los colores</option>
          {coloresDisponibles.map((color) => (
            <option key={color} value={color}>{color}</option>
          ))}
        </select>

        {selectedColors.length > 0 && (
          <div className="selected-colors active">
            {selectedColors.map((color, index) => (
              <span key={index} className="color-tag">
                {color} 
                <button type="button" onClick={() => removeColor(color)}>x</button>
              </span>
            ))}
          </div>
        )}

        <select 
          name="numeroEquipacion" 
          value={formData.numeroEquipacion} 
          onChange={handleChange} 
          required 
          className="select-input"
        >
          <option value="" disabled hidden>Selecciona número de equipación</option>
          {equipaciones.map((equipacion) => (
            <option key={equipacion} value={equipacion}>{equipacion}</option>
          ))}
        </select>

        <textarea 
          name="comentarios" 
          placeholder="Comentarios extra" 
          value={formData.comentarios} 
          onChange={handleChange} 
        />

        <div className="form-buttons-container">
          <div className="form-buttons">
            <button type="submit" className="btn btn-primary">Agregar Camiseta</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AgregarCamiseta;