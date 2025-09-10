import React, { useState, useCallback, memo, useMemo } from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

// Hook optimizado para manejo de formularios
export const useOptimizedForm = (initialValues) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const updateValue = useCallback(
    (name, value) => {
      // Usar requestAnimationFrame para batching
      requestAnimationFrame(() => {
        setValues((prev) => ({ ...prev, [name]: value }));
        // Limpiar error si existe
        if (errors[name]) {
          setErrors((prev) => ({ ...prev, [name]: null }));
        }
      });
    },
    [errors],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const validate = useCallback(
    (rules) => {
      const newErrors = {};
      let isValid = true;

      Object.keys(rules).forEach((field) => {
        const rule = rules[field];
        const value = values[field];

        if (rule.required && (!value || value.toString().trim() === "")) {
          newErrors[field] = "Este campo es requerido";
          isValid = false;
        } else if (
          rule.minLength &&
          value &&
          value.toString().length < rule.minLength
        ) {
          newErrors[field] = `Mínimo ${rule.minLength} caracteres`;
          isValid = false;
        } else if (
          rule.maxLength &&
          value &&
          value.toString().length > rule.maxLength
        ) {
          newErrors[field] = `Máximo ${rule.maxLength} caracteres`;
          isValid = false;
        } else if (rule.pattern && value && !rule.pattern.test(value)) {
          newErrors[field] = rule.message || "Formato inválido";
          isValid = false;
        }
      });

      setErrors(newErrors);
      return isValid;
    },
    [values],
  );

  return { values, updateValue, reset, validate, errors };
};

// TextField optimizado con debouncing
export const OptimizedTextField = memo(
  ({ name, value = "", onChange, debounceMs = 300, ...props }) => {
    const [localValue, setLocalValue] = useState(value);
    const [timeoutId, setTimeoutId] = useState(null);

    // Sincronizar valor externo con valor local
    React.useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const handleChange = useCallback(
      (e) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        // Limpiar timeout anterior
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Crear nuevo timeout para debouncing
        const newTimeoutId = setTimeout(() => {
          onChange(name, newValue);
        }, debounceMs);

        setTimeoutId(newTimeoutId);
      },
      [name, onChange, debounceMs, timeoutId],
    );

    // Cleanup del timeout
    React.useEffect(() => {
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }, [timeoutId]);

    return (
      <TextField
        {...props}
        value={localValue ?? ""}
        onChange={handleChange}
        size="small"
      />
    );
  },
);

// Select optimizado
export const OptimizedSelect = memo(
  ({ name, value, onChange, options, label, required = false, ...props }) => {
    const handleChange = useCallback(
      (e) => {
        onChange(name, e.target.value);
      },
      [name, onChange],
    );

    const memoizedOptions = useMemo(() => options, [options]);

    return (
      <FormControl size="small" {...props}>
        <InputLabel>{label}</InputLabel>
        <Select
          value={value || ""}
          label={label}
          onChange={handleChange}
          required={required}
        >
          {memoizedOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  },
);

// Checkbox optimizado
export const OptimizedCheckbox = memo(
  ({ name, checked, onChange, label, ...props }) => {
    const handleChange = useCallback(
      (e) => {
        onChange(name, e.target.checked);
      },
      [name, onChange],
    );

    return (
      <FormControlLabel
        control={
          <Checkbox checked={checked} onChange={handleChange} {...props} />
        }
        label={label}
      />
    );
  },
);

// Componente de loading skeleton optimizado
export const OptimizedSkeleton = memo(
  ({ variant = "text", width, height, ...props }) => {
    const skeletonStyle = useMemo(
      () => ({
        backgroundColor: "rgba(0, 0, 0, 0.11)",
        borderRadius: variant === "circular" ? "50%" : "4px",
        width: width || "100%",
        height: height || (variant === "text" ? "1em" : "40px"),
        animation: "pulse 1.5s ease-in-out infinite",
        "@keyframes pulse": {
          "0%": { opacity: 1 },
          "50%": { opacity: 0.4 },
          "100%": { opacity: 1 },
        },
      }),
      [variant, width, height],
    );

    return <div style={skeletonStyle} {...props} />;
  },
);

export default {
  useOptimizedForm,
  OptimizedTextField,
  OptimizedSelect,
  OptimizedCheckbox,
  OptimizedSkeleton,
};
