import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import { useAuth } from "../../context/AuthContext";
import apiYesems from "../../api/apiYesems";
import { notify } from "../../Util/toast"; // 👈 Usamos tus toasts
import { ShieldCheck, Star, Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import "./SuscripcionStyle.css";

const Suscripcion = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const { isPremium, loading, actualizarDatosUsuario } = useAuth(); 
  const [cargandoPago, setCargandoPago] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get("status");

    if (status === "approved" || isPremium) {
      const sincronizar = async () => {
        await actualizarDatosUsuario(); 
        notify("success", "¡Suscripción activada con éxito! 🎉");
        navigate("/principal"); 
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
        notify("error", "No se pudo generar el enlace de pago.");
      }
    } catch (error) {
      notify("error", "Error al conectar con el servidor de pagos.");
    } finally {
      setCargandoPago(false);
    }
  };

  if (loading) return (
    <div className="suscripcion-loading">
        <div className="spinner"></div>
        <p>Verificando estado...</p>
    </div>
  );

  return (
    <div className="suscripcion-page">
      <div className="suscripcion-card">
        <div className="premium-icon-header">
            <Star size={40} fill="#fcb424" color="#fcb424" />
        </div>
        
        <h1>Acceso Premium</h1>
        <p className="description">
          Lleva tu aprendizaje al siguiente nivel con acceso total a <strong>YESEMS</strong>.
        </p>

        <div className="plan-box">
          <div className="plan-header">
             <div className="plan-tag">RECOMENDADO</div>
             <h2>Plan de Prueba</h2>
             <div className="plan-price">
                <span className="currency">$</span>
                <span className="amount">10.00</span>
                <span className="period">/ MXN</span>
             </div>
          </div>
          
          <ul className="plan-features">
            <li><CheckCircle2 size={18} color="#10b981" /> <span>Acceso total por 1 hora</span></li>
            <li><CheckCircle2 size={18} color="#10b981" /> <span>Exámenes desbloqueados</span></li>
            <li><CheckCircle2 size={18} color="#10b981" /> <span>Certificados oficiales</span></li>
            <li><CheckCircle2 size={18} color="#10b981" /> <span>Contenido sin publicidad</span></li>
          </ul>
        </div>

        <div className="suscripcion-actions">
          <button 
            className="btn-pay-now" 
            onClick={manejarSuscripcion}
            disabled={cargandoPago}
          >
            {cargandoPago ? "Procesando..." : "Suscribirme ahora"}
          </button>

          <button 
            className="btn-go-back" 
            onClick={() => navigate("/principal")}
            disabled={cargandoPago}
          >
            <ArrowLeft size={16} /> Volver
          </button>
        </div>
        
        <div className="secure-payment-footer">
          <ShieldCheck size={16} />
          <span>Pago seguro mediante Mercado Pago</span>
        </div>
      </div>
    </div>
  );
};

export default Suscripcion;