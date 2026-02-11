import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SuscripcionRoute = () => {
  // Extraemos isPremium directamente del Contexto
  const { loading, isAuthenticated, isPremium } = useAuth();

  // Mientras el AuthContext verifica si hay un token válido
  if (loading) {
    return (
      <div className="loading-screen">
        <p>Verificando credenciales...</p>
      </div>
    );
  }

  // 1️⃣ Si NO está autenticado, directo al Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2️⃣ Si está autenticado pero NO es Premium, a la página de Suscripción
  // Usamos isPremium que ya centraliza la lógica de suscripcion.estado === "active"
  if (!isPremium) {
    return <Navigate to="/suscripcion" replace />;
  }

  // 3️⃣ Si todo está OK, permite ver el contenido (Cursos, Lecciones, etc.)
  return <Outlet />;
};

export default SuscripcionRoute;