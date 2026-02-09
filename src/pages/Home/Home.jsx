import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo-yesems.png";
import "./HomeStyle.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-card">
        <div className="home-content">
          <div className="logo-wrapper">
            <img src={logo} alt="yesems logo" className="home-logo" />
          </div>

          <h1 className="home-title">YES EMS</h1>
          <p className="home-subtitle">
            Plataforma digital para una mejor experiencia educativa.
          </p>
        </div>

        <div className="home-buttons">
          <button
            onClick={() => navigate("/login")}
            className="btn-home primary"
          >
            Iniciar Sesión
          </button>

          <button
            onClick={() => navigate("/register")}
            className="btn-home secondary"
          >
            Crear Cuenta
          </button>
        </div>
        
        <footer className="home-footer">
          <p>© 2026 YES EMS. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;