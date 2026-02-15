import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiYesems from "../../api/apiYesems";
import { Zap, ShieldCheck, CheckCircle2, ArrowLeft } from "lucide-react"; // Añadimos iconos modernos
import "./SuscripcionStyle.css";

const Suscripcion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isPremium, loading, actualizarDatosUsuario } = useAuth();
  const [cargandoPago, setCargandoPago] = useState(false);

  /* ============================================================
      🔄 VERIFICACIÓN AUTOMÁTICA AL VOLVER DE MERCADO PAGO
  ============================================================ */
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get("status");

    // Si el pago fue aprobado, sincronizamos y redirigimos
    if (status === "approved" || isPremium) {
      const sincronizar = async () => {
        await actualizarDatosUsuario();
        navigate("/principal");
      };
      sincronizar();
    }
  }, [location, isPremium, navigate, actualizarDatosUsuario]);

  const manejarSuscripcion = async () => {
    setCargandoPago(true);
    try {
      // El backend ya ignora estos valores y usa los de $100/semanal por seguridad,
      // pero los enviamos correctamente para mantener la consistencia.
      const res = await apiYesems.post("/pago/crear-preferencia", {
        plan: "semanal",
        precio: 100 
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

  if (loading) return (
    <div className="admin-loading-container">
      <div className="spinner"></div>
      <p>Verificando estado de cuenta...</p>
    </div>
  );

  return (
    <div className="suscripcion-container">
      <div className="suscripcion-card">
        <div className="icon-header">
            <ShieldCheck size={48} color="#fcb424" />
        </div>
        <h1>Acceso Premium 🔒</h1>
        <p className="description">
          Lleva tu preparación al siguiente nivel con acceso total y sin restricciones.
        </p>

        <div className="plan-detalles">
          <div className="plan-badge">RECOMENDADO</div>
          <h2>Plan Semanal</h2>
          <p className="precio">$100.00 MXN</p>
          <p className="duracion">Acceso por 7 días</p>
          
          <ul className="beneficios-list">
            <li><CheckCircle2 size={18} color="#16a34a" /> <span>Acceso ilimitado a todos los cursos</span></li>
            <li><CheckCircle2 size={18} color="#16a34a" /> <span>Simuladores de examen desbloqueados</span></li>
            <li><CheckCircle2 size={18} color="#16a34a" /> <span>Generación de constancias oficiales</span></li>
            <li><CheckCircle2 size={18} color="#16a34a" /> <span>Reportes de progreso detallados</span></li>
          </ul>
        </div>

        <div className="suscripcion-actions">
          <button 
            className="btn-primario-premium" 
            onClick={manejarSuscripcion}
            disabled={cargandoPago}
          >
            <Zap size={18} />
            {cargandoPago ? "Conectando con Mercado Pago..." : "Obtener Acceso Semanal"}
          </button>

          <button 
            className="btn-secundario-volver" 
            onClick={() => navigate("/principal")}
            disabled={cargandoPago}
          >
            <ArrowLeft size={18} />
            Volver
          </button>
        </div>
        
        <div className="footer-secure">
          <img src="https://img.icons8.com/color/48/000000/mercadopago.png" alt="Mercado Pago" width="24" />
          <p>Pago seguro y cifrado vía Mercado Pago.</p>
        </div>
      </div>
    </div>
  );
};

export default Suscripcion;