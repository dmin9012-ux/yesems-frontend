import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  ExternalLink,
  Menu,
  X
} from "lucide-react";
import "./TopBarAdminStyle.css";

const TopBarAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, loading } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const goTo = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const isActive = (path) =>
    location.pathname === path ? "active" : "";

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
      <header className="topbar-admin">

        {/* IZQUIERDA */}
        <div className="topbar-admin-left">
          <div
            className="admin-logo-box"
            onClick={() => goTo("/admin")}
          >
            <span className="logo-admin-text">YESEMS</span>

            <span className="admin-badge">
              <ShieldCheck size={12} />
              ADMIN
            </span>
          </div>
        </div>

        {/* HAMBURGUESA */}
        <button
          className="hamburger-btn-admin"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* NAV DESKTOP */}
        <nav className="topbar-admin-right desktop-admin-nav">

          <button
            className={`admin-topbar-btn ${isActive("/principal")}`}
            onClick={() => goTo("/principal")}
            title="Ver sitio público"
          >
            <ExternalLink size={18} />
            <span>Ver Sitio</span>
          </button>

          <button
            className={`admin-topbar-btn ${isActive("/admin")}`}
            onClick={() => goTo("/admin")}
          >
            <LayoutDashboard size={18} />
            <span>Panel</span>
          </button>

          <div className="divider-v"></div>

          <button
            className="admin-topbar-btn logout-admin"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Salir</span>
          </button>

        </nav>
      </header>

      {/* OVERLAY */}
      {menuOpen && (
        <div
          className="mobile-overlay-admin"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* MENÚ MÓVIL */}
      <div className={`mobile-menu-admin ${menuOpen ? "open" : ""}`}>

        <button
          className="mobile-admin-item"
          onClick={() => goTo("/principal")}
        >
          <ExternalLink size={20} />
          Ver Sitio
        </button>

        <button
          className="mobile-admin-item"
          onClick={() => goTo("/admin")}
        >
          <LayoutDashboard size={20} />
          Panel
        </button>

        <button
          className="mobile-admin-item logout"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          Cerrar sesión
        </button>

      </div>
    </>
  );
};

export default TopBarAdmin;
