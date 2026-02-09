import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiYesems from "../../api/apiYesems";
import { notify } from "../../Util/toast"; 
import logo from "../../assets/logo-yesems.png";
import { Mail, Send, ArrowLeft } from "lucide-react"; 
import "./ForgotPasswordStyle.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiYesems.post("/usuario/password/forgot", { email });
      notify("success", res.data.message || "Código enviado correctamente 📧");

      setTimeout(() => {
        navigate("/verify-code", { state: { email } });
      }, 1500);

    } catch (error) {
      const errorMsg = error.response?.data?.message || "Error al enviar el código.";
      notify("error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <button className="btn-floating-back" onClick={() => navigate("/login")} title="Regresar">
          <ArrowLeft size={20} />
        </button>

        <header className="forgot-header">
          <div className="forgot-logo-wrapper">
            <img src={logo} alt="yesems logo" className="forgot-logo" />
          </div>
          <h2 className="forgot-title">¿Olvidaste tu contraseña?</h2>
          <p className="forgot-subtitle">
            No te preocupes. Ingresa tu correo y te enviaremos un código de 6 dígitos para restablecer tu acceso.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="input-group-auth">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              placeholder="Tu correo electrónico registrado"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="forgot-actions">
            <button type="submit" className="btn-forgot-submit" disabled={loading}>
              {loading ? (
                <div className="loader-dots">
                  <span></span><span></span><span></span>
                </div>
              ) : (
                <>
                  <span>Enviar código de acceso</span>
                  <Send size={18} className="send-icon" />
                </>
              )}
            </button>
          </div>
        </form>

        <footer className="forgot-footer">
          <p>¿Recordaste tu contraseña? <strong className="link-login" onClick={() => navigate("/login")}>Inicia sesión</strong></p>
        </footer>
      </div>
    </div>
  );
}