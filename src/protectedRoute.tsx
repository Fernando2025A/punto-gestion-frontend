import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // 1. Si aún está verificando con el backend, puedes mostrar un spinner o texto de carga
  if (isLoading) {
    return <div className="loading-screen">Cargando...</div>;
  }

  // 2. Si NO está autenticado, lo redirigimos a la página inicial "/"
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 3. Si está autenticado, renderiza las rutas hijas mediante <Outlet />
  return <Outlet />;
}