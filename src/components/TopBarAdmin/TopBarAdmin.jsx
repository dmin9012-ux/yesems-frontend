import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
      {/* LOGO */}
      <div className="topbar-admin-left">
        <span
          className="logo"
          onClick={() => navigate("/admin")}
        >
          Yesems
        </span>
      </div>

      {/* NAV */}
      <nav className="topbar-admin-right">
        <button
          className="topbar-btn"
          onClick={() => navigate("/admin")}
        >
          Panel
        </button>

        <button
          className="topbar-btn logout"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </nav>
    </header>
  );
};

export default TopBarAdmin;
