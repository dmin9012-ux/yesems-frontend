import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBarAdmin from "../../../components/TopBarAdmin/TopBarAdmin";
import { obtenerUsuarios } from "../../../servicios/usuarioAdminService";
import { notify, confirmDialog } from "../../../Util/toast"; 
import apiYesems from "../../../api/apiYesems"; 
import { Search, Edit3, Zap } from "lucide-react"; 
import "./UsuariosStyle.css";

export default function ListarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState(""); 
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

  /* ========================================================
      ⚡ LÓGICA PARA ACTIVAR PREMIUM DESDE LA TABLA
  ======================================================== */
  const handleActivarPremium = async (u) => {
    const result = await confirmDialog(
      `¿Activar Premium para ${u.nombre}?`,
      "Introduce el número de horas de suscripción (ej: 1, 24, 720):",
      "question",
      true // Habilita el input en el modal
    );

    if (result.isConfirmed) {
      const horas = result.value || "1"; 
      try {
        await apiYesems.post("/usuario/activar-premium-admin", {
          usuarioId: u._id,
          horas: parseInt(horas),
          tipo: "prueba_hora"
        });
        
        notify("success", `¡Premium activado por ${horas}h para ${u.nombre}! ⚡`);
        cargarUsuarios(); // Refrescar lista para ver cambios
      } catch (err) {
        console.error("Error activation:", err);
        notify("error", "Error al activar la suscripción.");
      }
    }
  };

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
                      <div className="action-buttons-cell">
                        {/* ⚡ BOTÓN ACTIVAR PREMIUM */}
                        <button 
                          className="btn-accion-premium"
                          onClick={() => handleActivarPremium(u)}
                          title="Dar Premium Manual"
                        >
                          <Zap size={16} />
                        </button>

                        {/* 📝 BOTÓN EDITAR */}
                        <button 
                          className="btn-accion-edit"
                          onClick={() => navigate(`/admin/usuarios/editar/${u._id}`)}
                          title="Editar Usuario"
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
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