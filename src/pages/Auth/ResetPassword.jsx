import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiYesems from "../../api/apiYesems";
import logo from "../../assets/logo-yesems.png";
import ojoAbierto from "../../assets/ojoabierto.png";
import ojoCerrado from "../../assets/ojocerrado.png";
import "./ResetPasswordStyle.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const codigo = location.state?.codigo;

  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [showPasswordNueva, setShowPasswordNueva] = useState(false);
  const [showConfirmarPassword, setShowConfirmarPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!email || !codigo) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, codigo, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordNueva !== confirmarPassword) {
      setMensaje("❌ Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    setMensaje("");

    try {
      const res = await apiYesems.post("/usuario/password/reset", {
        email,
        codigo,
        passwordNueva,
      });

      if (res.data.ok) {
        setMensaje("✅ Contraseña restablecida correctamente");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      }
    } catch (error) {
      setMensaje(
        error.response?.data?.message ||
          "❌ Error al restablecer la contraseña"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">

        {/* LOGO */}
        <img src={logo} alt="YES EMS logo" className="auth-logo" />

        <h2>Restablecer contraseña</h2>
        <p className="subtitle">Ingresa tu nueva contraseña</p>

        <form onSubmit={handleSubmit}>

          {/* 🔐 NUEVA CONTRASEÑA */}
          <div className="password-group">
            <input
              type={showPasswordNueva ? "text" : "password"}
              placeholder="Nueva contraseña"
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              required
            />
            <img
              src={showPasswordNueva ? ojoAbierto : ojoCerrado}
              alt="Mostrar contraseña"
              className="password-eye"
              onClick={() => setShowPasswordNueva(!showPasswordNueva)}
            />
          </div>

          {/* 🔐 CONFIRMAR CONTRASEÑA */}
          <div className="password-group">
            <input
              type={showConfirmarPassword ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              required
            />
            <img
              src={showConfirmarPassword ? ojoAbierto : ojoCerrado}
              alt="Mostrar contraseña"
              className="password-eye"
              onClick={() =>
                setShowConfirmarPassword(!showConfirmarPassword)
              }
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Restableciendo..." : "Restablecer contraseña"}
          </button>
        </form>

        {mensaje && <p className="mensaje">{mensaje}</p>}

      </div>
    </div>
  );
}
