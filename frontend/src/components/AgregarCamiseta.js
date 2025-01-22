import React, { useState } from 'react';
import './AgregarCamiseta.css';

function AgregarCamiseta({ onClose, onAdd }) {
  const [newCamiseta, setNewCamiseta] = useState({
    imagen: null,  // Cambiado a null para manejar el archivo
    club: '',
    pais: '',
    dorsal: '',
    nombre: '',
    talle: '',
    colores: '',
    numeroEquipacion: '',
    comentarios: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCamiseta({ ...newCamiseta, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewCamiseta({ ...newCamiseta, imagen: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newCamiseta.club || !newCamiseta.pais) {
      alert('El campo "Club" y "País" son obligatorios.');
      return;
    }

    const usuarioId = localStorage.getItem('usuarioId');
    if (!usuarioId) {
      alert('Error: Usuario no autenticado.');
      return;
    }

    const formData = new FormData();
    formData.append('usuarioId', localStorage.getItem('usuarioId'));
    formData.append('imagen', newCamiseta.imagen);
    formData.append('club', newCamiseta.club);
    formData.append('pais', newCamiseta.pais);
    formData.append('dorsal', newCamiseta.dorsal);
    formData.append('nombre', newCamiseta.nombre);
    formData.append('talle', newCamiseta.talle);
    formData.append('colores', newCamiseta.colores);
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
        onAdd(addedCamiseta);  // Notificar al componente padre para actualizar la lista
        onClose();  // Cerrar el formulario
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
        <input type="file" accept="image/*" onChange={handleImageChange} required />
        <input type="text" name="club" placeholder="Club (obligatorio)" value={newCamiseta.club} onChange={handleChange} required />
        <input type="text" name="pais" placeholder="País (obligatorio)" value={newCamiseta.pais} onChange={handleChange} required />
        <input type="text" name="dorsal" placeholder="Dorsal" value={newCamiseta.dorsal} onChange={handleChange} />
        <input type="text" name="nombre" placeholder="Nombre" value={newCamiseta.nombre} onChange={handleChange} />
        <input type="text" name="talle" placeholder="Talle" value={newCamiseta.talle} onChange={handleChange} />
        <input type="text" name="colores" placeholder="Colores" value={newCamiseta.colores} onChange={handleChange} />
        <input type="text" name="numeroEquipacion" placeholder="Número de equipación" value={newCamiseta.numeroEquipacion} onChange={handleChange} />
        <textarea name="comentarios" placeholder="Comentarios extra" value={newCamiseta.comentarios} onChange={handleChange} />
        <button type="submit" className="btn btn-primary">Guardar</button>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
      </form>
    </div>
  );
}

export default AgregarCamiseta;
