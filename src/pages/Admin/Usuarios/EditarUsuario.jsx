import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBarAdmin from "../../../components/TopBarAdmin/TopBarAdmin";
import {
  obtenerUsuarioPorId,
  actualizarUsuario,
} from "../../../servicios/usuarioAdminService";
import apiYesems from "../../../api/apiYesems";
import { notify, confirmDialog } from "../../../Util/toast";
import { Zap, ShieldCheck, ArrowLeft } from "lucide-react";

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
  const [saving, setSaving] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ============================================================
      CARGAR USUARIO
  ============================================================ */

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setLoading(true);

        const res = await obtenerUsuarioPorId(id);

        setUsuario({
          nombre: res.nombre || "",
          email: res.email || "",
          rol: res.rol || "usuario",
          estado: res.estado || "activo",
        });
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

  /* ============================================================
      HANDLE CHANGE
  ============================================================ */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUsuario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ============================================================
      GUARDAR CAMBIOS
  ============================================================ */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    try {
      setSaving(true);

      await actualizarUsuario(id, usuario);

      notify("success", "Datos actualizados correctamente 👤");

      navigate("/admin/usuarios");
    } catch (err) {
      console.error(err);

      notify("error", "Error al guardar cambios.");
    } finally {
      setSaving(false);
    }
  };

  /* ============================================================
      ACTIVAR PREMIUM
  ============================================================ */

  const handleActivarPremium = async () => {
    if (premiumLoading) return;

    const result = await confirmDialog(
      "Activar acceso premium",
      `¿Deseas otorgar 1 hora premium a ${usuario.nombre}?`,
      "question",
      false
    );

    if (!result.isConfirmed) return;

    try {
      setPremiumLoading(true);

      await apiYesems.post("/usuario/activar-premium-admin", {
        usuarioId: id,
        horas: 1,
        tipo: "prueba_hora",
      });

      notify("success", "Acceso premium activado ⚡");
    } catch (err) {
      console.error(err);

      notify(
        "error",
        err.response?.data?.message || "Error al activar premium."
      );
    } finally {
      setPremiumLoading(false);
    }
  };

  /* ============================================================
      ELIMINAR USUARIO
  ============================================================ */

  const handleEliminar = async () => {
    if (deleteLoading) return;

    const result = await confirmDialog(
      "Eliminar usuario",
      "Esta acción es permanente.",
      "warning"
    );

    if (!result.isConfirmed) return;

    try {
      setDeleteLoading(true);

      await apiYesems.delete(`/usuario/${id}`);

      notify("success", "Usuario eliminado");

      navigate("/admin/usuarios");
    } catch (err) {
      console.error(err);

      notify("error", "Error al eliminar usuario.");
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ============================================================
      LOADING SCREEN
  ============================================================ */

  if (loading) {
    return (
      <div className="admin-page-layout">
        <TopBarAdmin />

        <div className="admin-loading-container with-topbar">
          <div className="spinner"></div>
          <p>Cargando usuario...</p>
        </div>
      </div>
    );
  }

  /* ============================================================
      UI
  ============================================================ */

  return (
    <div className="admin-page-layout">
      <TopBarAdmin />

      <div className="admin-content-wrapper">

        {/* HEADER */}

        <div className="admin-page-header responsive">
          <div>
            <h1>Editar Usuario</h1>
            <p className="admin-subtitle">
              Modifica datos y permisos del usuario
            </p>
          </div>

          <button
            className="btn-volver responsive"
            onClick={() => navigate("/admin/usuarios")}
          >
            <ArrowLeft size={18} />
            Volver
          </button>
        </div>

        {/* CARD */}

        <div className="usuario-edit-card responsive">

          <form
            className="usuario-form responsive"
            onSubmit={handleSubmit}
          >

            {/* NOMBRE */}

            <div className="input-group-admin">
              <label>Nombre completo</label>

              <input
                type="text"
                name="nombre"
                value={usuario.nombre}
                onChange={handleChange}
                required
              />
            </div>

            {/* EMAIL */}

            <div className="input-group-admin">
              <label>Correo electrónico</label>

              <input
                type="email"
                name="email"
                value={usuario.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* GRID */}

            <div className="grid-form-row responsive">

              <div className="input-group-admin">
                <label>Rol</label>

                <select
                  name="rol"
                  value={usuario.rol}
                  onChange={handleChange}
                >
                  <option value="usuario">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="input-group-admin">
                <label>Estado</label>

                <select
                  name="estado"
                  value={usuario.estado}
                  onChange={handleChange}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

            </div>

            {/* PREMIUM */}

            <div className="admin-premium-section responsive">

              <div className="premium-header">
                <ShieldCheck size={20} />
                <h3>Gestión Premium</h3>
              </div>

              <p>
                Otorga acceso premium temporal manualmente.
              </p>

              <button
                type="button"
                className="btn-premium-direct responsive"
                onClick={handleActivarPremium}
                disabled={premiumLoading}
              >
                <Zap size={16} />

                {premiumLoading
                  ? "Activando..."
                  : "Activar 1 hora premium"}
              </button>

            </div>

            {/* ACTIONS */}

            <div className="form-actions-admin responsive">

              <button
                type="submit"
                className="btn-guardar-admin responsive"
                disabled={saving}
              >
                {saving
                  ? "Guardando..."
                  : "Guardar cambios"}
              </button>

              <button
                type="button"
                className="btn-eliminar-admin responsive"
                onClick={handleEliminar}
                disabled={deleteLoading}
              >
                {deleteLoading
                  ? "Eliminando..."
                  : "Eliminar usuario"}
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}
