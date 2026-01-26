import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiYesems from "../../api/apiYesems";
import { notify } from "../../Util/toast"; // 👈 Tu utilidad centralizada
import logo from "../../assets/logo-yesems.png";
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
        // ⏩ Código correcto → ir a reset password
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
    <div className="verify-container">
      <div className="verify-card">
        <img src={logo} alt="yesems logo" className="verify-logo" />

        <h2 className="verify-title">Verificar código</h2>
        <p className="subtitle">
          Ingresa el código de 6 dígitos enviado a: <br />
          <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit} className="verify-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="000000"
              className="input-codigo"
              value={codigo}
              onChange={(e) =>
                setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-verify"
            disabled={loading || codigo.length !== 6}
          >
            {loading ? "Verificando..." : "Verificar código"}
          </button>
        </form>

        <div className="verify-footer">
          <span className="link" onClick={() => navigate("/forgot-password")}>
            ⬅ Cambiar correo
          </span>
        </div>
      </div>
    </div>
  );
}