import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, Button, Avatar } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TuneIcon from '@mui/icons-material/Tune';
import DescriptionIcon from '@mui/icons-material/Description';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { useTheme } from '../context/ThemeContext.jsx';

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
            title: 'Gestión de Secretarías',
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
            title: 'Auditoría',
            description: 'Consulta el historial de acciones y registros de auditoría.',
            icon: HistoryEduIcon,
            link: '/admin/auditoria',
            color: '#ff1744', // Rojo intenso
            bgColor: isDarkMode ? 'rgba(255, 23, 68, 0.1)' : 'rgba(255, 23, 68, 0.05)',
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
                Accede rápidamente a la gestión de usuarios, carga de archivos y dependencias desde un solo lugar.
            </Typography>
            
            <Grid container spacing={4} justifyContent="center">
                {adminCards.map((card, index) => {
                    const IconComponent = card.icon;
                    return (
                        <Grid item xs={12} sm={6} md={4} lg={4} key={index}>
                            <Card 
                                sx={{ 
                                    height: 320,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: isDarkMode
                                        ? 'rgba(45, 55, 72, 0.8)'
                                        : 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(20px)',
                                    border: isDarkMode
                                        ? '1px solid rgba(255, 255, 255, 0.1)'
                                        : '1px solid rgba(0, 0, 0, 0.1)',
                                    borderRadius: 3,
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: isDarkMode
                                            ? `0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 12px ${card.color}40`
                                            : `0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px ${card.color}30`,
                                        background: card.bgColor,
                                    }
                                }}
                                component={Link}
                                to={card.link}
                                style={{ textDecoration: 'none' }}
                            >
                                <CardContent sx={{ 
                                    textAlign: 'center', 
                                    p: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    height: '100%',
                                }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                        <Avatar
                                            sx={{
                                                width: 70,
                                                height: 70,
                                                mb: 2,
                                                background: `linear-gradient(135deg, ${card.color}, ${card.color}dd)`,
                                                boxShadow: `0 8px 25px ${card.color}40`,
                                            }}
                                        >
                                            <IconComponent sx={{ fontSize: 35, color: 'white' }} />
                                        </Avatar>
                                        
                                        <Typography 
                                            variant="h6" 
                                            sx={{
                                                fontWeight: 600,
                                                mb: 1.5,
                                                color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                                                fontSize: '1.1rem',
                                                textAlign: 'center',
                                                lineHeight: 1.3,
                                            }}
                                        >
                                            {card.title}
                                        </Typography>
                                        
                                        <Typography 
                                            variant="body2" 
                                            sx={{
                                                color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                                                lineHeight: 1.5,
                                                textAlign: 'center',
                                                fontSize: '0.9rem',
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            {card.description}
                                        </Typography>
                                    </Box>
                                    
                                    <Button 
                                        variant="contained"
                                        sx={{
                                            background: `linear-gradient(45deg, ${card.color}, ${card.color}dd)`,
                                            color: 'white',
                                            fontWeight: 600,
                                            px: 3,
                                            py: 1,
                                            borderRadius: 2,
                                            boxShadow: `0 4px 15px ${card.color}40`,
                                            mt: 2,
                                            '&:hover': {
                                                background: `linear-gradient(45deg, ${card.color}dd, ${card.color}bb)`,
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 6px 20px ${card.color}50`,
                                            },
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        Acceder
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

export default AdminPage;
