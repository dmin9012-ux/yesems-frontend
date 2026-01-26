import apiYesems from "../api/apiYesems";

/**
 * 👤 Obtener mi perfil básico (Nombre, correo, etc.)
 * Backend: GET /api/usuario/perfil/me
 */
export const obtenerMiPerfil = async() => {
    try {
        const res = await apiYesems.get("/usuario/perfil/me");
        return res.data.usuario;
    } catch (error) {
        console.error("Error al obtener perfil:", error);
        throw error;
    }
};

/**
 * ✏️ Actualizar mi perfil (solo nombre)
 * Backend: PUT /api/usuario/perfil/me
 */
export const actualizarMiPerfil = async(nombre) => {
    try {
        const res = await apiYesems.put("/usuario/perfil/me", { nombre });
        return res.data.usuario;
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        throw error;
    }
};

/**
 * 📈 OBTENER PROGRESOS REALES (Lecciones y Niveles)
 * Esta es la función que corregirá el "0/6" en tu perfil.
 * Backend: GET /api/progreso/mis-progresos
 */
export const obtenerMisProgresos = async() => {
    try {
        const res = await apiYesems.get("/progreso/mis-progresos");
        // Según tu progresoController, los datos vienen en res.data.data
        return res.data.data;
    } catch (error) {
        console.error("Error al obtener los progresos del usuario:", error);
        return []; // Retornamos un array vacío para evitar que el front truene
    }
};