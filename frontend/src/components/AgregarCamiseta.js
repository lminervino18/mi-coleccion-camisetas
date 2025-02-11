import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import './AgregarCamiseta.css';

function AgregarCamiseta({ onClose, onAgregar }) {
  const [formData, setFormData] = useState({
    tipoDeCamiseta: '', // Nuevo campo
    liga: '',          // Nuevo campo
    imagenRecortada: null,
    imagenCompleta: null,
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
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

  useEffect(() => {
    setImagePosition({ x: 0, y: 0 });
  }, [zoom]);

  const handleImageMouseDown = (e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      });
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
        const newZoom = Math.max(0.5, Math.min(3, prevZoom * (1 - delta)));
        return Number(newZoom.toFixed(2));
      });
    }
  };

  useEffect(() => {
    if (showImageModal && imageRef.current && containerRef.current) {
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
        setImageDimensions({ 
          width: img.naturalWidth, 
          height: img.naturalHeight 
        });
        
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
  }, [showImageModal, originalImage]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      
      if (name === 'tipoDeCamiseta') {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          club: value === 'Seleccion' ? prev.pais : prev.club // La selección usa el país como club
        }));
      } else if (name === 'pais' && formData.tipoDeCamiseta === 'Seleccion') {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          club: value // Actualizar club con el país para selecciones
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFormat(file.type || 'image/jpeg');
      setImageLoaded(false);
      setZoom(1);
      setImagePosition({ x: 0, y: 0 });
      
      setFormData(prev => ({
        ...prev,
        imagenCompleta: file
      }));
      
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
    
    const displayedWidth = imageSize.width * zoom;
    const displayedHeight = imageSize.height * zoom;
    
    const scaleX = img.naturalWidth / displayedWidth;
    const scaleY = img.naturalHeight / displayedHeight;

    const sourceX = ((selectorPosition.x - imageOffset.x - imagePosition.x) * scaleX);
    const sourceY = ((selectorPosition.y - imageOffset.y - imagePosition.y) * scaleY);
    const sourceWidth = SELECTOR_SIZE * scaleX;
    const sourceHeight = SELECTOR_SIZE * scaleY;

    try {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, SELECTOR_SIZE, SELECTOR_SIZE);

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
        (blob) => {
          if (blob) {
            const croppedImageUrl = URL.createObjectURL(blob);
            setPreviewImage(croppedImageUrl);
            setFormData(prev => ({ 
              ...prev, 
              imagenRecortada: blob 
            }));
            setShowImageModal(false);
          }
        },
        imageFormat,
        1
      );
    } catch (error) {
      console.error('Error al recortar la imagen:', error);
    }
  }
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
    submitFormData.append('tipoDeCamiseta', formData.tipoDeCamiseta);
    submitFormData.append('liga', formData.liga || '');
    submitFormData.append('imagenCompleta', formData.imagenCompleta);
    submitFormData.append('imagenRecortada', formData.imagenRecortada);
    submitFormData.append('club', formData.club);
    submitFormData.append('pais', formData.pais);
    submitFormData.append('temporada', formData.temporada);
    submitFormData.append('nombre', formData.nombre || '');
    submitFormData.append('dorsal', formData.dorsal || '');
    submitFormData.append('talle', formData.talle);
    submitFormData.append('colores', selectedColors.join(','));
    submitFormData.append('numeroEquipacion', formData.numeroEquipacion);
    submitFormData.append('comentarios', formData.comentarios || '');

    try {
      const response = await fetch('http://18.118.189.193:8080/api/camisetas', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: submitFormData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const addedCamiseta = await response.json();
      onAgregar(addedCamiseta);
      onClose();
    } catch (error) {
      console.error('Error al agregar la camiseta:', error);
      alert('Error al agregar la camiseta. Por favor, intente nuevamente.');
    }
  };

  return (
    <div className="form-overlay">
      {showImageModal && (
        <div className="image-modal-overlay">
          <div className="image-modal">
            <h3>Elige el área que se mostrará como miniatura</h3>
            <div 
              className="image-container" 
              ref={containerRef}
              onWheel={handleWheel}
              onMouseMove={handleImageMouseMove}
              onMouseUp={handleImageMouseUp}
              onMouseLeave={handleImageMouseUp}
              style={{ 
                position: 'relative',
                width: '100%',
                height: '500px',
                overflow: 'hidden',
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: `${imagePosition.x}px`,
                  top: `${imagePosition.y}px`,
                  width: '100%',
                  height: '100%',
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
                onMouseDown={handleImageMouseDown}
              >
                <img
                  ref={imageRef}
                  src={originalImage}
                  alt="Original"
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
              </div>
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
        <div className="tipo-camiseta-container">
        <div className="tipo-camiseta-options">
          <label className={`tipo-option ${formData.tipoDeCamiseta === 'Club' ? 'active' : ''}`}>
            <input
              type="radio"
              name="tipoDeCamiseta"
              value="Club"
              checked={formData.tipoDeCamiseta === 'Club'}
              onChange={handleChange}
              required
            />
            Club
          </label>
          <label className={`tipo-option ${formData.tipoDeCamiseta === 'Seleccion' ? 'active' : ''}`}>
            <input
              type="radio"
              name="tipoDeCamiseta"
              value="Seleccion"
              checked={formData.tipoDeCamiseta === 'Seleccion'}
              onChange={handleChange}
            />
            Selección
          </label>
        </div>
      </div>

      <input 
        type="text" 
        name="liga" 
        placeholder="Liga" 
        value={formData.liga} 
        onChange={handleChange}
        className="form-input"
      />

      <input 
        type="text" 
        name="club" 
        placeholder="Club" 
        value={formData.club} 
        onChange={handleChange}
        disabled={formData.tipoDeCamiseta === 'Seleccion'}
        required 
        className="form-input"
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
          value={formData.dorsal || ''} 
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || /^[0-9]+$/.test(value)) {
              setFormData(prev => ({
                ...prev,
                dorsal: value === '' ? '' : parseInt(value)
              }));
            }
          }}
        />

        <select 
          name="talle" 
          value={formData.talle} 
          onChange={handleChange} 
          required 
          className={`select-input ${formData.talle ? 'has-value' : ''}`}
        >
          <option value="" disabled hidden>Selecciona un talle</option>
          {talles.map((talle) => (
            <option key={talle} value={talle}>{talle}</option>
          ))}
        </select>

        <select 
          onChange={handleColorChange} 
          value="" 
          className={`select-input ${selectedColors.length > 0 ? 'has-value' : ''}`}
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
          className={`select-input ${formData.numeroEquipacion ? 'has-value' : ''}`}
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