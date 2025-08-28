import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TuneIcon from '@mui/icons-material/Tune';
import DescriptionIcon from '@mui/icons-material/Description';
import FunctionsIcon from '@mui/icons-material/Functions';
import { useTheme } from '../context/ThemeContext.jsx';
import AdminCard from '../components/AdminCard.jsx';

const AdminPage = () => {
  const { isDarkMode } = useTheme();

  const adminCards = [
    {
      title: 'Gestión de Usuarios',
      description: 'Crea, edita y elimina usuarios del sistema.',
      icon: PeopleIcon,
      link: '/admin/users',
      color: '#2196f3', // Azul
      bgColor: isDarkMode ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.05)',
    },
    {
      title: 'Carga de Archivos Excel',
      description: 'Sube archivos de dotación y actualiza los datos del sistema.',
      icon: CloudUploadIcon,
      link: '/admin/upload',
      color: '#ff9800', // Naranja
      bgColor: isDarkMode ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.05)',
    },
    {
      title: 'Gestión de Secretarias',
      description: 'Administra las dependencias jerárquicas del organigrama.',
      icon: AccountTreeIcon,
      link: '/admin/secretarias',
      color: '#4caf50', // Verde
      bgColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)',
    },
    {
      title: 'Gestión de Variables',
      description: 'Define, edita y elimina variables de referencia y sus umbrales.',
      icon: TuneIcon,
      link: '/admin/variables',
      color: '#9c27b0', // Púrpura
      bgColor: isDarkMode ? 'rgba(156, 39, 176, 0.1)' : 'rgba(156, 39, 176, 0.05)',
    },
    {
      title: 'Gestión de Plantillas',
      description: 'Administra y edita plantillas de importación de Excel.',
      icon: DescriptionIcon,
      link: '/admin/plantillas',
      color: '#00bcd4', // Cyan
      bgColor: isDarkMode ? 'rgba(0, 188, 212, 0.1)' : 'rgba(0, 188, 212, 0.05)',
    },
    {
      title: 'Centro de Funciones',
      description: 'Administra las funciones usadas en los gráficos del dashboard.',
      icon: FunctionsIcon,
      link: '/admin/funciones',
      color: '#673ab7',
      bgColor: isDarkMode ? 'rgba(103, 58, 183, 0.1)' : 'rgba(103, 58, 183, 0.05)',
    },
  ];

  return (
    <Box
      sx={{
        maxWidth: 1000,
        mx: 'auto',
        p: 4,
        background: isDarkMode
          ? 'linear-gradient(135deg, rgba(45, 55, 72, 0.3) 0%, rgba(26, 32, 44, 0.3) 100%)'
          : 'linear-gradient(135deg, rgba(240, 249, 240, 0.3) 0%, rgba(227, 242, 253, 0.3) 100%)',
        borderRadius: 3,
        minHeight: '80vh',
      }}
    >
      <Typography
        variant="h3"
        gutterBottom
        align="center"
        sx={{
          fontWeight: 700,
          mb: 2,
          color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
        }}
      >
        Panel de Administración
      </Typography>
      <Typography
        variant="h6"
        align="center"
        sx={{
          mb: 5,
          color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
          fontWeight: 400,
        }}
      >
        Accede rápidamente a la gestión de usuarios, archivos, secretarias, variables y plantillas desde un solo lugar.
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {adminCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} lg={4} key={index}>
            <AdminCard {...card} isDarkMode={isDarkMode} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminPage;

