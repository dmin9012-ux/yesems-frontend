import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, BarChart3, Settings } from "lucide-react"; // Iconos más pro
import TopBarAdmin from "../../components/TopBarAdmin/TopBarAdmin";
import "./AdminPanelStyle.css";

export default function AdminPanel() {
  const navigate = useNavigate();

  return (
    <div className="admin-layout">
      <TopBarAdmin />

      <div className="admin-container">
        {/* SIDEBAR ADMINISTRATIVO */}
        <aside className="admin-sidebar">
          <div className="sidebar-header">
            <Settings size={20} />
            <h2 className="sidebar-title">Gestión</h2>
          </div>

          <ul className="sidebar-menu">
            <li onClick={() => navigate("/admin/cursos")} className="menu-item">
              <BookOpen size={18} /> <span>Cursos</span>
            </li>
            <li onClick={() => navigate("/admin/usuarios")} className="menu-item">
              <Users size={18} /> <span>Usuarios</span>
            </li>
            <li onClick={() => navigate("/admin/reportes")} className="menu-item">
              <BarChart3 size={18} /> <span>Reportes</span>
            </li>
          </ul>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="admin-main">
          <header className="admin-main-header">
            <h1 className="admin-title">Panel de Administración</h1>
            <p className="admin-subtitle">
              Bienvenido al centro de control de <strong>YES EMS</strong>.
            </p>
          </header>

          <div className="admin-cards-grid">
            <div className="admin-card-action" onClick={() => navigate("/admin/cursos")}>
              <div className="card-icon icon-blue">
                <BookOpen size={32} />
              </div>
              <div className="card-info">
                <h3>Gestionar Cursos</h3>
                <p>Crear lecciones, subir videos y configurar exámenes.</p>
              </div>
              <div className="card-arrow">→</div>
            </div>

            <div className="admin-card-action" onClick={() => navigate("/admin/usuarios")}>
              <div className="card-icon icon-amber">
                <Users size={32} />
              </div>
              <div className="card-info">
                <h3>Control de Usuarios</h3>
                <p>Administrar roles, permisos y ver progreso de estudiantes.</p>
              </div>
              <div className="card-arrow">→</div>
            </div>

            <div className="admin-card-action" onClick={() => navigate("/admin/reportes")}>
              <div className="card-icon icon-green">
                <BarChart3 size={32} />
              </div>
              <div className="card-info">
                <h3>Métricas y Reportes</h3>
                <p>Estadísticas de aprobación y analíticas generales.</p>
              </div>
              <div className="card-arrow">→</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}