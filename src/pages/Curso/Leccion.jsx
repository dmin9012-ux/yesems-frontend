import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import TopBar from "../../components/TopBar/TopBar";
import { validarLeccion } from "../../servicios/progresoService";
import { ProgresoContext } from "../../context/ProgresoContext";
import { notify } from "../../Util/toast"; 
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Paperclip, 
  Menu, 
  X, 
  ChevronRight, 
  ChevronLeft,
  PlayCircle
} from "lucide-react";

import "./LeccionStyle.css";

export default function Leccion() {
  const { id, nivel, num } = useParams();
  const navigate = useNavigate();
  const nivelNum = Number(nivel);
  const numLeccion = Number(num);

  const [curso, setCurso] = useState(null);
  const [leccionActual, setLeccionActual] = useState(null);
  const [esUltimaLeccion, setEsUltimaLeccion] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [previewPDF, setPreviewPDF] = useState(null);

  const { progresoGlobal, nivelesAprobadosGlobal, actualizarProgreso } = useContext(ProgresoContext);
  const leccionId = `${id}-n${nivelNum}-l${numLeccion}`;

  useEffect(() => {
    const cargarLeccion = async () => {
      setCargando(true);
      try {
        const ref = doc(db, "cursos", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          notify("error", "Curso no encontrado");
          navigate("/principal");
          return;
        }

        const data = snap.data();
        const nivelData = data.niveles?.find((n) => Number(n.numero) === nivelNum);
        const leccionData = nivelData?.lecciones?.[numLeccion - 1];

        if (!leccionData) {
          notify("error", "Contenido no disponible");
          navigate(`/curso/${id}`);
          return;
        }

        setCurso({ id: snap.id, ...data });
        setLeccionActual({
          id: leccionId,
          ...leccionData,
          nivelTitulo: nivelData.titulo,
        });
        setEsUltimaLeccion(numLeccion === nivelData.lecciones.length);
      } catch (err) {
        notify("error", "Error de conexión");
      } finally { setCargando(false); }
    };

    cargarLeccion();
    setMenuAbierto(false);
    window.scrollTo(0, 0); // Reset scroll al cambiar lección
  }, [id, nivelNum, numLeccion, leccionId, navigate]);

  const finalizarPaso = async () => {
    const yaCompletada = (progresoGlobal[id] || []).includes(leccionId);
    if (yaCompletada) return true;

    setGuardando(true);
    try {
      const res = await validarLeccion({ cursoId: id, leccionId });
      if (res?.ok) {
        actualizarProgreso(id, leccionId);
        return true;
      }
      return false;
    } catch (err) { return false;
    } finally { setGuardando(false); }
  };

  const manejarNavegacion = async (direccion) => {
    if (direccion === "sig") {
      const ok = await finalizarPaso();
      if (!ok && !(progresoGlobal[id] || []).includes(leccionId)) {
        notify("error", "No pudimos guardar tu progreso");
        return;
      }
      if (esUltimaLeccion) navigate(`/curso/${id}/nivel/${nivelNum}/examen`);
      else navigate(`/curso/${id}/nivel/${nivelNum}/leccion/${numLeccion + 1}`);
    } else {
      navigate(-1);
    }
  };

  if (cargando || !leccionActual) return <div className="loading-state">Cargando lección...</div>;

  return (
    <div className="leccion-page">
      <TopBar />
      
      {/* Botón flotante lateral para móvil */}
      <button className="mobile-sidebar-trigger" onClick={() => setMenuAbierto(!menuAbierto)}>
        {menuAbierto ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="leccion-layout">
        <aside className={`leccion-sidebar ${menuAbierto ? "is-active" : ""}`}>
          <div className="sidebar-content">
            <h4 className="sidebar-course-name">{curso.nombre}</h4>
            <div className="sidebar-divider"></div>
            {curso.niveles.map((n) => (
              <div key={n.numero} className="sidebar-section">
                <p className="sidebar-level-label">Nivel {n.numero}</p>
                <ul className="sidebar-list">
                  {n.lecciones.map((l, i) => {
                    const lKey = `${id}-n${n.numero}-l${i + 1}`;
                    const isCurrent = n.numero === nivelNum && (i + 1) === numLeccion;
                    return (
                      <li key={lKey} className={`sidebar-item ${isCurrent ? "is-current" : ""}`}>
                        <Link to={`/curso/${id}/nivel/${n.numero}/leccion/${i + 1}`}>
                          {l.titulo || `Lección ${i + 1}`}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        <main className="leccion-main">
          <header className="leccion-header">
            <nav className="breadcrumb">
               <span>Nivel {nivelNum}</span> <ChevronRight size={14} /> <span>Lección {numLeccion}</span>
            </nav>
            <h1 className="leccion-title-text">{leccionActual.titulo}</h1>
          </header>

          <section className="leccion-video-container">
            {leccionActual.videoURL ? (
               <div className="video-responsive-box">
                 <iframe 
                   src={leccionActual.videoURL} 
                   allowFullScreen 
                   title="Video Player"
                 />
               </div>
            ) : (
              <div className="video-placeholder">
                <PlayCircle size={48} />
                <p>Contenido teórico</p>
              </div>
            )}
          </section>

          <article className="leccion-body-content">
            <div 
              className="rich-text-container" 
              dangerouslySetInnerHTML={{ __html: leccionActual.contenidoHTML }} 
            />
          </article>

          {leccionActual.materiales?.length > 0 && (
            <section className="leccion-resources">
              <h3 className="resources-heading"><Paperclip size={20} /> Material complementario</h3>
              <div className="resources-grid">
                {leccionActual.materiales.map((mat) => (
                  <div key={mat.id} className="resource-card">
                    <div className="resource-info">
                      <FileText className="pdf-icon" />
                      <div>
                        <strong>{mat.titulo}</strong>
                        <span>Documento PDF</span>
                      </div>
                    </div>
                    <div className="resource-actions">
                      <a href={mat.urlDownload} target="_blank" rel="noreferrer" className="action-download">
                        <Download size={16} /> Descargar
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <footer className="leccion-navigation">
            <button className="nav-btn btn-prev" onClick={() => manejarNavegacion("prev")}>
              <ChevronLeft size={20} /> Anterior
            </button>
            <button className="nav-btn btn-next" onClick={() => manejarNavegacion("sig")} disabled={guardando}>
              {guardando ? "Guardando..." : esUltimaLeccion ? "Ir al Examen" : "Siguiente"}
              {!guardando && <ChevronRight size={20} />}
            </button>
          </footer>
        </main>
      </div>
      {menuAbierto && <div className="sidebar-mask" onClick={() => setMenuAbierto(false)}></div>}
    </div>
  );
}