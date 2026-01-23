import React, { useState } from "react";
import { registerRequest } from "../../servicios/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../../assets/logo-yesems.png";
import ojoAbierto from "../../assets/ojoabierto.png";
import ojoCerrado from "../../assets/ojocerrado.png";
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
      toast.warning("⚠ La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await registerRequest({ nombre, email, password });

      if (!res.ok) {
        toast.error(res.message);
        return;
      }

      toast.success(
        res.message ||
          "📧 Se te envió un correo de verificación para comprobar que eres tú."
      );

      // Limpiar campos opcional
      setNombre("");
      setEmail("");
      setPassword("");

      navigate("/login");
    } catch (error) {
      console.error("Error en registro:", error);
      toast.error("❌ Error al conectar con el servidor");
    } finally {
      setLoading(false); // ✅ Siempre se ejecuta
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <img src={logo} alt="yesems logo" className="register-logo" />

        <h2>Crear Cuenta</h2>
        <p className="subtitle">Únete a la plataforma YES EMS</p>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* 🔐 PASSWORD CON OJO */}
          <div className="password-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña (mínimo 6 caracteres)"
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

          <button className="btn-register" type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrarme"}
          </button>
        </form>

        <p className="footer-text">
          ¿Ya tienes cuenta?{" "}
          <span className="link" onClick={() => navigate("/login")}>
            Inicia sesión
          </span>
        </p>
      </div>
    </div>
  );
}
