import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  ClipboardCheck,
  Send
} from "lucide-react";

import TopBar from "../../components/TopBar/TopBar";
import apiYesems from "../../api/apiYesems";
import {
  enviarExamenNivel,
  puedeAccederNivel
} from "../../servicios/examenService";

import { ProgresoContext } from "../../context/ProgresoContext";

/* ✅ IMPORT CORRECTO — ASEGÚRATE QUE EXISTA src/Util/toast.js */
import { notify } from "../../Util/toast";

import "./ExamenStyle.css";


/* ======================================================
   SHUFFLE PROFESIONAL
====================================================== */
const shuffleArray = (array) => {
  const copia = [...array];

  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }

  return copia;
};


/* ======================================================
   COMPONENTE
====================================================== */
export default function Examen() {

  const { id, nivel } = useParams();

  const cursoId = id;
  const nivelNumero = Number(nivel);

  const navigate = useNavigate();

  const {
    recargarProgreso,
    actualizarNivelesAprobados
  } = useContext(ProgresoContext);


  /* ======================================================
     STATES
  ====================================================== */

  const [examen, setExamen] = useState({ preguntas: [] });

  const [respuestas, setRespuestas] = useState({});

  const [resultado, setResultado] = useState(null);

  const [cargando, setCargando] = useState(true);

  const [enviando, setEnviando] = useState(false);

  const [error, setError] = useState("");

  const [bloqueado, setBloqueado] = useState(false);


  /* ======================================================
     CARGAR EXAMEN
  ====================================================== */

  const cargarExamen = async () => {

    try {

      setCargando(true);
      setError("");
      setBloqueado(false);
      setResultado(null);
      setRespuestas({});


      /* VALIDAR ACCESO */
      const acceso = await puedeAccederNivel({
        cursoId,
        nivel: nivelNumero
      });

      if (!acceso?.ok || acceso.puedeAcceder !== true) {

        setBloqueado(true);

        setError(
          acceso?.reason ||
          "No tienes acceso a este nivel aún."
        );

        return;
      }


      /* OBTENER EXAMEN */
      const res = await apiYesems.get(
        `/examen/${cursoId}/nivel/${nivelNumero}`
      );


      if (!res?.data?.ok || !res.data.preguntas?.length) {

        setError("No se encontraron preguntas.");
        return;

      }


      /* SHUFFLE */
      setExamen({
        ...res.data,
        preguntas: shuffleArray(res.data.preguntas)
      });

    }
    catch (err) {

      console.error(err);

      setError("Error al conectar con el servidor.");

      notify("error", "Error al cargar la evaluación.");

    }
    finally {

      setCargando(false);

    }

  };


  useEffect(() => {

    cargarExamen();

  }, [cursoId, nivelNumero]);


  /* ======================================================
     SELECCIONAR RESPUESTA
  ====================================================== */

  const seleccionarRespuesta = (preguntaId, opcionIndex) => {

    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: opcionIndex
    }));

  };


  /* ======================================================
     ENVIAR EXAMEN
  ====================================================== */

  const enviarExamen = async () => {

    const respuestasArray =
      examen.preguntas.map(p => ({
        preguntaId: p.id,
        respuesta: respuestas[p.id]
      }));


    /* VALIDAR */
    if (respuestasArray.some(r => r.respuesta === undefined)) {

      notify(
        "warning",
        "Responde todas las preguntas antes de finalizar."
      );

      return;
    }


    try {

      setEnviando(true);


      const res = await enviarExamenNivel({

        cursoId,
        nivel: nivelNumero,
        respuestas: respuestasArray

      });


      setResultado(res);


      if (res.aprobado) {

        notify(
          "success",
          `¡Aprobado con ${res.porcentaje}%!`
        );

        actualizarNivelesAprobados(
          cursoId,
          nivelNumero
        );

      }
      else {

        notify(
          "error",
          `Puntaje insuficiente (${res.porcentaje}%).`
        );

      }


      await recargarProgreso();

    }
    catch (err) {

      console.error(err);

      notify(
        "error",
        "Error al enviar el examen."
      );

    }
    finally {

      setEnviando(false);

    }

  };


  /* ======================================================
     LOADING
  ====================================================== */

  if (cargando)
    return (

      <div className="examen-loading-full">

        <div className="spinner-yes"></div>

        <p>Preparando evaluación...</p>

      </div>

    );


  /* ======================================================
     BLOQUEADO
  ====================================================== */

  if (bloqueado)
    return (

      <div className="examen-screen-msg">

        <TopBar />

        <div className="msg-card locked">

          <AlertCircle size={60} />

          <h2>Acceso restringido</h2>

          <p>{error}</p>

          <button
            className="btn-yes primary"
            onClick={() =>
              navigate(`/curso/${cursoId}`)
            }
          >
            Volver
          </button>

        </div>

      </div>

    );


  /* ======================================================
     RESULTADO
  ====================================================== */

  if (resultado)
    return (

      <div className="examen-screen-msg">

        <TopBar />

        <div
          className={`msg-card result ${
            resultado.aprobado
              ? "success"
              : "fail"
          }`}
        >

          {
            resultado.aprobado
              ? <CheckCircle size={80} />
              : <XCircle size={80} />
          }

          <h1>
            {
              resultado.aprobado
                ? "¡Excelente!"
                : "No aprobado"
            }
          </h1>

          <div className="score-badge">
            {resultado.porcentaje}%
          </div>

          <div className="result-actions">

            {
              resultado.aprobado
                ? (

                  <button
                    className="btn-yes success"
                    onClick={() =>
                      navigate(
                        resultado.cursoFinalizado
                          ? "/perfil"
                          : `/curso/${cursoId}`
                      )
                    }
                  >

                    Continuar
                    <ArrowRight size={18} />

                  </button>

                )
                : (

                  <button
                    className="btn-yes retry"
                    onClick={cargarExamen}
                  >

                    <RotateCcw size={18} />
                    Intentar de nuevo

                  </button>

                )
            }

          </div>

        </div>

      </div>

    );


  /* ======================================================
     UI PRINCIPAL
  ====================================================== */

  return (

    <div className="examen-layout">

      <TopBar />

      <div className="examen-content">

        <header className="examen-header-main">

          <div className="header-info">

            <ClipboardCheck size={32} />

            <div>

              <h1>
                Evaluación Nivel {nivelNumero}
              </h1>

              <p>
                Selecciona la respuesta correcta.
              </p>

            </div>

          </div>

        </header>


        <div className="preguntas-list">

          {
            examen.preguntas.map(
              (pregunta, idx) => (

                <div
                  key={pregunta.id}
                  className="pregunta-card-student"
                >

                  <div className="pregunta-header">

                    <span className="q-number">
                      {idx + 1}
                    </span>

                    <h3>
                      {pregunta.pregunta}
                    </h3>

                  </div>


                  <div className="opciones-grid-student">

                    {
                      pregunta.opciones.map(
                        (opcion, i) => (

                          <div
                            key={i}
                            className={`opcion-choice ${
                              respuestas[pregunta.id] === i
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              seleccionarRespuesta(
                                pregunta.id,
                                i
                              )
                            }
                          >

                            {opcion}

                          </div>

                        )
                      )
                    }

                  </div>

                </div>

              )
            )
          }

        </div>


        <footer className="examen-footer-action">

          <button
            className="btn-finish-exam"
            onClick={enviarExamen}
            disabled={enviando}
          >

            {
              enviando
                ? "Enviando..."
                : (
                  <>
                    <Send size={18} />
                    Finalizar evaluación
                  </>
                )
            }

          </button>

        </footer>

      </div>

    </div>

  );

}
