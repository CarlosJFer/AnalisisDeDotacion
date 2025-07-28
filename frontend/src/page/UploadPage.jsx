import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useTheme } from '../context/ThemeContext.jsx';
import UploadSection from '../components/UploadSection.jsx';

const UploadPage = () => {
  const { isDarkMode } = useTheme();

  return (
    <Box 
      sx={{ 
        maxWidth: 900, 
        mx: 'auto', 
        p: 4,
        background: isDarkMode
          ? 'linear-gradient(135deg, rgba(45, 55, 72, 0.3) 0%, rgba(26, 32, 44, 0.3) 100%)'
          : 'linear-gradient(135deg, rgba(240, 249, 240, 0.3) 0%, rgba(227, 242, 253, 0.3) 100%)',
        borderRadius: 3,
        minHeight: '80vh',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Avatar sx={{ 
          width: 48, 
          height: 48, 
          background: 'linear-gradient(135deg, #ff9800, #f57c00)',
        }}>
          <CloudUploadIcon sx={{ fontSize: 24 }} />
        </Avatar>
        <Typography 
          variant="h3" 
          sx={{
            fontWeight: 700,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
          }}
        >
          Carga de Archivos Excel
        </Typography>
      </Box>
      
      <Typography 
        variant="h6" 
        align="center" 
        sx={{
          mb: 4,
          color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
          fontWeight: 400,
        }}
      >
        Sube archivos de dotación para actualizar los datos del sistema de manera rápida y eficiente.
      </Typography>

      <UploadSection />
    </Box>
  );
};

export default UploadPage;