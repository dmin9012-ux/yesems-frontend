import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";
import TopBar from "../../components/TopBar/TopBar";
import { validarLeccion } from "../../servicios/progresoService";
import { ProgresoContext } from "../../context/ProgresoContext";

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
  const [error, setError] = useState("");

  const {
    progresoGlobal,
    nivelesAprobadosGlobal,
    actualizarProgreso,
    recargarProgreso // 🔑 Importante para sincronizar
  } = useContext(ProgresoContext);

  const leccionId = `${id}-n${nivelNum}-l${numLeccion}`;

  /* ===============================
      📥 CARGAR LECCIÓN
  =============================== */
  useEffect(() => {
    const cargarLeccion = async () => {
      setCargando(true);
      setError("");
      try {
        const ref = doc(db, "cursos", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setError("Curso no encontrado");
          return;
        }

        const data = snap.data();
        const nivelData = data.niveles?.find((n) => Number(n.numero) === nivelNum);
        
        if (!nivelData) {
          setError("Nivel no encontrado");
          return;
        }

        const leccionData = nivelData.lecciones?.[numLeccion - 1];
        if (!leccionData) {
          setError("Lección no encontrada");
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

        setEsUltimaLeccion(numLeccion === nivelData.lecciones.length);
      } catch (err) {
        console.error("Error cargando lección:", err);
        setError("Error al conectar con la base de datos");
      } finally {
        setCargando(false);
      }
    };

    cargarLeccion();
  }, [id, nivelNum, numLeccion, leccionId]);

  /* ===============================
      💾 GUARDAR PROGRESO
  =============================== */
  const guardarProgresoReal = async () => {
    const progresoCursoActual = progresoGlobal[id] || [];
    
    // Si ya está marcada como completada localmente, no llamamos al API
    if (progresoCursoActual.includes(leccionId)) return true;

    setGuardando(true);
    try {
      const res = await validarLeccion({ cursoId: id, leccionId });

      if (res?.ok) {
        // Actualizamos el contexto global
        actualizarProgreso(id, leccionId);
        return true;
      } else {
        setError(res.message || "No se pudo guardar el progreso");
        return false;
      }
    } catch (err) {
      console.error("Error validar lección:", err);
      return false;
    } finally {
      setGuardando(false);
    }
  };

  /* ===============================
      🔹 NAVEGACIÓN
  =============================== */
  const navegarSiguiente = async () => {
    const ok = await guardarProgresoReal();
    if (!ok) return;

    const nivelData = curso.niveles.find((nv) => Number(nv.numero) === nivelNum);
    
    if (numLeccion >= (nivelData?.lecciones.length || 0)) {
      // Si era la última lección, vamos al examen
      navigate(`/curso/${id}/nivel/${nivelNum}/examen`);
    } else {
      navigate(`/curso/${id}/nivel/${nivelNum}/leccion/${numLeccion + 1}`);
    }
  };

  const irAExamenNivel = async () => {
    const ok = await guardarProgresoReal();
    if (ok) navigate(`/curso/${id}/nivel/${nivelNum}/examen`);
  };

  if (cargando) return <><TopBar /><div className="cargando">Cargando lección...</div></>;

  if (error || !leccionActual) return (
    <><TopBar /><div className="error-container">
      <p className="error-leccion">❌ {error || "Lección no disponible"}</p>
      <button onClick={() => navigate(`/curso/${id}`)}>Volver al curso</button>
    </div></>
  );

  const progresoActual = progresoGlobal[id] || [];
  const nivelesAprobados = nivelesAprobadosGlobal[id] || [];
  const nivelData = curso.niveles.find((n) => Number(n.numero) === nivelNum);
  
  // Cálculos de progreso
  const totalLeccionesNivel = nivelData?.lecciones.length || 0;
  const leccionesNivelIds = nivelData?.lecciones.map((_, idx) => `${id}-n${nivelNum}-l${idx + 1}`) || [];
  const completadasNivel = leccionesNivelIds.filter((l) => progresoActual.includes(l)).length;
  const progresoNivelPct = Math.round((completadasNivel / totalLeccionesNivel) * 100);

  return (
    <>
      <TopBar />
      <div className="leccion-contenedor-sidebar">
        <aside className="sidebar">
          <h3>{curso.nombre}</h3>
          {curso.niveles.map((nivelItem) => {
            const nNum = Number(nivelItem.numero);
            const desbloqueado = nNum === 1 || nivelesAprobados.includes(nNum - 1);

            return (
              <div key={nNum} className={`nivel-sidebar ${!desbloqueado ? "nivel-bloqueado" : ""}`}>
                <p>Nivel {nNum}: {nivelItem.titulo}</p>
                <ul>
                  {nivelItem.lecciones.map((_, idx) => {
                    const lid = `${id}-n${nNum}-l${idx + 1}`;
                    const esActual = nNum === nivelNum && (idx + 1) === numLeccion;
                    const completada = progresoActual.includes(lid);
                    return (
                      <li key={lid} className={`${esActual ? "active " : ""}${completada ? "completada" : ""}`}>
                        {desbloqueado ? (
                          <Link to={`/curso/${id}/nivel/${nNum}/leccion/${idx + 1}`}>
                            {completada ? "✅" : "📖"} Lección {idx + 1}
                          </Link>
                        ) : (
                          <span>🔒 Lección {idx + 1}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </aside>

        <main className="contenido">
          <div className="header-leccion">
            <span className="badge-nivel">Nivel {nivelNum}</span>
            <h1>{leccionActual.titulo}</h1>
          </div>

          <div className="progreso-mini">
            <span>Progreso del nivel: {progresoNivelPct}%</span>
            <div className="barra"><div className="llenado" style={{width: `${progresoNivelPct}%`}}></div></div>
          </div>

          <div className="video-wrapper">
            {leccionActual.videoURL ? (
               <iframe src={leccionActual.videoURL} title="Video lección" allowFullScreen />
            ) : <div className="no-video">No hay video disponible para esta lección</div>}
          </div>

          {leccionActual.contenidoHTML && (
            <div className="lectura-container" dangerouslySetInnerHTML={{ __html: leccionActual.contenidoHTML }} />
          )}

          <div className="footer-navegacion">
            <button onClick={() => navigate(-1)} className="btn-secundario">Volver</button>
            
            {esUltimaLeccion ? (
              <button onClick={irAExamenNivel} className="btn-principal" disabled={guardando}>
                {guardando ? "Guardando..." : "Ir al Examen 📝"}
              </button>
            ) : (
              <button onClick={navegarSiguiente} className="btn-principal" disabled={guardando}>
                {guardando ? "Guardando..." : "Siguiente Lección ➝"}
              </button>
            )}
          </div>
        </main>
      </div>
    </>
  );
}