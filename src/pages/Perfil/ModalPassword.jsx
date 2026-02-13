import React, { useState } from "react";
import apiYesems from "../../api/apiYesems";
import { notify } from "../../Util/toast";
import ojoAbierto from "../../assets/ojoabierto.png";
import ojoCerrado from "../../assets/ojocerrado.png";
import "./ModalPasswordStyle.css";

const ModalPassword = ({ onClose }) => {
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [loading, setLoading] = useState(false);

  const cerrarModal = () => {
    setPasswordActual("");
    setPasswordNueva("");
    setShowActual(false);
    setShowNueva(false);
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
      setTimeout(cerrarModal, 1000);
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Error al cambiar contraseña";
      notify("error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && cerrarModal()}>
      <div className="modal-content-password">
        <h3 className="modal-title">Seguridad</h3>
        <p className="modal-subtitle">Cambia tu contraseña para proteger tu cuenta.</p>

        <div className="modal-form">
          {/* PASSWORD ACTUAL */}
          <div className="input-container-modal">
            <input
              type={showActual ? "text" : "password"}
              placeholder="Contraseña actual"
              className="modal-input"
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
            <img
              src={showActual ? ojoAbierto : ojoCerrado}
              alt="Ver"
              className="modal-password-eye"
              onClick={() => setShowActual(!showActual)}
            />
          </div>

          {/* NUEVA PASSWORD */}
          <div className="input-container-modal">
            <input
              type={showNueva ? "text" : "password"}
              placeholder="Nueva contraseña"
              className="modal-input"
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
            <img
              src={showNueva ? ojoAbierto : ojoCerrado}
              alt="Ver"
              className="modal-password-eye"
              onClick={() => setShowNueva(!showNueva)}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button 
            className="btn-modal-save" 
            onClick={cambiarPassword} 
            disabled={loading}
          >
            {loading ? "Procesando..." : "Guardar"}
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