import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useTheme } from "../../context/ThemeContext.jsx";

const PaginationControls = ({ page, totalPages, onPrev, onNext }) => {
  const { theme } = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.light;

  const btnSx = {
    borderColor: primary,
    color: primary,
    "&:hover": {
      borderColor: primary,
      backgroundColor: secondary,
    },
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
      <Button
        variant="outlined"
        size="small"
        sx={btnSx}
        onClick={onPrev}
        disabled={page === 0}
        aria-label="Página anterior"
      >
        « Anterior
      </Button>
      <Typography variant="body2" sx={{ alignSelf: "center" }}>
        Página {page + 1} de {totalPages}
      </Typography>
      <Button
        variant="outlined"
        size="small"
        sx={btnSx}
        onClick={onNext}
        disabled={page === totalPages - 1}
        aria-label="Página siguiente"
      >
        Siguiente »
      </Button>
    </Box>
  );
};

export default PaginationControls;
