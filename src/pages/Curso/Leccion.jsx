import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
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

  const {
    progresoGlobal,
    nivelesAprobadosGlobal,
    actualizarProgreso,
    recargarProgreso,
  } = useContext(ProgresoContext);

  // ID CANÓNICO
  const leccionId = id + "-n" + nivelNum + "-l" + numLeccion;

  /* ===============================
     📥 CARGAR LECCIÓN
  =============================== */
  useEffect(() => {
    const cargarLeccion = async () => {
      try {
        const ref = doc(db, "cursos", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;

        const data = snap.data();
        const nivelData = data.niveles?.[nivelNum - 1];
        const leccionData = nivelData?.lecciones?.[numLeccion - 1];
        if (!nivelData || !leccionData) return;

        setCurso(data);

        setLeccionActual({
          id: leccionId,
          titulo: leccionData.titulo,
          videoURL: leccionData.videoURL || "https://www.youtube.com/embed/dQw4w9WgXcQ",
          contenidoHTML: leccionData.contenidoHTML || "",
          materiales: leccionData.materiales || [],
          nivelTitulo: nivelData.titulo,
        });

        setEsUltimaLeccion(numLeccion === nivelData.lecciones.length);
      } catch (error) {
        console.error("❌ Error cargando lección:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarLeccion();
  }, [id, nivelNum, numLeccion]);

  /* ===============================
     💾 GUARDAR PROGRESO (BLINDADO)
  =============================== */
  const guardarProgreso = async () => {
    const progresoCursoActual = progresoGlobal[id] || [];
    if (progresoCursoActual.includes(leccionId)) {
      await recargarProgreso(); // 🔄 Asegurar actualización
      return true;
    }

    try {
      setGuardando(true);

      const res = await validarLeccion({ cursoId: id, leccionId });

      if (res?.ok === false) {
        if (res.message?.includes("ya fue validada")) {
          actualizarProgreso(id, leccionId);
          await recargarProgreso();
          return true;
        }
        alert(res.message || "Error al guardar progreso");
        return false;
      }

      actualizarProgreso(id, leccionId);
      await recargarProgreso();
      return true;
    } catch (err) {
      if (
        err.response?.status === 400 &&
        err.response.data?.message?.includes("ya fue validada")
      ) {
        actualizarProgreso(id, leccionId);
        await recargarProgreso();
        return true;
      }

      console.error("❌ Error validar lección:", err);
      alert("Error al guardar progreso");
      return false;
    } finally {
      setGuardando(false);
    }
  };

  if (cargando || !curso || !leccionActual) {
    return (
      <>
        <TopBar />
        <p className="cargando">Cargando lección...</p>
      </>
    );
  }

  /* ===============================
     📊 CÁLCULO DE PROGRESO
  =============================== */
  const progresoCursoActual = progresoGlobal[id] || [];
  const nivelesAprobados = nivelesAprobadosGlobal[id] || [];

  const totalLeccionesNivel = curso.niveles[nivelNum - 1].lecciones.length;
  const totalLeccionesCurso = curso.niveles.reduce((acc, n) => acc + n.lecciones.length, 0);

  const leccionesNivelIds = curso.niveles[nivelNum - 1].lecciones.map((_, idx) => id + "-n" + nivelNum + "-l" + (idx + 1));
  const completadasNivel = leccionesNivelIds.filter((l) => progresoCursoActual.includes(l)).length;

  const progresoNivelPct = Math.round((completadasNivel / totalLeccionesNivel) * 100);
  const progresoCursoPct = Math.round((progresoCursoActual.length / totalLeccionesCurso) * 100);

  const leccionCompletada = progresoCursoActual.includes(leccionId);

  /* ===============================
     ➡️ NAVEGACIÓN
  =============================== */
  const navegarAnterior = () => {
    let n = nivelNum;
    let l = numLeccion - 1;

    if (l < 1) {
      n--;
      if (n < 1) return;
      l = curso.niveles[n - 1].lecciones.length;
    }

    navigate(`/curso/${id}/nivel/${n}/leccion/${l}`);
  };

  const navegarSiguiente = async () => {
    const ok = await guardarProgreso();
    if (!ok) return;

    let siguienteLeccion = numLeccion + 1;
    const nivelData = curso.niveles[nivelNum - 1];
    if (siguienteLeccion > nivelData.lecciones.length) {
      // si es la última, ir a examen
      navigate(`/curso/${id}/nivel/${nivelNum}/examen`);
    } else {
      navigate(`/curso/${id}/nivel/${nivelNum}/leccion/${siguienteLeccion}`);
    }
  };

  const irAExamenNivel = async () => {
    const ok = await guardarProgreso();
    if (!ok) return;

    navigate(`/curso/${id}/nivel/${nivelNum}/examen`);
  };

  /* ===============================
     🖥️ RENDER
  =============================== */
  return (
    <>
      <TopBar />

      <div className="leccion-contenedor-sidebar">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <h3>{curso.nombre}</h3>

          {curso.niveles.map((nivelItem) => {
            const nivelNumero = Number(nivelItem.numero);
            const desbloqueado = nivelNumero === 1 || nivelesAprobados.includes(nivelNumero - 1);

            return (
              <div
                key={nivelItem.numero}
                className={"nivel-sidebar " + (!desbloqueado ? "nivel-bloqueado" : "")}
              >
                <p>
                  Nivel {nivelItem.numero}: {nivelItem.titulo}
                </p>

                <ul>
                  {nivelItem.lecciones.map((_, index) => {
                    const lid = id + "-n" + nivelNumero + "-l" + (index + 1);
                    const esActual = nivelNumero === nivelNum && index + 1 === numLeccion;
                    const completada = progresoCursoActual.includes(lid);

                    return (
                      <li
                        key={lid}
                        className={(esActual ? "active " : "") + (completada ? "completada" : "")}
                      >
                        {desbloqueado ? (
                          <Link to={`/curso/${id}/nivel/${nivelNumero}/leccion/${index + 1}`}>
                            Lección {index + 1}
                          </Link>
                        ) : (
                          <span>🔒 Lección {index + 1}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </aside>

        {/* MAIN */}
        <main className="contenido">
          <div className="indicador-leccion">
            Nivel {nivelNum} · Lección {numLeccion} de {totalLeccionesNivel}
          </div>

          <div className="barra-progreso">
            <p>Progreso del nivel</p>
            <progress value={progresoNivelPct} max="100" />
            <span>{progresoNivelPct}%</span>
          </div>

          <div className="barra-progreso">
            <p>Progreso del curso</p>
            <progress value={progresoCursoPct} max="100" />
            <span>{progresoCursoPct}%</span>
          </div>

          <h1>{leccionActual.titulo}</h1>
          <h3>{leccionActual.nivelTitulo}</h3>

          {leccionCompletada && <p className="leccion-completada">✔️ Lección completada</p>}

          <div className="video-container">
            <iframe src={leccionActual.videoURL} title={leccionActual.titulo} allowFullScreen />
          </div>

          {leccionActual.contenidoHTML && (
            <div className="contenido-html" dangerouslySetInnerHTML={{ __html: leccionActual.contenidoHTML }} />
          )}

          <div className="navegacion-lecciones">
            <button onClick={navegarAnterior} className="btn-nav">
              ⬅ Anterior
            </button>

            {!esUltimaLeccion && (
              <button onClick={navegarSiguiente} className="btn-nav" disabled={guardando}>
                Siguiente ➝
              </button>
            )}

            {esUltimaLeccion && (
              <button onClick={irAExamenNivel} className="btn-nav btn-finalizar" disabled={guardando}>
                📝 Presentar examen del nivel
              </button>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
