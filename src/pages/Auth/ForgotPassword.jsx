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
        {/* Botón de regreso mejorado para móvil */}
        <button className="btn-back-nav" onClick={() => navigate("/login")} title="Regresar">
          <ArrowLeft size={22} />
        </button>

        <header className="forgot-header">
          <div className="forgot-logo-wrapper">
            <img src={logo} alt="yesems logo" className="forgot-logo" />
          </div>
          <h2 className="forgot-title">¿Olvidaste tu contraseña?</h2>
          <p className="forgot-subtitle">
            Ingresa tu correo y te enviaremos un código de 6 dígitos para restablecer tu acceso.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="input-group-auth">
            <div className="icon-box">
              <Mail size={20} />
            </div>
            <input
              type="email"
              placeholder="Tu correo registrado"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-forgot-submit" disabled={loading}>
            {loading ? (
              <div className="spinner-mini"></div>
            ) : (
              <>
                <span>Enviar código</span>
                <Send size={18} className="send-icon" />
              </>
            )}
          </button>
        </form>

        <footer className="forgot-footer">
          <p>
            ¿La recordaste?{" "}
            <strong className="link-login" onClick={() => navigate("/login")}>
              Inicia sesión
            </strong>
          </p>
        </footer>
      </div>
    </div>
  );
}