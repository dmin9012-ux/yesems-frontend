import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiYesems from "../../api/apiYesems";
import "./SuscripcionStyle.css";

const Suscripcion = () => {
  const navigate = useNavigate();
  const { isPremium, loading } = useAuth();
  const [cargandoPago, setCargandoPago] = useState(false);

  // Si ya es premium, no debe estar aquí
  useEffect(() => {
    if (!loading && isPremium) {
      navigate("/principal");
    }
  }, [isPremium, loading, navigate]);

  const manejarSuscripcion = async () => {
    setCargandoPago(true);
    try {
      // Pedimos al backend la preferencia de Mercado Pago
      // Nota: El backend debe tener la ruta POST /api/pago/crear-preferencia
      const res = await apiYesems.post("/pago/crear-preferencia", {
        plan: "premium_semanal",
        precio: 10 // Puedes ajustar el precio o traerlo de una config
      });

      if (res.data && res.data.init_point) {
        // Redirección directa a la pasarela de Mercado Pago
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
          <h2>Plan Semanal</h2>
          <p className="precio">$10.00 MXN</p>
          <ul>
            <li>✅ Acceso a todos los niveles</li>
            <li>✅ Certificado de finalización</li>
            <li>✅ Soporte técnico</li>
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