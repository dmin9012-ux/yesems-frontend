import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";
import TopBar from "../../components/TopBar/TopBar";
import { ProgresoContext } from "../../context/ProgresoContext";
import apiYesems from "../../api/apiYesems"; // Usamos tu instancia de Axios configurada

import "./CursoStyle.css";

export default function Curso() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [curso, setCurso] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [accesos, setAccesos] = useState({});

  const {
    progresoGlobal,
    nivelesAprobadosGlobal,
    progresoCursos,
    recargarProgreso,
    loading: progresoLoading,
  } = useContext(ProgresoContext);

  /* ======================================
      🔄 CARGAR CURSO
  ====================================== */
  useEffect(() => {
    const cargarDatosCurso = async () => {
      setCargando(true);
      try {
        // Cargar el curso desde Firestore
        const ref = doc(db, "cursos", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          console.error("❌ Curso no encontrado");
          navigate("/principal");
          return;
        }

        setCurso({ id: snap.id, ...snap.data() });

        // Sincronizar progreso si el contexto está vacío
        if (progresoCursos.length === 0) {
          await recargarProgreso();
        }
      } catch (error) {
        console.error("❌ Error cargando curso:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatosCurso();
  }, [id, recargarProgreso]); // Eliminamos progresoCursos.length de aquí para evitar bucles

  /* ======================================
      🔹 VERIFICAR ACCESOS (Optimizado)
  ====================================== */
  const verificarTodosLosAccesos = useCallback(async (niveles) => {
    const nuevosAccesos = {};
    
    // Ejecutamos las verificaciones en paralelo para mayor velocidad
    const promesas = niveles.map(async (nivel) => {
      const num = Number(nivel.numero);
      if (num === 1) {
        nuevosAccesos[num] = true;
        return;
      }
      try {
        const res = await apiYesems.get(`/examen/${id}/nivel/${num}/puede-acceder`);
        nuevosAccesos[num] = res.data.puedeAcceder;
      } catch (error) {
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

  if (cargando || progresoLoading || !curso) {
    return (
      <>
        <TopBar />
        <div className="cargando-container">
          <p className="cargando">Cargando contenido del curso...</p>
        </div>
      </>
    );
  }

  /* ======================================
      📊 DATOS DE PROGRESO
  ====================================== */
  const leccionesCompletadas = progresoGlobal[id] || [];
  const nivelesAprobados = nivelesAprobadosGlobal[id] || [];
  const progresoActual = progresoCursos.find((p) => p.cursoId === id);
  const cursoFinalizado = progresoActual?.completado === true;

  return (
    <>
      <TopBar />

      <div className="curso-contenedor-sidebar">
        <aside className="sidebar">
          <h3>{curso.nombre}</h3>

          {Array.isArray(curso.niveles) &&
            curso.niveles.sort((a,b) => a.numero - b.numero).map((nivel) => {
              const nivelNumero = Number(nivel.numero);

              // Generar IDs de lecciones (Asegúrate de que coincidan con los del backend)
              const idsLeccionesNivel = nivel.lecciones.map(
                (_, idx) => `${id}-n${nivelNumero}-l${idx + 1}`
              );

              const leccionesCompletadasNivel = idsLeccionesNivel.filter((lid) =>
                leccionesCompletadas.includes(lid)
              );

              const nivelCompletado =
                leccionesCompletadasNivel.length === idsLeccionesNivel.length && idsLeccionesNivel.length > 0;

              const examenAprobado = nivelesAprobados.includes(nivelNumero);
              const nivelDesbloqueado = accesos[nivelNumero] ?? (nivelNumero === 1);

              return (
                <div
                  key={nivel.numero}
                  className={`nivel-sidebar ${!nivelDesbloqueado ? "nivel-bloqueado" : ""}`}
                >
                  <p className="nivel-titulo">
                    Nivel {nivel.numero}: {nivel.titulo}
                  </p>

                  <ul>
                    {nivel.lecciones.map((_, index) => {
                      const lid = `${id}-n${nivelNumero}-l${index + 1}`;
                      const estaCompletada = leccionesCompletadas.includes(lid);

                      return (
                        <li key={lid} className={estaCompletada ? "completada" : ""}>
                          {nivelDesbloqueado ? (
                            <Link
                              to={`/curso/${id}/nivel/${nivelNumero}/leccion/${index + 1}`}
                              className="leccion-link"
                            >
                              {estaCompletada ? "✅" : "📖"} Lección {index + 1}
                            </Link>
                          ) : (
                            <span className="leccion-bloqueada">
                              🔒 Lección {index + 1}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  {nivelDesbloqueado && nivelCompletado && !examenAprobado && (
                    <button
                      className="btn-examen-sidebar"
                      onClick={() => navigate(`/curso/${id}/nivel/${nivelNumero}/examen`)}
                    >
                      📝 Realizar Examen
                    </button>
                  )}

                  {examenAprobado && (
                    <p className="nivel-aprobado">⭐ Nivel Superado</p>
                  )}
                </div>
              );
            })}

          {cursoFinalizado && (
            <div className="curso-completado-seccion">
              <p>🎉 ¡Curso terminado!</p>
              <button className="btn-finalizar-curso" onClick={() => navigate("/perfil")}>
                Ver mi Constancia
              </button>
            </div>
          )}

          <button className="btn-regresar-sidebar" onClick={() => navigate("/principal")}>
            ⬅ Mis Cursos
          </button>
        </aside>

        <main className="contenido">
          <h2 className="curso-titulo">{curso.nombre}</h2>
          <div className="curso-info-card">
            <p className="curso-descripcion">
              {curso.descripcion || "Bienvenido a este curso. Completa todas las lecciones de cada nivel para habilitar el examen."}
            </p>
          </div>
          {/* Aquí podrías añadir un gráfico de progreso visual */}
        </main>
      </div>
    </>
  );
}