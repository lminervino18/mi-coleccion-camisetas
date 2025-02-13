import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { 
  VictoryPie, 
  VictoryBar, 
  VictoryChart, 
  VictoryAxis,  // ✅ Ahora importado correctamente
  VictoryTheme, 
  VictoryLabel, 
  VictoryPortal 
} from "victory";
import "./EstadisticasCamisetas.css";


const COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD",
  "#D4A5A5", "#9E579D", "#574B90", "#303952", "#FC427B"
];

function EstadisticasCamisetas() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);

  useEffect(() => {
    const fetchCamisetas = async () => {
      try {
        const usuarioId = localStorage.getItem("usuarioId");
        const response = await fetch(`http://localhost:8080/api/camisetas/${usuarioId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) throw new Error("Error al obtener las camisetas");

        const data = await response.json();
        procesarEstadisticas(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCamisetas();
  }, []);

  const procesarEstadisticas = (data) => {
    if (!data || data.length === 0) {
      setEstadisticas({
        total: 0,
        porPais: [],
        porTipo: [],
        porLiga: [],
      });
      return;
    }

    const total = data.length;

    const contarPor = (clave) =>
      Object.entries(
        data.reduce((acc, item) => {
          if (item[clave]) acc[item[clave]] = (acc[item[clave]] || 0) + 1;
          return acc;
        }, {})
      )
        .map(([x, y]) => ({ x, y }))
        .sort((a, b) => b.y - a.y)
        .slice(0, 10);

    setEstadisticas({
      total,
      porPais: contarPor("pais"),
      porTipo: contarPor("tipoDeCamiseta"),
      porLiga: contarPor("liga"),
    });
  };

  // 🔄 Forzar re-renderizado para evitar problemas con Victory
  useEffect(() => {
    setTimeout(() => {
      setEstadisticas((prev) => ({ ...prev }));
    }, 10);
  }, []);

  if (loading) return <div className="estadisticas-loading">Cargando...</div>;
  if (error) return <div className="estadisticas-error">{error}</div>;
  if (!estadisticas) return <div className="estadisticas-error">No hay datos disponibles.</div>;

  return (
    <div className="estadisticas-overlay">
      <div className="estadisticas-container">
        <div className="estadisticas-header">
          <button className="btn-back" onClick={() => navigate("/camisetas")}>
            <FontAwesomeIcon icon={faArrowLeft} /> Volver
          </button>
          <h1>Estadísticas de tu colección</h1>
        </div>

        <div className="total-camisetas">
          <h2>Total de camisetas: {estadisticas.total}</h2>
        </div>

        <div className="estadisticas-content">
          {estadisticas.porPais.length > 0 && (
            <div className="chart-section">
              <h3>Distribución por país</h3>
              <div style={{ height: "400px" }}>
                <VictoryPie
                  data={estadisticas.porPais}
                  colorScale={COLORS}
                  width={600}
                  height={400}
                  padding={{ top: 40, bottom: 40, left: 80, right: 80 }}
                  labelRadius={({ innerRadius }) => innerRadius + 60}
                  labels={({ datum }) => `${datum.x}: ${datum.y}`}
                  labelComponent={<VictoryPortal />}
                  style={{
                    labels: { fill: "white", fontSize: 12 },
                    parent: { maxWidth: "100%" },
                  }}
                />
              </div>
            </div>
          )}

          {estadisticas.porTipo.length > 0 && (
            <div className="chart-section">
              <h3>Distribución por tipo</h3>
              <div style={{ height: "400px" }}>
                <VictoryChart theme={VictoryTheme.material} domainPadding={20} width={600} height={400}>
                  <VictoryAxis tickLabelComponent={<VictoryLabel style={{ fill: "white" }} />} />
                  <VictoryAxis dependentAxis tickLabelComponent={<VictoryLabel style={{ fill: "white" }} />} />
                  <VictoryBar
                    data={estadisticas.porTipo}
                    style={{ data: { fill: ({ index }) => COLORS[index % COLORS.length] } }}
                    labels={({ datum }) => datum.y}
                    labelComponent={<VictoryPortal />}
                  />
                </VictoryChart>
              </div>
            </div>
          )}

          {estadisticas.porLiga.length > 0 && (
            <div className="chart-section">
              <h3>Distribución por liga</h3>
              <div style={{ height: "400px" }}>
                <VictoryPie
                  data={estadisticas.porLiga}
                  colorScale={COLORS}
                  width={600}
                  height={400}
                  padding={{ top: 40, bottom: 40, left: 80, right: 80 }}
                  labelRadius={({ innerRadius }) => innerRadius + 60}
                  labels={({ datum }) => `${datum.x}: ${datum.y}`}
                  labelComponent={<VictoryPortal />}
                  style={{
                    labels: { fill: "white", fontSize: 12 },
                    parent: { maxWidth: "100%" },
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EstadisticasCamisetas;
