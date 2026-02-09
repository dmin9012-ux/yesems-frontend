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

      // ✅ NOTIFICACIÓN DE ÉXITO
      notify("success", "¡Registro exitoso! 📧 Revisa tu correo para verificar tu cuenta.");

      // Limpiamos los campos
      setNombre("");
      setEmail("");
      setPassword("");

      // ⏩ ESPERAMOS 3 SEGUNDOS ANTES DE NAVEGAR
      // Esto asegura que el usuario lea que debe verificar su cuenta.
      setTimeout(() => {
        navigate("/login");
      }, 3500);

    } catch (error) {
      console.error("Error en registro:", error);
      notify("error", "Error al conectar con el servidor");
    } finally {
      // Importante: No quitamos el loading inmediatamente si queremos bloquear 
      // el botón mientras se muestra la notificación antes de ir al login.
      setTimeout(() => setLoading(false), 3500);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <header className="register-header">
          <div className="register-logo-wrapper">
             <img src={logo} alt="yesems logo" className="register-logo" />
          </div>
          <h2>Crear Cuenta</h2>
          <p className="subtitle">Únete a la plataforma <strong>YES EMS</strong></p>
        </header>

        <form onSubmit={handleRegister} className="register-form">
          <div className="input-group-auth">
            <User className="input-icon" size={20} />
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              disabled={loading} // Bloqueamos durante la espera
            />
          </div>

          <div className="input-group-auth">
            <Mail className="input-icon" size={20} />
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
            <Lock className="input-icon" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button 
              type="button" 
              className="password-toggle-eye" 
              onClick={() => setShowPassword(!showPassword)}
            >
              <img src={showPassword ? ojoAbierto : ojoCerrado} alt="Ver" />
            </button>
          </div>

          <div className="register-actions">
            <button className="btn-register-submit" type="submit" disabled={loading}>
              {loading ? (
                <div className="loader-dots">
                  <span></span><span></span><span></span>
                </div>
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
          <p>¿Ya tienes cuenta? <strong className="link-login" onClick={() => navigate("/login")}>Inicia sesión</strong></p>
        </footer>
      </div>
    </div>
  );
}