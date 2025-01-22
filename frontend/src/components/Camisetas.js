import React, { useState, useEffect } from 'react';
import './Camisetas.css';
import AgregarCamiseta from './AgregarCamiseta';

function Camisetas() {
  const [camisetas, setCamisetas] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchCamisetas = async () => {
      try {
        const usuarioId = localStorage.getItem('usuarioId'); // Obtener usuarioId del localStorage
        const response = await fetch(`http://localhost:8080/api/camisetas/${usuarioId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCamisetas(data);
        } else {
          console.error('Error al obtener camisetas');
        }
      } catch (error) {
        console.error('Error en la conexión al servidor', error);
      }
    };

    fetchCamisetas();
  }, []);

  const handleAgregarCamiseta = (nuevaCamiseta) => {
    setCamisetas([...camisetas, nuevaCamiseta]);
    setShowForm(false);
  };

  return (
    <div className="camisetas-container">
      <div className="top-bar">
        <input
          type="text"
          placeholder="Buscar camisetas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn" onClick={() => setShowForm(true)}>Agregar</button>
      </div>

      {showForm && <AgregarCamiseta onClose={() => setShowForm(false)} onAgregar={handleAgregarCamiseta} />}

      <div className="grid-container">
        {camisetas
          .filter((camiseta) => camiseta.club.toLowerCase().includes(search.toLowerCase()))
          .map((camiseta) => (
            <div key={camiseta.id} className="camiseta-item">
              <img src={`data:image/jpeg;base64,${camiseta.imagen}`} alt={camiseta.club} />
              <div className="camiseta-info">
                <h3>{camiseta.club}</h3>
                <p>{camiseta.pais}</p>
                <p>Dorsal: {camiseta.dorsal}</p>
                <p>Talle: {camiseta.talle}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Camisetas;
