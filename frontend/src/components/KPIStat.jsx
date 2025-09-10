import React from 'react';
import { Box, Typography } from '@mui/material';
import theme from '../theme.js';
import icons from '../icons.js';

const KPIStat = ({ iconName, label, value }) => {
  const IconComponent = icons[iconName];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {IconComponent && (
        <IconComponent sx={{ fontSize: 24, color: theme.colors.textPrimary }} />
      )}
      <Box>
        <Typography sx={{ fontSize: theme.fontSizes.kpiValue, fontWeight: 600 }}>
          {value}
        </Typography>
        <Typography
          sx={{ fontSize: theme.fontSizes.kpiLabel, color: theme.colors.textSecondary }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

export default KPIStat;
