import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, CheckCircle, ArrowRight } from "lucide-react";
import "./MenuStyle.css";

export default function Menu({ cursos = [], cursosCompletados = [] }) {
  const navigate = useNavigate();

  const estaCompletado = (cursoId) => {
    return cursosCompletados.some((c) => (c?.cursoId || c?._id || c?.id || c) === cursoId);
  };

  if (!Array.isArray(cursos) || cursos.length === 0) {
    return (
      <div className="menu-empty-state">
        <div className="empty-icon-wrapper"><BookOpen size={48} /></div>
        <h3>No hay cursos disponibles</h3>
        <p>Pronto aparecerán nuevas lecciones para ti.</p>
      </div>
    );
  }

  return (
    <section className="menu-section">
      <header className="menu-section-header">
        <h2 className="menu-section-title">Continúa tu aprendizaje</h2>
        <p className="menu-section-subtitle">Selecciona un curso para retomar tus lecciones.</p>
      </header>

      <div className="menu-grid">
        {cursos.map((item) => {
          const cursoId = item.id || item._id || item.cursoId;
          const completado = estaCompletado(cursoId);

          return (
            <article
              key={cursoId}
              className={`course-card ${completado ? "status-completed" : ""}`}
              onClick={() => navigate(`/curso/${cursoId}`)}
            >
              <div className="course-card-image">
                {item.imagenURL ? (
                  <img src={item.imagenURL} alt={item.nombre} loading="lazy" />
                ) : (
                  <div className="course-image-placeholder"><BookOpen size={40} /></div>
                )}
                {completado && (
                  <div className="course-status-badge">
                    <CheckCircle size={14} /> <span>Completado</span>
                  </div>
                )}
              </div>

              <div className="course-card-body">
                <h3 className="course-card-name">{item.nombre}</h3>
                <p className="course-card-info">{item.descripcion}</p>
                <div className="course-card-footer">
                  <button className="course-action-btn">
                    <span>{completado ? "Repasar" : "Comenzar"}</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}