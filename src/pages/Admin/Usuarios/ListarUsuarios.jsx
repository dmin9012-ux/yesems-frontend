import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBarAdmin from "../../../components/TopBarAdmin/TopBarAdmin";
import { obtenerUsuarios } from "../../../servicios/usuarioAdminService";
import "./UsuariosStyle.css";

export default function ListarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const res = await obtenerUsuarios();
      setUsuarios(res);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      alert("Error al obtener usuarios. Revisa tu sesión o permisos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  if (loading) return <div>Cargando usuarios...</div>;

  return (
    <>
      <TopBarAdmin />
      <div className="usuarios-container">
        <h1>Gestión de Usuarios</h1>
        <button className="btn-volver" onClick={() => navigate("/admin")}>
          ← Volver al Panel
        </button>

        {usuarios.length === 0 ? (
          <p>No hay usuarios registrados.</p>
        ) : (
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u._id}>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>{u.rol}</td>
                  <td>{u.estado}</td>
                  <td>
                    <button onClick={() => navigate(`/admin/usuarios/editar/${u._id}`)}>
                      ✏️ Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
