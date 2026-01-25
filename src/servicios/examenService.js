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
            preguntas: res.data.preguntas || [],
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
            siguienteNivel: res.data.siguienteNivel || null,
            cursoFinalizado: res.data.cursoFinalizado || false,
            progresoActualizado: res.data.progresoActualizado || {},
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
            siguienteNivel: null,
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
            reason: res.data.reason || null,
        };
    } catch (error) {
        console.error("❌ Error puedeAccederNivel:", error);

        let reason = "Error al verificar acceso al nivel";

        if (
            error &&
            error.response &&
            error.response.data &&
            error.response.data.message
        ) {
            reason = error.response.data.message;
        }

        return {
            ok: true,
            puedeAcceder: false,
            reason,
        };
    }
};