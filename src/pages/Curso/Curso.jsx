import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { Menu as MenuIcon, X } from "lucide-react"; // Importamos iconos para el toggle

import { db } from "../../firebase/firebaseConfig";
import TopBar from "../../components/TopBar/TopBar";
import { ProgresoContext } from "../../context/ProgresoContext";
import apiYesems from "../../api/apiYesems";
import { notify } from "../../Util/toast";

import "./CursoStyle.css";

export default function Curso() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [curso, setCurso] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [accesos, setAccesos] = useState({});
  const [sidebarAbierto, setSidebarAbierto] = useState(false); // 📱 Estado para móvil

  const {
    progresoGlobal,
    nivelesAprobadosGlobal,
    progresoCursos,
    recargarProgreso,
    loading: progresoLoading,
  } = useContext(ProgresoContext);

  // ... (Efectos y funciones se mantienen exactamente igual hasta el return)

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
        if (progresoCursos.length === 0) await recargarProgreso();
      } catch (error) {
        notify("error", "Error al conectar con la base de datos");
      } finally {
        setCargando(false);
      }
    };
    cargarDatosCurso();
  }, [id, navigate, recargarProgreso, progresoCursos.length]);

  const verificarTodosLosAccesos = useCallback(async (niveles) => {
    const nuevosAccesos = {};
    const promesas = niveles.map(async (nivel) => {
      const num = Number(nivel.numero);
      if (num === 1) { nuevosAccesos[num] = true; return; }
      try {
        const res = await apiYesems.get(`/examen/${id}/nivel/${num}/puede-acceder`);
        nuevosAccesos[num] = res.data.puedeAcceder;
      } catch (error) { nuevosAccesos[num] = false; }
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
          <div className="spinner"></div>
          <p className="cargando">Sincronizando tu progreso...</p>
        </div>
      </>
    );
  }

  const leccionesCompletadas = progresoGlobal[id] || [];
  const nivelesAprobados = nivelesAprobadosGlobal[id] || [];
  const progresoActual = progresoCursos.find((p) => p.cursoId === id);
  const cursoFinalizado = progresoActual?.completado === true;

  return (
    <>
      <TopBar />

      {/* 📱 Botón flotante para abrir el índice en móviles */}
      <button 
        className="toggle-sidebar-btn" 
        onClick={() => setSidebarAbierto(!sidebarAbierto)}
      >
        {sidebarAbierto ? <X size={24} /> : <MenuIcon size={24} />}
        <span>{sidebarAbierto ? "Cerrar Índice" : "Ver Índice"}</span>
      </button>

      <div className={`curso-contenedor-sidebar ${sidebarAbierto ? "sidebar-mobile-open" : ""}`}>
        <aside className={`sidebar ${sidebarAbierto ? "open" : ""}`}>
          <div className="sidebar-header">
            <h3>{curso.nombre}</h3>
          </div>

          <nav className="sidebar-nav">
            {Array.isArray(curso.niveles) &&
              curso.niveles.sort((a,b) => a.numero - b.numero).map((nivel) => {
                const nivelNumero = Number(nivel.numero);
                const idsLeccionesNivel = nivel.lecciones.map((_, idx) => `${id}-n${nivelNumero}-l${idx + 1}`);
                const leccionesCompletadasNivel = idsLeccionesNivel.filter((lid) => leccionesCompletadas.includes(lid));
                const nivelCompletado = leccionesCompletadasNivel.length === idsLeccionesNivel.length && idsLeccionesNivel.length > 0;
                const examenAprobado = nivelesAprobados.includes(nivelNumero);
                const nivelDesbloqueado = accesos[nivelNumero] ?? (nivelNumero === 1);

                return (
                  <div key={nivel.numero} className={`nivel-sidebar ${!nivelDesbloqueado ? "nivel-bloqueado" : ""}`}>
                    <p className="nivel-titulo">
                      Nivel {nivel.numero}: {nivel.titulo}
                    </p>

                    <ul className="lecciones-lista">
                      {nivel.lecciones.map((lecc, index) => {
                        const lid = `${id}-n${nivelNumero}-l${index + 1}`;
                        const estaCompletada = leccionesCompletadas.includes(lid);

                        return (
                          <li key={lid} className={`leccion-item ${estaCompletada ? "completada" : ""}`}>
                            {nivelDesbloqueado ? (
                              <Link 
                                to={`/curso/${id}/nivel/${nivelNumero}/leccion/${index + 1}`} 
                                className="leccion-link"
                                onClick={() => setSidebarAbierto(false)} // Cierra al navegar
                              >
                                <span className="icon">{estaCompletada ? "✅" : "📖"}</span>
                                <span className="text">{lecc.titulo || `Lección ${index + 1}`}</span>
                              </Link>
                            ) : (
                              <span className="leccion-bloqueada">
                                <span className="icon">🔒</span>
                                <span className="text">{lecc.titulo || `Lección ${index + 1}`}</span>
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
          </nav>

          <div className="sidebar-footer">
            {cursoFinalizado && (
              <div className="curso-completado-seccion">
                <p>🎉 ¡Curso completado!</p>
                <button className="btn-finalizar-curso" onClick={() => navigate("/perfil")}>
                  Ver mi Constancia
                </button>
              </div>
            )}
            <button className="btn-regresar-sidebar" onClick={() => navigate("/principal")}>
              ⬅ Volver a Mis Cursos
            </button>
          </div>
        </aside>

        {/* 📱 Overlay para cerrar el sidebar al tocar fuera en móviles */}
        {sidebarAbierto && <div className="sidebar-overlay" onClick={() => setSidebarAbierto(false)}></div>}

        <main className="contenido-curso">
          <header className="contenido-header">
            <h2 className="curso-titulo">{curso.nombre}</h2>
            <div className="status-badge">{cursoFinalizado ? "Graduado" : "En aprendizaje"}</div>
          </header>
          
          <div className="curso-info-card">
            <h3>Sobre este curso</h3>
            <p className="curso-descripcion">
              {curso.descripcion || "Explora el contenido y completa las lecciones para habilitar tu evaluación final."}
            </p>
          </div>

          <div className="indicaciones-ayuda">
            <h4>¿Cómo avanzar?</h4>
            <ul>
              <li>Lee o visualiza cada lección completamente.</li>
              <li>Al finalizar las lecciones de un nivel, se habilitará el examen.</li>
              <li>Aprueba el examen para desbloquear el siguiente nivel.</li>
            </ul>
          </div>
        </main>
      </div>
    </>
  );
}