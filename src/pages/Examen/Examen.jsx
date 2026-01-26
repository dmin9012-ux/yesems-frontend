import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";

import TopBar from "../../components/TopBar/TopBar";
import apiYesems from "../../api/apiYesems";
import { enviarExamenNivel, puedeAccederNivel } from "../../servicios/examenService";
import { ProgresoContext } from "../../context/ProgresoContext";

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
      alert("❗ Responde todas las preguntas antes de finalizar.");
      return;
    }

    try {
      setEnviando(true);
      const res = await enviarExamenNivel({ cursoId, nivel: nivelNumero, respuestas: respuestasArray });

      if (res.aprobado) {
        actualizarNivelesAprobados(cursoId, nivelNumero);
      }
      
      await recargarProgreso();
      setResultado(res);

    } catch (err) {
      alert("Error al enviar el examen.");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <><TopBar /><div className="cargando">Cargando evaluación...</div></>;

  if (bloqueado) return (
    <>
      <TopBar />
      <div className="examen-bloqueado">
        <h2>🚫 Acceso restringido</h2>
        <p>{error}</p>
        <button className="btn-examen aprobado" onClick={() => navigate(`/curso/${cursoId}`)}>Volver</button>
      </div>
    </>
  );

  if (resultado) return (
    <>
      <TopBar />
      <div className="resultado-examen">
        <div className={`resultado-header ${resultado.aprobado ? "aprobado" : "reprobado"}`}>
          <h1>{resultado.aprobado ? "🎉 ¡Excelente trabajo!" : "❌ No se alcanzó el puntaje"}</h1>
          <p className="porcentaje">{resultado.porcentaje}%</p>
          <p>Mínimo para aprobar: 80%</p>
        </div>
        <div className="resultado-acciones">
          {resultado.aprobado ? (
            <button className="btn-examen aprobado" onClick={() => navigate(resultado.cursoFinalizado ? "/perfil" : `/curso/${cursoId}`)}>
              {resultado.cursoFinalizado ? "Ver mi Constancia 🎓" : "Continuar al siguiente nivel ➝"}
            </button>
          ) : (
            <button className="btn-examen reprobado" onClick={cargarExamen}>Intentar de nuevo</button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      <TopBar />
      <div className="examen-contenedor">
        <header className="examen-header">
          <h1>Nivel {nivelNumero}</h1>
          <p>Selecciona la respuesta correcta para cada pregunta.</p>
        </header>

        {examen.preguntas.map((pregunta, idx) => (
          <div key={pregunta.id} className="pregunta-card">
            <h3><span className="n-pregunta">{idx + 1}</span> {pregunta.pregunta}</h3>
            <ul className="opciones-lista">
              {pregunta.opciones.map((opcion, i) => (
                <li 
                  key={i} 
                  className={`opcion-item ${respuestas[pregunta.id] === i ? "seleccionada" : ""}`}
                  onClick={() => seleccionarRespuesta(pregunta.id, i)}
                >
                  <label>
                    <input
                      type="radio"
                      name={pregunta.id}
                      checked={respuestas[pregunta.id] === i}
                      readOnly
                    />
                    <div className="opcion-indicador"></div>
                    <span className="opcion-texto">{opcion}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <button className="btn-enviar" onClick={enviarExamen} disabled={enviando}>
          {enviando ? "Calificando..." : "Finalizar Evaluación"}
        </button>
      </div>
    </>
  );
}