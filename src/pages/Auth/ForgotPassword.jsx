import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiYesems from "../../api/apiYesems";
import { notify } from "../../Util/toast"; 
import logo from "../../assets/logo-yesems.png";
import { Mail, Send, ArrowLeft } from "lucide-react"; // Iconos consistentes
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

      // ✅ Éxito
      notify("success", res.data.message || "Código enviado correctamente 📧");

      // ⏩ Redirección automática tras el éxito
      setTimeout(() => {
        navigate("/verify-code", { state: { email } });
      }, 1500);

    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Error al enviar el código. Intenta más tarde.";
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
          <h2 className="forgot-title">Recuperar contraseña</h2>
          <p className="forgot-subtitle">
            Ingresa tu correo y te enviaremos un código de 6 dígitos para restablecer tu acceso.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="input-group-auth">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* CONTENEDOR PARA CENTRAR EL BOTÓN */}
          <div className="forgot-actions">
            <button type="submit" className="btn-forgot-submit" disabled={loading}>
              {loading ? (
                <span className="loader-btn"></span>
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
            <span>Volver al inicio de sesión</span>
          </button>
        </footer>
      </div>
    </div>
  );
}