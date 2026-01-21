import axios from "axios";

const apiYesems = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔐 Interceptor: agregar token JWT correctamente
apiYesems.interceptors.request.use(
    (config) => {
        // 🚨 Ajuste: obtener token desde AuthContext o localStorage
        let token = null;

        // Si guardas todo el usuario en localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.token) {
            token = user.token;
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ❌ Interceptor de errores: solo propagar
apiYesems.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

export default apiYesems;