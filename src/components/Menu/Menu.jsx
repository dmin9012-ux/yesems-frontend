import React from "react";
import { useNavigate } from "react-router-dom";
import "./MenuStyle.css";

export default function Menu({
  cursos = [],
  cursosCompletados = [],
}) {
  const navigate = useNavigate();

  if (!Array.isArray(cursos) || cursos.length === 0) {
    return (
      <div className="menu-container">
        <p>No hay cursos disponibles por el momento.</p>
      </div>
    );
  }

  // 🔹 Función segura para saber si un curso está completado
  const estaCompletado = (cursoId) => {
    return cursosCompletados.some(
      (c) =>
        c === cursoId ||
        c?.cursoId === cursoId ||
        c?._id === cursoId ||
        c?.id === cursoId ||
        c?.completado === true
    );
  };

  return (
    <div className="menu-container">
      <h2 className="menu-title">🚀 Cursos disponibles</h2>

      <div className="menu-grid">
        {cursos.map((item) => {
          const cursoId = item.id || item.cursoId;
          const completado = estaCompletado(cursoId);

          return (
            <div
              key={cursoId}
              className={`menu-item sombra ${
                completado ? "completado" : ""
              }`}
              onClick={() => navigate(`/curso/${cursoId}`)}
            >
              <div className="menu-icon">
                {item.imagenURL ? (
                  <img
                    src={item.imagenURL}
                    alt={item.nombre}
                  />
                ) : (
                  "📘"
                )}
              </div>

              <p className="menu-text">{item.nombre}</p>
              <p className="menu-desc">{item.descripcion}</p>

              {completado && (
                <span className="badge-completado">
                  ✅ Completado
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
