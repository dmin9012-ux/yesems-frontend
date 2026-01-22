// /yesems/src/servicios/authService.js
import apiYesems from "../api/apiYesems";

/**
 * 🔐 Login
 */
export const loginRequest = async(datos) => {
    try {
        const res = await apiYesems.post("/auth/login", datos);

        if (!res.data || !res.data.token || !res.data.usuario) {
            return { ok: false, message: "Respuesta inválida del servidor" };
        }

        return {
            ok: true,
            token: res.data.token,
            usuario: res.data.usuario,
            message: res.data.message || "Login exitoso",
        };
    } catch (error) {
        let message = "Error al iniciar sesión";

        if (
            error &&
            error.response &&
            error.response.data &&
            error.response.data.message
        ) {
            message = error.response.data.message;
        }

        return { ok: false, message };
    }
};

/**
 * 📝 Registro
 */
export const registerRequest = async(datos) => {
    try {
        const res = await apiYesems.post("/auth/register", datos);

        return {
            ok: true,
            message: res.data && res.data.message ?
                res.data.message :
                "Registro exitoso, revisa tu correo para verificar tu cuenta",
        };
    } catch (error) {
        let message = "Error al registrar usuario";

        if (
            error &&
            error.response &&
            error.response.data &&
            error.response.data.message
        ) {
            message = error.response.data.message;
        }

        return { ok: false, message };
    }
};

/**
 * 📧 Verificar correo
 */
export const verificarCorreoRequest = async(token) => {
    try {
        const res = await apiYesems.get("/auth/verificar/" + token);

        return {
            ok: true,
            message: res.data && res.data.message ?
                res.data.message :
                "Cuenta verificada correctamente",
        };
    } catch (error) {
        let message = "Error al verificar correo";

        if (
            error &&
            error.response &&
            error.response.data &&
            error.response.data.message
        ) {
            message = error.response.data.message;
        }

        return { ok: false, message };
    }
};

/**
 * 🔑 Forgot password
 */
export const forgotPasswordRequest = async(email) => {
    try {
        const res = await apiYesems.post("/usuario/password/forgot", { email });

        return {
            ok: true,
            message: res.data && res.data.message ?
                res.data.message :
                "Si el correo existe, se enviará un enlace",
        };
    } catch (error) {
        let message = "Error al solicitar recuperación";

        if (
            error &&
            error.response &&
            error.response.data &&
            error.response.data.message
        ) {
            message = error.response.data.message;
        }

        return { ok: false, message };
    }
};

/**
 * 🔒 Reset password
 */
export const resetPasswordRequest = async(token, password) => {
    try {
        const res = await apiYesems.post("/usuario/password/reset", {
            token,
            password,
        });

        return {
            ok: true,
            message: res.data && res.data.message ?
                res.data.message :
                "Contraseña actualizada correctamente",
        };
    } catch (error) {
        let message = "Error al restablecer contraseña";

        if (
            error &&
            error.response &&
            error.response.data &&
            error.response.data.message
        ) {
            message = error.response.data.message;
        }

        return { ok: false, message };
    }
};