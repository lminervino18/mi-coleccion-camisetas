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
    emailExists: "",
    passwordMatch: "",
    userExists: "",
    passwordStrength: "",
  });

  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePasswordStrength = (password) => {
    // Verifica si la contraseña tiene al menos 8 caracteres, 1 número y 1 letra
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Limpiar errores antes de realizar la validación
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "", // Limpiar el error del campo específico
    }));

    // Validaciones dinámicas
    if (name === "email") {
      if (!validateEmail(value)) {
        setErrors((prev) => ({
          ...prev,
          email: "El correo no tiene un formato válido",
        }));
      }
    }

    if (name === "password" || name === "confirmPassword") {
      if (!validatePasswordStrength(value)) {
        setErrors((prev) => ({
          ...prev,
          passwordStrength: "La contraseña debe tener al menos 8 caracteres, una letra y un número.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, passwordStrength: "" }));
      }

      if (name === "confirmPassword" && formData.password !== value) {
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
          `http://localhost:8080/api/usuarios/?nombre=${value.trim()}`
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

    if (name === "email" && value.trim() !== "") {
      // Validación en tiempo real para verificar si el email ya existe
      setIsCheckingUser(true);
      try {
        const response = await fetch(
          `http://localhost:8080/api/usuarios/?email=${value.trim()}`
        );
        if (response.ok) {
          setErrors((prev) => ({
            ...prev,
            emailExists: "El correo electrónico ya está en uso",
          }));
        } else {
          setErrors((prev) => ({ ...prev, emailExists: "" }));
        }
      } catch (error) {
        console.error("Error al verificar el correo:", error);
        setErrors((prev) => ({
          ...prev,
          emailExists: "",
        }));
      }
      setIsCheckingUser(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones finales antes de enviar
    let validationErrors = {};

    if (!validateEmail(formData.email)) {
      validationErrors.email = "El correo no tiene un formato válido";
    }

    if (formData.password !== formData.confirmPassword) {
      validationErrors.passwordMatch = "Las contraseñas no coinciden";
    }

    if (errors.userExists) {
      validationErrors.userExists = "El nombre de usuario ya esta registrado";
    }

    if (errors.emailExists) {
      validationErrors.emailExists = "El email ya esta en uso";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
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
        // Si el usuario ya existe, mostramos el error en el formulario
        setErrors((prev) => ({
          ...prev,
          userExists: "El usuario ya esta registrado",
          emailExists: "El email ya esta en uso",
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
    window.location.href = "/api/usuarios";  // Esto redirige a la página principal
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
