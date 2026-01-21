// src/servicios/usuarioAdminService.js
import apiYesems from "../api/apiYesems";

/**
 * 👥 Obtener todos los usuarios (solo admin)
 * GET /api/usuario
 */
export const obtenerUsuarios = async() => {
    const res = await apiYesems.get("/usuario");
    return res.data.usuarios; // Array de usuarios
};

/**
 * 👤 Obtener un usuario por ID
 * GET /api/usuario/:id
 */
export const obtenerUsuarioPorId = async(id) => {
    const res = await apiYesems.get(`/usuario/${id}`);
    return res.data.usuario;
};

/**
 * ✏️ Actualizar usuario por ID
 * PUT /api/usuario/:id
 */
export const actualizarUsuario = async(id, datos) => {
    const res = await apiYesems.put(`/usuario/${id}`, datos);
    return res.data.usuario;
};