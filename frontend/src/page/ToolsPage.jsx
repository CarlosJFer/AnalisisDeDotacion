import React from "react";
import { Grid, Box, Typography } from "@mui/material";
import { icons } from "../ui";
import ToolCard from "../components/ToolCard.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const ToolsPage = () => {
  const { isDarkMode } = useTheme();

  const tools = [
    {
      title: "Expedientes",
      description: "Ver expedientes sin movimiento",
      icon: icons.carpeta,
      route: "/tools/expedientes",
      color: "#1d976c",
      bgColor: isDarkMode ? "rgba(29,151,108,0.1)" : "rgba(29,151,108,0.05)",
    },
    {
      title: "Agrupamiento y Niveles",
      description: "Detectar agentes en agrupamientos o niveles erróneos",
      icon: icons.capas,
      route: "/tools/agrupamiento-niveles",
      color: "#cc2b5e",
      bgColor: isDarkMode ? "rgba(204,43,94,0.1)" : "rgba(204,43,94,0.05)",
    },
    {
      title: "ABNA",
      description: "Antigüedad de Becas, Neikes y Asesores",
      icon: icons.tiempo,
      route: "/tools/abna",
      color: "#ee9ca7",
      bgColor: isDarkMode ? "rgba(238,156,167,0.1)" : "rgba(238,156,167,0.05)",
    },
    {
      title: "AID",
      description: "Asignador de ID según función",
      icon: icons.etiqueta,
      route: "/tools/aid",
      color: "#42275a",
      bgColor: isDarkMode ? "rgba(66,39,90,0.1)" : "rgba(66,39,90,0.05)",
    },
    {
      title: "Registro de resoluciones",
      description: "Seguimiento y avisos de resoluciones",
      icon: icons.descripcion,
      route: "/tools/resoluciones",
      color: "#2193b0",
      bgColor: isDarkMode ? "rgba(33,147,176,0.1)" : "rgba(33,147,176,0.05)",
    },
  ];

  return (
    <Box
      sx={{
        maxWidth: 1000,
        mx: "auto",
        p: 4,
        background: isDarkMode
          ? "linear-gradient(135deg, rgba(45, 55, 72, 0.3) 0%, rgba(26, 32, 44, 0.3) 100%)"
          : "linear-gradient(135deg, rgba(240, 249, 240, 0.3) 0%, rgba(227, 242, 253, 0.3) 100%)",
        borderRadius: 3,
        minHeight: "80vh",
      }}
    >
      <Typography
        variant="h3"
        gutterBottom
        align="center"
        sx={{
          fontWeight: 700,
          mb: 2,
          color: isDarkMode ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)",
        }}
      >
        Herramientas
      </Typography>
      <Typography
        variant="h6"
        align="center"
        sx={{
          mb: 5,
          color: isDarkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)",
          fontWeight: 400,
        }}
      >
        Accede a utilidades complementarias del sistema.
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {tools.map((tool, index) => (
          <Grid item xs={12} sm={6} md={4} lg={4} key={index}>
            <ToolCard {...tool} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ToolsPage;
