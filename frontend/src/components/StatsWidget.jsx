import React from "react";
import { Box, Typography } from "@mui/material";
import KPIStat from "./ui/KPIStat.jsx";
import { DashboardCard, icons } from "../ui";

const StatsWidget = ({ data, isDarkMode }) => {
  if (!data) {
    return (
      <DashboardCard
        title="Resumen general"
        icon={<icons.resumen />}
        isDarkMode={isDarkMode}
      >
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
      </DashboardCard>
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
    <DashboardCard
      title="Resumen general"
      icon={<icons.resumen />}
      isDarkMode={isDarkMode}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box
          sx={{
            flexGrow: 1,
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: 2,
          }}
        >
          {stats.map((stat, index) => (
            <KPIStat key={index} {...stat} isDarkMode={isDarkMode} />
          ))}
        </Box>
        {data.ultimaActualizacion && (
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Última actualización:{" "}
              {new Date(data.ultimaActualizacion).toLocaleString("es-AR")}
            </Typography>
          </Box>
        )}
      </Box>
    </DashboardCard>
  );
};

export default StatsWidget;
