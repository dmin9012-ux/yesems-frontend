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
  X
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
  const [previewPDF, setPreviewPDF] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    progresoGlobal,
    nivelesAprobadosGlobal,
    actualizarProgreso
  } = useContext(ProgresoContext);

  const leccionId = `${id}-n${nivelNum}-l${numLeccion}`;

  /* =============================
     CARGAR LECCIÓN
  ============================= */

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

        const nivelData =
          data.niveles?.find(
            (n) => Number(n.numero) === nivelNum
          );

        if (!nivelData) {

          notify("error", "Nivel no encontrado");
          navigate(`/curso/${id}`);
          return;
        }

        const leccionData =
          nivelData.lecciones?.[numLeccion - 1];

        if (!leccionData) {

          notify("error", "Lección no encontrada");
          return;
        }

        setCurso({ id: snap.id, ...data });

        setLeccionActual({
          id: leccionId,
          titulo: leccionData.titulo,
          videoURL: leccionData.videoURL || "",
          contenidoHTML: leccionData.contenidoHTML || "",
          materiales: leccionData.materiales || [],
          nivelTitulo: nivelData.titulo,
        });

        setEsUltimaLeccion(
          numLeccion === nivelData.lecciones.length
        );

      } catch (err) {

        notify("error", "Error de conexión");

      } finally {

        setCargando(false);
      }
    };

    cargarLeccion();

  }, [id, nivelNum, numLeccion, navigate, leccionId]);

  /* =============================
     PROGRESO
  ============================= */

  const guardarProgresoReal = async () => {

    const progresoCursoActual =
      progresoGlobal[id] || [];

    if (progresoCursoActual.includes(leccionId))
      return true;

    setGuardando(true);

    try {

      const res =
        await validarLeccion({
          cursoId: id,
          leccionId
        });

      if (res?.ok) {

        actualizarProgreso(id, leccionId);

        notify("success", "Progreso guardado ✨");

        return true;

      } else {

        notify("error", res.message);

        return false;
      }

    } catch {

      notify("error", "Error al guardar progreso");

      return false;

    } finally {

      setGuardando(false);
    }
  };

  const navegarSiguiente = async () => {

    const ok = await guardarProgresoReal();

    if (!ok) return;

    const nivelData =
      curso.niveles.find(
        (nv) => Number(nv.numero) === nivelNum
      );

    if (numLeccion >=
        (nivelData?.lecciones.length || 0)) {

      navigate(
        `/curso/${id}/nivel/${nivelNum}/examen`
      );

    } else {

      navigate(
        `/curso/${id}/nivel/${nivelNum}/leccion/${numLeccion + 1}`
      );
    }
  };

  const irAExamenNivel = async () => {

    const ok = await guardarProgresoReal();

    if (ok)
      navigate(
        `/curso/${id}/nivel/${nivelNum}/examen`
      );
  };

  /* =============================
     LOADING
  ============================= */

  if (cargando) {

    return (
      <>
        <TopBar />

        <div className="loader-full">
          <div className="spinner"></div>
          <p>Preparando lección...</p>
        </div>
      </>
    );
  }

  const progresoActual = progresoGlobal[id] || [];
  const nivelesAprobados = nivelesAprobadosGlobal[id] || [];

  /* =============================
     SIDEBAR CONTROL
  ============================= */

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const cerrarSidebar = () => {
    setSidebarOpen(false);
  };

  /* =============================
     RENDER
  ============================= */

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

      <div className="leccion-contenedor-sidebar">

        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={cerrarSidebar}
          />
        )}

        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>

          <div className="sidebar-header">
            <h3>{curso.nombre}</h3>
          </div>

          <nav className="sidebar-nav">

            {curso.niveles.map((nivelItem) => {

              const nNum = Number(nivelItem.numero);

              const desbloqueado =
                nNum === 1 ||
                nivelesAprobados.includes(nNum - 1);

              return (

                <div
                  key={nNum}
                  className="nivel-sidebar"
                >

                  <p className="nivel-titulo">
                    Nivel {nNum}: {nivelItem.titulo}
                  </p>

                  <ul className="lecciones-lista">

                    {nivelItem.lecciones.map(
                      (lecc, idx) => {

                      const lid =
                        `${id}-n${nNum}-l${idx+1}`;

                      const esActual =
                        nNum === nivelNum &&
                        (idx+1) === numLeccion;

                      const completada =
                        progresoActual.includes(lid);

                      return (

                        <li
                          key={lid}
                          className={`leccion-item ${
                            esActual ? "active " : ""
                          }${completada
                            ? "completada"
                            : ""}`}
                        >

                          {desbloqueado ? (

                            <Link
                              to={`/curso/${id}/nivel/${nNum}/leccion/${idx+1}`}
                              className="leccion-link"
                              onClick={cerrarSidebar}
                            >

                              <span>
                                {completada
                                  ? "✅"
                                  : "📖"}
                              </span>

                              <span className="text">
                                {lecc.titulo}
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

                </div>
              );
            })}

          </nav>
        </aside>

        {/* CONTENIDO */}
        <main className="contenido-leccion">

          <div className="header-leccion">
            <span className="badge-nivel">
              Nivel {nivelNum}
            </span>
          </div>

          <h1 className="leccion-titulo">
            {leccionActual.titulo}
          </h1>

          {/* VIDEO */}
          <div className="video-wrapper">
            {leccionActual.videoURL ? (
              <iframe
                src={leccionActual.videoURL}
                title="Video lección"
                allowFullScreen
                className="video-iframe"
              />
            ) : (
              <div className="no-video">
                Material audiovisual no disponible.
              </div>
            )}
          </div>

          {/* CONTENIDO */}
          {leccionActual.contenidoHTML && (
            <div
              className="contenido-html-rich"
              dangerouslySetInnerHTML={{
                __html:
                  leccionActual.contenidoHTML
              }}
            />
          )}

          {/* MATERIALES */}
          {leccionActual.materiales.length > 0 && (
            <div className="seccion-recursos">

              <h3 className="recursos-titulo">
                <Paperclip size={18}/>
                Recursos
              </h3>

              {leccionActual.materiales.map(
                (mat) => (

                <div
                  key={mat.id}
                  className="material-card-estudiante"
                >

                  <FileText size={20}/>

                  <p>
                    {mat.titulo ||
                     "Documento PDF"}
                  </p>

                  <div className="material-acciones">

                    {mat.urlPreview && (
                      <button
                        className="btn-preview"
                        onClick={() =>
                          setPreviewPDF(
                            previewPDF === mat.urlPreview
                            ? null
                            : mat.urlPreview
                          )
                        }
                      >
                        <ExternalLink size={16}/>
                        Ver
                      </button>
                    )}

                    <a
                      href={mat.urlDownload}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-download"
                    >
                      <Download size={16}/>
                      Descargar
                    </a>

                  </div>

                </div>
              ))}

            </div>
          )}

          {/* NAVEGACIÓN */}
          <div className="navegacion-footer">

            <button
              onClick={() => navigate(-1)}
              className="btn-secundario"
            >
              ⬅ Anterior
            </button>

            {esUltimaLeccion ? (

              <button
                onClick={irAExamenNivel}
                className="btn-primario"
                disabled={guardando}
              >
                {guardando
                  ? "Guardando..."
                  : "Realizar Examen 📝"}
              </button>

            ) : (

              <button
                onClick={navegarSiguiente}
                className="btn-primario"
                disabled={guardando}
              >
                {guardando
                  ? "Guardando..."
                  : "Siguiente ➝"}
              </button>

            )}

          </div>

        </main>

      </div>
    </>
  );
}
