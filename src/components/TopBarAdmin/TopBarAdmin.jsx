import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import "./TopBarAdminStyle.css";

const TopBarAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Cerrar menú si se cambia a Desktop
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
    <header className="topbar-admin">
      <div className="topbar-admin-container">
        {/* IZQUIERDA: LOGO */}
        <div className="topbar-admin-left" onClick={() => goTo("/admin")}>
          <span className="logo-admin-text">YESEMS</span>
          <span className="admin-badge">
            <ShieldCheck size={14} />
            <span className="badge-text-admin">ADMIN</span>
          </span>
        </div>

        {/* BOTÓN HAMBURGUESA */}
        <button
          className={`topbar-admin-toggle ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú de administración"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* NAVEGACIÓN */}
        <nav className={`topbar-admin-nav ${menuOpen ? "open" : ""}`}>
          <button
            className={`admin-topbar-btn ${isActive("/principal")}`}
            onClick={() => goTo("/principal")}
          >
            <ExternalLink size={20} />
            <span className="nav-text-admin">Ver Sitio</span>
          </button>

          <button
            className={`admin-topbar-btn ${isActive("/admin")}`}
            onClick={() => goTo("/admin")}
          >
            <LayoutDashboard size={20} />
            <span className="nav-text-admin">Panel Control</span>
          </button>

          <div className="nav-admin-divider"></div>

          <button
            className="admin-topbar-btn logout-admin-btn"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span className="nav-text-admin">Cerrar Sesión</span>
          </button>
        </nav>
      </div>

      {/* Overlay para cerrar al tocar fuera */}
      {menuOpen && <div className="admin-nav-overlay" onClick={() => setMenuOpen(false)}></div>}
    </header>
  );
};

export default TopBarAdmin;