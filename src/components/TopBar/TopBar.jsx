import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./TopBar.css";

const TopBar = () => {
  const navigate = useNavigate();
  const { logout, user, loading } = useAuth();

  if (loading) return null;

  const handleLogout = () => {
    logout(); // AuthContext controla sesión y redirección
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span
          className="logo"
          onClick={() => navigate("/principal")}
          style={{ cursor: "pointer" }}
        >
          Yesems
        </span>
      </div>

      <nav className="topbar-right">
        <button
          className="topbar-btn"
          onClick={() => navigate("/principal")}
        >
          Inicio
        </button>

        {user && (
          <button
            className="topbar-btn"
            onClick={() => navigate("/perfil")}
          >
            Perfil
          </button>
        )}

        {user && (
          <button
            className="topbar-btn logout"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        )}
      </nav>
    </header>
  );
};

export default TopBar;
