import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, User, Home, Shield } from "lucide-react"; // Iconos profesionales
import "./TopBar.css";

const TopBar = () => {
  const navigate = useNavigate();
  const { logout, user, loading } = useAuth();

  if (loading) return null;

  const handleLogout = () => {
    logout(); 
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="logo-container" onClick={() => navigate("/principal")}>
          <span className="logo-text">YESEMS</span>
          <div className="logo-dot"></div>
        </div>
      </div>

      <nav className="topbar-right">
        <button className="topbar-link" onClick={() => navigate("/principal")}>
          <Home size={18} />
          <span>Inicio</span>
        </button>

        {user && (
          <button className="topbar-link" onClick={() => navigate("/perfil")}>
            <User size={18} />
            <span>Perfil</span>
          </button>
        )}

        {/* Mostrar acceso al panel si el usuario es Admin */}
        {user && user.rol === "admin" && (
           <button className="topbar-link admin-access" onClick={() => navigate("/admin")}>
            <Shield size={18} />
            <span>Admin</span>
          </button>
        )}

        {user && (
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        )}
      </nav>
    </header>
  );
};

export default TopBar;