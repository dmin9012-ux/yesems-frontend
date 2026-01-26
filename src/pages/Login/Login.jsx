import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notify } from "../../Util/toast"; // 👈 Importamos tu nueva utilidad
import logo from "../../assets/logo-yesems.png";
import ojoAbierto from "../../assets/ojoabierto.png";
import ojoCerrado from "../../assets/ojocerrado.png";
import "./LoginStyle.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("API URL:", import.meta.env.VITE_API_URL);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login({ email, password });

      // ❌ Error de login (Credenciales incorrectas)
      if (!res || res.ok === false) {
        notify("error", res?.message || "Credenciales incorrectas");
        setLoading(false);
        return;
      }

      const usuario = res.usuario;

      // ⚠️ Usuario no verificado
      if (usuario && usuario.verificado === false) {
        notify("warning", "Debes verificar tu correo antes de iniciar sesión.");
        setLoading(false);
        return;
      }

      // ✅ Login Exitoso
      notify("success", `¡Bienvenido, ${usuario.nombre}!`);

      // 🚀 Redirección por rol
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
        <img src={logo} alt="yesems logo" className="login-logo" />

        <h2 className="login-title">Bienvenido</h2>
        <p className="login-subtitle">
          Inicia sesión en <strong>YES EMS</strong>
        </p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group password-group">
            <input
              type={showPassword ? "text" : "password"}
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
              className="link"
              onClick={() => navigate("/forgot-password")}
            >
              ¿Olvidaste tu contraseña?
            </span>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="login-footer">
          <span>¿No tienes cuenta?</span>
          <span className="link" onClick={() => navigate("/register")}>
            Regístrate
          </span>
        </div>
      </div>
    </div>
  );
}