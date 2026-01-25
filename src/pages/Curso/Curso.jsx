import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";
import TopBar from "../../components/TopBar/TopBar";
import { ProgresoContext } from "../../context/ProgresoContext";

import "./CursoStyle.css";

export default function Curso() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [curso, setCurso] = useState(null);
  const [cargando, setCargando] = useState(true);

  const {
    progresoGlobal,
    nivelesAprobadosGlobal,
    progresoCursos,
    recargarProgreso,
    loading,
  } = useContext(ProgresoContext);

  /* ======================================
     🔄 CARGAR CURSO + RECARGAR PROGRESO
  ====================================== */
  useEffect(() => {
    const cargarCurso = async () => {
      try {
        await recargarProgreso(); // 🔑 SINCRONIZA DESPUÉS DEL EXAMEN

        const ref = doc(db, "cursos", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          console.error("❌ Curso no encontrado");
          return;
        }

        setCurso(snap.data());
      } catch (error) {
        console.error("❌ Error cargando curso:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarCurso();
  }, [id]);

  if (cargando || loading || !curso) {
    return (
      <>
        <TopBar />
        <p className="cargando">Cargando curso...</p>
      </>
    );
  }

  /* ======================================
     📊 PROGRESO DESDE BACKEND
  ====================================== */

  const leccionesCompletadas = progresoGlobal[id] || [];
  const nivelesAprobados = nivelesAprobadosGlobal[id] || [];

  const progresoCurso = progresoCursos.find((p) => p.cursoId === id);
  const cursoFinalizado = progresoCurso?.completado === true;

  return (
    <>
      <TopBar />

      <div className="curso-contenedor-sidebar">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <h3>{curso.nombre}</h3>

          {Array.isArray(curso.niveles) &&
            curso.niveles.map((nivel) => {
              const nivelNumero = Number(nivel.numero);

              const nivelDesbloqueado =
                nivelNumero === 1 ||
                nivelesAprobados.includes(nivelNumero - 1);

              const idsLeccionesNivel = nivel.lecciones.map((l) => l.id);

              const leccionesCompletadasNivel = idsLeccionesNivel.filter(
                (lid) => leccionesCompletadas.includes(lid)
              );

              const nivelCompletado =
                leccionesCompletadasNivel.length === idsLeccionesNivel.length;

              const examenAprobado =
                nivelesAprobados.includes(nivelNumero);

              return (
                <div
                  key={nivel.numero}
                  className={`nivel-sidebar ${
                    !nivelDesbloqueado ? "nivel-bloqueado" : ""
                  }`}
                >
                  <p>
                    Nivel {nivel.numero}: {nivel.titulo}
                  </p>

                  <ul>
                    {nivel.lecciones.map((lec) => {
                      const estaCompletada =
                        leccionesCompletadas.includes(lec.id);

                      return (
                        <li
                          key={lec.id}
                          className={estaCompletada ? "completada" : ""}
                        >
                          {nivelDesbloqueado ? (
                            <Link
                              to={`/curso/${id}/nivel/${nivel.numero}/leccion/${lec.id}`}
                              className="leccion-link"
                            >
                              {lec.titulo}
                            </Link>
                          ) : (
                            <span className="leccion-bloqueada">
                              🔒 {lec.titulo}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  {/* 📝 EXAMEN */}
                  {nivelDesbloqueado &&
                    nivelCompletado &&
                    !examenAprobado && (
                      <button
                        className="btn-examen-sidebar"
                        onClick={() =>
                          navigate(
                            `/curso/${id}/nivel/${nivel.numero}/examen`
                          )
                        }
                      >
                        📝 Presentar examen
                      </button>
                    )}

                  {examenAprobado && (
                    <p className="nivel-aprobado">✅ Nivel aprobado</p>
                  )}
                </div>
              );
            })}

          {/* 🎓 FINALIZAR CURSO */}
          {cursoFinalizado && (
            <button
              className="btn-finalizar-curso"
              onClick={() => navigate("/perfil")}
            >
              🎓 Finalizar curso
            </button>
          )}

          <button
            className="btn-regresar-sidebar"
            onClick={() => navigate("/principal")}
          >
            ⬅ Regresar
          </button>
        </aside>

        {/* MAIN */}
        <main className="contenido">
          <h2 className="curso-titulo">{curso.nombre}</h2>
          <p className="curso-descripcion">
            {curso.descripcion || "No hay descripción disponible"}
          </p>
        </main>
      </div>
    </>
  );
}
