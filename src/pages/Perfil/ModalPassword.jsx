import React, { useState } from "react";
import apiYesems from "../../api/apiYesems";
import "./ModalPasswordStyle.css";

const ModalPassword = ({ onClose }) => {
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const cerrarModal = () => {
    setPasswordActual("");
    setPasswordNueva("");
    setMensaje("");
    setLoading(false);
    onClose();
  };

  const cambiarPassword = async () => {
    if (!passwordActual || !passwordNueva) {
      setMensaje("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);
    setMensaje("");

    try {
      // ✅ RUTA CORRECTA PARA USUARIO NORMAL
      await apiYesems.put("/usuario/perfil/password", {
        passwordActual,
        passwordNueva,
      });

      setMensaje("Contraseña actualizada correctamente");

      setTimeout(cerrarModal, 1200);
    } catch (error) {
      setMensaje(
        error?.response?.data?.message || "Error al cambiar contraseña"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Cambiar contraseña</h3>

        <input
          type="password"
          placeholder="Contraseña actual"
          value={passwordActual}
          onChange={(e) => setPasswordActual(e.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={passwordNueva}
          onChange={(e) => setPasswordNueva(e.target.value)}
          disabled={loading}
        />

        {mensaje && <p className="modal-message">{mensaje}</p>}

        <div className="modal-buttons">
          <button onClick={cambiarPassword} disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </button>
          <button onClick={cerrarModal} disabled={loading}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPassword;
