import React, { useState } from "react";
import { User, Image, Lock, X } from "lucide-react";
import { actualizarMiPerfil } from "../../servicios/usuarioService";
import { notify } from "../../Util/toast";

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

  const guardarPerfil = async () => {
    if (!nombre.trim()) {
      return notify("warning", "El nombre no puede estar vacío");
    }

    if (nombre === usuario.nombre) {
      return onClose();
    }

    try {
      setLoading(true);
      const usuarioActualizado = await actualizarMiPerfil(nombre);
      setUsuario(usuarioActualizado);
      notify("success", "Perfil actualizado correctamente ✨");
      onClose();
    } catch (err) {
      notify("error", "No se pudo actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal-editar-card">
        <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
          <X size={20} />
        </button>

        {/* 📑 TABS RESPONSIVAS */}
        <div className="modal-tabs">
          <button
            className={`tab-item ${tab === "perfil" ? "active" : ""}`}
            onClick={() => setTab("perfil")}
          >
            <User size={18} /> <span>Perfil</span>
          </button>

          <button
            className={`tab-item ${tab === "foto" ? "active" : ""}`}
            onClick={() => setTab("foto")}
          >
            <Image size={18} /> <span>Foto</span>
          </button>

          <button
            className={`tab-item ${tab === "seguridad" ? "active" : ""}`}
            onClick={() => setTab("seguridad")}
          >
            <Lock size={18} /> <span>Seguridad</span>
          </button>
        </div>

        {/* 📦 CONTENIDO */}
        <div className="tab-body">
          {tab === "perfil" && (
            <div className="tab-pane">
              <h3>Información personal</h3>
              <p className="tab-description">Actualiza tu nombre tal cual aparecerá en tus constancias.</p>
              
              <div className="input-field">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  disabled={loading}
                  autoFocus
                />
              </div>

              <button className="btn-save-perfil" onClick={guardarPerfil} disabled={loading}>
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          )}

          {tab === "foto" && (
            <div className="tab-pane centered">
              <div className="icon-circle">
                <Image size={32} />
              </div>
              <h3>Foto de perfil</h3>
              <p>Esta función estará disponible próximamente para personalizar tu cuenta.</p>
            </div>
          )}

          {tab === "seguridad" && (
            <div className="tab-pane centered">
              <div className="icon-circle">
                <Lock size={32} />
              </div>
              <h3>Seguridad</h3>
              <p>Para proteger tu cuenta, te recomendamos cambiar tu contraseña periódicamente.</p>
              <button
                className="btn-change-pass"
                onClick={() => {
                  onClose();
                  onChangePassword();
                }}
              >
                Cambiar contraseña ahora
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalEditarPerfil;