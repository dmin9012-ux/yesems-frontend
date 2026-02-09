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
        setLoading(false); // Detenemos el loading aquí si hay error
        return;
      }

      // ✅ PASO 1: Notificamos el éxito
      notify("success", "¡Registro exitoso! 📧 Revisa tu correo para verificar tu cuenta.");

      // ✅ PASO 2: Limpiamos los campos para que se vea ordenado
      setNombre("");
      setEmail("");
      setPassword("");

      // ✅ PASO 3: Esperamos 3.5 segundos para que lean la notificación
      setTimeout(() => {
        setLoading(false);
        navigate("/login");
      }, 3500);

    } catch (error) {
      console.error("Error en registro:", error);
      notify("error", "Error al conectar con el servidor");
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
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              disabled={loading} 
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
              placeholder="Contraseña (mínimo 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
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
                <div className="loader-dots-dark">
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
          <span>¿Ya tienes cuenta?</span>
          <span className="link-login" onClick={() => !loading && navigate("/login")}>
            Inicia sesión
          </span>
        </footer>
      </div>
    </div>
  );
}