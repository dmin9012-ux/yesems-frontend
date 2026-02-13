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
          <img src={logo} alt="yesems logo" className="login-logo" />
          <h2 className="login-title">Bienvenido</h2>
          <p className="login-subtitle">
            Inicia sesión en <strong>YES EMS</strong>
          </p>
        </header>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group-auth">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group-auth">
            <Lock className="input-icon" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <img
              src={showPassword ? ojoAbierto : ojoCerrado}
              alt="Mostrar contraseña"
              className="password-eye"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>

          <div className="login-options">
            <span
              className="link-forgot"
              onClick={() => navigate("/forgot-password")}
            >
              ¿Olvidaste tu contraseña?
            </span>
          </div>

          <div className="login-actions">
            <button type="submit" className="btn-login-submit" disabled={loading}>
              {loading ? (
                <span className="loader-btn"></span>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Entrar</span>
                </>
              )}
            </button>
          </div>
        </form>

        <footer className="login-footer">
          <span>¿No tienes cuenta?</span>
          <span className="link-register" onClick={() => navigate("/register")}>
            Regístrate aquí
          </span>
        </footer>
      </div>
    </div>
  );
}