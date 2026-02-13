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
  X
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

  // Cerrar menú al cambiar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header className="topbar-user-main">

        {/* IZQUIERDA */}
        <div className="topbar-user-left">
          <div
            className="user-logo-box"
            onClick={() => goTo("/principal")}
          >
            <span className="logo-user-text">YESEMS</span>

            <span className="user-role-badge">
              <GraduationCap size={12} />
              USUARIO
            </span>
          </div>
        </div>

        {/* BOTÓN HAMBURGUESA (solo móvil) */}
        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* NAV DESKTOP */}
        <nav className="topbar-user-right desktop-nav">

          <button
            className={`user-topbar-btn ${isActive("/principal")}`}
            onClick={() => goTo("/principal")}
          >
            <Home size={18} />
            <span>Inicio</span>
          </button>

          {user && (
            <button
              className={`user-topbar-btn ${isActive("/perfil")}`}
              onClick={() => goTo("/perfil")}
            >
              <User size={18} />
              <span>Mi Perfil</span>
            </button>
          )}

          {user && user.rol === "admin" && (
            <button
              className="user-topbar-btn admin-access-link"
              onClick={() => goTo("/admin")}
            >
              <Shield size={18} />
              <span>Admin</span>
            </button>
          )}

          <div className="divider-vertical-top"></div>

          {user && (
            <button
              className="user-topbar-btn logout-user-btn"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>Salir</span>
            </button>
          )}

        </nav>
      </header>

      {/* OVERLAY */}
      {menuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* MENÚ MÓVIL */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>

        <button
          className={`mobile-menu-item ${isActive("/principal")}`}
          onClick={() => goTo("/principal")}
        >
          <Home size={20} />
          Inicio
        </button>

        {user && (
          <button
            className={`mobile-menu-item ${isActive("/perfil")}`}
            onClick={() => goTo("/perfil")}
          >
            <User size={20} />
            Mi Perfil
          </button>
        )}

        {user && user.rol === "admin" && (
          <button
            className="mobile-menu-item"
            onClick={() => goTo("/admin")}
          >
            <Shield size={20} />
            Panel Admin
          </button>
        )}

        {user && (
          <button
            className="mobile-menu-item logout"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            Cerrar sesión
          </button>
        )}

      </div>
    </>
  );
};

export default TopBar;
