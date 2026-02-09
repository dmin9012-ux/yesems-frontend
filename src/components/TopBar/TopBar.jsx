import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LogOut,
  User,
  Home,
  Shield,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";
import "./TopBar.css";

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, loading } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path ? "active" : "";

  const goTo = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <header className="topbar-user-main">
      {/* ================= IZQUIERDA ================= */}
      <div className="topbar-user-left" onClick={() => goTo("/principal")}>
        <span className="logo-user-text">YESEMS</span>

        <span className="user-role-badge">
          <GraduationCap size={14} />
          <span className="badge-text">USUARIO</span>
        </span>
      </div>

      {/* ================= BOTÓN MÓVIL ================= */}
      <button
        className="topbar-mobile-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menú"
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* ================= MENÚ ================= */}
      <nav className={`topbar-user-right ${menuOpen ? "open" : ""}`}>
        <button
          className={`user-topbar-btn ${isActive("/principal")}`}
          onClick={() => goTo("/principal")}
        >
          <Home size={20} />
          <span className="btn-text">Inicio</span>
        </button>

        {user && (
          <button
            className={`user-topbar-btn ${isActive("/perfil")}`}
            onClick={() => goTo("/perfil")}
          >
            <User size={20} />
            <span className="btn-text">Mi Perfil</span>
          </button>
        )}

        {user && user.rol === "admin" && (
          <button
            className="user-topbar-btn admin-access-link"
            onClick={() => goTo("/admin")}
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
