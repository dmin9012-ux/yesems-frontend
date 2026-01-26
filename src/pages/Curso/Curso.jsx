// /yesems/src/pages/Curso/Curso.jsx
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
  const [accesos, setAccesos] = useState({}); // track de acceso a cada nivel

  const {
    progresoGlobal,
    nivelesAprobadosGlobal,
    progresoCursos,
    recargarProgreso,
    loading,
  } = useContext(ProgresoContext);

  /* ======================================
     🔄 CARGAR CURSO + PROGRESO
     ⚡ Solo cargar progreso si aún no está cargado
  ====================================== */
  useEffect(() => {
    const cargarCurso = async () => {
      setCargando(true);
      try {
        if (progresoCursos.length === 0) {
          await recargarProgreso(); // 🔑 sincroniza progresos solo si no hay
        }

        const ref = doc(db, "cursos", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          console.error("❌ Curso no encontrado");
          return;
        }

        setCurso({ id: snap.id, ...snap.data() });
      } catch (error) {
        console.error("❌ Error cargando curso:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarCurso();
  }, [id, progresoCursos.length, recargarProgreso]);

  /* ======================================
     🔹 FUNCION PARA CONSULTAR ACCESO A NIVEL
  ====================================== */
  const verificarAccesoNivel = async (nivelNumero) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://yesems-backend-production.up.railway.app/api/examen/${id}/nivel/${nivelNumero}/puede-acceder`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setAccesos((prev) => ({ ...prev, [nivelNumero]: data.puedeAcceder }));
    } catch (error) {
      console.error(error);
      setAccesos((prev) => ({ ...prev, [nivelNumero]: false }));
    }
  };

  /* ======================================
     🔄 CONSULTAR ACCESO PARA TODOS LOS NIVELES
     ⚡ Solo si hay niveles y progreso cargado
  ====================================== */
  useEffect(() => {
    if (!curso?.niveles || progresoCursos.length === 0) return;
    curso.niveles.forEach((nivel) => {
      verificarAccesoNivel(Number(nivel.numero));
    });
  }, [curso, progresoCursos.length]);

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

              const idsLeccionesNivel = nivel.lecciones.map(
                (_, idx) => id + "-n" + nivelNumero + "-l" + (idx + 1)
              );

              const leccionesCompletadasNivel = idsLeccionesNivel.filter((lid) =>
                leccionesCompletadas.includes(lid)
              );

              const nivelCompletado =
                leccionesCompletadasNivel.length === idsLeccionesNivel.length;

              const examenAprobado = nivelesAprobados.includes(nivelNumero);

              // 🔹 Primer nivel desbloqueado por defecto
              // 🔹 Niveles siguientes desbloqueados si examen del nivel anterior aprobado
              const nivelDesbloqueado =
                accesos[nivelNumero] ?? (nivelNumero === 1 || nivelesAprobados.includes(nivelNumero - 1));

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
                    {nivel.lecciones.map((leccion, index) => {
                      const lid = id + "-n" + nivelNumero + "-l" + (index + 1);
                      const estaCompletada = leccionesCompletadas.includes(lid);

                      return (
                        <li
                          key={lid}
                          className={estaCompletada ? "completada" : ""}
                        >
                          {nivelDesbloqueado ? (
                            <Link
                              to={`/curso/${id}/nivel/${nivelNumero}/leccion/${
                                index + 1
                              }`}
                              className="leccion-link"
                            >
                              {leccion.titulo}
                            </Link>
                          ) : (
                            <span className="leccion-bloqueada">
                              🔒 {leccion.titulo}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  {/* 📝 BOTÓN EXAMEN */}
                  {nivelDesbloqueado && nivelCompletado && !examenAprobado && (
                    <button
                      className="btn-examen-sidebar"
                      onClick={() =>
                        navigate(`/curso/${id}/nivel/${nivelNumero}/examen`)
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

          {/* 🎓 BOTÓN FINALIZAR CURSO */}
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
