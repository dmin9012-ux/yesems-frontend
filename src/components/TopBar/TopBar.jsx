import React, { useState, useEffect } from "react";
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

  // Cerrar menú si se cambia el tamaño de la pantalla a Desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => (location.pathname === path ? "active" : "");

  const goTo = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <header className="topbar-user-main">
      <div className="topbar-container">
        {/* ================= IZQUIERDA ================= */}
        <div className="topbar-user-left" onClick={() => goTo("/principal")}>
          <span className="logo-user-text">YESEMS</span>
          <span className="user-role-badge">
            <GraduationCap size={14} />
            <span className="badge-text">ESTUDIANTE</span>
          </span>
        </div>

        {/* ================= BOTÓN MÓVIL ================= */}
        <button
          className={`topbar-mobile-toggle ${menuOpen ? "is-active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* ================= NAVEGACIÓN ================= */}
        <nav className={`topbar-user-nav ${menuOpen ? "open" : ""}`}>
          <button
            className={`user-topbar-btn ${isActive("/principal")}`}
            onClick={() => goTo("/principal")}
          >
            <Home size={20} />
            <span className="nav-text">Inicio</span>
          </button>

          {user && (
            <button
              className={`user-topbar-btn ${isActive("/perfil")}`}
              onClick={() => goTo("/perfil")}
            >
              <User size={20} />
              <span className="nav-text">Mi Perfil</span>
            </button>
          )}

          {user && user.rol === "admin" && (
            <button
              className="user-topbar-btn admin-access-link"
              onClick={() => goTo("/admin")}
            >
              <Shield size={20} />
              <span className="nav-text">Panel Admin</span>
            </button>
          )}

          <div className="nav-divider"></div>

          {user && (
            <button
              className="user-topbar-btn logout-user-btn"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span className="nav-text">Cerrar Sesión</span>
            </button>
          )}
        </nav>
      </div>
      
      {/* Overlay para cerrar el menú al tocar fuera (solo móvil) */}
      {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)}></div>}
    </header>
  );
};

export default TopBar;