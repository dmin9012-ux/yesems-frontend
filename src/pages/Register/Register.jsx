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
          <img src={logo} alt="yesems logo" className="register-logo" />
          <h2>Crear Cuenta</h2>
          <p className="subtitle">Únete a la plataforma <strong>YES EMS</strong></p>
        </header>

        <form onSubmit={handleRegister} className="register-form">
          <div className="input-group-auth">
            <User className="input-icon" size={20} />
            <input
              type="text"
              autoComplete="name"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

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

          <div className="input-group-auth password-group">
            <Lock className="input-icon" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Contraseña (mín. 6 caracteres)"
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

          <div className="register-actions">
            <button className="btn-register-submit" type="submit" disabled={loading}>
              {loading ? (
                <span className="loader-btn"></span>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Registrarme</span>
                </>
              )}
            </button>
          </div>
        </form>

        <footer className="register-footer">
          <span>¿Ya tienes cuenta?</span>
          <span className="link-login" onClick={() => navigate("/login")}>
            Inicia sesión
          </span>
        </footer>
      </div>
    </div>
  );
}