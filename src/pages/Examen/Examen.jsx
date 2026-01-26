import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";

import TopBar from "../../components/TopBar/TopBar";
import apiYesems from "../../api/apiYesems";
import { enviarExamenNivel, puedeAccederNivel } from "../../servicios/examenService";
import { ProgresoContext } from "../../context/ProgresoContext";

import "./ExamenStyle.css";

/* 🔀 Mezclar preguntas para evitar patrones memorizados */
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

  // Traemos las funciones del contexto de progreso
  const { recargarProgreso, actualizarNivelesAprobados } = useContext(ProgresoContext);

  const [examen, setExamen] = useState({ preguntas: [] });
  const [respuestas, setRespuestas] = useState({});
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [bloqueado, setBloqueado] = useState(false);

  /* ===============================
      Cargar examen y verificar acceso
  =============================== */
  const cargarExamen = async () => {
    try {
      setCargando(true);
      setError("");
      setBloqueado(false);
      setExamen({ preguntas: [] });
      setRespuestas({});
      setResultado(null);

      // Verificar si el usuario tiene permitido hacer este examen
      const acceso = await puedeAccederNivel({ cursoId, nivel: nivelNumero });
      if (!acceso?.ok || acceso.puedeAcceder !== true) {
        setBloqueado(true);
        setError(acceso?.reason || "No tienes acceso a este nivel aún.");
        return;
      }

      const res = await apiYesems.get(`/examen/${cursoId}/nivel/${nivelNumero}`);
      if (!res?.data?.ok || !res.data.preguntas?.length) {
        setError("No se encontraron preguntas para este nivel.");
        return;
      }

      setExamen({ ...res.data, preguntas: shuffleArray(res.data.preguntas) });
    } catch (err) {
      console.error("❌ Error cargar examen:", err);
      setError("Hubo un problema al cargar el examen. Reintenta más tarde.");
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

  /* ===============================
      Enviar y Procesar Examen
  =============================== */
  const enviarExamen = async () => {
    if (!examen?.preguntas?.length) return;

    const respuestasArray = examen.preguntas.map((p) => ({ 
      preguntaId: p.id, 
      respuesta: respuestas[p.id] 
    }));

    // Validación: todas las preguntas deben tener respuesta
    if (respuestasArray.some((r) => r.respuesta === undefined)) {
      alert("❗ Por favor, responde todas las preguntas antes de enviar.");
      return;
    }

    try {
      setEnviando(true);
      const res = await enviarExamenNivel({ 
        cursoId, 
        nivel: nivelNumero, 
        respuestas: respuestasArray 
      });

      if (!res?.ok) {
        alert(res?.message || "Error al procesar el examen.");
        return;
      }

      // --- SINCRONIZACIÓN DE PROGRESO ---
      // 1. Actualizamos localmente el nivel aprobado
      if (res.aprobado) {
        actualizarNivelesAprobados(cursoId, nivelNumero);
      }

      // 2. Forzamos la recarga desde el backend para obtener el objeto de progreso real
      // (Esto asegura que el Perfil y el Curso vean el cambio de inmediato)
      await recargarProgreso();

      // 3. Mostramos la pantalla de resultados
      setResultado({
        aprobado: res.aprobado,
        porcentaje: res.porcentaje,
        cursoFinalizado: res.cursoFinalizado,
      });

    } catch (err) {
      console.error("❌ Error enviar examen:", err);
      alert("Ocurrió un error inesperado al enviar tus respuestas.");
    } finally {
      setEnviando(false);
    }
  };

  /* ===============================
      Renders condicionales
  =============================== */
  if (cargando) return <><TopBar /><div className="cargando">Preparando examen...</div></>;

  if (bloqueado) return (
    <>
      <TopBar />
      <div className="examen-bloqueado">
        <h2>🚫 Acceso restringido</h2>
        <p>{error}</p>
        <button className="btn-examen" onClick={() => navigate(`/curso/${cursoId}`)}>
          Volver al curso
        </button>
      </div>
    </>
  );

  if (resultado) return (
    <>
      <TopBar />
      <div className="resultado-examen">
        <div className={`resultado-header ${resultado.aprobado ? "aprobado" : "reprobado"}`}>
          <h1>{resultado.aprobado ? "🎉 ¡Felicidades, aprobaste!" : "❌ No lograste el puntaje mínimo"}</h1>
          <p className="porcentaje">Tu puntaje: <strong>{resultado.porcentaje}%</strong></p>
          <p className="nota-minima">Mínimo requerido: 80%</p>
        </div>

        {resultado.aprobado && resultado.cursoFinalizado && (
          <div className="finalizado-badge">
            <p>🎓 ¡Has completado satisfactoriamente todas las unidades de este curso!</p>
          </div>
        )}

        <div className="resultado-acciones">
          {resultado.aprobado ? (
            resultado.cursoFinalizado ? (
              <button className="btn-examen aprobado" onClick={() => navigate("/perfil")}>
                Ir a mi Perfil
              </button>
            ) : (
              <button className="btn-examen aprobado" onClick={() => navigate(`/curso/${cursoId}`)}>
                Continuar con el siguiente nivel
              </button>
            )
          ) : (
            <button className="btn-examen reprobado" onClick={cargarExamen}>
              Intentar de nuevo
            </button>
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
          <h1>Evaluación - Nivel {nivelNumero}</h1>
          <p>Lee cuidadosamente cada pregunta y selecciona la respuesta correcta.</p>
        </header>

        {examen?.preguntas?.length > 0 ? examen.preguntas.map((pregunta, idx) => (
          <div key={pregunta.id} className="pregunta-card">
            <h3><span className="n-pregunta">{idx + 1}.</span> {pregunta.pregunta}</h3>
            <ul className="opciones-lista">
              {pregunta.opciones.map((opcion, i) => (
                <li key={i} className={`opcion-item ${respuestas[pregunta.id] === i ? "seleccionada" : ""}`}>
                  <label>
                    <input
                      type="radio"
                      name={pregunta.id}
                      checked={respuestas[pregunta.id] === i}
                      onChange={() => seleccionarRespuesta(pregunta.id, i)}
                    />
                    <span className="opcion-texto">{opcion}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )) : <p className="error-mensaje">No hay preguntas disponibles para este nivel actualmente.</p>}

        <footer className="examen-footer">
          <button 
            className="btn-enviar" 
            onClick={enviarExamen} 
            disabled={enviando}
          >
            {enviando ? "Procesando respuestas..." : "Finalizar y calificar"}
          </button>
        </footer>
      </div>
    </>
  );
}