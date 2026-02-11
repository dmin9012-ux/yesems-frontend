import { createContext, useContext, useEffect, useState } from "react";
import { loginRequest } from "../servicios/authService";
import { obtenerMiPerfil } from "../servicios/usuarioService"; // Importante para refrescar

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===============================
      🔄 CARGAR SESIÓN AL INICIAR
  =============================== */
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

  /* ========================================================
      ✨ REFRESCAR DATOS (Crucial para Mercado Pago)
      Consulta al backend el estado actual (rol, suscripción)
  ======================================================== */
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

  /* ===============================
      🔐 LOGIN
  =============================== */
  const login = async (datos) => {
    const res = await loginRequest(datos);

    if (!res.ok) {
      return res;
    }

    // Guardar token y usuario por separado
    localStorage.setItem("token", res.token);
    
    const userData = { ...res.usuario };
    localStorage.setItem("user", JSON.stringify(userData));
    
    setUser(userData);

    return res;
  };

  /* ===============================
      🚪 LOGOUT
  =============================== */
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user && user.rol === "admin",
        // Agregamos el estado de suscripción para fácil acceso en el Front
        isPremium: user && user.suscripcion && user.suscripcion.estado === "active",
        login,
        logout,
        actualizarDatosUsuario, // La exportamos para usarla al volver de pagar
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);