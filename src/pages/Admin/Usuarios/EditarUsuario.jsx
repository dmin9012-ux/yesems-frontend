import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBarAdmin from "../../../components/TopBarAdmin/TopBarAdmin";
import { obtenerUsuarioPorId, actualizarUsuario } from "../../../servicios/usuarioAdminService";
import apiYesems from "../../../api/apiYesems";
import { notify, confirmDialog } from "../../../Util/toast";
import { Zap, ShieldCheck } from "lucide-react"; // 👈 Añadidos iconos
import "./UsuariosStyle.css";

export default function EditarUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState({
    nombre: "",
    email: "",
    rol: "usuario",
    estado: "activo",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setLoading(true);
        const res = await obtenerUsuarioPorId(id);
        setUsuario(res);
      } catch (err) {
        console.error("Error al obtener usuario:", err);
        notify("error", "No se pudo cargar el perfil del usuario.");
        navigate("/admin/usuarios");
      } finally {
        setLoading(false);
      }
    };
    cargarUsuario();
  }, [id, navigate]);

  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await actualizarUsuario(id, usuario);
      notify("success", "Datos del usuario actualizados 👤");
      navigate("/admin/usuarios");
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      notify("error", "Error al guardar los cambios.");
    }
  };

  // 🚀 NUEVA FUNCIÓN: ACTIVAR PREMIUM DESDE LA EDICIÓN
  const handleActivarPremium = async () => {
    const result = await confirmDialog(
      "Activar Suscripción Premium",
      "¿Cuántas horas de acceso quieres otorgar a este usuario?",
      "question",
      true // Asumiendo que tu util permite input
    );

    if (result.isConfirmed) {
      const horas = result.value || 1;
      try {
        await apiYesems.post("/usuario/activar-premium-admin", {
          usuarioId: id,
          horas: parseInt(horas),
          tipo: "prueba_hora"
        });
        notify("success", `¡Suscripción de ${horas}h activada con éxito! ⚡`);
      } catch (err) {
        notify("error", "Hubo un fallo al procesar la suscripción.");
      }
    }
  };

  const handleEliminar = async () => {
    const result = await confirmDialog(
      "¿Eliminar este usuario?",
      "Esta acción es irreversible y se perderá todo su progreso.",
      "warning"
    );

    if (result.isConfirmed) {
      try {
        await apiYesems.delete(`/usuario/${id}`);
        notify("success", "Usuario eliminado permanentemente.");
        navigate("/admin/usuarios");
      } catch (err) {
        notify("error", "No se tienen permisos o el usuario no existe.");
      }
    }
  };

  if (loading) return (
    <div className="admin-loading-container">
      <div className="spinner"></div>
      <p>Consultando base de datos...</p>
    </div>
  );

  return (
    <div className="admin-page-layout">
      <TopBarAdmin />
      <div className="usuarios-container">
        <header className="admin-page-header">
          <h1>Editar Usuario</h1>
          <button className="btn-volver" onClick={() => navigate("/admin/usuarios")}>
            ← Volver a la lista
          </button>
        </header>

        <div className="usuario-edit-card">
          <form className="usuario-form" onSubmit={handleSubmit}>
            {/* ... (campos de nombre y email se mantienen igual) */}
            <div className="input-group-admin">
              <label>Nombre Completo</label>
              <input type="text" name="nombre" value={usuario.nombre} onChange={handleChange} required />
            </div>

            <div className="input-group-admin">
              <label>Correo Electrónico</label>
              <input type="email" name="email" value={usuario.email} onChange={handleChange} required />
            </div>

            <div className="grid-form-row">
              <div className="input-group-admin">
                <label>Rol de Acceso</label>
                <select name="rol" value={usuario.rol} onChange={handleChange}>
                  <option value="usuario">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="input-group-admin">
                <label>Estado de Cuenta</label>
                <select name="estado" value={usuario.estado} onChange={handleChange}>
                  <option value="activo">Activo ✅</option>
                  <option value="inactivo">Inactivo ❌</option>
                </select>
              </div>
            </div>

            {/* 🛡️ SECCIÓN NUEVA: GESTIÓN DE SUSCRIPCIÓN */}
            <div className="admin-premium-section">
                <h3><ShieldCheck size={20} /> Gestión de Suscripción</h3>
                <p>Otorga acceso premium manualmente a este usuario sin pasar por Mercado Pago.</p>
                <button type="button" className="btn-premium-direct" onClick={handleActivarPremium}>
                    <Zap size={16} /> Activar Premium Ahora
                </button>
            </div>

            <div className="form-actions-admin">
              <button type="submit" className="btn-guardar-admin">
                💾 Guardar Cambios
              </button>
              <button type="button" className="btn-eliminar-admin" onClick={handleEliminar}>
                ❌ Eliminar Usuario
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}