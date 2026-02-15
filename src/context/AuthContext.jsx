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

  /* ========================================================
      ⚡ REFRESCAR DATOS (Crucial para el Plan Semanal)
  ======================================================== */
  const actualizarDatosUsuario = async () => {
    try {
      const res = await obtenerMiPerfil();
      // Verificamos si la respuesta trae el usuario (ajustado a la estructura de tu backend)
      const datosNuevos = res.usuario || res; 
      
      if (datosNuevos) {
        // Actualizamos localStorage con la nueva fecha de 168h
        localStorage.setItem("user", JSON.stringify(datosNuevos));
        // Actualizamos estado global para que el contador de Perfil.jsx se reinicie
        setUser({ ...datosNuevos }); 
        return datosNuevos;
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
      🛡️ VALIDACIÓN PREMIUM (Compara fechaFin con ahora)
  ======================================================== */
  const checkPremiumStatus = () => {
    if (!user || !user.suscripcion || user.suscripcion.estado !== "active") {
      return false;
    }

    const fechaFin = new Date(user.suscripcion.fechaFin);
    const ahora = new Date();

    return ahora < fechaFin;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user && user.rol === "admin",
        isPremium: checkPremiumStatus(), 
        login,
        logout,
        actualizarDatosUsuario,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);