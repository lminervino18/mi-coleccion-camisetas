import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../assets/logo.png';
import RegisterForm from './RegisterForm';

function Login() {
  const [showRegister, setShowRegister] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // En Login.js
    useEffect(() => {
      // Limpiar todos los datos del usuario anterior
      const token = localStorage.getItem('token');
      if (!token) {
          localStorage.removeItem('token');
          localStorage.removeItem('usuarioId');
          
          // Limpiar cualquier customOrder existente
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
              if (key.startsWith('customOrder_')) {
                  localStorage.removeItem(key);
              }
          });
      }
    }, [navigate]);

  const handleOpenRegister = () => setShowRegister(true);
  const handleCloseRegister = () => setShowRegister(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });
  };

  const decodeToken = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.usuarioId || null;
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
    }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: { 
              'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
              username: credentials.username,
              password: credentials.password
          }),
          credentials: 'include',
      });

      // Loguear el status de la respuesta
      console.log('Status de respuesta:', response.status);

      // Manejar diferentes códigos de estado
      if (response.status === 401) {
          const errorText = await response.text();
          setError(errorText || 'Credenciales inválidas');
          return;
      }

      if (!response.ok) {
          const errorText = await response.text();
          setError(errorText || 'Error en el inicio de sesión');
          return;
      }

      const data = await response.json();
      console.log('Respuesta del servidor:', data);

      // Validar la estructura de la respuesta
      if (data && data.token && data.usuarioId) {
          // Limpiar cualquier dato anterior
          localStorage.clear();
          
          // Guardar los nuevos datos
          localStorage.setItem('token', data.token);
          localStorage.setItem('usuarioId', data.usuarioId.toString());
          
          // Redirigir a la página de camisetas
          window.location.href = '/camisetas';
      } else {
          setError('Respuesta del servidor inválida');
      }

  } catch (error) {
      console.error('Error de conexión:', error);
      setError('No se pudo conectar con el servidor');
  }
};

  return (
    <>
      <div className="login-container">
        <div className="overlay">
          <div className="logo-title">
            <img src={logo} alt="Logo" className="logo" />
            <h1 className="title">Mi Colección de Camisetas</h1>
          </div>
          <p className="subtitle">Las camisetas que amás, ahora organizadas.</p>
          <form className="login-form" onSubmit={handleSubmit}>
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
              <label htmlFor="username">Nombre de Usuario</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Ingresa tu nombre de usuario"
                value={credentials.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Ingresa tu contraseña"
                value={credentials.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Iniciar Sesión
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleOpenRegister}
              >
                Registrarse
              </button>
            </div>
          </form>
        </div>
      </div>
      {showRegister && <RegisterForm onClose={handleCloseRegister} />}
    </>
  );
}

export default Login;
