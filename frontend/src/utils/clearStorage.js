// Script para limpiar localStorage y resolver problemas de datos corruptos
export const clearLocalStorage = () => {
  try {
    // Limpiar todos los datos del localStorage
    localStorage.clear();
    console.log("LocalStorage limpiado exitosamente");
    return true;
  } catch (error) {
    console.error("Error al limpiar localStorage:", error);
    return false;
  }
};

export const clearUserData = () => {
  try {
    // Limpiar solo datos del usuario
    localStorage.removeItem("userInfo");
    localStorage.removeItem("theme-mode");
    localStorage.removeItem("accessibility-settings");
    console.log("Datos de usuario limpiados exitosamente");
    return true;
  } catch (error) {
    console.error("Error al limpiar datos de usuario:", error);
    return false;
  }
};

export const checkLocalStorageHealth = () => {
  try {
    const keys = Object.keys(localStorage);
    const health = {
      totalKeys: keys.length,
      corruptedKeys: [],
      healthy: true,
    };

    keys.forEach((key) => {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          // Intentar parsear si es JSON
          if (value.startsWith("{") || value.startsWith("[")) {
            JSON.parse(value);
          }
        }
      } catch (error) {
        health.corruptedKeys.push(key);
        health.healthy = false;
      }
    });

    return health;
  } catch (error) {
    console.error("Error al verificar salud del localStorage:", error);
    return { healthy: false, error: error.message };
  }
};
