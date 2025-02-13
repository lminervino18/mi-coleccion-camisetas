import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import './EstadisticasCamisetas.css';

// Registrar los componentes de Chart.js
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
  '#D4A5A5', '#9E579D', '#574B90', '#303952', '#FC427B'
];

function EstadisticasCamisetas() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    porPais: { labels: [], data: [] },
    porTipo: { labels: [], data: [] },
    porLiga: { labels: [], data: [] },
    matrizColores: []
  });

  useEffect(() => {
    const fetchCamisetas = async () => {
      try {
        const usuarioId = localStorage.getItem('usuarioId');
        const response = await fetch(`http://localhost:8080/api/camisetas/${usuarioId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          procesarEstadisticas(data);
        } else {
          setError('Error al obtener las camisetas');
        }
      } catch (error) {
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchCamisetas();
  }, []);

  const procesarEstadisticas = (data) => {
    const total = data.length;

    // Por país
    const paisCount = data.reduce((acc, camiseta) => {
      acc[camiseta.pais] = (acc[camiseta.pais] || 0) + 1;
      return acc;
    }, {});
    const paisSorted = Object.entries(paisCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Por tipo
    const tipoCount = data.reduce((acc, camiseta) => {
      acc[camiseta.tipoDeCamiseta] = (acc[camiseta.tipoDeCamiseta] || 0) + 1;
      return acc;
    }, {});

    // Por liga
    const ligaCount = data.reduce((acc, camiseta) => {
      if (camiseta.liga) {
        acc[camiseta.liga] = (acc[camiseta.liga] || 0) + 1;
      }
      return acc;
    }, {});
    const ligaSorted = Object.entries(ligaCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Matriz de colores
    const coloresUnicos = [...new Set(data.flatMap(c => c.colores))];
    const matrizColores = coloresUnicos.map(color1 => ({
      color: color1,
      combinaciones: coloresUnicos.map(color2 => {
        const count = data.filter(c => 
          c.colores.includes(color1) && c.colores.includes(color2)
        ).length;
        return { color: color2, count };
      })
    }));

    setEstadisticas({
      total,
      porPais: {
        labels: paisSorted.map(([pais]) => pais),
        data: paisSorted.map(([, count]) => count)
      },
      porTipo: {
        labels: Object.keys(tipoCount),
        data: Object.values(tipoCount)
      },
      porLiga: {
        labels: ligaSorted.map(([liga]) => liga),
        data: ligaSorted.map(([, count]) => count)
      },
      matrizColores
    });
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'white'
        }
      }
    }
  };

  const createChartData = (labels, data) => ({
    labels,
    datasets: [{
      data,
      backgroundColor: COLORS,
      borderColor: COLORS.map(color => color + '88'),
      borderWidth: 1
    }]
  });

  if (loading) return <div className="estadisticas-loading">Cargando...</div>;
  if (error) return <div className="estadisticas-error">{error}</div>;

  return (
    <div className="estadisticas-overlay">
      <div className="estadisticas-container">
        <div className="estadisticas-header">
          <button 
            className="btn-back"
            onClick={() => navigate('/camisetas')}
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Volver
          </button>
          <h1>Estadísticas de tu colección</h1>
        </div>

        <div className="total-camisetas">
          <h2>Total de camisetas: {estadisticas.total}</h2>
        </div>

        <div className="estadisticas-content">
          <div className="chart-section">
            <h3>Distribución por país</h3>
            <div className="chart-container">
              <Pie 
                data={createChartData(estadisticas.porPais.labels, estadisticas.porPais.data)}
                options={chartOptions}
              />
            </div>
          </div>

          <div className="chart-section">
            <h3>Distribución por tipo</h3>
            <div className="chart-container">
              <Bar
                data={createChartData(estadisticas.porTipo.labels, estadisticas.porTipo.data)}
                options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { color: 'white' }
                    },
                    x: {
                      ticks: { color: 'white' }
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="chart-section">
            <h3>Distribución por liga</h3>
            <div className="chart-container">
              <Pie 
                data={createChartData(estadisticas.porLiga.labels, estadisticas.porLiga.data)}
                options={chartOptions}
              />
            </div>
          </div>

          <div className="chart-section">
            <h3>Matriz de combinaciones de colores</h3>
            <div className="color-matrix">
              {estadisticas.matrizColores.map((row, i) => (
                <div key={i} className="matrix-row">
                  <div className="matrix-label">{row.color}</div>
                  <div className="matrix-cells">
                    {row.combinaciones.map((cell, j) => (
                      <div 
                        key={j}
                        className="matrix-cell"
                        style={{
                          backgroundColor: `rgba(255, 255, 255, ${cell.count / estadisticas.total})`
                        }}
                      >
                        {cell.count}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EstadisticasCamisetas;