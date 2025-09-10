import React from 'react';
import { Card, CardContent, Box, Typography, Icon } from '@mui/material';
import theme from '../theme.js';

const DashboardCard = ({ title, icon, action, isDarkMode, children }) => {
  const colors = isDarkMode ? theme.dark : theme.light;
  return (
    <Card
      sx={{
        background: isDarkMode ? 'rgba(45,55,72,0.8)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        border: isDarkMode
          ? '1px solid rgba(255,255,255,0.1)'
          : '1px solid rgba(0,0,0,0.08)',
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {(title || action) && (
          <Box className="flex items-center justify-between gap-3" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              {icon && <Icon sx={{ color: colors.button.border }}>{icon}</Icon>}
              {title && (
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: isDarkMode
                      ? 'rgba(255,255,255,0.9)'
                      : 'rgba(0,0,0,0.8)',
                  }}
                >
                  {title}
                </Typography>
              )}
            </Box>
            {action}
          </Box>
        )}
        {children}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
