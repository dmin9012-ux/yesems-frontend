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
        <header className="forgot-header">
          <img src={logo} alt="yesems logo" className="forgot-logo" />
          <h2 className="forgot-title">Recuperar acceso</h2>
          <p className="forgot-subtitle">
            Ingresa tu correo y te enviaremos un código de 6 dígitos para restablecer tu contraseña.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="input-group-auth">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="forgot-actions">
            <button type="submit" className="btn-forgot-submit" disabled={loading}>
              {loading ? (
                <div className="spinner-mini"></div>
              ) : (
                <>
                  <Send size={18} />
                  <span>Enviar código</span>
                </>
              )}
            </button>
          </div>
        </form>

        <footer className="forgot-footer">
          <button className="link-back" onClick={() => navigate("/login")}>
            <ArrowLeft size={16} />
            <span>Volver al inicio</span>
          </button>
        </footer>
      </div>
    </div>
  );
}