import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EstadisticasCamisetas.css';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

// Nueva paleta de grises
const COLORS = [
  '#F8F9FA', // Casi blanco
  '#E9ECEF',
  '#DEE2E6',
  '#CED4DA',
  '#ADB5BD',
  '#6C757D',
  '#495057',
  '#343A40',
  '#212529', // Casi negro
];


const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="#000" // Cambiado a negro
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      style={{ fontWeight: 600 }} // Añadido para mejor legibilidad
    >
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const ResumenColeccion = ({ camisetas, userData }) => {
  const totalCamisetas = camisetas.length;
  const paisesDiferentes = new Set(camisetas.map(c => c.pais)).size;
  const clubesDiferentes = new Set(camisetas.filter(c => c.club).map(c => c.club)).size;

  return (
    <div className="resumen-container">
      <div className="user-profile-header">
        {userData?.fotoDePerfil ? (
          <img 
            src={userData.fotoDePerfil} 
            alt="Perfil" 
            className="profile-photo"
          />
        ) : (
          <div className="profile-photo-placeholder">
            {userData?.username?.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="username">{userData?.username}</span>
      </div>
      <div className="resumen-stats">
        <div className="resumen-item">
          <span className="resumen-numero">{totalCamisetas}</span>
          <span className="resumen-label">Camisetas en total</span>
        </div>
        <div className="resumen-item">
          <span className="resumen-numero">{paisesDiferentes}</span>
          <span className="resumen-label">Países diferentes</span>
        </div>
        <div className="resumen-item">
          <span className="resumen-numero">{clubesDiferentes}</span>
          <span className="resumen-label">Clubes diferentes</span>
        </div>
      </div>
    </div>
  );
};

const GraficoCard = ({ titulo, children, isHovered, onHover, onLeave }) => {
  return (
    <div 
      className={`grafico-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        transformOrigin: 'center center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        zIndex: isHovered ? '1000' : '1'
      }}
    >
      <h2>{titulo}</h2>
      {children}
    </div>
  );
};

function EstadisticasCamisetas() {
  const navigate = useNavigate();
  const [camisetas, setCamisetas] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [stats, setStats] = useState({
    porTipo: [],
    porTalle: [],
    porLiga: [],
    porAnio: [],
    topClubes: [],
    coloresMasUsados: [],
    dorsalesMasComunes: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usuarioId = localStorage.getItem('usuarioId');
        
        // Fetch usuario
        const userResponse = await fetch(
          `http://localhost:8080/api/usuarios/${usuarioId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (!userResponse.ok) {
          throw new Error('Error al obtener datos del usuario');
        }

        const userData = await userResponse.json();
        setUserData(userData);

        // Fetch camisetas
        const camisetasResponse = await fetch(
          `http://localhost:8080/api/camisetas/${usuarioId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (!camisetasResponse.ok) {
          throw new Error('Error al obtener las camisetas');
        }

        const camisetasData = await camisetasResponse.json();
        console.log("Datos recibidos:", camisetasData);
        setCamisetas(camisetasData);
        procesarEstadisticas(camisetasData);
      } catch (error) {
        console.error("Error en fetch:", error);
        setError('Error al cargar los datos: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const procesarEstadisticas = (camisetas) => {
    if (!camisetas || camisetas.length === 0) {
      setStats({
        porTipo: [{ name: 'Sin datos', value: 1 }],
        porTalle: [{ name: 'Sin datos', value: 1 }],
        porLiga: [{ name: 'Sin datos', value: 1 }],
        porAnio: [{ name: 'Sin datos', value: 1 }],
        topClubes: [{ name: 'Sin datos', value: 1 }],
        coloresMasUsados: [{ name: 'Sin datos', value: 1 }],
        dorsalesMasComunes: [{ name: 'Sin datos', value: 1 }]
      });
      return;
    }

    // Estadísticas por tipo (Club vs Selección)
    const tipoCount = camisetas.reduce((acc, camiseta) => {
      acc[camiseta.tipoDeCamiseta] = (acc[camiseta.tipoDeCamiseta] || 0) + 1;
      return acc;
    }, {});

    // Estadísticas por talle
    const talleCount = camisetas.reduce((acc, camiseta) => {
      acc[camiseta.talle] = (acc[camiseta.talle] || 0) + 1;
      return acc;
    }, {});

    // Estadísticas por liga
    const ligaCount = camisetas
      .filter(c => c.liga)
      .reduce((acc, camiseta) => {
        acc[camiseta.liga] = (acc[camiseta.liga] || 0) + 1;
        return acc;
      }, {});

    const ligasSorted = Object.entries(ligaCount)
      .sort(([,a], [,b]) => b - a)
      .reduce((acc, [liga, count], index) => {
        if (index < 6) {
          acc.push({ name: liga, value: count });
        } else {
          const otrosIndex = acc.findIndex(item => item.name === 'Otras');
          if (otrosIndex === -1) {
            acc.push({ name: 'Otras', value: count });
          } else {
            acc[otrosIndex].value += count;
          }
        }
        return acc;
      }, []);

    // Evolución por año
    const aniosData = camisetas.reduce((acc, camiseta) => {
      let anio;
      if (camiseta.temporada.includes('/')) {
        anio = camiseta.temporada.split('/')[0];
      } else {
        anio = camiseta.temporada;
      }
      acc[anio] = (acc[anio] || 0) + 1;
      return acc;
    }, {});

    const aniosOrdenados = Object.entries(aniosData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([anio, count]) => ({
        name: anio,
        value: count
      }));

    // Top clubes
    const clubCount = camisetas
      .filter(c => c.club)
      .reduce((acc, camiseta) => {
        acc[camiseta.club] = (acc[camiseta.club] || 0) + 1;
        return acc;
      }, {});

    const topClubes = Object.entries(clubCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([club, count]) => ({
        name: club,
        value: count
      }));

    // Colores más usados
    const colorCount = camisetas.reduce((acc, camiseta) => {
      camiseta.colores.forEach(color => {
        acc[color] = (acc[color] || 0) + 1;
      });
      return acc;
    }, {});

    const coloresMasUsados = Object.entries(colorCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([color, count]) => ({
        name: color,
        value: count
      }));

    // Dorsales más comunes
    const dorsalesCount = camisetas
      .filter(c => c.dorsal)
      .reduce((acc, c) => {
        acc[c.dorsal] = (acc[c.dorsal] || 0) + 1;
        return acc;
      }, {});

    const dorsalesMasComunes = Object.entries(dorsalesCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([dorsal, count]) => ({
        name: `#${dorsal}`,
        value: count
      }));

    setStats({
      porTipo: Object.entries(tipoCount).map(([name, value]) => ({ name, value })),
      porTalle: Object.entries(talleCount).map(([name, value]) => ({ name, value })),
      porLiga: ligasSorted,
      porAnio: aniosOrdenados,
      topClubes,
      coloresMasUsados,
      dorsalesMasComunes
    });
  };

  if (loading) {
    return (
      <div className="estadisticas-overlay">
        <div className="estadisticas-container">
          <div className="loading-spinner">Cargando estadísticas...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="estadisticas-overlay">
        <div className="estadisticas-container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="estadisticas-overlay">
      <div className="estadisticas-container">
        <div className="header-container">
          <button 
            className="back-button" 
            onClick={() => navigate('/camisetas')}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className="estadisticas-titulo">Estadísticas de tu Colección</h1>
        </div>
        
        <ResumenColeccion camisetas={camisetas} userData={userData} />
        
        <div className="graficos-grid">
          {/* Club vs Selección */}
          <GraficoCard 
            titulo="Club vs Selección"
            isHovered={hoveredCard === 'tipo'}
            onHover={() => setHoveredCard('tipo')}
            onLeave={() => setHoveredCard(null)}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.porTipo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.porTipo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Distribución por Talle */}
          <GraficoCard 
            titulo="Distribución por Talle"
            isHovered={hoveredCard === 'talle'}
            onHover={() => setHoveredCard('talle')}
            onLeave={() => setHoveredCard(null)}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.porTalle}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.porTalle.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Top Ligas */}
          <GraficoCard 
            titulo="Top Ligas"
            isHovered={hoveredCard === 'liga'}
            onHover={() => setHoveredCard('liga')}
            onLeave={() => setHoveredCard(null)}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.porLiga}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.porLiga.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Evolución por Año */}
          <GraficoCard 
            titulo="Evolución por Año"
            isHovered={hoveredCard === 'anio'}
            onHover={() => setHoveredCard('anio')}
            onLeave={() => setHoveredCard(null)}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.porAnio}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Top Clubes */}
          <GraficoCard 
            titulo="Top 10 Clubes"
            isHovered={hoveredCard === 'clubes'}
            onHover={() => setHoveredCard('clubes')}
            onLeave={() => setHoveredCard(null)}
          >
            <div className="lista-ranking">
              {stats.topClubes.map((club, index) => (
                <div key={club.name} className="ranking-item">
                  <span className="ranking-position">{index + 1}</span>
                  <span className="ranking-name">{club.name}</span>
                  <span className="ranking-value">{club.value}</span>
                </div>
              ))}
            </div>
          </GraficoCard>

          {/* Colores más usados */}
          <GraficoCard 
            titulo="Colores más Usados"
            isHovered={hoveredCard === 'colores'}
            onHover={() => setHoveredCard('colores')}
            onLeave={() => setHoveredCard(null)}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.coloresMasUsados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {stats.coloresMasUsados.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GraficoCard>

          {/* Dorsales más comunes */}
          <GraficoCard 
            titulo="Dorsales más Comunes"
            isHovered={hoveredCard === 'dorsales'}
            onHover={() => setHoveredCard('dorsales')}
            onLeave={() => setHoveredCard(null)}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.dorsalesMasComunes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.dorsalesMasComunes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </GraficoCard>
        </div>
      </div>
    </div>
  );
}

export default EstadisticasCamisetas;