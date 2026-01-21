import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { verificarCorreoRequest } from "../../servicios/authService";
import "./VerificarCorreoStyle.css";

export default function VerificarCorreo() {
  const { token } = useParams();

  const [estado, setEstado] = useState("cargando");
  // "cargando" | "exito" | "error"
  const [mensaje, setMensaje] = useState("Procesando token...");
  const [contador, setContador] = useState(10);

  useEffect(() => {
    if (!token) {
      setEstado("error");
      setMensaje("Token no proporcionado.");
      return;
    }

    let intervalId = null;

    const verificar = async () => {
      // ⏳ Delay para mejor UX
      await new Promise((r) => setTimeout(r, 1000));

      const res = await verificarCorreoRequest(token);

      if (res.ok) {
        setEstado("exito");
        setMensaje(
          res.message ||
            "✔ Cuenta verificada correctamente. Serás redirigido al login..."
        );
      } else {
        setEstado("error");
        setMensaje(
          res.message ||
            "❌ Token inválido o expirado. Serás redirigido al login..."
        );
      }

      // ⏱ Conteo regresivo
      intervalId = setInterval(() => {
        setContador((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId);
            window.location.href = "/login";
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    verificar();

    // 🧹 Limpieza
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [token]);

  return (
    <div className="verificar-container">
      <div className="verificar-card">
        {estado === "cargando" && (
          <>
            <div className="loader"></div>
            <h2>Verificando tu cuenta...</h2>
          </>
        )}

        {estado === "exito" && (
          <h2 style={{ color: "green" }}>Cuenta verificada</h2>
        )}

        {estado === "error" && (
          <h2 style={{ color: "red" }}>Error en la verificación</h2>
        )}

        <p>{mensaje}</p>

        {estado !== "cargando" && (
          <p>
            Redirigiendo en <b>{contador}</b> segundos...
          </p>
        )}
      </div>
    </div>
  );
}
