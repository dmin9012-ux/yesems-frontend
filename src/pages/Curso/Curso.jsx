import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import TopBar from "../../components/TopBar/TopBar";
import { ProgresoContext } from "../../context/ProgresoContext";
import apiYesems from "../../api/apiYesems";
import { notify } from "../../Util/toast";
import { 
  BookOpen, 
  Lock, 
  CheckCircle2, 
  ArrowLeft, 
  FileText, 
  Trophy,
  Menu as MenuIcon,
  X 
} from "lucide-react";

import "./CursoStyle.css";

export default function Curso() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [curso, setCurso] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [accesos, setAccesos] = useState({});
  const [menuAbierto, setMenuAbierto] = useState(false);

  const {
    progresoGlobal,
    nivelesAprobadosGlobal,
    progresoCursos,
    recargarProgreso,
    loading: progresoLoading,
  } = useContext(ProgresoContext);

  // ... (Efectos de carga y lógica de accesos se mantienen igual)
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
      } finally { setCargando(false); }
    };
    cargarDatosCurso();
  }, [id, navigate, recargarProgreso]);

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
      <div className="curso-loading-screen">
        <div className="spinner-main"></div>
        <p>Sincronizando tu aula virtual...</p>
      </div>
    );
  }

  const leccionesCompletadas = progresoGlobal[id] || [];
  const nivelesAprobados = nivelesAprobadosGlobal[id] || [];
  const cursoFinalizado = progresoCursos.find((p) => p.cursoId === id)?.completado === true;

  return (
    <div className="curso-layout">
      <TopBar />

      {/* Botón flotante para móvil */}
      <button 
        className={`floating-menu-btn ${menuAbierto ? 'is-active' : ''}`} 
        onClick={() => setMenuAbierto(!menuAbierto)}
      >
        {menuAbierto ? <X size={24} /> : <MenuIcon size={24} />}
      </button>

      <div className="curso-container">
        {/* Sidebar */}
        <aside className={`curso-sidebar ${menuAbierto ? "is-open" : ""}`}>
          <div className="sidebar-course-info">
            <h3>{curso.nombre}</h3>
            <div className="progress-mini-bar"></div>
          </div>

          <nav className="sidebar-navigation">
            {curso.niveles?.sort((a,b) => a.numero - b.numero).map((nivel) => {
              const nNum = Number(nivel.numero);
              const nivelDesbloqueado = accesos[nNum] ?? (nNum === 1);
              const nivelAprobado = nivelesAprobados.includes(nNum);

              return (
                <div key={nNum} className={`sidebar-level ${!nivelDesbloqueado ? "is-locked" : ""}`}>
                  <header className="level-header">
                    <span>Nivel {nNum}</span>
                    {!nivelDesbloqueado && <Lock size={14} />}
                  </header>

                  <ul className="lesson-list">
                    {nivel.lecciones.map((lecc, idx) => {
                      const lid = `${id}-n${nNum}-l${idx + 1}`;
                      const completada = leccionesCompletadas.includes(lid);

                      return (
                        <li key={lid} className={`lesson-item ${completada ? "is-done" : ""}`}>
                          {nivelDesbloqueado ? (
                            <Link 
                              to={`/curso/${id}/nivel/${nNum}/leccion/${idx + 1}`}
                              onClick={() => setMenuAbierto(false)}
                            >
                              {completada ? <CheckCircle2 size={16} className="icon-done" /> : <BookOpen size={16} />}
                              <span>{lecc.titulo || `Lección ${idx + 1}`}</span>
                            </Link>
                          ) : (
                            <div className="lesson-disabled">
                              <Lock size={16} />
                              <span>{lecc.titulo || `Lección ${idx + 1}`}</span>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  {nivelDesbloqueado && !nivelAprobado && (
                    <button 
                      className="btn-go-exam"
                      onClick={() => navigate(`/curso/${id}/nivel/${nNum}/examen`)}
                    >
                      <FileText size={16} /> Dar Examen
                    </button>
                  )}
                </div>
              );
            })}
          </nav>

          <footer className="sidebar-footer">
            <button className="btn-back-main" onClick={() => navigate("/principal")}>
              <ArrowLeft size={18} /> Panel General
            </button>
          </footer>
        </aside>

        {/* Área de contenido */}
        <main className="curso-main-content">
          <section className="welcome-card">
            <div className="welcome-text">
              <span className="badge-status">{cursoFinalizado ? "Completado" : "En curso"}</span>
              <h1>{curso.nombre}</h1>
              <p>{curso.descripcion || "Bienvenido a este módulo de aprendizaje profesional."}</p>
            </div>
            {cursoFinalizado && (
               <div className="congrats-banner">
                 <Trophy size={40} color="#fcb424" />
                 <div>
                   <h4>¡Felicidades!</h4>
                   <p>Has concluido este curso con éxito.</p>
                 </div>
               </div>
            )}
          </section>

          <section className="learning-guide">
            <h3>Tu ruta de aprendizaje</h3>
            <div className="guide-steps">
              <div className="step">
                <div className="step-num">1</div>
                <p>Completa todas las lecciones del nivel actual.</p>
              </div>
              <div className="step">
                <div className="step-num">2</div>
                <p>Presenta el examen del nivel para validar tus conocimientos.</p>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <p>Desbloquea automáticamente el siguiente nivel hasta graduarte.</p>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Overlay para cerrar en móvil */}
      {menuAbierto && <div className="sidebar-overlay" onClick={() => setMenuAbierto(false)}></div>}
    </div>
  );
}