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

  useEffect(() => {
    // Limpiar localStorage cuando se accede a la página de login
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioId');

    // Si hay un token válido, redirigir automáticamente a /camisetas
    const token = localStorage.getItem('token');
    if (token) {
      const usuarioId = decodeToken(token);
      if (usuarioId) {
        localStorage.setItem('usuarioId', usuarioId);
        navigate('/camisetas');
      }
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

  // Función para decodificar el token JWT y extraer el usuarioId
  const decodeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica el payload del JWT
      return payload.usuarioId || null;  // Asegúrate de que el backend envía el campo usuarioId en el payload
    } catch (error) {
      console.error('Error al decodificar el token', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        setError('Usuario o contraseña incorrectos');
        return;
      }

      const data = await response.json();
      localStorage.setItem('token', data.token); // Guardar token para futuras peticiones

      // Decodificar token para obtener usuarioId
      const usuarioId = decodeToken(data.token);
      if (usuarioId) {
        localStorage.setItem('usuarioId', usuarioId);  // Guardar el usuarioId en localStorage
        navigate('/camisetas');  // Redirigir a la página de camisetas
      } else {
        setError('No se pudo obtener la información del usuario');
        return;
      }

    } catch (error) {
      setError('Error en la conexión al servidor');
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
          <p className="subtitle">Gestiona tu colección de Casacas</p>
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
