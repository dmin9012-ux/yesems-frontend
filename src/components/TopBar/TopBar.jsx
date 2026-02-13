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

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <header className="topbar-user-main">
      <div className="topbar-user-left">
        <div className="user-logo-box" onClick={() => navigate("/principal")}>
          <span className="logo-user-text">YESEMS</span>
          <span className="user-role-badge">
            <GraduationCap size={12} />
            <span className="badge-text">USUARIO</span>
          </span>
        </div>
      </div>

      <nav className="topbar-user-right">
        <button 
          className={`user-topbar-btn ${isActive("/principal")}`} 
          onClick={() => navigate("/principal")}
          title="Inicio"
        >
          <Home size={20} />
          <span className="btn-text">Inicio</span>
        </button>

        {user && (
          <button 
            className={`user-topbar-btn ${isActive("/perfil")}`} 
            onClick={() => navigate("/perfil")}
            title="Mi Perfil"
          >
            <User size={20} />
            <span className="btn-text">Mi Perfil</span>
          </button>
        )}

        {user && user.rol === "admin" && (
          <button 
            className="user-topbar-btn admin-access-link" 
            onClick={() => navigate("/admin")}
            title="Admin"
          >
            <Shield size={20} />
            <span className="btn-text">Admin</span>
          </button>
        )}

        <div className="divider-vertical-top"></div>

        {user && (
          <button 
            className="user-topbar-btn logout-user-btn" 
            onClick={handleLogout}
            title="Salir"
          >
            <LogOut size={20} />
            <span className="btn-text">Salir</span>
          </button>
        )}
      </nav>
    </header>
  );
};

export default TopBar;