import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { verificarCorreoRequest } from "../../servicios/authService";
import logo from "../../assets/logo-yesems.png"; // Importamos el logo para branding
import "./VerificarCorreoStyle.css";

export default function VerificarCorreo() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [estado, setEstado] = useState("cargando");
  const [mensaje, setMensaje] = useState("Procesando token de seguridad...");
  const [contador, setContador] = useState(10);

  useEffect(() => {
    if (!token) {
      setEstado("error");
      setMensaje("Token no proporcionado.");
      return;
    }

    let intervalId = null;

    const verificar = async () => {
      // ⏳ Delay para mejor UX (que no parpadee demasiado rápido)
      await new Promise((r) => setTimeout(r, 1500));

      const res = await verificarCorreoRequest(token);

      if (res.ok) {
        setEstado("exito");
        setMensaje(res.message || "✔ Tu cuenta ha sido activada con éxito.");
      } else {
        setEstado("error");
        setMensaje(res.message || "❌ El enlace es inválido o ha expirado.");
      }

      // ⏱ Conteo regresivo para redirección automática
      intervalId = setInterval(() => {
        setContador((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId);
            navigate("/login", { replace: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    verificar();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [token, navigate]);

  return (
    <div className="verificar-container">
      <div className={`verificar-card ${estado}`}>
        <img src={logo} alt="yesems logo" className="verificar-logo" />

        {estado === "cargando" && (
          <div className="verificar-content">
            <div className="verificar-spinner"></div>
            <h2>Verificando tu cuenta...</h2>
            <p className="mensaje-status">{mensaje}</p>
          </div>
        )}

        {estado === "exito" && (
          <div className="verificar-content">
            <div className="icon-status success">✔</div>
            <h2 className="title-success">¡Excelente!</h2>
            <p className="mensaje-status">{mensaje}</p>
          </div>
        )}

        {estado === "error" && (
          <div className="verificar-content">
            <div className="icon-status error">✖</div>
            <h2 className="title-error">Hubo un problema</h2>
            <p className="mensaje-status">{mensaje}</p>
          </div>
        )}

        {estado !== "cargando" && (
          <div className="verificar-footer">
            <p>
              Serás redirigido al login en <b>{contador}</b> segundos...
            </p>
            <button className="btn-direct-login" onClick={() => navigate("/login")}>
              Ir al Login ahora
            </button>
          </div>
        )}
      </div>
    </div>
  );
}