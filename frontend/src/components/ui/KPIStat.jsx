import React from 'react';
import { Box, Typography } from '@mui/material';
import { theme } from '../../ui';

const KPIStat = ({ icon: Icon, label, value, delta, isDarkMode }) => {
  const deltaColor =
    typeof delta === 'number'
      ? delta > 0
        ? 'success.main'
        : delta < 0
        ? 'error.main'
        : 'text.secondary'
      : 'text.secondary';

  return (
    <Box
      sx={{
        p: 2,
        height: '100%',
        borderRadius: theme.radii.md,
        background: isDarkMode
          ? 'rgba(45,55,72,0.8)'
          : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        border: isDarkMode
          ? '1px solid rgba(255,255,255,0.1)'
          : '1px solid rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      {Icon && (
        <Icon
          aria-hidden="true"
          sx={{
            fontSize: theme.typography.fontSize.xl,
            color: theme.palette.primary,
            mb: 1,
          }}
        />
      )}
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: theme.typography.fontSize.lg,
          color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)',
        }}
      >
        {value}
      </Typography>
      <Typography
        sx={{
          fontSize: theme.typography.fontSize.sm,
          color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
        }}
      >
        {label}
      </Typography>
      {typeof delta === 'number' && (
        <Typography
          sx={{
            mt: 0.5,
            fontSize: theme.typography.fontSize.xs,
            color: deltaColor,
          }}
        >
          {delta > 0 ? `+${delta.toFixed(1)}%` : `${delta.toFixed(1)}%`}
        </Typography>
      )}
    </Box>
  );
};

export default KPIStat;
