import apiYesems from "../api/apiYesems";

/**
 * 🔹 Obtener TODOS mis progresos
 * Backend: GET /api/progreso
 * ⚠️ Backend devuelve ARRAY DIRECTO
 */
export const obtenerProgresoUsuario = async() => {
    try {
        const res = await apiYesems.get("/progreso");

        if (Array.isArray(res.data)) {
            return {
                ok: true,
                data: res.data,
            };
        }

        return {
            ok: true,
            data: [],
        };
    } catch (error) {
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

        return {
            ok: true,
            alreadyValidated: res.data.alreadyValidated === true,
            data: res.data,
        };
    } catch (error) {
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