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
      const msg = error.response?.data?.message || "Código inválido o expirado";
      notify("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-card">
        <button className="btn-floating-back" onClick={() => navigate("/forgot-password")} title="Cambiar correo">
          <ArrowLeft size={20} />
        </button>

        <header className="verify-header">
          <div className="verify-logo-wrapper">
            <img src={logo} alt="yesems logo" className="verify-logo" />
          </div>
          <h2 className="verify-title">Verificar Código</h2>
          <p className="subtitle">
            Ingresa los 6 dígitos que enviamos a: <br />
            <strong className="email-highlight">{email}</strong>
          </p>
        </header>

        <form onSubmit={handleSubmit} className="verify-form">
          <div className="input-group-auth verify-input-box">
            <KeyRound className="input-icon" size={20} />
            <input
              type="text"
              inputMode="numeric" /* Fuerza teclado numérico en móviles */
              pattern="[0-9]*"
              placeholder="000000"
              className="input-codigo-style"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              required
            />
          </div>

          <div className="verify-actions">
            <button 
              type="submit" 
              className="btn-verify-submit"
              disabled={loading || codigo.length !== 6}
            >
              {loading ? (
                <div className="loader-dots">
                  <span></span><span></span><span></span>
                </div>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  <span>Validar Código</span>
                </>
              )}
            </button>
          </div>
        </form>

        <footer className="verify-footer">
          <p>¿No recibiste el código? <br /> 
            <span className="link-resend" onClick={() => navigate("/forgot-password")}>Reenviar correo</span>
          </p>
        </footer>
      </div>
    </div>
  );
}