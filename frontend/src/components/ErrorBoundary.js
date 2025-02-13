import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true }; // Permite que el componente se actualice con el estado de error
  }

  componentDidCatch(error, info) {
    console.error('Error:', error);  // Puedes agregar más lógica de logging si es necesario
    console.error('Info:', info);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please try again later.</h1>;
    }

    return this.props.children;  // Renderiza los componentes hijos si no hay error
  }
}

export default ErrorBoundary;
