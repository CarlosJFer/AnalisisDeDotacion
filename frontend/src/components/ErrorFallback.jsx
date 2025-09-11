import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import icons from "../ui/icons.js";

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const handleReportError = () => {
    // Aquí se podría enviar el error a un servicio de logging
    console.error("Error reportado en", pathname, error);

    // Ejemplo de reporte automático
    const errorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: pathname,
    };

    // En una implementación real, esto se enviaría a un servicio como Sentry
    localStorage.setItem("last-error-report", JSON.stringify(errorReport));

    alert("Error reportado. Nuestro equipo será notificado.");
  };

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 600, width: "100%" }}>
        <CardContent sx={{ textAlign: "center", p: 4 }}>
          <icons.error sx={{ fontSize: 64, color: "error.main", mb: 2 }} />

          <Typography variant="h4" gutterBottom color="error">
            ¡Algo salió mal!
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Se ha producido un error inesperado en la aplicación. Puedes
            intentar recargar la página o volver al inicio.
          </Typography>

          <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
            <Typography variant="subtitle2" gutterBottom>
              Error: {error.message}
            </Typography>
            <Typography variant="caption" display="block">
              URL: {pathname}
            </Typography>
          </Alert>

          <Box
            sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 3 }}
          >
            <Button
              variant="contained"
              startIcon={<icons.refrescar />}
              onClick={resetErrorBoundary}
              color="primary"
            >
              Reintentar
            </Button>

            <Button
              variant="outlined"
              startIcon={<icons.inicio />}
              onClick={handleGoHome}
            >
              Ir al Inicio
            </Button>

            <Button
              variant="text"
              startIcon={<icons.bug />}
              onClick={handleReportError}
              color="error"
            >
              Reportar Error
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Accordion sx={{ textAlign: "left" }}>
            <AccordionSummary expandIcon={<icons.expandir />}>
              <Typography variant="subtitle2">Detalles técnicos</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                variant="body2"
                component="pre"
                sx={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                  bgcolor: "grey.100",
                  p: 2,
                  borderRadius: 1,
                  maxHeight: 200,
                  overflow: "auto",
                }}
              >
                {error.stack}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, display: "block" }}
          >
            Si el problema persiste, contacta al administrador del sistema.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ErrorFallback;
