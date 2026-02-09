import React, { useState } from "react";
import { registerRequest } from "../../servicios/authService";
import { useNavigate } from "react-router-dom";
import { notify } from "../../Util/toast";
import logo from "../../assets/logo-yesems.png";
import ojoAbierto from "../../assets/ojoabierto.png";
import ojoCerrado from "../../assets/ojocerrado.png";
import { User, Mail, Lock, UserPlus } from "lucide-react"; 
import "./RegisterStyle.css";

export default function Register() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      notify("warning", "La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await registerRequest({ nombre, email, password });

      if (!res.ok) {
        notify("error", res.message || "Error al registrar usuario");
        return;
      }

      notify("success", "¡Registro exitoso! 📧 Revisa tu correo para verificar tu cuenta.");
      setNombre("");
      setEmail("");
      setPassword("");
      navigate("/login");
    } catch (error) {
      console.error("Error en registro:", error);
      notify("error", "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <header className="register-header">
          <div className="register-logo-container">
            <img src={logo} alt="yesems logo" className="register-logo" />
          </div>
          <h2 className="register-title">Crear Cuenta</h2>
          <p className="register-subtitle">Únete a la plataforma <strong>YES EMS</strong></p>
        </header>

        <form onSubmit={handleRegister} className="register-form">
          <div className="input-group-auth">
            <div className="icon-box">
              <User size={20} />
            </div>
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group-auth">
            <div className="icon-box">
              <Mail size={20} />
            </div>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group-auth password-group">
            <div className="icon-box">
              <Lock size={20} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña (mín. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
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

          <button type="submit" className="btn-register-submit" disabled={loading}>
            {loading ? (
              <div className="spinner-mini"></div>
            ) : (
              <>
                <UserPlus size={20} />
                <span>Registrarme</span>
              </>
            )}
          </button>
        </form>

        <footer className="register-footer">
          <p>
            ¿Ya tienes cuenta?{" "}
            <span className="link-login" onClick={() => navigate("/login")}>
              Inicia sesión
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
}