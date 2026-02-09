import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Users, BarChart3, ShieldCheck, ChevronRight } from "lucide-react"; 
import TopBarAdmin from "../../components/TopBarAdmin/TopBarAdmin";
import "./AdminPanelStyle.css";

export default function AdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();

  // Función para saber si la ruta está activa
  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout-wrapper">
      <TopBarAdmin />

      <div className="admin-container">
        {/* SIDEBAR NAVEGACIÓN */}
        <aside className="admin-sidebar">
          <div className="sidebar-header">
            <div className="admin-badge">
              <ShieldCheck size={18} color="#00003f" />
            </div>
            <h2 className="sidebar-title">Panel Admin</h2>
          </div>

          <nav className="sidebar-nav">
            <ul className="sidebar-menu">
              <li 
                onClick={() => navigate("/admin/cursos")} 
                className={`menu-item ${isActive("/admin/cursos") ? "active" : ""}`}
              >
                <BookOpen size={20} /> <span>Gestionar Cursos</span>
              </li>
              <li 
                onClick={() => navigate("/admin/usuarios")} 
                className={`menu-item ${isActive("/admin/usuarios") ? "active" : ""}`}
              >
                <Users size={20} /> <span>Gestionar Usuarios</span>
              </li>
              <li 
                onClick={() => navigate("/admin/reportes")} 
                className={`menu-item ${isActive("/admin/reportes") ? "active" : ""}`}
              >
                <BarChart3 size={20} /> <span>Reportes</span>
              </li>
            </ul>
          </nav>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="admin-main">
          <header className="admin-welcome-section">
            <h1 className="admin-title">Centro de Control</h1>
            <p className="admin-subtitle">
              Bienvenido, administrador. Gestiona el ecosistema <strong>YES EMS</strong> desde aquí.
            </p>
          </header>

          <div className="admin-cards-grid">
            {/* CARD CURSOS */}
            <div className="admin-action-card" onClick={() => navigate("/admin/cursos")}>
              <div className="card-icon-wrapper icon-bg-blue">
                <BookOpen size={28} />
              </div>
              <div className="card-body">
                <h3>Cursos</h3>
                <p>Administra el catálogo de lecciones y contenido multimedia.</p>
              </div>
              <ChevronRight className="card-chevron" size={20} />
            </div>

            {/* CARD USUARIOS */}
            <div className="admin-action-card" onClick={() => navigate("/admin/usuarios")}>
              <div className="card-icon-wrapper icon-bg-amber">
                <Users size={28} />
              </div>
              <div className="card-body">
                <h3>Usuarios</h3>
                <p>Control de acceso para estudiantes, profesores y staff.</p>
              </div>
              <ChevronRight className="card-chevron" size={20} />
            </div>

            {/* CARD REPORTES */}
            <div className="admin-action-card" onClick={() => navigate("/admin/reportes")}>
              <div className="card-icon-wrapper icon-bg-green">
                <BarChart3 size={28} />
              </div>
              <div className="card-body">
                <h3>Reportes</h3>
                <p>Estadísticas de progreso, inscripciones y actividad global.</p>
              </div>
              <ChevronRight className="card-chevron" size={20} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}