import { createContext, useContext, useEffect, useState } from "react";
import { loginRequest } from "../servicios/authService";
import { obtenerMiPerfil } from "../servicios/usuarioService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarSesion = () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Error al parsear usuario:", error);
          logout();
        }
      }
      setLoading(false);
    };
    cargarSesion();
  }, []);

  const actualizarDatosUsuario = async () => {
    try {
      const perfilActualizado = await obtenerMiPerfil();
      if (perfilActualizado) {
        localStorage.setItem("user", JSON.stringify(perfilActualizado));
        setUser(perfilActualizado);
        return perfilActualizado;
      }
    } catch (error) {
      console.error("Error al refrescar perfil:", error);
    }
    return null;
  };

  const login = async (datos) => {
    const res = await loginRequest(datos);
    if (!res.ok) return res;

    localStorage.setItem("token", res.token);
    const userData = { ...res.usuario };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    return res;
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  /* ========================================================
      🛡️ LÓGICA DE VALIDACIÓN PREMIUM (TIEMPO REAL)
  ======================================================== */
  const checkPremiumStatus = () => {
    if (!user || !user.suscripcion || user.suscripcion.estado !== "active") {
      return false;
    }

    // Comprobar si la fecha de fin ya expiró
    const fechaFin = new Date(user.suscripcion.fechaFin);
    const ahora = new Date();

    if (ahora > fechaFin) {
      // Si ya expiró, podríamos limpiar el estado o simplemente retornar false
      return false;
    }

    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user && user.rol === "admin",
        // Ahora isPremium es el resultado de la validación de tiempo
        isPremium: checkPremiumStatus(), 
        login,
        logout,
        actualizarDatosUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);