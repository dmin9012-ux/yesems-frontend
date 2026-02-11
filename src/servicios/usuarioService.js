import apiYesems from "../api/apiYesems";

/**
 * 👤 Obtener mi perfil básico y SINCRONIZAR LOCALSTORAGE
 * Backend: GET /api/usuario/perfil/me
 */
export const obtenerMiPerfil = async() => {
    try {
        const res = await apiYesems.get("/usuario/perfil/me");
        const usuarioActualizado = res.data.usuario;

        // ✅ CRUCIAL: Si recibimos el usuario, actualizamos el localStorage 
        // para que AuthContext detecte el cambio de suscripción de inmediato.
        if (usuarioActualizado) {
            localStorage.setItem("user", JSON.stringify(usuarioActualizado));
        }

        return usuarioActualizado;
    } catch (error) {
        console.error("Error al obtener perfil:", error);
        throw error;
    }
};

/**
 * ✏️ Actualizar mi perfil (solo nombre)
 */
export const actualizarMiPerfil = async(nombre) => {
    try {
        const res = await apiYesems.put("/usuario/perfil/me", { nombre });
        const usuarioActualizado = res.data.usuario;

        // ✅ También actualizamos aquí por si el usuario cambia su nombre
        if (usuarioActualizado) {
            localStorage.setItem("user", JSON.stringify(usuarioActualizado));
        }

        return usuarioActualizado;
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        throw error;
    }
};

/**
 * 📈 OBTENER PROGRESOS REALES
 */
export const obtenerMisProgresos = async() => {
    try {
        const res = await apiYesems.get("/progreso/mis-progresos");
        return res.data.data;
    } catch (error) {
        console.error("Error al obtener los progresos del usuario:", error);
        return [];
    }
};