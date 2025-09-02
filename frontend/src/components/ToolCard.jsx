import React from 'react';
import { Card, CardContent, Typography, Avatar, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';

const ToolCard = ({ title, description, icon: Icon, route }) => {
  const { isDarkMode } = useTheme();
  return (
    <Card
      component={Link}
      to={route}
      sx={{
        height: 260,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textDecoration: 'none',
        p: 2,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        background: isDarkMode ? 'rgba(45,55,72,0.4)' : 'rgba(255,255,255,0.8)',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: isDarkMode
            ? '0 8px 24px rgba(0,0,0,0.4)'
            : '0 8px 24px rgba(0,0,0,0.15)'
        }
      }}
    >
      <CardContent sx={{ textAlign: 'center', flex: 1 }}>
        <Avatar sx={{ mb: 2, bgcolor: 'primary.main' }}>
          <Icon />
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {description}
        </Typography>
        <Button variant="contained" sx={{ mt: 'auto' }}>
          Abrir
        </Button>
      </CardContent>
    </Card>
  );
};

export default React.memo(ToolCard);
