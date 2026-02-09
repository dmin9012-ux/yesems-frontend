import { useEffect, useState, useContext, useCallback } from "react";
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

  const cargarExamen = useCallback(async () => {
    try {
      setCargando(true);
      setError("");
      setBloqueado(false);
      setResultado(null);
      setRespuestas({}); 

      const acceso = await puedeAccederNivel({ cursoId, nivel: nivelNumero });
      if (!acceso?.ok || acceso.puedeAcceder !== true) {
        setBloqueado(true);
        setError(acceso?.reason || "Debes completar todas las lecciones antes de realizar la evaluación.");
        return;
      }

      const res = await apiYesems.get(`/examen/${cursoId}/nivel/${nivelNumero}`);
      if (!res?.data?.ok || !res.data.preguntas?.length) {
        setError("Esta evaluación aún no tiene preguntas configuradas.");
        return;
      }

      setExamen({ ...res.data, preguntas: shuffleArray(res.data.preguntas) });
    } catch (err) {
      setError("Error al conectar con el servidor.");
      notify("error", "Error al cargar la evaluación.");
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

  const enviarExamen = async () => {
    const respuestasArray = examen.preguntas.map((p) => ({ 
      preguntaId: p.id, 
      respuesta: respuestas[p.id] 
    }));

    if (respuestasArray.some((r) => r.respuesta === undefined)) {
      notify("warning", "Por favor, responde todas las preguntas para continuar.");
      return;
    }

    try {
      setEnviando(true);
      const res = await enviarExamenNivel({ cursoId, nivel: nivelNumero, respuestas: respuestasArray });

      if (res.aprobado) {
        notify("success", `¡Felicidades! Aprobaste con ${res.porcentaje}%`);
        actualizarNivelesAprobados(cursoId, nivelNumero);
      } else {
        notify("error", `Tu puntaje fue de ${res.porcentaje}%. ¡No te rindas!`);
      }
      
      await recargarProgreso();
      setResultado(res);
      window.scrollTo(0, 0); // Volver arriba para ver el resultado

    } catch (err) {
      notify("error", "Hubo un problema al procesar tus respuestas.");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return (
    <div className="examen-loading-full">
      <div className="spinner-yes"></div>
      <p>Generando tu evaluación personalizada...</p>
    </div>
  );

  if (bloqueado || error) return (
    <div className="examen-layout">
      <TopBar />
      <div className="examen-content">
        <div className="msg-card locked">
          <AlertCircle size={64} className="icon-alert" />
          <h2>Acceso Restringido</h2>
          <p>{error || "No puedes acceder a este examen aún."}</p>
          <button className="btn-finish-exam" onClick={() => navigate(`/curso/${cursoId}`)}>
            Volver al Curso
          </button>
        </div>
      </div>
    </div>
  );

  if (resultado) return (
    <div className="examen-layout">
      <TopBar />
      <div className="examen-content">
        <div className={`msg-card result ${resultado.aprobado ? "success" : "fail"}`}>
          <div className="result-icon-container">
            {resultado.aprobado ? <CheckCircle size={80} color="#10b981" /> : <XCircle size={80} color="#ef4444" />}
          </div>
          <h1>{resultado.aprobado ? "¡Prueba Superada!" : "Puntaje Insuficiente"}</h1>
          
          <div className="score-container">
              <span className="score-badge">{resultado.porcentaje}%</span>
              <p className="min-score">Mínimo para aprobar: 80%</p>
          </div>
          
          <div className="result-actions">
            {resultado.aprobado ? (
              <button className="btn-finish-exam" onClick={() => navigate(resultado.cursoFinalizado ? "/perfil" : `/curso/${cursoId}`)}>
                {resultado.cursoFinalizado ? "Ver mi Certificado 🎓" : "Continuar al siguiente nivel"} <ArrowRight size={18} />
              </button>
            ) : (
              <button className="btn-finish-exam retry" onClick={cargarExamen}>
                <RotateCcw size={18} /> Reintentar Evaluación
              </button>
            )}
          </div>
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
            <ClipboardCheck size={36} />
            <div>
              <h1>Evaluación: Nivel {nivelNumero}</h1>
              <p>Lee con atención. Solo una opción es correcta.</p>
            </div>
          </div>
        </header>

        <div className="preguntas-list">
          {examen.preguntas.map((pregunta, idx) => (
            <article key={pregunta.id} className={`pregunta-card-student ${respuestas[pregunta.id] !== undefined ? "answered" : ""}`}>
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
            </article>
          ))}
        </div>

        <footer className="examen-footer-action">
          <button 
            className="btn-finish-exam" 
            onClick={enviarExamen} 
            disabled={enviando}
          >
            {enviando ? (
                <div className="loader-container">
                    <div className="spinner-mini"></div>
                    <span>Calificando...</span>
                </div>
            ) : (
                <>
                    <Send size={18} />
                    <span>Enviar Evaluación</span>
                </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}