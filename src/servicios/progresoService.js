import apiYesems from "../api/apiYesems";

/**
 * 🔹 Obtener TODOS mis progresos
 * Backend: GET /api/progreso/mis-progresos ✅
 */
export const obtenerProgresoUsuario = async() => {
    try {
        // Ajustamos la ruta para que coincida con el backend
        const res = await apiYesems.get("/progreso/mis-progresos");

        // El backend responde con { ok: true, data: [...] }
        // Verificamos res.data.data porque axios mete la respuesta en 'data' 
        // y tu controlador mete el array en una propiedad 'data'
        const arrayProgresos = res.data && res.data.data ? res.data.data : [];

        return {
            ok: true,
            data: arrayProgresos,
        };
    } catch (error) {
        console.error("❌ Error en obtenerProgresoUsuario:", error);
        let message = "Error al obtener el progreso del usuario";

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
            message,
            data: [] // Retornamos array vacío para evitar errores de .map() o .find()
        };
    }
};

/**
 * 🔹 Validar lección y guardar progreso
 * Backend: POST /api/progreso/validar-leccion
 */
export const validarLeccion = async({ cursoId, leccionId }) => {
    try {
        if (!cursoId || !leccionId) {
            return {
                ok: false,
                message: "cursoId y leccionId son obligatorios",
            };
        }

        const res = await apiYesems.post("/progreso/validar-leccion", {
            cursoId,
            leccionId,
        });

        // res.data contiene el objeto que envía el controlador { ok, message, data: progreso }
        return {
            ok: true,
            alreadyValidated: res.data && res.data.alreadyValidated === true,
            data: res.data && res.data.data ? res.data.data : null,
        };
    } catch (error) {
        console.error("❌ Error en validarLeccion:", error);
        let message = "Error al guardar el progreso";

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
            message,
        };
    }
};