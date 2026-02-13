import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";
import TopBar from "../../components/TopBar/TopBar";
import { ProgresoContext } from "../../context/ProgresoContext";
import apiYesems from "../../api/apiYesems";
import { notify } from "../../Util/toast";

import { Menu, X } from "lucide-react";

import "./CursoStyle.css";

export default function Curso() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [curso, setCurso] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [accesos, setAccesos] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    progresoGlobal,
    nivelesAprobadosGlobal,
    progresoCursos,
    recargarProgreso,
    loading: progresoLoading,
  } = useContext(ProgresoContext);

  /* ============================
     CARGAR CURSO
  ============================ */

  useEffect(() => {
    const cargarDatosCurso = async () => {
      setCargando(true);

      try {
        const ref = doc(db, "cursos", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          notify("error", "Curso no encontrado");
          navigate("/principal");
          return;
        }

        setCurso({ id: snap.id, ...snap.data() });

        if (progresoCursos.length === 0) {
          await recargarProgreso();
        }

      } catch (error) {
        console.error("Error cargando curso:", error);
        notify("error", "Error al conectar con la base de datos");

      } finally {
        setCargando(false);
      }
    };

    cargarDatosCurso();

  }, [id, navigate, recargarProgreso, progresoCursos.length]);

  /* ============================
     VERIFICAR ACCESOS
  ============================ */

  const verificarTodosLosAccesos = useCallback(async (niveles) => {

    const nuevosAccesos = {};

    const promesas = niveles.map(async (nivel) => {

      const num = Number(nivel.numero);

      if (num === 1) {
        nuevosAccesos[num] = true;
        return;
      }

      try {

        const res = await apiYesems.get(
          `/examen/${id}/nivel/${num}/puede-acceder`
        );

        nuevosAccesos[num] = res.data.puedeAcceder;

      } catch {

        nuevosAccesos[num] = false;
      }

    });

    await Promise.all(promesas);

    setAccesos(nuevosAccesos);

  }, [id]);

  useEffect(() => {

    if (curso?.niveles && !progresoLoading) {

      verificarTodosLosAccesos(curso.niveles);

    }

  }, [curso, progresoLoading, verificarTodosLosAccesos]);

  /* ============================
     LOADING
  ============================ */

  if (cargando || progresoLoading || !curso) {
    return (
      <>
        <TopBar />

        <div className="cargando-container">
          <div className="spinner"></div>
          <p className="cargando">
            Sincronizando tu progreso...
          </p>
        </div>
      </>
    );
  }

  /* ============================
     DATOS
  ============================ */

  const leccionesCompletadas = progresoGlobal[id] || [];

  const nivelesAprobados = nivelesAprobadosGlobal[id] || [];

  const progresoActual =
    progresoCursos.find((p) => p.cursoId === id);

  const cursoFinalizado =
    progresoActual?.completado === true;

  /* ============================
     SIDEBAR CONTROL
  ============================ */

  const toggleSidebar = () => {

    setSidebarOpen(!sidebarOpen);

  };

  const cerrarSidebar = () => {

    setSidebarOpen(false);

  };

  /* ============================
     RENDER
  ============================ */

  return (
    <>
      <TopBar />

      {/* BOTÓN HAMBURGUESA */}
      <button
        className="sidebar-toggle-btn"
        onClick={toggleSidebar}
      >
        {sidebarOpen
          ? <X size={22}/>
          : <Menu size={22}/>}
      </button>

      <div className="curso-contenedor-sidebar">

        {/* OVERLAY MÓVIL */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={cerrarSidebar}
          />
        )}

        {/* SIDEBAR */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>

          <div className="sidebar-header">

            <h3>{curso.nombre}</h3>

          </div>

          <nav className="sidebar-nav">

            {Array.isArray(curso.niveles) &&
              curso.niveles
                .sort((a,b) => a.numero - b.numero)
                .map((nivel) => {

                const nivelNumero =
                  Number(nivel.numero);

                const idsLeccionesNivel =
                  nivel.lecciones.map((_, idx) =>
                    `${id}-n${nivelNumero}-l${idx+1}`
                  );

                const leccionesCompletadasNivel =
                  idsLeccionesNivel.filter((lid)=>
                    leccionesCompletadas.includes(lid)
                  );

                const nivelCompletado =
                  leccionesCompletadasNivel.length ===
                  idsLeccionesNivel.length;

                const examenAprobado =
                  nivelesAprobados.includes(
                    nivelNumero
                  );

                const nivelDesbloqueado =
                  accesos[nivelNumero] ??
                  (nivelNumero === 1);

                return (

                  <div
                    key={nivel.numero}
                    className="nivel-sidebar"
                  >

                    <p className="nivel-titulo">

                      Nivel {nivel.numero}: {nivel.titulo}

                    </p>

                    <ul className="lecciones-lista">

                      {nivel.lecciones.map(
                        (lecc, index) => {

                        const lid =
                          `${id}-n${nivelNumero}-l${index+1}`;

                        const estaCompletada =
                          leccionesCompletadas.includes(lid);

                        return (

                          <li
                            key={lid}
                            className={`leccion-item ${
                              estaCompletada
                              ? "completada"
                              : ""
                            }`}
                          >

                            {nivelDesbloqueado ? (

                              <Link
                                to={`/curso/${id}/nivel/${nivelNumero}/leccion/${index+1}`}
                                className="leccion-link"
                                onClick={cerrarSidebar}
                              >

                                <span>
                                  {estaCompletada
                                    ? "✅"
                                    : "📖"}
                                </span>

                                <span className="text">
                                  {lecc.titulo ||
                                   `Lección ${index+1}`}
                                </span>

                              </Link>

                            ) : (

                              <span className="leccion-bloqueada">

                                🔒 {lecc.titulo}

                              </span>

                            )}

                          </li>

                        );

                      })}

                    </ul>

                    {/* BOTÓN EXAMEN */}

                    {nivelDesbloqueado &&
                     nivelCompletado &&
                     !examenAprobado && (

                      <button
                        className="btn-examen-sidebar"
                        onClick={()=>{
                          cerrarSidebar();
                          navigate(
                           `/curso/${id}/nivel/${nivelNumero}/examen`
                          );
                        }}
                      >

                        📝 Realizar Examen

                      </button>

                    )}

                    {/* APROBADO */}

                    {examenAprobado && (

                      <p className="nivel-aprobado">

                        ⭐ Nivel Superado

                      </p>

                    )}

                  </div>

                );

              })}

          </nav>

          <div className="sidebar-footer">

            {cursoFinalizado && (

              <div>

                🎉 ¡Curso completado!

                <button
                  className="btn-examen-sidebar"
                  onClick={()=>{
                    cerrarSidebar();
                    navigate("/perfil");
                  }}
                >

                  Ver Constancia

                </button>

              </div>

            )}

            <button
              className="btn-regresar-sidebar"
              onClick={()=>{
                cerrarSidebar();
                navigate("/principal");
              }}
            >

              ⬅ Volver

            </button>

          </div>

        </aside>

        {/* CONTENIDO */}

        <main className="contenido-curso">

          <header className="contenido-header">

            <h2 className="curso-titulo">

              {curso.nombre}

            </h2>

            <div className="status-badge">

              {cursoFinalizado
                ? "Graduado"
                : "En aprendizaje"}

            </div>

          </header>

          <div className="curso-info-card">

            <h3>Sobre este curso</h3>

            <p className="curso-descripcion">

              {curso.descripcion ||
               "Explora el contenido del curso."}

            </p>

          </div>

        </main>

      </div>

    </>
  );
}
