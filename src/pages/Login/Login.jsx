import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notify } from "../../Util/toast"; 
import logo from "../../assets/logo-yesems.png";
import ojoAbierto from "../../assets/ojoabierto.png";
import ojoCerrado from "../../assets/ojocerrado.png";
import { LogIn, Mail, Lock } from "lucide-react"; 
import "./LoginStyle.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login({ email, password });

      if (!res || res.ok === false) {
        notify("error", res?.message || "Credenciales incorrectas");
        setLoading(false);
        return;
      }

      const usuario = res.usuario;

      if (usuario && usuario.verificado === false) {
        notify("warning", "Debes verificar tu correo antes de iniciar sesión.");
        setLoading(false);
        return;
      }

      notify("success", `¡Bienvenido, ${usuario.nombre}!`);

      if (usuario && usuario.rol === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/principal", { replace: true });
      }

    } catch (error) {
      console.error("❌ Error en login:", error);
      notify("error", "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <header className="login-header">
          <div className="login-logo-container">
            <img src={logo} alt="yesems logo" className="login-logo" />
          </div>
          <h2 className="login-title">Bienvenido</h2>
          <p className="login-subtitle">
            Inicia sesión en <strong>YES EMS</strong>
          </p>
        </header>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group-auth">
            <div className="icon-box">
              <Mail className="input-icon" size={20} />
            </div>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group-auth password-group">
            <div className="icon-box">
              <Lock className="input-icon" size={20} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              className="password-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              <img
                src={showPassword ? ojoAbierto : ojoCerrado}
                alt="Ver"
                className="password-eye-img"
              />
            </button>
          </div>

          <div className="login-options">
            <button
              type="button"
              className="link-forgot"
              onClick={() => navigate("/forgot-password")}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button type="submit" className="btn-login-submit" disabled={loading}>
            {loading ? (
              <div className="spinner-mini"></div>
            ) : (
              <>
                <LogIn size={20} />
                <span>Entrar</span>
              </>
            )}
          </button>
        </form>

        <footer className="login-footer">
          <p>
            ¿No tienes cuenta?{" "}
            <span className="link-register" onClick={() => navigate("/register")}>
              Regístrate aquí
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
}