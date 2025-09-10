import { useState, useMemo, useCallback } from "react";
import { useDebounce } from "../utils/performance.js";

// Hook optimizado para búsquedas en grandes datasets
export const useOptimizedSearch = (data, searchFields, options = {}) => {
  const {
    debounceDelay = 300,
    minSearchLength = 2,
    caseSensitive = false,
    exactMatch = false,
  } = options;

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay);

  // Función de búsqueda optimizada
  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < minSearchLength) {
      return data;
    }

    const searchValue = caseSensitive
      ? debouncedSearchTerm
      : debouncedSearchTerm.toLowerCase();

    return data.filter((item) => {
      return searchFields.some((field) => {
        const fieldValue = getNestedValue(item, field);
        if (!fieldValue) return false;

        const stringValue = caseSensitive
          ? String(fieldValue)
          : String(fieldValue).toLowerCase();

        return exactMatch
          ? stringValue === searchValue
          : stringValue.includes(searchValue);
      });
    });
  }, [
    data,
    debouncedSearchTerm,
    searchFields,
    caseSensitive,
    exactMatch,
    minSearchLength,
  ]);

  // Función para obtener valores anidados (ej: "user.profile.name")
  const getNestedValue = useCallback((obj, path) => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }, []);

  // Función para limpiar búsqueda
  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  // Función para establecer búsqueda
  const handleSearchChange = useCallback((event) => {
    const value = event.target.value;
    setSearchTerm(value);
  }, []);

  return {
    searchTerm,
    debouncedSearchTerm,
    filteredData,
    setSearchTerm,
    clearSearch,
    handleSearchChange,
    isSearching: searchTerm !== debouncedSearchTerm,
    hasResults: filteredData.length > 0,
    resultCount: filteredData.length,
  };
};

// Hook para filtros múltiples optimizado
export const useOptimizedFilters = (data, filterConfig = {}) => {
  const [filters, setFilters] = useState({});

  const filteredData = useMemo(() => {
    if (Object.keys(filters).length === 0) return data;

    return data.filter((item) => {
      return Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue || filterValue === "all") return true;

        const config = filterConfig[key];
        const itemValue = getNestedValue(item, key);

        if (config?.type === "array") {
          return Array.isArray(itemValue) && itemValue.includes(filterValue);
        }

        if (config?.type === "range") {
          const numValue = Number(itemValue);
          return numValue >= filterValue.min && numValue <= filterValue.max;
        }

        return itemValue === filterValue;
      });
    });
  }, [data, filters, filterConfig]);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilter = useCallback((key) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
  }, []);

  const getNestedValue = useCallback((obj, path) => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }, []);

  return {
    filters,
    filteredData,
    setFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters: Object.keys(filters).length > 0,
    activeFilterCount: Object.keys(filters).length,
  };
};

// Hook para sorting optimizado
export const useOptimizedSort = (data, defaultSort = null) => {
  const [sortConfig, setSortConfig] = useState(defaultSort);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const { key, direction } = sortConfig;

    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, key);
      const bValue = getNestedValue(b, key);

      // Manejo de valores null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return direction === "asc" ? -1 : 1;
      if (bValue == null) return direction === "asc" ? 1 : -1;

      // Comparación de números
      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Comparación de strings
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();

      if (aString < bString) return direction === "asc" ? -1 : 1;
      if (aString > bString) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = useCallback((key) => {
    setSortConfig((prevConfig) => {
      if (prevConfig?.key === key) {
        // Cambiar dirección si es la misma columna
        return {
          key,
          direction: prevConfig.direction === "asc" ? "desc" : "asc",
        };
      }
      // Nueva columna, empezar con ascendente
      return { key, direction: "asc" };
    });
  }, []);

  const clearSort = useCallback(() => {
    setSortConfig(null);
  }, []);

  const getNestedValue = useCallback((obj, path) => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }, []);

  return {
    sortedData,
    sortConfig,
    handleSort,
    clearSort,
    isSorted: sortConfig !== null,
  };
};

// Hook combinado para búsqueda, filtros y ordenamiento
export const useOptimizedDataTable = (data, config = {}) => {
  const {
    searchFields = [],
    filterConfig = {},
    defaultSort = null,
    searchOptions = {},
  } = config;

  // Búsqueda
  const {
    searchTerm,
    debouncedSearchTerm,
    filteredData: searchedData,
    setSearchTerm,
    clearSearch,
    handleSearchChange,
    isSearching,
  } = useOptimizedSearch(data, searchFields, searchOptions);

  // Filtros
  const {
    filters,
    filteredData: filteredAndSearchedData,
    setFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
  } = useOptimizedFilters(searchedData, filterConfig);

  // Ordenamiento
  const {
    sortedData: finalData,
    sortConfig,
    handleSort,
    clearSort,
    isSorted,
  } = useOptimizedSort(filteredAndSearchedData, defaultSort);

  // Función para resetear todo
  const resetAll = useCallback(() => {
    clearSearch();
    clearAllFilters();
    clearSort();
  }, [clearSearch, clearAllFilters, clearSort]);

  return {
    // Datos finales
    data: finalData,

    // Búsqueda
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
    clearSearch,
    handleSearchChange,
    isSearching,

    // Filtros
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,

    // Ordenamiento
    sortConfig,
    handleSort,
    clearSort,
    isSorted,

    // Utilidades
    resetAll,
    totalCount: data.length,
    filteredCount: finalData.length,
    hasFiltersOrSearch: hasActiveFilters || searchTerm.length > 0,
  };
};
