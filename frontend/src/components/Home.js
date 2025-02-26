import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from './RegisterForm';
import './Home.css';

function Home() {
  const [showRegister, setShowRegister] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  // Importar todas las imágenes de la carpeta people
  const importAll = (r) => r.keys().map(r);
  const images = importAll(require.context('../assets/people', false, /\.(png|jpe?g|svg)$/));

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const usuarioId = localStorage.getItem('usuarioId');

      if (!token) {
        localStorage.clear();
        return;
      }

      if (token && usuarioId) {
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
  }, [navigate]);

  // Efecto para el slider de imágenes
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentImageIndex + 1) % images.length;
      setNextImageIndex(nextIndex);
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentImageIndex(nextIndex);
        setIsTransitioning(false);
      }, 700);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentImageIndex, images.length]);

  const handleOpenRegister = () => setShowRegister(true);
  const handleCloseRegister = () => setShowRegister(false);
  const handleLogin = () => navigate('/login');

  return (
    <div className="home-container">
      <div className="header">
        <div className="header-left">
          <div className="header-logo"></div>
          <div className="site-title">Mi Colección de Camisetas</div>
        </div>
        <div className="nav-buttons">
          <button 
            className="btn btn-primary" 
            onClick={handleLogin}
            aria-label="Iniciar sesión"
          >
            Loguearse
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleOpenRegister}
            aria-label="Registrarse"
          >
            Registrarse
          </button>
        </div>
      </div>

      <div className="content-container">
        <div className="main-content">
          <div className="image-slider">
            {images.map((src, index) => (
              <img
                key={src}
                src={src}
                alt={`Slide ${index + 1}`}
                className={`slider-image ${index === currentImageIndex ? 'active' : ''}`}
                loading="lazy"
              />
            ))}
          </div>
          <div className="slogan-container">
            <p className="slogan">
              Bienvenido a tu espacio personal para coleccionar y organizar 
              tus camisetas de fútbol. Un lugar donde cada casaca cuenta una historia,
              donde la pasión se organiza y donde tu colección cobra vida.
              Cataloga, organiza y disfruta de tu colección de una manera única.
            </p>
            <p className="tagline">
              Las camisetas que amás, ahora organizadas.
            </p>
          </div>
        </div>
      </div>

      {showRegister && (
        <RegisterForm 
          onClose={handleCloseRegister} 
        />
      )}
    </div>
  );
}

export default Home;