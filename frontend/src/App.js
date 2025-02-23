// Modificar el ProtectedRoute para recibir y usar setIsLoggedIn
const ProtectedRoute = ({ children, setIsLoggedIn }) => {
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setIsLoggedIn(false);
        setIsChecking(false);
        return;
      }

      try {
        // Opcional: Verificar token con el backend
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error verificando token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('usuarioId');
        setIsLoggedIn(false);
      } finally {
        setIsChecking(false);
      }
    };

    const timer = setTimeout(checkAuth, 500);
    return () => clearTimeout(timer);
  }, [token, setIsLoggedIn]);

  if (isChecking) {
    return <Loading />;
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// En el componente App, modificar las rutas protegidas para pasar setIsLoggedIn
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // ... resto del código ...

  return (
    <Router>
      <div className="page-container">
        <Routes>
          <Route 
            path="/" 
            element={
              isLoggedIn ? 
                <Navigate to="/camisetas" replace /> : 
                <Navigate to="/login" replace />
            } 
          />

          <Route 
            path="/login" 
            element={
              isLoggedIn ? (
                <Navigate to="/camisetas" replace />
              ) : (
                <PageTransition>
                  <Login setIsLoggedIn={setIsLoggedIn} />
                </PageTransition>
              )
            } 
          />

          <Route 
            path="/camisetas" 
            element={
              <ProtectedRoute setIsLoggedIn={setIsLoggedIn}>
                <PageTransition>
                  <Camisetas setIsLoggedIn={setIsLoggedIn} />
                </PageTransition>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/camiseta/:id" 
            element={
              <ProtectedRoute setIsLoggedIn={setIsLoggedIn}>
                <PageTransition>
                  <DetalleCamiseta setIsLoggedIn={setIsLoggedIn} />
                </PageTransition>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/estadisticas-camisetas" 
            element={
              <ProtectedRoute setIsLoggedIn={setIsLoggedIn}>
                <PageTransition>
                  <EstadisticasCamisetas setIsLoggedIn={setIsLoggedIn} />
                </PageTransition>
              </ProtectedRoute>
            } 
          />

          {/* Ruta pública para colección compartida */}
          <Route 
            path="/shared/:token" 
            element={
              <PageTransition>
                <SharedCollection />
              </PageTransition>
            } 
          />

          {/* Ruta para manejar rutas no encontradas */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;