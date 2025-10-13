import React from "react";
import { Box, Stack, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import icons from "../../../ui/icons.js";

const ExpedientesQuickNav = ({ current = "proceso" }) => {
  const navigate = useNavigate();
  const items = [
    { key: "proceso", label: "Procesamiento", icon: <icons.refrescar />, to: "/tools/expedientes" },
    { key: "cargar", label: "Cargar", icon: <icons.agregar />, to: "/tools/expedientes/cargar" },
    { key: "cargados", label: "Cargados", icon: <icons.carpeta />, to: "/tools/expedientes/cargados" },
  ];
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1}>
        {items.map((it) => (
          <Button
            key={it.key}
            startIcon={it.icon}
            variant={current === it.key ? "contained" : "outlined"}
            size="small"
            onClick={() => navigate(it.to)}
          >
            {it.label}
          </Button>
        ))}
      </Stack>
    </Box>
  );
};

export default ExpedientesQuickNav;

