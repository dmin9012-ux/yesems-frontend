import React, { useEffect, useState } from "react";
import "./ExamenStyle.css";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerExamenNivel, enviarExamenNivel } from "../../api/apiYesems";
import { notify } from "../../Util/toast";

const Examen = () => {

    const { cursoId, nivelId } = useParams();
    const navigate = useNavigate();

    const [preguntas, setPreguntas] = useState([]);
    const [respuestas, setRespuestas] = useState({});
    const [loading, setLoading] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [resultado, setResultado] = useState(null);


    /* ========================================
       CARGAR EXAMEN
    ======================================== */

    useEffect(() => {

        const cargarExamen = async () => {

            try {

                setLoading(true);

                const data = await obtenerExamenNivel(cursoId, nivelId);

                if (!data || !data.preguntas) {
                    throw new Error("No hay preguntas disponibles");
                }

                const preguntasMezcladas = [...data.preguntas].sort(
                    () => Math.random() - 0.5
                );

                setPreguntas(preguntasMezcladas);

            } catch (error) {

                notify("error", "No puedes acceder a este examen");
                navigate("/principal");

            } finally {

                setLoading(false);

            }

        };

        cargarExamen();

    }, [cursoId, nivelId, navigate]);


    /* ========================================
       SELECCIONAR RESPUESTA
    ======================================== */

    const seleccionarRespuesta = (preguntaId, opcionIndex) => {

        setRespuestas((prev) => ({
            ...prev,
            [preguntaId]: opcionIndex
        }));

    };


    /* ========================================
       ENVIAR EXAMEN
    ======================================== */

    const finalizarExamen = async () => {

        if (Object.keys(respuestas).length !== preguntas.length) {

            notify("error", "Responde todas las preguntas");
            return;

        }

        try {

            setEnviando(true);

            const resultado = await enviarExamenNivel(
                cursoId,
                nivelId,
                respuestas
            );

            setResultado(resultado);

            if (resultado.aprobado) {

                notify("success", "¡Examen aprobado!");

            } else {

                notify("error", "No aprobaste. Intenta nuevamente.");

            }

        } catch (error) {

            notify("error", "Error al enviar examen");

        } finally {

            setEnviando(false);

        }

    };


    /* ========================================
       LOADING
    ======================================== */

    if (loading) {

        return (
            <div className="examen-layout">
                <div className="examen-loading">
                    Cargando examen...
                </div>
            </div>
        );

    }


    /* ========================================
       RESULTADO
    ======================================== */

    if (resultado) {

        return (

            <div className="examen-layout">

                <div className="examen-content">

                    <div className="resultado-box">

                        <h2>
                            {resultado.aprobado
                                ? "🎉 Examen aprobado"
                                : "❌ Examen no aprobado"}
                        </h2>

                        <p>
                            Puntaje: {resultado.correctas} / {resultado.total}
                        </p>

                        <button
                            className="btn-finish-exam"
                            onClick={() => navigate(`/curso/${cursoId}`)}
                        >
                            Volver al curso
                        </button>

                    </div>

                </div>

            </div>

        );

    }


    /* ========================================
       UI PRINCIPAL
    ======================================== */

    return (

        <div className="examen-layout">

            <div className="examen-content">

                <div className="header-info">

                    <h1>Examen Nivel {nivelId}</h1>

                    <p>
                        Responde todas las preguntas correctamente para avanzar
                    </p>

                </div>


                {preguntas.map((pregunta, index) => (

                    <div
                        key={pregunta.id}
                        className="pregunta-card-student"
                    >

                        <div className="pregunta-title">
                            {index + 1}. {pregunta.pregunta}
                        </div>

                        <div className="opciones-container">

                            {pregunta.opciones.map((opcion, opcionIndex) => (

                                <div
                                    key={opcionIndex}
                                    className={`opcion-choice ${
                                        respuestas[pregunta.id] === opcionIndex
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        seleccionarRespuesta(
                                            pregunta.id,
                                            opcionIndex
                                        )
                                    }
                                >
                                    {opcion}
                                </div>

                            ))}

                        </div>

                    </div>

                ))}


                <div className="examen-footer-action">

                    <button
                        className="btn-finish-exam"
                        onClick={finalizarExamen}
                        disabled={enviando}
                    >
                        {enviando
                            ? "Enviando..."
                            : "Finalizar examen"}
                    </button>

                </div>

            </div>

        </div>

    );

};

export default Examen;
