import React from 'react';
import { Card } from '@mui/material';

const GlassCard = ({ children, isDarkMode, sx = {}, ...props }) => (
  <Card
    sx={{
      height: '100%',
      background: isDarkMode
        ? 'rgba(45, 55, 72, 0.8)'
        : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      border: isDarkMode
        ? '1px solid rgba(255, 255, 255, 0.1)'
        : '1px solid rgba(0, 0, 0, 0.08)',
      borderRadius: 3,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: isDarkMode
          ? '0 12px 40px rgba(0, 0, 0, 0.4)'
          : '0 12px 40px rgba(0, 0, 0, 0.15)',
      },
      ...sx,
    }}
    {...props}
  >
    {children}
  </Card>
);

export default GlassCard;
