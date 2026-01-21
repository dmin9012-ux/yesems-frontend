import React, { useState } from "react";
import { User, Image, Lock, X } from "lucide-react";
import { actualizarMiPerfil } from "../../servicios/usuarioService";

import "./ModalEditarPerfilStyle.css";

const ModalEditarPerfil = ({
  usuario,
  setUsuario,
  onClose,
  onChangePassword,
}) => {
  const [tab, setTab] = useState("perfil");
  const [nombre, setNombre] = useState(usuario.nombre || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const guardarPerfil = async () => {
    if (!nombre.trim()) {
      return setError("El nombre no puede estar vacío");
    }

    if (nombre === usuario.nombre) {
      return onClose();
    }

    try {
      setLoading(true);
      setError("");

      const usuarioActualizado = await actualizarMiPerfil(nombre);

      // 🔁 Actualiza estado en Perfil.jsx
      setUsuario(usuarioActualizado);

      onClose();
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-editar">
        <button className="modal-close" onClick={onClose}>
          <X />
        </button>

        {/* TABS */}
        <div className="tabs">
          <button
            className={tab === "perfil" ? "active" : ""}
            onClick={() => setTab("perfil")}
          >
            <User size={16} /> Perfil
          </button>

          <button
            className={tab === "foto" ? "active" : ""}
            onClick={() => setTab("foto")}
          >
            <Image size={16} /> Foto
          </button>

          <button
            className={tab === "seguridad" ? "active" : ""}
            onClick={() => setTab("seguridad")}
          >
            <Lock size={16} /> Seguridad
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="tab-content">
          {tab === "perfil" && (
            <>
              <h3>Información personal</h3>

              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre"
                disabled={loading}
              />

              {error && <p className="modal-error">{error}</p>}

              <button onClick={guardarPerfil} disabled={loading}>
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
            </>
          )}

          {tab === "foto" && (
            <>
              <h3>Foto de perfil</h3>
              <p>Próximamente podrás subir una imagen.</p>
            </>
          )}

          {tab === "seguridad" && (
            <>
              <h3>Seguridad de la cuenta</h3>
              <button
                onClick={() => {
                  onClose();
                  onChangePassword();
                }}
              >
                Cambiar contraseña
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalEditarPerfil;
