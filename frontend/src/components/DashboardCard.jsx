import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import icons from '../icons.js';
import { COLORS, RADII, SHADOWS } from '../theme.js';

const DashboardCard = React.memo(({ title, icon, children, isDarkMode }) => {
  const IconComponent = icons[icon];

  return (
    <Card
      sx={{
        height: '100%',
        background: isDarkMode ? COLORS.darkBackground : COLORS.lightBackground,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${isDarkMode ? COLORS.darkBorder : COLORS.lightBorder}`,
        borderRadius: RADII.card,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: isDarkMode ? SHADOWS.dark : SHADOWS.light,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {IconComponent && (
            <IconComponent
              sx={{
                fontSize: 32,
                mr: 1.5,
                color: isDarkMode ? COLORS.darkText : COLORS.lightText,
              }}
            />
          )}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: isDarkMode ? COLORS.darkText : COLORS.lightText,
            }}
          >
            {title}
          </Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );
});

export default DashboardCard;
