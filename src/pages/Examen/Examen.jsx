import { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, AlertCircle, ArrowRight, RotateCcw, ClipboardCheck, Send, Trophy } from "lucide-react";

import TopBar from "../../components/TopBar/TopBar";
import apiYesems from "../../api/apiYesems";
import { enviarExamenNivel, puedeAccederNivel } from "../../servicios/examenService";
import { ProgresoContext } from "../../context/ProgresoContext";
import { notify } from "../../Util/toast"; 

import "./ExamenStyle.css";

// Mezclar preguntas para que cada intento se sienta fresco
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

  const cargarExamen = useCallback(async () => {
    try {
      setCargando(true);
      setError("");
      setBloqueado(false);
      setResultado(null);
      setRespuestas({}); 

      // 1. Validar si el usuario completó las lecciones previas
      const acceso = await puedeAccederNivel({ cursoId, nivel: nivelNumero });
      if (!acceso?.ok || acceso.puedeAcceder !== true) {
        setBloqueado(true);
        setError(acceso?.reason || "Debes completar todas las lecciones del nivel antes de evaluarte.");
        return;
      }

      // 2. Traer las preguntas del backend
      const res = await apiYesems.get(`/examen/${cursoId}/nivel/${nivelNumero}`);
      if (!res?.data?.ok || !res.data.preguntas?.length) {
        setError("Esta evaluación estará disponible próximamente.");
        return;
      }

      setExamen({ ...res.data, preguntas: shuffleArray(res.data.preguntas) });
    } catch (err) {
      setError("No pudimos conectar con el servidor de evaluaciones.");
    } finally {
      setCargando(false);
    }
  }, [cursoId, nivelNumero]);

  useEffect(() => {
    cargarExamen();
  }, [cargarExamen]);

  const seleccionarRespuesta = (preguntaId, opcionIndex) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: opcionIndex }));
  };

  const manejarEnvio = async () => {
    const respuestasArray = examen.preguntas.map((p) => ({ 
      preguntaId: p.id, 
      respuesta: respuestas[p.id] 
    }));

    if (respuestasArray.some((r) => r.respuesta === undefined)) {
      notify("warning", "Responde todas las preguntas para calificar.");
      return;
    }

    try {
      setEnviando(true);
      const res = await enviarExamenNivel({ cursoId, nivel: nivelNumero, respuestas: respuestasArray });

      if (res.aprobado) {
        notify("success", "¡Nivel completado con éxito! 🌟");
        actualizarNivelesAprobados(cursoId, nivelNumero);
      } else {
        notify("error", "Puntaje insuficiente. ¡Repasa y vuelve a intentarlo!");
      }
      
      await recargarProgreso();
      setResultado(res);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      notify("error", "Error al procesar el examen.");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return (
    <div className="examen-loader">
      <div className="spin-yes"></div>
      <p>Cargando preguntas...</p>
    </div>
  );

  // Pantalla de Error o Bloqueo
  if (bloqueado || error) return (
    <div className="examen-layout">
      <TopBar />
      <div className="examen-container">
        <div className="msg-card locked">
          <AlertCircle size={50} className="icon-alert" />
          <h2>Aviso de Evaluación</h2>
          <p>{error}</p>
          <button className="btn-back" onClick={() => navigate(`/curso/${cursoId}`)}>
            Volver al Curso
          </button>
        </div>
      </div>
    </div>
  );

  // Pantalla de Resultados (Aprobado/Reprobado)
  if (resultado) return (
    <div className="examen-layout">
      <TopBar />
      <div className="examen-container">
        <div className={`result-card ${resultado.aprobado ? "is-success" : "is-fail"}`}>
          <div className="result-header">
            {resultado.aprobado ? <Trophy size={60} color="#fcb424" /> : <XCircle size={60} color="#ef4444" />}
            <h1>{resultado.aprobado ? "¡Excelente Trabajo!" : "Sigue intentando"}</h1>
          </div>
          
          <div className="result-score">
            <div className="score-circle">
               <span className="big-percent">{resultado.porcentaje}%</span>
               <span className="label-score">Puntaje total</span>
            </div>
          </div>

          <div className="result-footer">
            {resultado.aprobado ? (
              <button className="btn-action-main" onClick={() => navigate(resultado.cursoFinalizado ? "/perfil" : `/curso/${cursoId}`)}>
                {resultado.cursoFinalizado ? "Obtener Certificado 🎓" : "Siguiente Nivel"} <ArrowRight size={20} />
              </button>
            ) : (
              <button className="btn-action-main retry" onClick={cargarExamen}>
                <RotateCcw size={18} /> Intentar de nuevo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizado del examen
  return (
    <div className="examen-layout">
      <TopBar />
      <div className="examen-container">
        <header className="exam-header">
           <ClipboardCheck size={32} color="#fcb424" />
           <div>
              <h1>Examen de Nivel {nivelNumero}</h1>
              <p>Selecciona la respuesta correcta para cada caso.</p>
           </div>
        </header>

        <div className="questions-stack">
          {examen.preguntas.map((p, idx) => (
            <div key={p.id} className={`question-card ${respuestas[p.id] !== undefined ? "is-answered" : ""}`}>
              <div className="q-label">Pregunta {idx + 1}</div>
              <p className="q-text">{p.pregunta}</p>
              <div className="options-list">
                {p.opciones.map((opc, i) => (
                  <label key={i} className={`option-item ${respuestas[p.id] === i ? "is-selected" : ""}`}>
                    <input 
                      type="radio" 
                      name={p.id} 
                      onChange={() => seleccionarRespuesta(p.id, i)}
                      checked={respuestas[p.id] === i}
                    />
                    <span className="option-check"></span>
                    <span className="option-label">{opc}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <footer className="exam-submit-bar">
          <button className="btn-send-exam" onClick={manejarEnvio} disabled={enviando}>
            {enviando ? "Calificando..." : "Finalizar y Enviar"} <Send size={18} />
          </button>
        </footer>
      </div>
    </div>
  );
}