// Utilidades de optimización de rendimiento

import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { Box } from "@mui/material";

// Hook para debouncing - evita re-renders excesivos en búsquedas
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook para throttling - limita la frecuencia de ejecución
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    },
    [callback, delay],
  );
};

// Hook para intersection observer - lazy loading de componentes
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  }, [options]);

  return [targetRef, isIntersecting];
};

// Función para optimizar estilos CSS pesados
export const optimizedStyles = {
  // Reemplaza backdrop-filter por alternativas más ligeras cuando sea necesario
  glassmorphism: (isDarkMode, intensity = "normal") => {
    const baseStyle = {
      background: isDarkMode
        ? "rgba(45, 55, 72, 0.8)"
        : "rgba(255, 255, 255, 0.9)",
      border: isDarkMode
        ? "1px solid rgba(255, 255, 255, 0.1)"
        : "1px solid rgba(0, 0, 0, 0.1)",
      borderRadius: 3,
    };

    // Solo aplicar blur en elementos visibles y cuando sea necesario
    if (intensity === "high") {
      return {
        ...baseStyle,
        backdropFilter: "blur(20px)",
        boxShadow: isDarkMode
          ? "0 8px 32px rgba(0, 0, 0, 0.3)"
          : "0 8px 32px rgba(0, 0, 0, 0.1)",
      };
    }

    return {
      ...baseStyle,
      boxShadow: isDarkMode
        ? "0 4px 12px rgba(0, 0, 0, 0.2)"
        : "0 4px 12px rgba(0, 0, 0, 0.05)",
    };
  },

  // Botones optimizados
  modernButton: (isDarkMode, color = "primary") => ({
    fontWeight: 600,
    px: 3,
    py: 1.5,
    borderRadius: 2,
    textTransform: "none",
    transition: "transform 0.2s ease, box-shadow 0.2s ease", // Reducido de 0.3s a 0.2s
    "&:hover": {
      transform: "translateY(-1px)", // Reducido de -2px a -1px
    },
  }),

  // Avatares optimizados
  modernAvatar: (size = 32, gradient = "primary") => ({
    width: size,
    height: size,
    background: getGradient(gradient),
    // Removemos box-shadow para mejor rendimiento en listas grandes
  }),
};

// Gradientes pre-calculados para mejor rendimiento
const gradients = {
  primary: "linear-gradient(135deg, #4caf50, #388e3c)",
  secondary: "linear-gradient(135deg, #2196f3, #1976d2)",
  warning: "linear-gradient(135deg, #ff9800, #f57c00)",
  error: "linear-gradient(135deg, #f44336, #d32f2f)",
  purple: "linear-gradient(135deg, #9c27b0, #7b1fa2)",
};

export const getGradient = (type) => gradients[type] || gradients.primary;

// Función para chunking de datos grandes
export const chunkArray = (array, chunkSize = 50) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

// Hook para paginación virtual
export const useVirtualPagination = (data, itemsPerPage = 50) => {
  const [currentPage, setCurrentPage] = useState(0);

  const paginatedData = useMemo(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  }, [data, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  return {
    paginatedData,
    currentPage,
    setCurrentPage,
    totalPages,
    hasNextPage: currentPage < totalPages - 1,
    hasPrevPage: currentPage > 0,
  };
};

// Componente de loading optimizado
export const OptimizedSkeleton = ({
  width = "100%",
  height = 40,
  count = 1,
}) => (
  <Box>
    {Array.from({ length: count }).map((_, index) => (
      <Box
        key={index}
        sx={{
          width,
          height,
          bgcolor: "rgba(0, 0, 0, 0.1)",
          borderRadius: 1,
          mb: 1,
          animation: "pulse 1.5s ease-in-out infinite",
          "@keyframes pulse": {
            "0%": { opacity: 1 },
            "50%": { opacity: 0.5 },
            "100%": { opacity: 1 },
          },
        }}
      />
    ))}
  </Box>
);
