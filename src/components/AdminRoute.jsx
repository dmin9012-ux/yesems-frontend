import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
  const auth = useAuth();

  // ⏳ Esperar a que cargue la sesión
  if (auth.loading) {
    return null; // luego puedes poner un loader
  }

  // 🔐 Validar autenticación
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 🛡️ Validar rol administrador
  if (!auth.isAdmin) {
    return <Navigate to="/principal" replace />;
  }

  // ✅ Acceso permitido
  return <Outlet />;
};

export default AdminRoute;
