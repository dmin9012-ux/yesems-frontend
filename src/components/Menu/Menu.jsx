import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle,
  Menu as MenuIcon,
  X
} from "lucide-react";

import "./MenuStyle.css";

export default function Menu({
  cursos = [],
  cursosCompletados = [],
}) {

  const navigate = useNavigate();

  /* ===============================
     ESTADO PARA MÓVIL
  =============================== */

  const [esMovil, setEsMovil] = useState(window.innerWidth <= 768);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {

    const handleResize = () => {
      setEsMovil(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);

  }, []);


  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };


  const irACurso = (cursoId) => {

    navigate(`/curso/${cursoId}`);

    /* cerrar menú en móvil */
    if (esMovil) {
      setMenuAbierto(false);
    }

  };


  if (!Array.isArray(cursos) || cursos.length === 0) {
    return (
      <div className="menu-container-empty">
        <div className="empty-icon">📚</div>
        <p>
          Aún no tienes cursos asignados. ¡Pronto aparecerán aquí!
        </p>
      </div>
    );
  }


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

    <div className="menu-wrapper">

      {/* ================= BOTÓN MÓVIL ================= */}

      {esMovil && (
        <div className="menu-mobile-header">

          <button
            className="menu-toggle-btn"
            onClick={toggleMenu}
          >
            {menuAbierto ? <X size={28} /> : <MenuIcon size={28} />}
          </button>

          <span className="menu-mobile-title">
            Cursos
          </span>

        </div>
      )}


      {/* ================= CONTENIDO ================= */}

      <div className={`menu-content ${esMovil ? (menuAbierto ? "open" : "closed") : ""}`}>

        <div className="menu-header">

          <h2 className="menu-title">
            Continúa tu aprendizaje
          </h2>

          <p className="menu-subtitle">
            Selecciona un curso para retomar tus lecciones.
          </p>

        </div>


        <div className="menu-grid">

          {cursos.map((item) => {

            const cursoId = item.id || item.cursoId;

            const completado = estaCompletado(cursoId);

            return (

              <div
                key={cursoId}
                className={`menu-card ${completado ? "is-completed" : ""}`}
                onClick={() => irACurso(cursoId)}
              >

                <div className="card-image-container">

                  {item.imagenURL ? (

                    <img
                      src={item.imagenURL}
                      alt={item.nombre}
                      className="card-img"
                    />

                  ) : (

                    <div className="card-placeholder">
                      <BookOpen size={40} />
                    </div>

                  )}


                  {completado && (

                    <div className="card-badge">

                      <CheckCircle size={14} />

                      Completado

                    </div>

                  )}

                </div>


                <div className="card-content">

                  <h3 className="card-title">
                    {item.nombre}
                  </h3>

                  <p className="card-description">

                    {item.descripcion ||
                      "Haz clic para ver los detalles del curso y comenzar a estudiar."}

                  </p>


                  <button className="btn-card-action">

                    {completado
                      ? "Repasar Curso"
                      : "Comenzar ahora"}

                  </button>

                </div>

              </div>

            );

          })}

        </div>

      </div>

    </div>

  );

}
