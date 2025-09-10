// ARCHIVO: src/services/api.js

import axios from "axios";

// Navigator helper that can be injected from React components
let navigator;

export const setNavigate = (nav) => {
  navigator = nav;
};

// 1. Creamos una instancia de Axios con la URL base de nuestro backend.
const apiClient = axios.create({
  baseURL: "http://localhost:5001/api", // La base de todas tus rutas de la API
  timeout: 30000, // 30 segundos timeout
});

// 2. Usamos un interceptor para añadir el token de autenticación a cada petición.
apiClient.interceptors.request.use(
  (config) => {
    try {
      // Obtenemos la información del usuario desde localStorage
      const userInfo = localStorage.getItem("userInfo");

      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        if (parsedUser && parsedUser.token) {
          // Si existe el token, lo añadimos a la cabecera 'Authorization'
          config.headers["Authorization"] = `Bearer ${parsedUser.token}`;
        }
      }
    } catch (error) {
      console.error(
        "Error al obtener datos de usuario desde localStorage:",
        error,
      );
      // Limpiar datos corruptos
      localStorage.removeItem("userInfo");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 3. Interceptor de respuesta para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Ignorar errores de extensiones del navegador
    if (
      error.message?.includes("message channel closed") ||
      error.message?.includes("Extension context invalidated")
    ) {
      console.warn("Browser extension error (ignored):", error.message);
      return Promise.resolve({ data: null }); // Return empty response instead of error
    }

    // Manejar errores de red
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout");
    } else if (error.response?.status === 401) {
      console.warn("Unauthorized access - redirecting to login");
      localStorage.removeItem("userInfo");
      if (navigator) {
        navigator("/login", { replace: true });
      } else {
        window.location.href = "/login";
      }
    } else if (error.response?.status >= 500) {
      console.error("Server error:", error.response.status);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
