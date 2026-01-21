import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiYesems from "../../api/apiYesems";
import logo from "../../assets/logo-yesems.png";
import "./VerifyCodeStyle.css";

export default function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();

  // ⛔ Si no viene email, regresamos
  const email = location.state?.email;

  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    try {
      const res = await apiYesems.post("/usuario/password/verify-code", {
        email,
        codigo,
      });

      if (res.data.ok) {
        // ✅ Código correcto → ir a reset password
        navigate("/reset-password", {
          state: { email, codigo },
        });
      }
    } catch (error) {
      console.error(error);
      setMensaje("❌ Código inválido o expirado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-card">

        <img src={logo} alt="yesems logo" className="verify-logo" />

        <h2>Verificar código</h2>
        <p className="subtitle">
          Ingresa el código de 6 dígitos que enviamos a tu correo
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Código de 6 dígitos"
            value={codigo}
            onChange={(e) =>
              setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            maxLength={6}
            required
          />

          <button type="submit" disabled={loading || codigo.length !== 6}>
            {loading ? "Verificando..." : "Verificar código"}
          </button>
        </form>

        {mensaje && <p className="mensaje">{mensaje}</p>}

        <p className="footer-text">
          <span className="link" onClick={() => navigate("/forgot-password")}>
            Cambiar correo
          </span>
        </p>

      </div>
    </div>
  );
}
