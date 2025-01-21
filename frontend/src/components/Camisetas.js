import React, { useState, useEffect } from 'react';
import './Camisetas.css';

function Camisetas() {
  const [camisetas, setCamisetas] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Obtener las camisetas desde la API
    const fetchCamisetas = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/camisetas', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Token del login
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

  return (
    <div className="camisetas-container">
      <div className="top-bar">
        <input
          type="text"
          placeholder="Buscar camisetas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn">Agregar</button>
        <button className="btn">Filtrar</button>
        <button className="btn">Ordenar</button>
      </div>
      <div className="grid-container">
        {camisetas
          .filter((camiseta) =>
            camiseta.club.toLowerCase().includes(search.toLowerCase())
          )
          .map((camiseta) => (
            <div key={camiseta.id} className="camiseta-item">
              <img src={camiseta.imagen} alt={camiseta.club} />
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
