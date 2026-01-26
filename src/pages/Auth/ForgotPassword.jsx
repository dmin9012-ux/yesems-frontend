import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiYesems from "../../api/apiYesems";
import { notify } from "../../Util/toast"; // 👈 Tu utilidad centralizada
import logo from "../../assets/logo-yesems.png";
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

      // ✅ Éxito: Notificamos con un Toast verde/azul
      notify("success", res.data.message || "Código enviado correctamente 📧");

      // ⏩ Redirección automática tras el éxito
      setTimeout(() => {
        navigate("/verify-code", { state: { email } });
      }, 1500);

    } catch (error) {
      console.error(error);
      // ❌ Error: Toast rojo
      const errorMsg = error.response?.data?.message || "Error al enviar el código. Intenta más tarde.";
      notify("error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <img src={logo} alt="yesems logo" className="forgot-logo" />

        <h2 className="forgot-title">Recuperar contraseña</h2>
        <p className="forgot-subtitle">
          Ingresa tu correo y te enviaremos un código de 6 dígitos para restablecer tu acceso.
        </p>

        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="input-group">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-forgot" disabled={loading}>
            {loading ? "Enviando..." : "Enviar código"}
          </button>
        </form>

        <div className="forgot-footer">
          <span className="link" onClick={() => navigate("/login")}>
            ⬅ Volver al inicio de sesión
          </span>
        </div>
      </div>
    </div>
  );
}