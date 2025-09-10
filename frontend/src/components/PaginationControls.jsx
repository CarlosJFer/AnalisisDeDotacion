import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import theme from '../theme.js';

const PaginationControls = ({ page, totalPages, onChange, isDarkMode }) => {
  const colors = isDarkMode ? theme.dark : theme.light;
  const handlePrev = () => onChange(p => Math.max(0, p - 1));
  const handleNext = () => onChange(p => Math.min(totalPages - 1, p + 1));

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
      <Button
        variant="outlined"
        size="small"
        onClick={handlePrev}
        disabled={page === 0}
        sx={{
          borderColor: colors.button.border,
          color: colors.button.color,
          '&:hover': {
            borderColor: colors.button.border,
            backgroundColor: colors.button.hoverBg,
          },
        }}
      >
        ← Anterior
      </Button>
      <Typography variant="body2" sx={{ alignSelf: 'center' }}>
        Página {page + 1} de {totalPages}
      </Typography>
      <Button
        variant="outlined"
        size="small"
        onClick={handleNext}
        disabled={page === totalPages - 1}
        sx={{
          borderColor: colors.button.border,
          color: colors.button.color,
          '&:hover': {
            borderColor: colors.button.border,
            backgroundColor: colors.button.hoverBg,
          },
        }}
      >
        Siguiente →
      </Button>
    </Box>
  );
};

export default PaginationControls;
