import React, { useState } from "react";
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

  if (loading) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path ? "active" : "";

  return (
    <header className="topbar-admin">
      {/* IZQUIERDA */}
      <div className="topbar-admin-left">
        <div
          className="admin-logo-box"
          onClick={() => navigate("/admin")}
        >
          <span className="logo-admin-text">YESEMS</span>
          <span className="admin-badge">
            <ShieldCheck size={14} />
            <span className="badge-text-admin">ADMIN</span>
          </span>
        </div>
      </div>

      {/* BOTÓN HAMBURGUESA */}
      <button
        className="topbar-admin-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      {/* DERECHA */}
      <nav className={`topbar-admin-right ${menuOpen ? "open" : ""}`}>
        <button
          className={`admin-topbar-btn ${isActive("/principal")}`}
          onClick={() => {
            navigate("/principal");
            setMenuOpen(false);
          }}
        >
          <ExternalLink size={20} />
          <span className="btn-text-admin">Ver Sitio</span>
        </button>

        <button
          className={`admin-topbar-btn ${isActive("/admin")}`}
          onClick={() => {
            navigate("/admin");
            setMenuOpen(false);
          }}
        >
          <LayoutDashboard size={20} />
          <span className="btn-text-admin">Panel</span>
        </button>

        <div className="divider-v"></div>

        <button
          className="admin-topbar-btn logout-admin"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span className="btn-text-admin">Salir</span>
        </button>
      </nav>
    </header>
  );
};

export default TopBarAdmin;
