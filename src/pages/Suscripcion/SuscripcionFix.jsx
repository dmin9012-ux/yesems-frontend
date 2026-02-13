import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // 👈 Añadimos useLocation
import { useAuth } from "../../context/AuthContext";
import apiYesems from "../../api/apiYesems";
import "./SuscripcionStyle.css";

const Suscripcion = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 👈 Para leer los parámetros que envía Mercado Pago al volver
  const { isPremium, loading, actualizarDatosUsuario } = useAuth(); // 👈 Traemos la función de actualizar
  const [cargandoPago, setCargandoPago] = useState(false);

  /* ============================================================
      🔄 VERIFICACIÓN AUTOMÁTICA AL VOLVER DE MERCADO PAGO
  ============================================================ */
  useEffect(() => {
    // Si en la URL detectamos que el pago fue exitoso
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get("status");

    if (status === "approved" || isPremium) {
      const sincronizar = async () => {
        await actualizarDatosUsuario(); // Forzamos al Front a pedir los datos nuevos al Back
        navigate("/principal"); // Nos lo llevamos a ver sus cursos
      };
      sincronizar();
    }
  }, [location, isPremium, navigate, actualizarDatosUsuario]);

  const manejarSuscripcion = async () => {
    setCargandoPago(true);
    try {
      const res = await apiYesems.post("/pago/crear-preferencia", {
        plan: "premium_semanal",
        precio: 10 
      });

      if (res.data && res.data.init_point) {
        window.location.href = res.data.init_point;
      } else {
        alert("No se pudo generar el enlace de pago. Intenta más tarde.");
      }
    } catch (error) {
      console.error("Error al iniciar suscripción:", error);
      alert("Hubo un error al conectar con el servidor de pagos.");
    } finally {
      setCargandoPago(false);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="suscripcion-container">
      <div className="suscripcion-card">
        <h1>Acceso Premium 🔒</h1>
        <p className="description">
          Obtén acceso ilimitado a todos los cursos, exámenes y reportes de la plataforma YESems.
        </p>

        <div className="plan-detalles">
          <h2>Plan de Prueba</h2>
          <p className="precio">$10.00 MXN</p>
          <ul>
            <li>✅ Acceso total por 1 hora</li>
            <li>✅ Exámenes desbloqueados</li>
            <li>✅ Certificado de finalización</li>
          </ul>
        </div>

        <div className="suscripcion-actions">
          <button 
            className="btn-primario" 
            onClick={manejarSuscripcion}
            disabled={cargandoPago}
          >
            {cargandoPago ? "Procesando..." : "Suscribirme ahora"}
          </button>

          <button 
            className="btn-secundario" 
            onClick={() => navigate("/principal")}
            disabled={cargandoPago}
          >
            Volver
          </button>
        </div>
        
        <p className="footer-note">
          Pago seguro procesado por Mercado Pago.
        </p>
      </div>
    </div>
  );
};

export default Suscripcion;