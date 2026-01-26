import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBarAdmin from "../../../components/TopBarAdmin/TopBarAdmin";
import { obtenerUsuarios } from "../../../servicios/usuarioAdminService";
import { notify } from "../../../Util/toast"; // 👈 Tu utilidad de Toasts
import { Search, Edit3, UserPlus } from "lucide-react"; // Iconos para mejorar el UI
import "./UsuariosStyle.css";

export default function ListarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState(""); // 🔍 Opcional: Filtro rápido
  const navigate = useNavigate();

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const res = await obtenerUsuarios();
      setUsuarios(res);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      notify("error", "Error al sincronizar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Filtrado simple por nombre o email
  const usuariosFiltrados = usuarios.filter(u => 
    u.nombre.toLowerCase().includes(filtro.toLowerCase()) || 
    u.email.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) return (
    <div className="admin-loading-container">
      <div className="spinner"></div>
      <p>Cargando base de datos de usuarios...</p>
    </div>
  );

  return (
    <div className="admin-page-layout">
      <TopBarAdmin />
      <div className="usuarios-container">
        
        <header className="admin-page-header">
          <div className="header-text">
            <h1>Gestión de Usuarios</h1>
            <p>Administra los roles y accesos de la plataforma.</p>
          </div>
          <button className="btn-volver" onClick={() => navigate("/admin")}>
            ← Volver al Panel
          </button>
        </header>

        <div className="table-controls">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo..." 
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          {usuariosFiltrados.length === 0 ? (
            <div className="no-data">
              <p>No se encontraron usuarios registrados.</p>
            </div>
          ) : (
            <table className="usuarios-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u) => (
                  <tr key={u._id}>
                    <td className="font-bold">{u.nombre}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge-rol ${u.rol}`}>
                        {u.rol === 'admin' ? '🛡️ Admin' : '👤 Usuario'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-dot ${u.estado}`}></span>
                      {u.estado}
                    </td>
                    <td className="text-center">
                      <button 
                        className="btn-accion-edit"
                        onClick={() => navigate(`/admin/usuarios/editar/${u._id}`)}
                        title="Editar Usuario"
                      >
                        <Edit3 size={16} /> Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}