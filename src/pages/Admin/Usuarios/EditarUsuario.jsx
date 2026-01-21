import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBarAdmin from "../../../components/TopBarAdmin/TopBarAdmin";
import { obtenerUsuarioPorId, actualizarUsuario } from "../../../servicios/usuarioAdminService";
import apiYesems from "../../../api/apiYesems";
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

  // Cargar usuario al montar
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setLoading(true);
        const res = await obtenerUsuarioPorId(id);
        setUsuario(res);
      } catch (err) {
        console.error("Error al obtener usuario:", err);
        alert("No se pudo cargar el usuario. Revisa tu sesión o permisos.");
      } finally {
        setLoading(false);
      }
    };
    cargarUsuario();
  }, [id]);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  // Guardar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await actualizarUsuario(id, usuario);
      alert("Usuario actualizado correctamente.");
      navigate("/admin/usuarios");
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      alert("No se pudo actualizar el usuario. Revisa tu sesión o permisos.");
    }
  };

  // Borrar usuario
  const handleEliminar = async () => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario? Esta acción es irreversible.")) return;

    try {
      await apiYesems.delete(`/usuario/${id}`);
      alert("Usuario eliminado correctamente.");
      navigate("/admin/usuarios");
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      alert("No se pudo eliminar el usuario. Revisa tu sesión o permisos.");
    }
  };

  if (loading) return <div>Cargando usuario...</div>;

  return (
    <>
      <TopBarAdmin />
      <div className="usuarios-container">
        <h1>Editar Usuario</h1>
        <button className="btn-volver" onClick={() => navigate("/admin/usuarios")}>
          ← Volver a Usuarios
        </button>

        <form className="usuario-form" onSubmit={handleSubmit}>
          <label>
            Nombre:
            <input type="text" name="nombre" value={usuario.nombre} onChange={handleChange} required />
          </label>

          <label>
            Email:
            <input type="email" name="email" value={usuario.email} onChange={handleChange} required />
          </label>

          <label>
            Rol:
            <select name="rol" value={usuario.rol} onChange={handleChange}>
              <option value="usuario">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </label>

          <label>
            Estado:
            <select name="estado" value={usuario.estado} onChange={handleChange}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </label>

          <div className="form-buttons">
            <button type="submit" className="btn-guardar">💾 Guardar Cambios</button>
            <button type="button" className="btn-eliminar" onClick={handleEliminar}>❌ Eliminar Usuario</button>
          </div>
        </form>
      </div>
    </>
  );
}
