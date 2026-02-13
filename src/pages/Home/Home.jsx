import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo-yesems.png";
import "./HomeStyle.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-card">
        <img src={logo} alt="yesems logo" className="home-logo" />

        <h1 className="home-title">YES EMS</h1>
        <p className="home-subtitle">
          Plataforma digital para una mejor experiencia
        </p>

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
            Registrarse
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;