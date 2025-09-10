import React, { createContext, useState, useEffect } from "react";
import apiClient from "../services/api"; // Usamos nuestro cliente API centralizado

// 1. Creamos el contexto
const AuthContext = createContext();

// 2. Creamos el proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 3. Al cargar, verificamos si hay un usuario en localStorage
  useEffect(() => {
    async function initUser() {
      try {
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
          const parsedUser = JSON.parse(userInfo);
          // Verificar que el usuario tiene las propiedades necesarias
          if (
            parsedUser &&
            typeof parsedUser === "object" &&
            parsedUser.token
          ) {
            setUser(parsedUser);

            // Intentar sincronizar con el backend en segundo plano
            try {
              const response = await apiClient.get("/auth/me");
              if (response.data && response.data._id) {
                // Solo actualizar si hay diferencias significativas
                const backendUser = {
                  ...response.data,
                  token: parsedUser.token,
                };
                if (
                  JSON.stringify(parsedUser) !== JSON.stringify(backendUser)
                ) {
                  setUser(backendUser);
                  localStorage.setItem("userInfo", JSON.stringify(backendUser));
                  window.dispatchEvent(
                    new CustomEvent("userUpdated", { detail: backendUser }),
                  );
                }
              }
            } catch (error) {
              // Si falla la sincronización, mantener el usuario de localStorage
            }

            setLoading(false);
            return;
          } else {
            // Si los datos están corruptos, limpiar localStorage
            localStorage.removeItem("userInfo");
          }
        }

        // Si no hay usuario en localStorage, no hacer peticiones al backend
        // El usuario debe hacer login explícitamente
        setUser(null);
      } catch (error) {
        // Limpiar datos corruptos
        setUser(null);
        localStorage.removeItem("userInfo");
      } finally {
        setLoading(false);
      }
    }
    initUser();
  }, []);

  // 4. Escuchar actualizaciones del usuario
  useEffect(() => {
    const handleUserUpdate = (event) => {
      const updatedUser = event.detail;
      setUser(updatedUser);
      // Asegurar que localStorage también se actualice
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
    };

    window.addEventListener("userUpdated", handleUserUpdate);
    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, []);

  // 5. Función para actualizar usuario
  const updateUser = (updatedUserData) => {
    if (!user) {
      return null;
    }

    const newUserData = { ...user, ...updatedUserData };
    setUser(newUserData);
    localStorage.setItem("userInfo", JSON.stringify(newUserData));

    return newUserData;
  };

  // 5. Función de Login (solo maneja estado, no navegación)
  const login = async (username, password) => {
    try {
      const { data } = await apiClient.post("/auth/login", {
        username,
        password,
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      let msg = "Error al iniciar sesión";
      if (error.response) {
        if (
          error.response.status === 401 &&
          error.response.data &&
          error.response.data.message
        ) {
          msg = error.response.data.message;
        } else if (error.response.data && error.response.data.message) {
          msg = error.response.data.message;
        }
      } else if (error.message) {
        msg = error.message;
      }
      // Evitar que el error se propague como excepción no controlada
      return Promise.reject(msg);
    }
  };

  // 6. Función de Logout
  const logout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    // La navegación debe hacerse en el componente, no aquí
  };

  // 7. Proveemos el estado y las funciones a los componentes hijos
  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

export default AuthContext;
