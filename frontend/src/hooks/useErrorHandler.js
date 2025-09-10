import { useCallback } from 'react';

export const useErrorHandler = () => {
  const handleError = useCallback((error, context = 'Unknown') => {
    // Ignorar errores de extensiones del navegador
    if (error?.message?.includes('message channel closed') ||
        error?.message?.includes('Extension context invalidated') ||
        error?.message?.includes('listener indicated an asynchronous response')) {
      console.warn(`Browser extension error in ${context} (safe to ignore):`, error.message);
      return false; // Indica que el error fue manejado y debe ser ignorado
    }

    // Ignorar errores de cancelación de requests
    if (error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') {
      console.warn(`Request cancelled in ${context}:`, error.message);
      return false;
    }

    // Log errores reales
    console.error(`Error in ${context}:`, error);
    return true; // Indica que es un error real que debe ser manejado
  }, []);

  const safeAsync = useCallback(async (asyncFn, context = 'Async operation') => {
    try {
      return await asyncFn();
    } catch (error) {
      const shouldHandle = handleError(error, context);
      if (shouldHandle) {
        throw error; // Re-throw si es un error real
      }
      return null; // Retorna null para errores ignorados
    }
  }, [handleError]);

  return { handleError, safeAsync };
};

export default useErrorHandler;