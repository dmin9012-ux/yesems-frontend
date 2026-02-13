import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { doc, getDoc } from "firebase/firestore";
import { Menu as MenuIcon, X, FileText, Download, ExternalLink, Paperclip, ChevronLeft, ChevronRight } from "lucide-react";

import { db } from "../../firebase/firebaseConfig";
import TopBar from "../../components/TopBar/TopBar";
import { validarLeccion } from "../../servicios/progresoService";
import { ProgresoContext } from "../../context/ProgresoContext";
import { notify } from "../../Util/toast"; 

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
  const [previewPDF, setPreviewPDF] = useState(null);
  const [sidebarAbierto, setSidebarAbierto] = useState(false); // 📱 Control móvil

  const { progresoGlobal, nivelesAprobadosGlobal, actualizarProgreso } = useContext(ProgresoContext);
  const leccionId = `${id}-n${nivelNum}-l${numLeccion}`;

  // ... (Efectos de carga y lógica de guardado se mantienen igual que tu código original)
  useEffect(() => {
    const cargarLeccion = async () => {
      setCargando(true);
      try {
        const ref = doc(db, "cursos", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) { notify("error", "Curso no encontrado"); navigate("/principal"); return; }
        const data = snap.data();
        const nivelData = data.niveles?.find((n) => Number(n.numero) === nivelNum);
        if (!nivelData) { navigate(`/curso/${id}`); return; }
        const leccionData = nivelData.lecciones?.[numLeccion - 1];
        if (!leccionData) return;

        setCurso({ id: snap.id, ...data });
        setLeccionActual({
          id: leccionId,
          titulo: leccionData.titulo,
          videoURL: leccionData.videoURL || "",
          contenidoHTML: leccionData.contenidoHTML || "",
          materiales: leccionData.materiales || [],
          nivelTitulo: nivelData.titulo,
        });
        setEsUltimaLeccion(numLeccion === nivelData.lecciones.length);
      } catch (err) { notify("error", "Error de conexión"); }
      finally { setCargando(false); }
    };
    cargarLeccion();
  }, [id, nivelNum, numLeccion, leccionId, navigate]);

  const guardarProgresoReal = async () => {
    const progresoCursoActual = progresoGlobal[id] || [];
    if (progresoCursoActual.includes(leccionId)) return true;
    setGuardando(true);
    try {
      const res = await validarLeccion({ cursoId: id, leccionId });
      if (res?.ok) { actualizarProgreso(id, leccionId); return true; }
      return false;
    } catch (err) { return false; }
    finally { setGuardando(false); }
  };

  const navegarSiguiente = async () => {
    const ok = await guardarProgresoReal();
    if (!ok) return;
    const nivelData = curso.niveles.find((nv) => Number(nv.numero) === nivelNum);
    if (numLeccion >= (nivelData?.lecciones.length || 0)) {
      navigate(`/curso/${id}/nivel/${nivelNum}/examen`);
    } else {
      navigate(`/curso/${id}/nivel/${nivelNum}/leccion/${numLeccion + 1}`);
    }
  };

  if (cargando) return (
    <><TopBar /><div className="loader-full"><div className="spinner"></div><p>Cargando lección...</p></div></>
  );

  const progresoActual = progresoGlobal[id] || [];
  const nivelesAprobados = nivelesAprobadosGlobal[id] || [];
  const nivelData = curso.niveles.find((n) => Number(n.numero) === nivelNum);
  const totalLeccionesNivel = nivelData?.lecciones.length || 0;

  return (
    <>
      <TopBar />
      
      {/* 📱 Botón flotante para abrir el índice en móviles */}
      <button className="toggle-lecciones-btn" onClick={() => setSidebarAbierto(!sidebarAbierto)}>
        {sidebarAbierto ? <X size={20} /> : <MenuIcon size={20} />}
        <span>Contenido</span>
      </button>

      <div className="leccion-contenedor-sidebar">
        <aside className={`sidebar ${sidebarAbierto ? "open" : ""}`}>
          <div className="sidebar-header">
            <h3>{curso.nombre}</h3>
          </div>
          <nav className="sidebar-nav">
            {curso.niveles.map((nivelItem) => {
              const nNum = Number(nivelItem.numero);
              const desbloqueado = nNum === 1 || nivelesAprobados.includes(nNum - 1);
              return (
                <div key={nNum} className={`nivel-sidebar ${!desbloqueado ? "nivel-bloqueado" : ""}`}>
                  <p className="nivel-titulo">Nivel {nNum}: {nivelItem.titulo}</p>
                  <ul className="lecciones-lista">
                    {nivelItem.lecciones.map((lecc, idx) => {
                      const lid = `${id}-n${nNum}-l${idx + 1}`;
                      const esActual = nNum === nivelNum && (idx + 1) === numLeccion;
                      const completada = progresoActual.includes(lid);
                      return (
                        <li key={lid} className={`leccion-item ${esActual ? "active " : ""}${completada ? "completada" : ""}`}>
                          {desbloqueado ? (
                            <Link 
                                to={`/curso/${id}/nivel/${nNum}/leccion/${idx + 1}`} 
                                className="leccion-link"
                                onClick={() => setSidebarAbierto(false)}
                            >
                              <span className="icon">{completada ? "✅" : "📖"}</span>
                              <span className="text">{lecc.titulo || `Lección ${idx + 1}`}</span>
                            </Link>
                          ) : (
                            <span className="leccion-bloqueada">
                              <span className="icon">🔒</span>
                              <span className="text">{lecc.titulo || `Lección ${idx + 1}`}</span>
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>
        </aside>

        {sidebarAbierto && <div className="sidebar-overlay" onClick={() => setSidebarAbierto(false)}></div>}

        <main className="contenido-leccion">
          <div className="header-leccion">
            <span className="badge-nivel">Nivel {nivelNum}</span>
            <span className="progreso-texto">Lección {numLeccion} de {totalLeccionesNivel}</span>
          </div>
          
          <h1 className="leccion-titulo">{leccionActual.titulo}</h1>

          <div className="video-wrapper">
            {leccionActual.videoURL ? (
               <iframe 
                src={leccionActual.videoURL} 
                title="Video lección" 
                allowFullScreen 
                className="video-iframe"
               />
            ) : <div className="no-video">Material no disponible</div>}
          </div>

          {leccionActual.contenidoHTML && (
            <div className="contenido-html-rich" dangerouslySetInnerHTML={{ __html: leccionActual.contenidoHTML }} />
          )}

          {leccionActual.materiales?.length > 0 && (
            <div className="seccion-recursos">
              <h3 className="recursos-titulo"><Paperclip size={20} /> Recursos adicionales</h3>
              <div className="grid-materiales">
                {leccionActual.materiales.map((mat) => (
                  <div key={mat.id} className="material-card-estudiante">
                    <div className="material-info">
                      <FileText size={24} className="icon-pdf" />
                      <div>
                        <p className="material-nombre">{mat.titulo}</p>
                        <p className="material-tipo">PDF</p>
                      </div>
                    </div>
                    <div className="material-acciones">
                      {mat.urlPreview && (
                        <button className="btn-preview" onClick={() => setPreviewPDF(previewPDF === mat.urlPreview ? null : mat.urlPreview)}>
                          <ExternalLink size={16} /> {previewPDF === mat.urlPreview ? "Cerrar" : "Ver"}
                        </button>
                      )}
                      <a href={mat.urlDownload} target="_blank" rel="noopener noreferrer" className="btn-download">
                        <Download size={16} /> Descargar
                      </a>
                    </div>
                    {previewPDF === mat.urlPreview && (
                      <div className="pdf-embed-container">
                        <iframe src={mat.urlPreview} width="100%" height="500px" title="PDF"></iframe>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="navegacion-footer">
            <button onClick={() => navigate(-1)} className="btn-secundario">
              <ChevronLeft size={20} /> <span className="btn-text">Anterior</span>
            </button>
            
            <button onClick={esUltimaLeccion ? () => navigate(`/curso/${id}/nivel/${nivelNum}/examen`) : navegarSiguiente} className="btn-primario" disabled={guardando}>
              <span className="btn-text">{esUltimaLeccion ? "Ir al Examen" : "Siguiente"}</span> <ChevronRight size={20} />
            </button>
          </div>
        </main>
      </div>
    </>
  );
}