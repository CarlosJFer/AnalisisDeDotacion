import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import KPIStat from "./KPIStat.jsx";

const StatsWidget = ({ data, isDarkMode }) => {
  if (!data) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <Typography variant="body2" color="text.secondary">
          No hay datos de resumen disponibles
        </Typography>
      </Box>
    );
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatNumber = (number) =>
    new Intl.NumberFormat("es-AR").format(number);
  const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

  const stats = [
    {
      metric: "personas",
      label: "Total de Agentes",
      value: formatNumber(data.totalAgentes || 0),
      delta: data.trendAgentes,
    },
    {
      metric: "money",
      label: "Masa Salarial",
      value: formatCurrency(data.masaSalarial || 0),
      delta: data.trendMasaSalarial,
    },
    {
      metric: "porcentaje",
      label: "Sueldo Promedio",
      value: formatCurrency(data.sueldoPromedio || 0),
      delta: data.trendSueldoPromedio,
    },
    {
      metric: "eficiencia",
      label: "Índice de Eficiencia",
      value: formatPercent(data.indiceEficiencia || 0),
      delta: data.trendEficiencia,
    },
  ];

  return (
    <Box sx={{ height: "100%", p: 1 }}>
      <Grid container spacing={2} sx={{ height: "100%" }}>
        {stats.map((stat, index) => (
          <Grid item xs={6} md={3} key={index} sx={{ height: "50%" }}>
            <KPIStat {...stat} isDarkMode={isDarkMode} />
          </Grid>
        ))}
      </Grid>
      {data.ultimaActualizacion && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            Última actualización:{" "}
            {new Date(data.ultimaActualizacion).toLocaleString("es-AR")}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default StatsWidget;
