import React from 'react';
import { Card, CardContent, Icon, Box } from '@mui/material';
import { useTheme } from '../context/ThemeContext.jsx';

interface Props {
  icon?: string;
  children: React.ReactNode;
}

const DashboardCard: React.FC<Props> = ({ icon, children }) => {
  const { isDarkMode } = useTheme();
  return (
    <Card
      sx={{
        height: '100%',
        background: isDarkMode ? 'rgba(45,55,72,0.8)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        border: isDarkMode
          ? '1px solid rgba(255,255,255,0.1)'
          : '1px solid rgba(0,0,0,0.08)',
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: 3, height: '100%' }}>
        {icon && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Icon color="primary">{icon}</Icon>
          </Box>
        )}
        {children}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
