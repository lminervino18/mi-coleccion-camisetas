import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterForm.css";

const API_URL = process.env.REACT_APP_API_URL;

function RegisterForm({ onClose, onNavigateToHome }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    emailExists: "",
    passwordMatch: "",
    userExists: "",
    passwordStrength: "",
  });

  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const navigate = useNavigate(); // 🔥 Hook para la navegación

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePasswordStrength = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));

    if (!value.trim()) return;

    if (name === "username" || name === "email") {
      setIsCheckingUser(true);
      try {
        const queryParam = name === "username"
          ? `nombre=${encodeURIComponent(value.trim())}`
          : `email=${encodeURIComponent(value.trim())}`;
        const response = await fetch(`${API_URL}/api/usuarios?${queryParam}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.status === 409) {
          const errorMessage = await response.text();
          setErrors((prev) => ({
            ...prev,
            [name === "username" ? "userExists" : "emailExists"]: errorMessage,
          }));
        } else if (response.ok) {
          setErrors((prev) => ({
            ...prev,
            [name === "username" ? "userExists" : "emailExists"]: "",
          }));
        }
      } catch (error) {
        console.error(`Error verificando ${name}:`, error);
      }
      setIsCheckingUser(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let validationErrors = {};

    if (!validateEmail(formData.email)) {
      validationErrors.email = "El correo no tiene un formato válido";
    }

    if (formData.password !== formData.confirmPassword) {
      validationErrors.passwordMatch = "Las contraseñas no coinciden";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const registerResponse = await fetch(`${API_URL}/api/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: "USER",
        }),
      });

      if (registerResponse.status === 409) {
        const errorMessage = await registerResponse.text();
        setErrors((prev) => ({
          ...prev,
          userExists: errorMessage.includes("usuario") ? "El usuario ya está registrado" : "",
          emailExists: errorMessage.includes("correo") ? "El email ya está en uso" : "",
        }));
        return;
      }

      if (!registerResponse.ok) {
        throw new Error("Error en el registro");
      }

      // 🔥 Si el registro fue exitoso, hacemos login automáticamente
      const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();

        localStorage.clear(); // Limpiar localStorage antes de guardar nuevos datos
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('usuarioId', loginData.usuarioId.toString());

        // 🔥 Esperar 100ms y redirigir a camisetas con navigate
        setTimeout(() => {
          navigate("/camisetas");
        }, 100);
      } else {
        setSuccessMessage(true);
      }

    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        userExists: "Hubo un error al intentar registrar el usuario",
      }));
    }
  };

  const handleNavigateHome = () => {
    setSuccessMessage(false);
    navigate("/login"); // 🔥 Usamos navigate para la redirección
  };

  return (
    <div className="register-form-container">
      <div className="register-overlay" onClick={onClose}></div>
      <div className="register-form">
        {!successMessage ? (
          <>
            <h2 className="register-title">Crear Cuenta</h2>

            {/* Mostrar errores dinámicos */}
            {errors.email && <p className="error-message">{errors.email}</p>}
            {errors.passwordMatch && <p className="error-message">{errors.passwordMatch}</p>}
            {errors.passwordStrength && <p className="error-message">{errors.passwordStrength}</p>}
            {errors.userExists && <p className="error-message">{errors.userExists}</p>}
            {errors.emailExists && <p className="error-message">{errors.emailExists}</p>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Nombre de Usuario</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Ingresa tu nombre de usuario"
                  value={formData.username}
                  onChange={handleChange}
                  className={errors.userExists ? "error" : ""}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Ingresa tu correo"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.emailExists ? "error" : ""}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Crea tu contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.passwordStrength ? "error" : ""}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirma tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.passwordMatch ? "error" : ""}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={isCheckingUser}>
                {isCheckingUser ? "Verificando..." : "Registrarse"}
              </button>
            </form>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
          </>
        ) : (
          <div className="success-message" style={{ border: "2px solid #4CAF50", padding: "20px", borderRadius: "8px" }}>
            <h2>Usuario creado correctamente</h2>
            <p>Bienvenido. Haz clic en el botón para continuar.</p>
            <button className="btn btn-primary" onClick={handleNavigateHome}>
              Loguearse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisterForm;
