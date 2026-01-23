// src/services/apiYesems.js
import axios from "axios";

// 🔗 Instancia de Axios
const apiYesems = axios.create({
    baseURL: import.meta.env.VITE_API_URL.replace(/\/$/, ""), // elimina / final si existe
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔐 Interceptor de REQUEST
// Agrega el token JWT SOLO si existe
apiYesems.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// 🚨 Interceptor de RESPONSE
// Solo propaga el error (útil para manejarlo en el login)
apiYesems.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

console.log("BASE URL Axios:",
    import.meta.env.VITE_API_URL);


export default apiYesems;