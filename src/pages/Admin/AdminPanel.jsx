import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, BarChart3, ShieldCheck } from "lucide-react"; // Iconos modernos
import TopBarAdmin from "../../components/TopBarAdmin/TopBarAdmin";
import "./AdminPanelStyle.css";

export default function AdminPanel() {
  const navigate = useNavigate();

  return (
    <div className="admin-layout-wrapper">
      <TopBarAdmin />

      <div className="admin-container">
        {/* SIDEBAR CON TU LÓGICA DE NAVEGACIÓN */}
        <aside className="admin-sidebar">
          <div className="sidebar-header">
            <ShieldCheck size={20} color="#fcb424" />
            <h2 className="sidebar-title">Panel Admin</h2>
          </div>

          <ul className="sidebar-menu">
            <li onClick={() => navigate("/admin/cursos")} className="menu-item">
              <BookOpen size={18} /> <span>Gestionar Cursos</span>
            </li>
            <li onClick={() => navigate("/admin/usuarios")} className="menu-item">
              <Users size={18} /> <span>Gestionar Usuarios</span>
            </li>
            <li onClick={() => navigate("/admin/reportes")} className="menu-item">
              <BarChart3 size={18} /> <span>Reportes</span>
            </li>
          </ul>
        </aside>

        {/* CONTENIDO PRINCIPAL FUSIONADO */}
        <main className="admin-main">
          <div className="admin-welcome-section">
            <h1 className="admin-title">Panel de Administración</h1>
            <p className="admin-subtitle">
              Bienvenido al centro de control. Selecciona una opción para comenzar.
            </p>
          </div>

          <div className="admin-cards">
            {/* CARD CURSOS */}
            <div className="admin-card" onClick={() => navigate("/admin/cursos")}>
              <div className="card-icon-box icon-blue">
                <BookOpen size={32} />
              </div>
              <div className="card-info">
                <h3>Cursos</h3>
                <p>Crear, editar o eliminar cursos del catálogo.</p>
              </div>
              <div className="card-arrow">→</div>
            </div>

            {/* CARD USUARIOS */}
            <div className="admin-card" onClick={() => navigate("/admin/usuarios")}>
              <div className="card-icon-box icon-amber">
                <Users size={32} />
              </div>
              <div className="card-info">
                <h3>Usuarios</h3>
                <p>Administrar cuentas de estudiantes y administradores.</p>
              </div>
              <div className="card-arrow">→</div>
            </div>

            {/* CARD REPORTES */}
            <div className="admin-card" onClick={() => navigate("/admin/reportes")}>
              <div className="card-icon-box icon-green">
                <BarChart3 size={32} />
              </div>
              <div className="card-info">
                <h3>Reportes</h3>
                <p>Ver estadísticas de rendimiento y uso del sistema.</p>
              </div>
              <div className="card-arrow">→</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}