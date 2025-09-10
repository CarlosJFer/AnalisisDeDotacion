import React from 'react';
import { CardContent, Typography, Box, Chip } from '@mui/material';
import * as Icons from '@mui/icons-material';
import GlassCard from './GlassCard.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const DashboardCard = ({ title, icon, chipLabel, children }) => {
  const { isDarkMode, theme } = useTheme();
  const IconComponent = Icons[icon.charAt(0).toUpperCase() + icon.slice(1)];
  const color = theme.palette.primary.main;

  return (
    <GlassCard isDarkMode={isDarkMode} sx={{ borderLeft: `6px solid ${color}` }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.25 }}>
          {IconComponent && <IconComponent sx={{ color }} />}
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)' }}
          >
            {title}
          </Typography>
          {chipLabel && (
            <Chip label={chipLabel} size="small" variant="outlined" sx={{ borderColor: color, color }} />
          )}
        </Box>
        {children}
      </CardContent>
    </GlassCard>
  );
};

export default DashboardCard;
