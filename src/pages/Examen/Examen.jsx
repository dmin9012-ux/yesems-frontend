import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";

import TopBar from "../../components/TopBar/TopBar";
import apiYesems from "../../api/apiYesems";
import {
  enviarExamenNivel,
  puedeAccederNivel,
} from "../../servicios/examenService";
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

  const { recargarProgreso } = useContext(ProgresoContext);

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
      setExamen({ preguntas: [] });
      setRespuestas({});
      setResultado(null);

      const acceso = await puedeAccederNivel({
        cursoId,
        nivel: nivelNumero,
      });

      if (!acceso?.ok || acceso.puedeAcceder !== true) {
        setBloqueado(true);
        setError(acceso?.reason || "No puedes acceder a este examen");
        setCargando(false);
        return;
      }

      const res = await apiYesems.get(`/examen/${cursoId}/nivel/${nivelNumero}`);

      if (!res?.data?.ok || !res.data.preguntas?.length) {
        setError("El examen no tiene preguntas");
        setCargando(false);
        return;
      }

      setExamen({ ...res.data, preguntas: shuffleArray(res.data.preguntas) });
      setCargando(false);
    } catch (err) {
      console.error("❌ Error cargar examen:", err);
      setError("Error al cargar el examen");
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarExamen();
  }, [cursoId, nivelNumero]);

  const seleccionarRespuesta = (preguntaId, opcionIndex) => {
    setRespuestas((prev) => ({
      ...prev,
      [preguntaId]: opcionIndex,
    }));
  };

  const enviarExamen = async () => {
    if (!examen?.preguntas?.length) return;

    const respuestasArray = examen.preguntas.map((p) => ({
      preguntaId: p.id,
      respuesta: respuestas[p.id],
    }));

    if (respuestasArray.some((r) => r.respuesta === undefined)) {
      alert("❗ Debes responder todas las preguntas");
      return;
    }

    try {
      setEnviando(true);

      const res = await enviarExamenNivel({
        cursoId,
        nivel: nivelNumero,
        respuestas: respuestasArray,
      });

      if (!res?.ok) {
        alert(res?.message || "Error al enviar el examen");
        return;
      }

      // 🔑 RECARGAR PROGRESO Y RECALCULAR NIVELES
      await recargarProgreso();

      setResultado({
        aprobado: res.aprobado,
        porcentaje: res.porcentaje,
        mensaje: res.mensaje,
        cursoFinalizado: res.cursoFinalizado,
      });
    } catch (err) {
      console.error("❌ Error enviar examen:", err);
      alert("Error inesperado al enviar el examen");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <>
        <TopBar />
        <p className="cargando">Cargando examen...</p>
      </>
    );
  }

  if (bloqueado) {
    return (
      <>
        <TopBar />
        <div className="examen-bloqueado">
          <h2>🚫 Acceso bloqueado</h2>
          <p>{error}</p>
          <button className="btn-examen" onClick={() => navigate(`/curso/${cursoId}`)}>
            Volver al curso
          </button>
        </div>
      </>
    );
  }

  if (resultado) {
    return (
      <>
        <TopBar />
        <div className="resultado-examen">
          <h1>{resultado.aprobado ? "🎉 ¡Aprobado!" : "❌ Reprobado"}</h1>

          <p className="porcentaje">
            Puntaje: <strong>{resultado.porcentaje}%</strong>
          </p>

          <p className="mensaje">{resultado.mensaje}</p>

          {resultado.aprobado ? (
            resultado.cursoFinalizado ? (
              <button className="btn-examen aprobado" onClick={() => navigate("/perfil")}>
                🎓 Finalizar curso
              </button>
            ) : (
              <button className="btn-examen aprobado" onClick={() => navigate(`/curso/${cursoId}`)}>
                Volver al curso
              </button>
            )
          ) : (
            <button className="btn-examen reprobado" onClick={cargarExamen}>
              Reintentar examen
            </button>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar />
      <div className="examen-contenedor">
        <h1>Examen – Nivel {nivelNumero}</h1>

        {examen?.preguntas?.length > 0 ? (
          examen.preguntas.map((pregunta, idx) => (
            <div key={pregunta.id} className="pregunta">
              <h3>
                {idx + 1}. {pregunta.pregunta}
              </h3>
              <ul>
                {pregunta.opciones.map((opcion, i) => (
                  <li key={i}>
                    <label>
                      <input
                        type="radio"
                        name={pregunta.id}
                        checked={respuestas[pregunta.id] === i}
                        onChange={() => seleccionarRespuesta(pregunta.id, i)}
                      />
                      {opcion}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p>No hay preguntas disponibles.</p>
        )}

        <button className="btn-examen" onClick={enviarExamen} disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar examen"}
        </button>
      </div>
    </>
  );
}
