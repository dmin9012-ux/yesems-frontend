import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, AlertCircle, ArrowRight, RotateCcw, ClipboardCheck, Send } from "lucide-react";

import TopBar from "../../components/TopBar/TopBar";
import apiYesems from "../../api/apiYesems";
import { enviarExamenNivel, puedeAccederNivel } from "../../servicios/examenService";
import { ProgresoContext } from "../../context/ProgresoContext";
import { notify } from "../../Util/toast";

import "./ExamenStyle.css";

const shuffleArray = (array) => {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
};

export default function Examen() {
  const { id, nivel } = useParams();
  const cursoId = id;
  const nivelNumero = Number(nivel);
  const navigate = useNavigate();

  const { recargarProgreso, actualizarNivelesAprobados } = useContext(ProgresoContext);

  const [examen, setExamen] = useState({ preguntas: [] });
  const [respuestas, setRespuestas] = useState({}); 
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [bloqueado, setBloqueado] = useState(false);

  const cargarExamen = async () => {
    try {
      setCargando(true);
      setError("");
      setBloqueado(false);
      setResultado(null);
      setRespuestas({}); 

      const acceso = await puedeAccederNivel({ cursoId, nivel: nivelNumero });
      if (!acceso?.ok || acceso.puedeAcceder !== true) {
        setBloqueado(true);
        setError(acceso?.reason || "No tienes acceso a este nivel aún.");
        return;
      }

      const res = await apiYesems.get(`/examen/${cursoId}/nivel/${nivelNumero}`);
      if (!res?.data?.ok || !res.data.preguntas?.length) {
        setError("No se encontraron preguntas.");
        return;
      }

      setExamen({ ...res.data, preguntas: shuffleArray(res.data.preguntas) });
    } catch (err) {
      setError("Error al conectar con el servidor.");
      notify("error", "Error al cargar la evaluación.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarExamen();
  }, [cursoId, nivelNumero]);

  const seleccionarRespuesta = (preguntaId, opcionIndex) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: opcionIndex }));
  };

  const enviarExamen = async () => {
    const respuestasArray = examen.preguntas.map((p) => ({ 
      preguntaId: p.id, 
      respuesta: respuestas[p.id] 
    }));

    if (respuestasArray.some((r) => r.respuesta === undefined)) {
      notify("warning", "Por favor, responde todas las preguntas.");
      return;
    }

    try {
      setEnviando(true);
      const res = await enviarExamenNivel({ cursoId, nivel: nivelNumero, respuestas: respuestasArray });

      window.scrollTo({ top: 0, behavior: 'smooth' }); // 📱 Sube al inicio para ver el resultado

      if (res.aprobado) {
        notify("success", `¡Excelente! Aprobado con ${res.porcentaje}%`);
        actualizarNivelesAprobados(cursoId, nivelNumero);
      } else {
        notify("error", `Puntaje insuficiente (${res.porcentaje}%)`);
      }
      
      await recargarProgreso();
      setResultado(res);

    } catch (err) {
      notify("error", "Error al procesar el examen.");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return (
    <div className="examen-loading-full">
      <div className="spinner-yes"></div>
      <p>Preparando evaluación...</p>
    </div>
  );

  // ... (Bloqueado y Resultado se mantienen igual lógicamente, se ajustan en CSS)

  if (bloqueado) return (
    <div className="examen-screen-msg">
      <TopBar />
      <div className="msg-card locked">
        <AlertCircle size={50} color="#64748b" />
        <h2>Acceso restringido</h2>
        <p>{error}</p>
        <button className="btn-yes primary" onClick={() => navigate(`/curso/${cursoId}`)}>Volver al curso</button>
      </div>
    </div>
  );

  if (resultado) return (
    <div className="examen-screen-msg">
      <TopBar />
      <div className={`msg-card result ${resultado.aprobado ? "success" : "fail"}`}>
        {resultado.aprobado ? <CheckCircle size={70} color="#10b981" /> : <XCircle size={70} color="#ef4444" />}
        <h1>{resultado.aprobado ? "¡Lo lograste!" : "Sigue intentando"}</h1>
        <div className="score-badge">{resultado.porcentaje}%</div>
        <p className="min-score">Mínimo para aprobar: 80%</p>
        <div className="result-actions">
          {resultado.aprobado ? (
            <button className="btn-yes success" onClick={() => navigate(resultado.cursoFinalizado ? "/perfil" : `/curso/${cursoId}`)}>
              {resultado.cursoFinalizado ? "Ver mi Constancia" : "Siguiente nivel"} <ArrowRight size={18} />
            </button>
          ) : (
            <button className="btn-yes retry" onClick={cargarExamen}>
              <RotateCcw size={18} /> Reintentar examen
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="examen-layout">
      <TopBar />
      <div className="examen-content">
        <header className="examen-header-main">
          <div className="header-info">
            <ClipboardCheck size={32} className="header-icon-examen" />
            <div>
              <h1>Evaluación Nivel {nivelNumero}</h1>
              <p>Lee con atención antes de seleccionar.</p>
            </div>
          </div>
        </header>

        <div className="preguntas-list">
          {examen.preguntas.map((pregunta, idx) => (
            <div key={pregunta.id} className={`pregunta-card-student ${respuestas[pregunta.id] !== undefined ? "answered" : ""}`}>
              <div className="pregunta-header">
                <span className="q-number">{idx + 1}</span>
                <h3>{pregunta.pregunta}</h3>
              </div>
              <div className="opciones-grid-student">
                {pregunta.opciones.map((opcion, i) => (
                  <div 
                    key={i} 
                    className={`opcion-choice ${respuestas[pregunta.id] === i ? "selected" : ""}`}
                    onClick={() => seleccionarRespuesta(pregunta.id, i)}
                  >
                    <div className="radio-custom">
                        <div className="radio-inner"></div>
                    </div>
                    <span className="opcion-txt">{opcion}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <footer className="examen-footer-action">
          <button className="btn-finish-exam" onClick={enviarExamen} disabled={enviando}>
            {enviando ? <div className="spinner-mini"></div> : <><Send size={18} /> <span>Enviar Respuestas</span></>}
          </button>
        </footer>
      </div>
    </div>
  );
}