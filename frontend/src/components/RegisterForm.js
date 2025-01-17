import React, { useState } from "react";
import "./RegisterForm.css";

function RegisterForm({ onClose, onNavigateToHome }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    passwordMatch: "",
    userExists: "",
  });

  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validaciones dinámicas
    if (name === "email") {
      if (!validateEmail(value)) {
        setErrors((prev) => ({
          ...prev,
          email: "El correo no tiene un formato válido",
        }));
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    }

    if (name === "password" || name === "confirmPassword") {
      if (
        name === "confirmPassword" &&
        formData.password !== value &&
        formData.password !== ""
      ) {
        setErrors((prev) => ({
          ...prev,
          passwordMatch: "Las contraseñas no coinciden",
        }));
      } else if (name === "password" && value !== formData.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          passwordMatch: "Las contraseñas no coinciden",
        }));
      } else {
        setErrors((prev) => ({ ...prev, passwordMatch: "" }));
      }
    }

    if (name === "username" && value.trim() !== "") {
      // Validación en tiempo real para verificar si el nombre de usuario existe
      setIsCheckingUser(true);
      try {
        const response = await fetch(
          `http://localhost:8080/api/usuarios/buscar?nombre=${value.trim()}`
        );
        if (response.ok) {
          setErrors((prev) => ({
            ...prev,
            userExists: "El nombre de usuario ya está en uso",
          }));
        } else {
          setErrors((prev) => ({ ...prev, userExists: "" }));
        }
      } catch (error) {
        console.error("Error al verificar el usuario:", error);
        setErrors((prev) => ({
          ...prev,
          userExists: "",
        }));
      }
      setIsCheckingUser(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones finales antes de enviar
    if (!validateEmail(formData.email)) {
      setErrors((prev) => ({
        ...prev,
        email: "El correo no tiene un formato válido",
      }));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        passwordMatch: "Las contraseñas no coinciden",
      }));
      return;
    }

    if (errors.userExists) {
      alert("No se puede registrar: el nombre de usuario ya existe.");
      return;
    }

    // Intentar registrar al usuario
    try {
      const response = await fetch("http://localhost:8080/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: "USER", // Asegúrate de enviar el rol si es requerido
        }),
      });

      if (response.status === 409) {
        // Si el usuario ya existe
        setErrors((prev) => ({
          ...prev,
          userExists: "El usuario o correo ya están registrados",
        }));
        return;
      }

      if (!response.ok) {
        throw new Error("Error en el registro");
      }

      setSuccessMessage(true); // Mostrar mensaje de éxito
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        userExists: "Hubo un error al intentar registrar el usuario",
      }));
    }
  };

  const handleNavigateHome = () => {
    setSuccessMessage(false);
    onNavigateToHome(); // Redirige a la página principal
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
            {errors.userExists && <p className="error-message">{errors.userExists}</p>}

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
          <div className="success-message">
            <h2>Usuario creado correctamente</h2>
            <p>Bienvenido a la página. Haz clic en el botón para continuar.</p>
            <button className="btn btn-primary" onClick={"http://localhost:3000/"}>
              Ir a la página principal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisterForm;
