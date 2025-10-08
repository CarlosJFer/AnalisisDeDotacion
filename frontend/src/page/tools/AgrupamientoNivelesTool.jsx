import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import icons from "../../ui/icons.js";
import AdminCard from "../../components/AdminCard.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

const AgrupamientoNivelesTool = () => {
  const { isDarkMode } = useTheme();

  const cards = [
    {
      title: "Carga de Archivos Excel",
      description:
        "Sube archivos para actualizar solo los datos de Agrupamiento y Niveles.",
      icon: icons.subir,
      link: "/tools/agrupamiento-niveles/upload",
      color: "#ff9800",
      bgColor: isDarkMode
        ? "rgba(255, 152, 0, 0.1)"
        : "rgba(255, 152, 0, 0.05)",
    },
    {
      title: "Ver Agrupamientos y Niveles",
      description: "Consulta agrupamientos y niveles registrados.",
      icon: icons.capas,
      link: "/tools/agrupamiento-niveles/ver",
      color: "#cc2b5e",
      bgColor: isDarkMode
        ? "rgba(204, 43, 94, 0.1)"
        : "rgba(204, 43, 94, 0.05)",
    },
  ];

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ fontWeight: 700 }}
      >
        Agrupamiento y Niveles
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} lg={4} key={index}>
            <AdminCard {...card} isDarkMode={isDarkMode} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AgrupamientoNivelesTool;
