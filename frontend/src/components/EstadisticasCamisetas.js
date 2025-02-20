import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EstadisticasCamisetas.css';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';


const API_URL = process.env.REACT_APP_API_URL;


const COLORS = [
  '#FFB3BA', // Rosa pastel
  '#BAFFC9', // Verde menta
  '#BAE1FF', // Azul cielo
  '#FFFFBA', // Amarillo pastel
  '#FFE4BA', // Melocotón
  '#E0BBE4', // Lavanda
  '#957DAD', // Púrpura suave
  '#D4A5A5', // Rosa pálido
  '#9E8B8E'  // Gris rosado
];

const COLOR_MAPPING = {
  'rojo': '#FF0000',
  'azul': '#0000FF',
  'verde': '#008000',
  'amarillo': '#FFD700',
  'negro': '#000000',
  'blanco': '#FFFFFF',
  'gris': '#808080',
  'naranja': '#FFA500',
  'violeta': '#8A2BE2',
  'celeste': '#87CEEB',
  'bordó': '#800000',
  'rosa': '#FF69B4',
  'dorado': 'linear-gradient(45deg, #FFD700, #B8860B)',
  'plateado': 'linear-gradient(45deg, #C0C0C0, #E8E8E8)',
  'marrón': '#8B4513'
};

const RADIAN = Math.PI / 180;

const NoDataMessage = () => (
  <div className="no-data-message">
    <p>No hay datos disponibles</p>
    <p>Agrega más camisetas a tu colección para ver las estadísticas</p>
  </div>
);

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = outerRadius * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <g>
      <text 
        x={x} 
        y={y} 
        fill="black" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ 
          fontSize: '16px',
          fontWeight: '700',
          paintOrder: 'stroke',
          strokeWidth: '3px',
          strokeLinejoin: 'miter'
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ 
          fontSize: '16px',
          fontWeight: '700'
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
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

const PieChartComponent = ({ data, height = 300 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={renderCustomizedLabel}
        outerRadius={height * 0.25}
        fill="#8884d8"
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
);

const LineChartComponent = ({ data, height = 300 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
);

const RankingListComponent = ({ data, showAll = false, isColores = false }) => (
  <div className="lista-ranking">
    {(showAll ? data : data.slice(0, 5)).map((item, index) => (
      <div key={item.name} className="ranking-item">
        <span className="ranking-position">{index + 1}</span>
        {isColores && (
          <div 
            className="color-circle"
            style={{ 
              background: COLOR_MAPPING[item.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")] || '#CCCCCC',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              marginRight: '10px',
              border: '2px solid #666',
              display: 'inline-block',
              verticalAlign: 'middle',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          />
        )}
        <span className="ranking-name">{item.name}</span>
        <span className="ranking-value">{item.value}</span>
      </div>
    ))}
  </div>
);

const EstadisticasModalGrafico = ({ isOpen, onClose, children, titulo, tipo }) => {
  if (!isOpen) return null;
  
  const getModalClass = () => {
    switch (tipo) {
      case 'pie':
        return 'modal-pie';
      case 'line':
        return 'modal-line';
      case 'ranking':
        return 'modal-ranking';
      default:
        return '';
    }
  };

  return (
    <div 
      className="estadisticas-camisetas-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`estadisticas-camisetas-modal-content-inner ${getModalClass()}`}>
        <button 
          className="estadisticas-camisetas-modal-close" 
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="estadisticas-camisetas-modal-title">{titulo}</h2>
        <div className="estadisticas-camisetas-modal-content-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
};


const GraficoCard = ({ titulo, data, tipo, isHovered, onHover, onLeave, setModalAbierto }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
    setModalAbierto(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalAbierto(false);
  };

  const renderContent = (isModal = false) => {
    if (!data || data.length === 0) {
      return <NoDataMessage />;
    }

    const height = isModal ? 600 : 300;

    switch (tipo) {
      case 'pie':
        return (
          <div className={`chart-container ${isModal ? 'modal-chart' : ''}`}>
            <PieChartComponent data={data} height={height} />
          </div>
        );
      case 'line':
        return (
          <div className={`chart-container ${isModal ? 'modal-chart' : ''}`}>
            <LineChartComponent data={data} height={height} />
          </div>
        );
      case 'ranking':
        return (
          <div className={`chart-container ${isModal ? 'modal-ranking' : ''}`}>
            <RankingListComponent 
              data={data} 
              showAll={isModal} 
              isColores={titulo.includes('Colores')}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div 
        className={`grafico-card ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onClick={handleOpenModal}
      >
        <h2>{titulo}</h2>
        {renderContent(false)}
      </div>
  
      <EstadisticasModalGrafico 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        titulo={titulo}
        tipo={tipo}
      >
        {renderContent(true)}
      </EstadisticasModalGrafico>
    </>
  );
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

function EstadisticasCamisetas() {
  const navigate = useNavigate();
  const [camisetas, setCamisetas] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [stats, setStats] = useState({
    porTipo: [],
    porTalle: [],
    porLiga: [],
    porAnio: [],
    topClubes: [],
    topDorsales: [],
    seleccionesPorPais: [],
    clubesPorPais: [],
    topNombres: [],
    topColores: [] // Añade esta línea
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usuarioId = localStorage.getItem('usuarioId');
        
        // Fetch usuario
        const userResponse = await fetch(
          `${API_URL}/api/usuarios/${usuarioId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            credentials: 'include',
          }
        );

        if (!userResponse.ok) {
          throw new Error('Error al obtener datos del usuario');
        }

        const userData = await userResponse.json();
        setUserData(userData);

        // Fetch camisetas
        const camisetasResponse = await fetch(
          `${API_URL}/api/camisetas/${usuarioId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            credentials: 'include',
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
        porTipo: [],
        porTalle: [],
        porLiga: [],
        porAnio: [],
        topClubes: [],
        topDorsales: [],
        seleccionesPorPais: [],
        clubesPorPais: [],
        topColores : [],
        topNombres: []
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

    const totalLigas = Object.values(ligaCount).reduce((a, b) => a + b, 0);

    const ligasSorted = Object.entries(ligaCount)
      .sort(([,a], [,b]) => b - a)
      .reduce((acc, [liga, count], index) => {
        if (index < 5) {
          acc.push({ 
            name: liga, 
            value: count,
            percentage: (count / totalLigas) * 100 
          });
        } else {
          const otrosIndex = acc.findIndex(item => item.name === 'Otros');
          if (otrosIndex === -1) {
            acc.push({ 
              name: 'Otros', 
              value: count,
              percentage: (count / totalLigas) * 100 
            });
          } else {
            acc[otrosIndex].value += count;
            acc[otrosIndex].percentage = (acc[otrosIndex].value / totalLigas) * 100;
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
   
    // Top dorsales
    const dorsalesCount = camisetas
      .filter(c => c.dorsal)
      .reduce((acc, c) => {
        acc[c.dorsal] = (acc[c.dorsal] || 0) + 1;
        return acc;
      }, {});

    const topDorsales = Object.entries(dorsalesCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([dorsal, count]) => ({
        name: `#${dorsal}`,
        value: count
      }));

    // Selecciones por país
    const seleccionesCount = camisetas
      .filter(c => c.tipoDeCamiseta === 'Seleccion')
      .reduce((acc, camiseta) => {
        acc[camiseta.pais] = (acc[camiseta.pais] || 0) + 1;
        return acc;
      }, {});

    const totalSelecciones = Object.values(seleccionesCount).reduce((a, b) => a + b, 0);

    const seleccionesPorPais = Object.entries(seleccionesCount)
      .sort(([,a], [,b]) => b - a)
      .reduce((acc, [pais, count], index) => {
        if (index < 5) {
          acc.push({
            name: pais,
            value: count,
            percentage: (count / totalSelecciones) * 100
          });
        } else {
          const otrosIndex = acc.findIndex(item => item.name === 'Otros');
          if (otrosIndex === -1) {
            acc.push({
              name: 'Otros',
              value: count,
              percentage: (count / totalSelecciones) * 100
            });
          } else {
            acc[otrosIndex].value += count;
            acc[otrosIndex].percentage = (acc[otrosIndex].value / totalSelecciones) * 100;
          }
        }
        return acc;
      }, []);

    // Clubes por país
    const clubesPorPaisCount = camisetas
      .filter(c => c.tipoDeCamiseta === 'Club')
      .reduce((acc, camiseta) => {
        acc[camiseta.pais] = (acc[camiseta.pais] || 0) + 1;
        return acc;
      }, {});

    const totalClubes = Object.values(clubesPorPaisCount).reduce((a, b) => a + b, 0);

    const clubesPorPais = Object.entries(clubesPorPaisCount)
      .sort(([,a], [,b]) => b - a)
      .reduce((acc, [pais, count], index) => {
        if (index < 5) {
          acc.push({
            name: pais,
            value: count,
            percentage: (count / totalClubes) * 100
          });
        } else {
          const otrosIndex = acc.findIndex(item => item.name === 'Otros');
          if (otrosIndex === -1) {
            acc.push({
              name: 'Otros',
              value: count,
              percentage: (count / totalClubes) * 100
            });
          } else {
            acc[otrosIndex].value += count;
            acc[otrosIndex].percentage = (acc[otrosIndex].value / totalClubes) * 100;
          }
        }
        return acc;
      }, []);
      // Dentro de procesarEstadisticas, antes del setStats
      const coloresCount = camisetas.reduce((acc, camiseta) => {
        // Verifica si camiseta.colores existe y es un array
        if (camiseta.colores && Array.isArray(camiseta.colores)) {
          // Procesa cada color en la lista
          camiseta.colores.forEach(color => {
            acc[color] = (acc[color] || 0) + 1;
          });
        }
        return acc;
      }, {});

      const topColores = Object.entries(coloresCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([color, count]) => ({
          name: color,
          value: count
        }));


    setStats({
      porTipo: Object.entries(tipoCount).map(([name, value]) => ({ name, value })),
      porTalle: Object.entries(talleCount).map(([name, value]) => ({ name, value })),
      porLiga: ligasSorted,
      porAnio: aniosOrdenados,
      topClubes,
      topDorsales,
      seleccionesPorPais,
      clubesPorPais,
      topColores
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
        
        <div className={`graficos-grid ${modalAbierto ? 'modal-abierto' : ''}`}>
          {/* Club vs Selección */}
          <GraficoCard 
            titulo="Club vs Selección"
            data={stats.porTipo}
            tipo="pie"
            isHovered={hoveredCard === 'tipo'}
            onHover={() => setHoveredCard('tipo')}
            onLeave={() => setHoveredCard(null)}
            setModalAbierto={setModalAbierto}
          />

          {/* Top Clubes */}
          <GraficoCard 
            titulo="Clubes"
            data={stats.topClubes}
            tipo="ranking"
            isHovered={hoveredCard === 'clubes'}
            onHover={() => setHoveredCard('clubes')}
            onLeave={() => setHoveredCard(null)}
            setModalAbierto={setModalAbierto}
          />

          {/* Top Ligas */}
          <GraficoCard 
            titulo="Ligas"
            data={stats.porLiga}
            tipo="pie"
            isHovered={hoveredCard === 'liga'}
            onHover={() => setHoveredCard('liga')}
            onLeave={() => setHoveredCard(null)}
            setModalAbierto={setModalAbierto}
          />

          {/* Selecciones por País */}
          <GraficoCard 
            titulo="Selecciones"
            data={stats.seleccionesPorPais}
            tipo="pie"
            isHovered={hoveredCard === 'selecciones'}
            onHover={() => setHoveredCard('selecciones')}
            onLeave={() => setHoveredCard(null)}
            setModalAbierto={setModalAbierto}
          />
          
                 {/* Evolución por Año */}
                 <GraficoCard 
            titulo="Cantidad por Año"
            data={stats.porAnio}
            tipo="line"
            isHovered={hoveredCard === 'anio'}
            onHover={() => setHoveredCard('anio')}
            onLeave={() => setHoveredCard(null)}
            setModalAbierto={setModalAbierto}
          />

          {/* Top Colores */}
          <GraficoCard 
            titulo="Colores"
            data={stats.topColores}
            tipo="ranking"
            isHovered={hoveredCard === 'colores'}
            onHover={() => setHoveredCard('colores')}
            onLeave={() => setHoveredCard(null)}
            setModalAbierto={setModalAbierto}
          />


          <GraficoCard 
            titulo="Jugadores"
            data={stats.topNombres}
            tipo="ranking"
            isHovered={hoveredCard === 'nombres'}
            onHover={() => setHoveredCard('nombres')}
            onLeave={() => setHoveredCard(null)}
            setModalAbierto={setModalAbierto}
          />

          {/* Top Dorsales */}
          <GraficoCard 
            titulo="Dorsales"
            data={stats.topDorsales}
            tipo="ranking"
            isHovered={hoveredCard === 'dorsales'}
            onHover={() => setHoveredCard('dorsales')}
            onLeave={() => setHoveredCard(null)}
            setModalAbierto={setModalAbierto}
          />


          {/* Distribución por Talle */}
          <GraficoCard 
            titulo="Talles"
            data={stats.porTalle}
            tipo="ranking"
            isHovered={hoveredCard === 'talle'}
            onHover={() => setHoveredCard('talle')}
            onLeave={() => setHoveredCard(null)}
            setModalAbierto={setModalAbierto}
          />
          
        </div>
      </div>
    </div>
  );
}

export default EstadisticasCamisetas;