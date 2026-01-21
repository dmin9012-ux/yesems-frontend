import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiYesems from "../../api/apiYesems";
import logo from "../../assets/logo-yesems.png";
import "./ForgotPasswordStyle.css";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    try {
      const res = await apiYesems.post("/usuario/password/forgot", { email });

      setMensaje(
        res.data.message ||
          "Si el correo existe, se enviará un código de recuperación"
      );

      // ⏩ Pasar al paso 2 (verificar código)
      setTimeout(() => {
        navigate("/verify-code", { state: { email } });
      }, 2000);

    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al enviar el código. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">

        <img src={logo} alt="yesems logo" className="forgot-logo" />

        <h2>Recuperar contraseña</h2>
        <p className="subtitle">
          Ingresa tu correo y te enviaremos un código de 6 dígitos
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar código"}
          </button>
        </form>

        {mensaje && <p className="mensaje">{mensaje}</p>}

        <p className="footer-text">
          <span className="link" onClick={() => navigate("/login")}>
            Volver al login
          </span>
        </p>

      </div>
    </div>
  );
}
