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

    if (storedUser) {
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

    // Guardar TODO en user (token incluido)
    const userData = {
      ...res.usuario,
      token: res.token,
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
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user && !!user.token,
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
