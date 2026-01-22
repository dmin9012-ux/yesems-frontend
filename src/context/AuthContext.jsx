import { createContext, useContext, useEffect, useState } from "react";
import { loginRequest } from "../servicios/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===============================
     🔄 CARGAR SESIÓN
  =============================== */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  /* ===============================
     🔐 LOGIN
  =============================== */
  const login = async (datos) => {
    const res = await loginRequest(datos);

    if (!res.ok) {
      return res;
    }

    // Guardar solo el token en localStorage
    localStorage.setItem("token", res.token);

    // Guardar info del usuario sin token dentro de user
    const userData = {
      ...res.usuario,
    };

    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    return res;
  };

  /* ===============================
     🚪 LOGOUT
  =============================== */
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // ✅ eliminar token también
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user && !!localStorage.getItem("token"),
        isAdmin: user && user.rol === "admin",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
