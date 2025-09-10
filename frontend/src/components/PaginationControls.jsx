import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import theme from '../theme.js';

const PaginationControls = ({ page, totalPages, onPrev, onNext }) => {
  const { colors, borderRadius } = theme;
  const buttonStyles = {
    borderColor: colors.border,
    color: colors.primary,
    borderRadius,
    '&:hover': {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}20`,
    },
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
      <Button variant="outlined" onClick={onPrev} disabled={page <= 1} sx={buttonStyles}>
        Anterior
      </Button>
      <Typography variant="body2">
        Página {page} de {totalPages}
      </Typography>
      <Button variant="outlined" onClick={onNext} disabled={page >= totalPages} sx={buttonStyles}>
        Siguiente
      </Button>
    </Box>
  );
};

export default PaginationControls;
