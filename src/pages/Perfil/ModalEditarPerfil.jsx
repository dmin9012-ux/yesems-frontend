import React, { useState } from "react";
import { User, Image, Lock, X } from "lucide-react";
import { actualizarMiPerfil } from "../../servicios/usuarioService";
import { notify } from "../../Util/toast"; // 👈 Importamos la utilidad

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

      // 🔁 Actualiza estado en Perfil.jsx
      setUsuario(usuarioActualizado);
      
      notify("success", "Perfil actualizado correctamente ✨");
      onClose();
    } catch (err) {
      console.error(err);
      notify("error", "No se pudo actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-editar-card">
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* 📑 TABS CON TU IDENTIDAD VISUAL */}
        <div className="modal-tabs">
          <button
            className={tab === "perfil" ? "tab-item active" : "tab-item"}
            onClick={() => setTab("perfil")}
          >
            <User size={16} /> Perfil
          </button>

          <button
            className={tab === "foto" ? "tab-item active" : "tab-item"}
            onClick={() => setTab("foto")}
          >
            <Image size={16} /> Foto
          </button>

          <button
            className={tab === "seguridad" ? "tab-item active" : "tab-item"}
            onClick={() => setTab("seguridad")}
          >
            <Lock size={16} /> Seguridad
          </button>
        </div>

        {/* 📦 CONTENIDO DINÁMICO */}
        <div className="tab-body">
          {tab === "perfil" && (
            <div className="tab-pane">
              <h3>Información personal</h3>
              <p className="tab-description">Actualiza tu nombre de usuario para tus constancias.</p>
              
              <div className="input-field">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  disabled={loading}
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
              <p>Esta función estará disponible en la próxima actualización.</p>
            </div>
          )}

          {tab === "seguridad" && (
            <div className="tab-pane centered">
              <div className="icon-circle">
                <Lock size={32} />
              </div>
              <h3>Seguridad</h3>
              <p>¿Deseas cambiar tu contraseña de acceso?</p>
              <button
                className="btn-change-pass"
                onClick={() => {
                  onClose();
                  onChangePassword();
                }}
              >
                Ir a cambiar contraseña
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalEditarPerfil;