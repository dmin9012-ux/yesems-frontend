import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiYesems from "../../api/apiYesems";
import { notify } from "../../Util/toast"; 
import logo from "../../assets/logo-yesems.png";
import ojoAbierto from "../../assets/ojoabierto.png";
import ojoCerrado from "../../assets/ojocerrado.png";
import { Lock, Save, ShieldCheck } from "lucide-react"; // Iconos consistentes
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

  useEffect(() => {
    if (!email || !codigo) {
      notify("warning", "Sesión de recuperación expirada.");
      navigate("/forgot-password", { replace: true });
    }
  }, [email, codigo, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordNueva !== confirmarPassword) {
      notify("error", "Las contraseñas no coinciden");
      return;
    }

    if (passwordNueva.length < 6) {
      notify("warning", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await apiYesems.post("/usuario/password/reset", {
        email,
        codigo,
        passwordNueva,
      });

      if (res.data.ok) {
        notify("success", "✅ Contraseña restablecida con éxito");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Error al restablecer contraseña";
      notify("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-card">
        <header className="reset-header">
          <img src={logo} alt="YES EMS logo" className="reset-logo" />
          <h2 className="reset-title">Restablecer contraseña</h2>
          <p className="subtitle">Crea una nueva contraseña segura para tu cuenta</p>
        </header>

        <form onSubmit={handleSubmit} className="reset-form">
          {/* 🔐 NUEVA CONTRASEÑA */}
          <div className="input-group-auth password-group">
            <Lock className="input-icon" size={20} />
            <input
              type={showPasswordNueva ? "text" : "password"}
              placeholder="Nueva contraseña"
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              required
            />
            <img
              src={showPasswordNueva ? ojoAbierto : ojoCerrado}
              alt="Mostrar"
              className="password-eye"
              onClick={() => setShowPasswordNueva(!showPasswordNueva)}
            />
          </div>

          {/* 🔐 CONFIRMAR CONTRASEÑA */}
          <div className="input-group-auth password-group">
            <ShieldCheck className="input-icon" size={20} />
            <input
              type={showConfirmarPassword ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              required
            />
            <img
              src={showConfirmarPassword ? ojoAbierto : ojoCerrado}
              alt="Mostrar"
              className="password-eye"
              onClick={() => setShowConfirmarPassword(!showConfirmarPassword)}
            />
          </div>

          {/* CONTENEDOR PARA CENTRAR EL BOTÓN */}
          <div className="reset-actions">
            <button type="submit" className="btn-reset-submit" disabled={loading}>
              {loading ? (
                <span className="loader-btn"></span>
              ) : (
                <>
                  <Save size={18} />
                  <span>Restablecer contraseña</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}