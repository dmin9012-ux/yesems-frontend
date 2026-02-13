import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiYesems from "../../api/apiYesems";
import { notify } from "../../Util/toast"; 
import logo from "../../assets/logo-yesems.png";
import { KeyRound, CheckCircle2, ArrowLeft } from "lucide-react"; 
import "./VerifyCodeStyle.css";

export default function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      notify("warning", "Por favor, solicita un código primero.");
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiYesems.post("/usuario/password/verify-code", {
        email,
        codigo,
      });

      if (res.data.ok) {
        notify("success", "Código verificado correctamente ✅");
        navigate("/reset-password", {
          state: { email, codigo },
        });
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Código inválido o expirado";
      notify("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-card">
        <header className="verify-header">
          <img src={logo} alt="yesems logo" className="verify-logo" />
          <h2 className="verify-title">Verificar código</h2>
          <p className="verify-subtitle">
            Ingresa los 6 dígitos enviados a: <br />
            <strong className="email-highlight">{email}</strong>
          </p>
        </header>

        <form onSubmit={handleSubmit} className="verify-form">
          <div className="input-group-auth">
            <KeyRound className="input-icon" size={20} />
            <input
              type="text"
              inputMode="numeric" /* 📱 Fuerza teclado numérico */
              pattern="[0-9]*"    /* 📱 Mejor compatibilidad iOS */
              placeholder="000000"
              className="input-codigo-style"
              value={codigo}
              onChange={(e) =>
                setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              required
              autoFocus
            />
          </div>

          <div className="verify-actions">
            <button 
              type="submit" 
              className="btn-verify-submit"
              disabled={loading || codigo.length !== 6}
            >
              {loading ? (
                <div className="spinner-mini"></div>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Verificar</span>
                </>
              )}
            </button>
          </div>
        </form>

        <footer className="verify-footer">
          <button className="link-back-verify" onClick={() => navigate("/forgot-password")}>
            <ArrowLeft size={16} />
            <span>Cambiar correo</span>
          </button>
        </footer>
      </div>
    </div>
  );
}