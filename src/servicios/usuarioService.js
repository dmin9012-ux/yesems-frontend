import apiYesems from "../api/apiYesems";

/**
 * 👤 Obtener mi perfil
 * Backend: GET /api/usuario/perfil/me
 */
export const obtenerMiPerfil = async() => {
    const res = await apiYesems.get("/usuario/perfil/me");
    return res.data.usuario;
};

/**
 * ✏️ Actualizar mi perfil (solo nombre)
 * Backend: PUT /api/usuario/perfil/me ✅
 */
export const actualizarMiPerfil = async(nombre) => {
    const res = await apiYesems.put("/usuario/perfil/me", { nombre });
    return res.data.usuario;
};