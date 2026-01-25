// servicios/examenService.js
import apiYesems from "../api/apiYesems";

/* =====================================================
   📥 OBTENER EXAMEN DE UN NIVEL
   GET /api/examen/:cursoId/nivel/:nivel
===================================================== */
export const obtenerExamenNivel = async({ cursoId, nivel }) => {
    try {
        const res = await apiYesems.get(
            "/examen/" + cursoId + "/nivel/" + nivel
        );

        return {
            ok: true,
            cursoId: res.data.cursoId,
            nivel: res.data.nivel,
            preguntas: Array.isArray(res.data.preguntas) ?
                res.data.preguntas :
                [],
        };
    } catch (error) {
        console.error("❌ Error obtenerExamenNivel:", error);

        let message = "Error al obtener el examen";

        if (
            error &&
            error.response &&
            error.response.data &&
            error.response.data.message
        ) {
            message = error.response.data.message;
        }

        return {
            ok: false,
            preguntas: [],
            message,
        };
    }
};

/* =====================================================
   📤 ENVIAR RESPUESTAS DEL EXAMEN
   POST /api/examen/:cursoId/nivel/:nivel
===================================================== */
export const enviarExamenNivel = async({
    cursoId,
    nivel,
    respuestas,
}) => {
    try {
        const res = await apiYesems.post(
            "/examen/" + cursoId + "/nivel/" + nivel, { respuestas }
        );

        return {
            ok: true,
            aprobado: res.data.aprobado,
            porcentaje: res.data.porcentaje,
            minimoAprobacion: res.data.minimoAprobacion,
            cursoFinalizado: res.data.cursoFinalizado,
        };
    } catch (error) {
        console.error("❌ Error enviarExamenNivel:", error);

        let message = "Error al enviar el examen";

        if (
            error &&
            error.response &&
            error.response.data &&
            error.response.data.message
        ) {
            message = error.response.data.message;
        }

        return {
            ok: false,
            aprobado: false,
            porcentaje: 0,
            cursoFinalizado: false,
            message,
        };
    }
};

/* =====================================================
   🔒 VERIFICAR SI PUEDE ACCEDER A UN NIVEL
   GET /api/examen/:cursoId/nivel/:nivel/puede-acceder
===================================================== */
export const puedeAccederNivel = async({ cursoId, nivel }) => {
    try {
        const res = await apiYesems.get(
            "/examen/" + cursoId + "/nivel/" + nivel + "/puede-acceder"
        );

        return {
            ok: true,
            puedeAcceder: res.data.puedeAcceder,
            cursoFinalizado: res.data.cursoFinalizado,
        };
    } catch (error) {
        console.error("❌ Error puedeAccederNivel:", error);

        let message = "Error al verificar acceso al nivel";

        if (
            error &&
            error.response &&
            error.response.data &&
            error.response.data.message
        ) {
            message = error.response.data.message;
        }

        return {
            ok: false,
            puedeAcceder: false,
            cursoFinalizado: false,
            message,
        };
    }
};