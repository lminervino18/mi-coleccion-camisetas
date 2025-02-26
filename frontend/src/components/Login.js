// Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './Login.css';
import RegisterForm from './RegisterForm';
import Loading from './Loading';

const API_URL = process.env.REACT_APP_API_URL;

function Login({ setIsLoggedIn }) {
  const [showRegister, setShowRegister] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar autenticación al cargar el componente
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const usuarioId = localStorage.getItem('usuarioId');

      if (!token) {
        localStorage.clear();
        return;
      }

      if (token && usuarioId) {
        setIsLoggedIn(true);
        navigate('/camisetas', { replace: true });
      }
    };

    checkAuth();

    // Limpiar customOrder existente
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('customOrder_')) {
        localStorage.removeItem(key);
      }
    });

    const handleBeforeUnload = () => {
      if (!localStorage.getItem('token')) {
        localStorage.clear();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [navigate, setIsLoggedIn]);

  const handleOpenRegister = () => setShowRegister(true);
  const handleCloseRegister = () => setShowRegister(false);
  const handleBack = () => navigate('/');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
    if (loadingError) setLoadingError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingError(null);

    if (!credentials.username.trim()) {
      setError('El nombre de usuario es requerido');
      return;
    }

    if (!credentials.password.trim()) {
      setError('La contraseña es requerida');
      return;
    }

    setIsLoading(true);
  
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: credentials.username.trim(),
          password: credentials.password.trim()
        }),
      });
  
      if (response.type === 'opaque') {
        throw new Error('Error de CORS: El servidor no permite solicitudes desde este origen.');
      }
  
      if (response.status === 401) {
        const errorText = await response.text();
        setError(errorText || 'Usuario o Contraseña Incorrectas');
        return;
      }
  
      if (response.status === 409) {
        const errorText = await response.text();
        setError(errorText || 'Conflicto: el recurso ya existe');
        return;
      }
  
      if (!response.ok) {
        const errorText = await response.text();
        setError(errorText || 'Error en el inicio de sesión');
        return;
      }
  
      const data = await response.json();
      
      if (data?.token && data?.usuarioId) {
        localStorage.clear();
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuarioId', data.usuarioId.toString());
        
        setIsLoggedIn(true);
        navigate('/camisetas', { replace: true });
      } else {
        setError('Respuesta del servidor inválida');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setLoadingError('No se pudo conectar con el servidor. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading error={loadingError} />;
  }

  return (
    <>
      <div className="login-container">
        <div className="overlay">
          <button 
            className="back-button"
            onClick={handleBack}
            aria-label="Volver a inicio"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div className="logo-title">
            <div className="logo"></div>
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
              <button 
                type="submit" 
                className="btn btn-primary"
              >
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