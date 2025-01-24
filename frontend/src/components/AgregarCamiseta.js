import React, { useState } from 'react';
import './AgregarCamiseta.css';

function AgregarCamiseta({ onClose, onAgregar }) {
  const [newCamiseta, setNewCamiseta] = useState({
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

  const [previewImage, setPreviewImage] = useState(null);
  const [selectedColors, setSelectedColors] = useState([]);

  const talles = ['XS', 'S', 'M', 'L', 'XL'];
  const equipaciones = [
    'Titular', 'Suplente', 'Tercera', 'Arquero',
    'Arquero Suplente', 'Arquero Tercera', 'Entrenamiento', 'Edición especial'
  ];
  const coloresDisponibles = [
    'Rojo', 'Azul', 'Verde', 'Amarillo', 'Negro', 'Blanco', 'Gris',
    'Naranja', 'Violeta', 'Celeste', 'Bordó', 'Rosa', 'Dorado', 'Plateado', 'Marrón'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCamiseta({ ...newCamiseta, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewCamiseta({ ...newCamiseta, imagen: file });

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleColorChange = (e) => {
    const color = e.target.value;
    if (color && !selectedColors.includes(color)) {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const removeColor = (color) => {
    const updatedColors = selectedColors.filter((c) => c !== color);
    setSelectedColors(updatedColors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newCamiseta.club || !newCamiseta.pais || !newCamiseta.temporada) {
      alert('Los campos "Club", "País" y "Temporada" son obligatorios.');
      return;
    }

    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) {
      alert('Error: Usuario no autenticado.');
      return;
    }

    const formData = new FormData();
    formData.append('usuarioId', usuarioId);
    formData.append('imagen', newCamiseta.imagen);
    formData.append('club', newCamiseta.club);
    formData.append('pais', newCamiseta.pais);
    formData.append('temporada', newCamiseta.temporada);
    formData.append('nombre', newCamiseta.nombre);
    formData.append('dorsal', newCamiseta.dorsal);
    formData.append('colores', selectedColors.join(','));
    formData.append('talle', newCamiseta.talle);
    formData.append('numeroEquipacion', newCamiseta.numeroEquipacion);
    formData.append('comentarios', newCamiseta.comentarios);

    try {
      const response = await fetch('http://localhost:8080/api/camisetas', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
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
      <form className="camiseta-form" onSubmit={handleSubmit}>
        <h2>Agregar Camiseta</h2>

        <input type="text" name="club" placeholder="Club" value={newCamiseta.club} onChange={handleChange} required />
        <input type="text" name="pais" placeholder="País" value={newCamiseta.pais} onChange={handleChange} required />
        <input type="text" name="temporada" placeholder="Temporada (ej: 2017/2018)" value={newCamiseta.temporada} onChange={handleChange} required />

        <input type="file" accept="image/*" onChange={handleImageChange} required />
        {previewImage && <img src={previewImage} alt="Previsualización" className="preview-image" />}

        <input type="text" name="nombre" placeholder="Nombre" value={newCamiseta.nombre} onChange={handleChange} />
        <input type="text" name="dorsal" placeholder="Dorsal" value={newCamiseta.dorsal} onChange={handleChange} />

        <select name="talle" value={newCamiseta.talle} onChange={handleChange} required className="select-input">
          <option value="" disabled hidden>Selecciona un talle</option>
          {talles.map((talle) => (
            <option key={talle} value={talle}>{talle}</option>
          ))}
        </select>

        <select onChange={handleColorChange} value="" className="select-input">
          <option value="" disabled hidden>Seleccione los colores</option>
          {coloresDisponibles.map((color) => (
            <option key={color} value={color}>{color}</option>
          ))}
        </select>

        {selectedColors.length > 0 && (
          <div className="selected-colors active">
            {selectedColors.map((color, index) => (
              <span key={index} className="color-tag">
                {color} <button type="button" onClick={() => removeColor(color)}>x</button>
              </span>
            ))}
          </div>
        )}

        <select name="numeroEquipacion" value={newCamiseta.numeroEquipacion} onChange={handleChange} required className="select-input">
          <option value="" disabled hidden>Selecciona número de equipación</option>
          {equipaciones.map((equipacion) => (
            <option key={equipacion} value={equipacion}>{equipacion}</option>
          ))}
        </select>

        <textarea name="comentarios" placeholder="Comentarios extra" value={newCamiseta.comentarios} onChange={handleChange} />

        <button type="submit" className="btn btn-primary">Guardar</button>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
      </form>
    </div>
  );
}

export default AgregarCamiseta;
