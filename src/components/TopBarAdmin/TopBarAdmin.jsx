import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, LogOut, ShieldCheck, ExternalLink } from "lucide-react";
import "./TopBarAdminStyle.css";

const TopBarAdmin = () => {
  const navigate = useNavigate();
  const { logout, loading } = useAuth();

  if (loading) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="topbar-admin">
      {/* SECCIÓN IZQUIERDA: LOGO + BADGE */}
      <div className="topbar-admin-left">
        <div className="admin-logo-box" onClick={() => navigate("/admin")}>
          <span className="logo-admin-text">YESEMS</span>
          <span className="admin-badge">
            <ShieldCheck size={12} />
            ADMIN
          </span>
        </div>
      </div>

      {/* SECCIÓN DERECHA: NAV */}
      <nav className="topbar-admin-right">
        <button 
          className="admin-topbar-btn" 
          onClick={() => navigate("/principal")}
          title="Ver sitio público"
        >
          <ExternalLink size={18} />
          <span>Ver Sitio</span>
        </button>

        <button 
          className="admin-topbar-btn active" 
          onClick={() => navigate("/admin")}
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
  );
};

export default TopBarAdmin;