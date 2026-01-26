import React, { useState } from "react";
import apiYesems from "../../api/apiYesems";
import { notify } from "../../Util/toast"; // 👈 Centralizamos la respuesta
import "./ModalPasswordStyle.css";

const ModalPassword = ({ onClose }) => {
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [loading, setLoading] = useState(false);

  const cerrarModal = () => {
    setPasswordActual("");
    setPasswordNueva("");
    setLoading(false);
    onClose();
  };

  const cambiarPassword = async () => {
    if (!passwordActual || !passwordNueva) {
      notify("warning", "Todos los campos son obligatorios");
      return;
    }

    if (passwordNueva.length < 6) {
      notify("warning", "La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      await apiYesems.put("/usuario/perfil/password", {
        passwordActual,
        passwordNueva,
      });

      notify("success", "Contraseña actualizada correctamente 🔐");
      
      // Cerramos de inmediato o tras un breve delay para que vean el éxito
      setTimeout(cerrarModal, 1000);
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Error al cambiar contraseña";
      notify("error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-password">
        <h3 className="modal-title">Cambiar contraseña</h3>
        <p className="modal-subtitle">Asegúrate de usar una combinación segura.</p>

        <div className="modal-form">
          <input
            type="password"
            placeholder="Contraseña actual"
            className="modal-input"
            value={passwordActual}
            onChange={(e) => setPasswordActual(e.target.value)}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Nueva contraseña"
            className="modal-input"
            value={passwordNueva}
            onChange={(e) => setPasswordNueva(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="modal-actions">
          <button 
            className="btn-modal-save" 
            onClick={cambiarPassword} 
            disabled={loading}
          >
            {loading ? "Actualizando..." : "Guardar cambios"}
          </button>
          <button 
            className="btn-modal-cancel" 
            onClick={cerrarModal} 
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPassword;