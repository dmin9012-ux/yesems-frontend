import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, User, Home, Shield, GraduationCap } from "lucide-react"; 
import "./TopBar.css";

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, loading } = useAuth();

  if (loading) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Función para marcar botón activo
  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <header className="topbar-user-main">
      {/* SECCIÓN IZQUIERDA: LOGO + BADGE ESTILO ADMIN */}
      <div className="topbar-user-left">
        <div className="user-logo-box" onClick={() => navigate("/principal")}>
          <span className="logo-user-text">YESEMS</span>
          <span className="user-role-badge">
            <GraduationCap size={12} />
            ESTUDIANTE
          </span>
        </div>
      </div>

      {/* SECCIÓN DERECHA: NAVEGACIÓN PREMIUM */}
      <nav className="topbar-user-right">
        <button 
          className={`user-topbar-btn ${isActive("/principal")}`} 
          onClick={() => navigate("/principal")}
        >
          <Home size={18} />
          <span>Inicio</span>
        </button>

        {user && (
          <button 
            className={`user-topbar-btn ${isActive("/perfil")}`} 
            onClick={() => navigate("/perfil")}
          >
            <User size={18} />
            <span>Mi Perfil</span>
          </button>
        )}

        {/* Acceso al Panel si es Admin */}
        {user && user.rol === "admin" && (
          <button className="user-topbar-btn admin-access-link" onClick={() => navigate("/admin")}>
            <Shield size={18} />
            <span>Admin</span>
          </button>
        )}

        <div className="divider-vertical-top"></div>

        {user && (
          <button className="user-topbar-btn logout-user-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Salir</span>
          </button>
        )}
      </nav>
    </header>
  );
};

export default TopBar;