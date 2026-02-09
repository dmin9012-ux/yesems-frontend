import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiYesems from "../../api/apiYesems";
import { notify } from "../../Util/toast"; 
import logo from "../../assets/logo-yesems.png";
import ojoAbierto from "../../assets/ojoabierto.png";
import ojoCerrado from "../../assets/ojocerrado.png";
import { Lock, Save, ShieldCheck, ArrowLeft } from "lucide-react"; 
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
        <button className="btn-back-auth" onClick={() => navigate("/login")} title="Cancelar">
          <ArrowLeft size={22} />
        </button>

        <header className="reset-header">
          <div className="reset-logo-wrapper">
            <img src={logo} alt="YES EMS logo" className="reset-logo" />
          </div>
          <h2 className="reset-title">Nueva Contraseña</h2>
          <p className="reset-subtitle">Crea una clave segura para proteger tu acceso a <strong>YES EMS</strong></p>
        </header>

        <form onSubmit={handleSubmit} className="reset-form">
          {/* 🔐 NUEVA CONTRASEÑA */}
          <div className="input-group-auth password-group">
            <div className="icon-box">
              <Lock size={20} />
            </div>
            <input
              type={showPasswordNueva ? "text" : "password"}
              placeholder="Nueva contraseña"
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              required
              disabled={loading}
            />
            <button 
              type="button" 
              className="password-toggle-eye" 
              onClick={() => setShowPasswordNueva(!showPasswordNueva)}
            >
              <img src={showPasswordNueva ? ojoAbierto : ojoCerrado} alt="Ver" />
            </button>
          </div>

          {/* 🔐 CONFIRMAR CONTRASEÑA */}
          <div className="input-group-auth password-group">
            <div className="icon-box">
              <ShieldCheck size={20} />
            </div>
            <input
              type={showConfirmarPassword ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button 
              type="button" 
              className="password-toggle-eye" 
              onClick={() => setShowConfirmarPassword(!showConfirmarPassword)}
            >
              <img src={showConfirmarPassword ? ojoAbierto : ojoCerrado} alt="Ver" />
            </button>
          </div>

          <button type="submit" className="btn-reset-submit" disabled={loading}>
            {loading ? (
              <div className="spinner-mini"></div>
            ) : (
              <>
                <Save size={18} />
                <span>Actualizar contraseña</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}