import React from "react";
import { useNavigate } from "react-router-dom";
import TopBarAdmin from "../../components/TopBarAdmin/TopBarAdmin";
import "./AdminPanelStyle.css";

export default function AdminPanel() {
  const navigate = useNavigate();

  return (
    <>
      {/* TOPBAR ADMIN */}
      <TopBarAdmin />

      <div className="admin-container">
        {/* SIDEBAR */}
        <aside className="admin-sidebar">
          <h2 className="sidebar-title">Panel Admin</h2>

          <ul className="sidebar-menu">
            <li onClick={() => navigate("/admin/cursos")}>
              📘 Gestionar Cursos
            </li>
            <li onClick={() => navigate("/admin/usuarios")}>
              👥 Gestionar Usuarios
            </li>
            <li onClick={() => navigate("/admin/reportes")}>
              📊 Reportes
            </li>
          </ul>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="admin-main">
          <h1 className="admin-title">Panel de Administración</h1>
          <p className="admin-subtitle">
            Selecciona una opción del menú para comenzar
          </p>

          <div className="admin-cards">
            <div
              className="admin-card"
              onClick={() => navigate("/admin/cursos")}
            >
              <h3>📘 Cursos</h3>
              <p>Crear, editar o eliminar cursos.</p>
            </div>

            <div
              className="admin-card"
              onClick={() => navigate("/admin/usuarios")}
            >
              <h3>👥 Usuarios</h3>
              <p>Administrar cuentas de estudiantes y administradores.</p>
            </div>

            <div
              className="admin-card"
              onClick={() => navigate("/admin/reportes")}
            >
              <h3>📊 Reportes</h3>
              <p>Ver estadísticas del sistema.</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
