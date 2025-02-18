import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import './EditarCamiseta.css';

function EditarCamiseta({ 
  camisetaSeleccionada, 
  onClose, 
  onActualizar 
}) {
  // Función para parsear colores
  const parseColores = () => {
    if (Array.isArray(camisetaSeleccionada.colores)) {
      return camisetaSeleccionada.colores;
    }
    
    if (typeof camisetaSeleccionada.colores === 'string') {
      return camisetaSeleccionada.colores.split(',').filter(color => color.trim() !== '');
    }
    
    return [];
  };

  const [formData, setFormData] = useState({
    id: camisetaSeleccionada.id,
    tipoDeCamiseta: camisetaSeleccionada.tipoDeCamiseta || 'Club',
    liga: camisetaSeleccionada.liga || '',
    imagenRecortada: null,
    imagenCompleta: null,
    club: camisetaSeleccionada.club || '',
    pais: camisetaSeleccionada.pais || '',
    temporada: camisetaSeleccionada.temporada || '',
    nombre: camisetaSeleccionada.nombre || '',
    dorsal: camisetaSeleccionada.dorsal || '',
    colores: [],
    talle: camisetaSeleccionada.talle || '',
    numeroEquipacion: camisetaSeleccionada.numeroEquipacion || '',
    comentarios: camisetaSeleccionada.comentarios || '',
  });
  const [selectedColors, setSelectedColors] = useState(parseColores());
  const [showImageModal, setShowImageModal] = useState(false);
  const [originalImage, setOriginalImage] = useState(
    camisetaSeleccionada.imagenCompletaBase64 
      ? `data:image/jpeg;base64,${camisetaSeleccionada.imagenCompletaBase64}`
      : null
  );
  const [previewImage, setPreviewImage] = useState(
    camisetaSeleccionada.imagenRecortadaBase64 
      ? `data:image/jpeg;base64,${camisetaSeleccionada.imagenRecortadaBase64}` 
      : null
  );
  const [imageSize, setImageSize] = useState({ width: 'auto', height: 'auto' });
  const [selectorPosition, setSelectorPosition] = useState({ x: 0, y: 0 });
  const [imageFormat, setImageFormat] = useState('image/jpeg');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [temporadaError, setTemporadaError] = useState('');
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

  const handlePreviewClick = () => {
    if (originalImage) {
      setZoom(1);
      setImagePosition({ x: 0, y: 0 });
      setShowImageModal(true);
    } else if (camisetaSeleccionada.imagenCompletaBase64) {
      setOriginalImage(`data:image/jpeg;base64,${camisetaSeleccionada.imagenCompletaBase64}`);
      setZoom(1);
      setImagePosition({ x: 0, y: 0 });
      setShowImageModal(true);
    }
  };

  const validarTemporada = (temporada) => {
    // Si está vacío, no mostrar error
    if (!temporada) return '';
  
    // Regex básico para el formato
    const temporadaRegex = /^\d{4}(?:\/\d{4})?$/;
    if (!temporadaRegex.test(temporada)) {
      return 'Formato inválido. Use: YYYY o YYYY/YYYY (ejemplo: 2023 o 2023/2024)';
    }
  
    if (temporada.includes('/')) {
      const [primerAño, segundoAño] = temporada.split('/').map(Number);
      
      // Validar que los años sean razonables
      if (primerAño < 1900) {
        return 'El año no puede ser anterior a 1900';
      }
  
      // Validar que el segundo año sea el siguiente al primero
      if (segundoAño !== primerAño + 1) {
        return 'El segundo año debe ser el siguiente al primero';
      }
    } else {
      const año = Number(temporada);
      
      // Validar que el año sea razonable
      if (año < 1800) {
        return 'El año no puede ser anterior a 1900';
      }
    }
  
    return ''; // Sin errores
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
      // Efecto para manejar el zoom
    useEffect(() => {
      const container = containerRef.current;
      if (container && showImageModal) {
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
          if (e.target.closest('.selector')) return;
          
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
    }, [showImageModal, imagePosition, zoom]);

    // Efecto para manejar el arrastre
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


    const handleChange = (e) => {
      const { name, value } = e.target;
      
      if (name === 'tipoDeCamiseta') {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          // Limpiar club y liga cuando se cambia el tipo
          club: '',
          liga: ''
        }));
      } else if (name === 'temporada') {
        setFormData(prev => ({ ...prev, [name]: value }));
        const error = validarTemporada(value);
        setTemporadaError(error);
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
        async (blob) => {
          if (blob) {
            const croppedImageUrl = URL.createObjectURL(blob);
            setPreviewImage(croppedImageUrl);
  
            // Si no hay una nueva imagen completa, necesitamos crear un Blob de la imagen existente
            if (!formData.imagenCompleta && camisetaSeleccionada.imagenCompletaBase64) {
              // Convertir la imagen base64 existente a Blob
              const response = await fetch(`data:image/jpeg;base64,${camisetaSeleccionada.imagenCompletaBase64}`);
              const originalBlob = await response.blob();
              
              setFormData(prev => ({ 
                ...prev, 
                imagenCompleta: originalBlob,
                imagenRecortada: blob 
              }));
            } else {
              setFormData(prev => ({ 
                ...prev, 
                imagenRecortada: blob 
              }));
            }
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

      // Validar temporada
    const temporadaError = validarTemporada(formData.temporada);
    if (temporadaError) {
      alert(temporadaError);
      return;
    }

    // Modificar la validación para que el club solo sea obligatorio si es tipo Club
    if ((!formData.club && formData.tipoDeCamiseta === 'Club') || !formData.pais || !formData.temporada) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }

    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) {
      alert('Error: Usuario no autenticado.');
      return;
    }

    const submitFormData = new FormData();
    
    // Añadir ID para actualización
    submitFormData.append('id', formData.id);
    submitFormData.append('usuarioId', usuarioId);
    
    // Agregar imágenes si hay una nueva área recortada o una nueva imagen
    if (formData.imagenRecortada) {
      if (formData.imagenCompleta) {
        submitFormData.append('imagenCompleta', formData.imagenCompleta);
      }
      submitFormData.append('imagenRecortada', formData.imagenRecortada);
    }
    
    submitFormData.append('club', formData.club);
    submitFormData.append('pais', formData.pais);
    submitFormData.append('temporada', formData.temporada);
    submitFormData.append('nombre', formData.nombre || '');
    submitFormData.append('dorsal', formData.dorsal || '');
    submitFormData.append('talle', formData.talle);
    submitFormData.append('colores', selectedColors.join(','));
    submitFormData.append('numeroEquipacion', formData.numeroEquipacion);
    submitFormData.append('comentarios', formData.comentarios || '');
    submitFormData.append('tipoDeCamiseta', formData.tipoDeCamiseta);
    submitFormData.append('liga', formData.liga || '');


    try {
      const response = await fetch(`http://localhost:8080/api/camisetas/usuario/${usuarioId}/camiseta/${formData.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
        body: submitFormData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedCamiseta = await response.json();
      onActualizar(updatedCamiseta);
      onClose();
    } catch (error) {
      console.error('Error al actualizar la camiseta:', error);
      alert('Error al actualizar la camiseta. Por favor, intente nuevamente.');
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
        <h2>Editar Camiseta</h2>
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
          name="pais" 
          placeholder="País" 
          value={formData.pais} 
          onChange={handleChange} 
          required 
        />
        <input 
          type="text" 
          name="liga" 
          placeholder="Liga" 
          value={formData.liga} 
          onChange={handleChange}
          disabled={formData.tipoDeCamiseta === 'Seleccion'}
          className="form-input"
        />

        <input 
          type="text" 
          name="club" 
          placeholder="Club" 
          value={formData.club} 
          onChange={handleChange}
          disabled={formData.tipoDeCamiseta === 'Seleccion'}
          required={formData.tipoDeCamiseta === 'Club'} 
          className="form-input"
        />
        
        <div className="input-group">
          <input 
            type="text" 
            name="temporada" 
            placeholder="Temporada (ej: 2023 o 2023/2024)" 
            value={formData.temporada} 
            onChange={handleChange} 
            required 
            className={`form-input ${temporadaError ? 'error' : ''}`}
          />
          {temporadaError && <span className="error-message">{temporadaError}</span>}
        </div>

        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange} 
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
            <button type="submit" className="btn btn-primary">Actualizar Camiseta</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EditarCamiseta;
