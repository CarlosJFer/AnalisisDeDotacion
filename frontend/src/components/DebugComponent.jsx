import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Alert, Paper } from "@mui/material";
import {
  checkLocalStorageHealth,
  clearLocalStorage,
  clearUserData,
} from "../utils/clearStorage";

const DebugComponent = () => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const health = checkLocalStorageHealth();
      setDebugInfo(health);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const handleClearAll = () => {
    try {
      clearLocalStorage();
      const updatedInfo = checkLocalStorageHealth();
      setDebugInfo(updatedInfo);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClearUserData = () => {
    try {
      clearUserData();
      const updatedInfo = checkLocalStorageHealth();
      setDebugInfo(updatedInfo);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          <Typography variant="h6">Error de Depuración</Typography>
          <Typography>{error}</Typography>
        </Alert>
      </Box>
    );
  }

  if (!debugInfo) {
    return (
      <Box p={3}>
        <Typography>Cargando información de depuración...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Panel de Depuración
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Estado del LocalStorage
        </Typography>

        <Typography>Total de claves: {debugInfo.totalKeys}</Typography>

        <Typography color={debugInfo.healthy ? "success.main" : "error.main"}>
          Estado: {debugInfo.healthy ? "Saludable" : "Problemas detectados"}
        </Typography>

        {debugInfo.corruptedKeys.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Claves corruptas:</Typography>
            <ul>
              {debugInfo.corruptedKeys.map((key) => (
                <li key={key}>{key}</li>
              ))}
            </ul>
          </Alert>
        )}
      </Paper>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          color="warning"
          onClick={handleClearUserData}
        >
          Limpiar Datos de Usuario
        </Button>

        <Button variant="contained" color="error" onClick={handleClearAll}>
          Limpiar Todo el LocalStorage
        </Button>
      </Box>
    </Box>
  );
};

export default DebugComponent;
