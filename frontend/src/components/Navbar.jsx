import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import NotificationBell from './NotificationBell.jsx';
import ProfileMenu from './ProfileMenu.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/organigrama');
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: isDarkMode
          ? 'linear-gradient(135deg, rgba(45, 55, 72, 0.95) 0%, rgba(26, 32, 44, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        boxShadow: isDarkMode
          ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'
          : '0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)',
        borderBottom: isDarkMode
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(0, 0, 0, 0.08)',
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 3 }}>
        {/* Logo a la izquierda - clickeable */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            onClick={handleLogoClick}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              p: 1,
              borderRadius: 2,
              '&:hover': {
                transform: 'scale(1.05)',
                background: isDarkMode 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(76, 175, 80, 0.05)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <img 
              src="/logo-navbar.png" 
              alt="Logo Análisis de dotación municipal" 
              style={{
                height: '45px',
                width: 'auto',
                objectFit: 'contain',
                filter: isDarkMode ? 'brightness(1.1)' : 'brightness(0.9)',
              }}
            />
          </Box>
        </Box>

        {/* Menú de navegación a la derecha */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 0.5, sm: 1 },
          flexWrap: 'wrap',
        }}>
          {/* Botón Inicio (Organigrama) */}
          {user && (
            <Button 
              component={Link} 
              to="/organigrama"
              startIcon={<HomeIcon />}
              sx={{ 
                color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '0.9rem',
                background: isDarkMode 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(255, 255, 255, 0.7)',
                border: isDarkMode
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  background: isDarkMode 
                    ? 'rgba(76, 175, 80, 0.2)' 
                    : 'rgba(76, 175, 80, 0.15)',
                  color: isDarkMode ? '#81c784' : '#2e7d32',
                  transform: 'translateY(-2px)',
                  boxShadow: isDarkMode
                    ? '0 6px 20px rgba(76, 175, 80, 0.3)'
                    : '0 6px 20px rgba(76, 175, 80, 0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Inicio
            </Button>
          )}
          
          {/* Botón Dashboard - Planta y Contratos */}
          {user && (
            <Button
              component={Link}
              to="/dashboard"
              startIcon={<DashboardIcon />}
              sx={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '0.9rem',
                background: isDarkMode
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(255, 255, 255, 0.7)',
                border: isDarkMode
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  background: isDarkMode
                    ? 'rgba(33, 150, 243, 0.2)'
                    : 'rgba(33, 150, 243, 0.15)',
                  color: isDarkMode ? '#64b5f6' : '#1976d2',
                  transform: 'translateY(-2px)',
                  boxShadow: isDarkMode
                    ? '0 6px 20px rgba(33, 150, 243, 0.3)'
                    : '0 6px 20px rgba(33, 150, 243, 0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Dashboard - Planta y Contratos
            </Button>
          )}
          
          {/* Botón Dashboard - Neikes y Becas */}

              Dashboard - Neikes y Becas
            </Button>
          )}

          {/* Botón Herramientas */}
          {user && (
            <Button
              component={Link}
              to="/"
              startIcon={<DashboardCustomizeIcon />}
              sx={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '0.9rem',
                background: isDarkMode
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(255, 255, 255, 0.7)',
                border: isDarkMode
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  background: isDarkMode
                    ? 'rgba(76, 175, 80, 0.2)'
                    : 'rgba(76, 175, 80, 0.15)',
                  color: isDarkMode ? '#81c784' : '#388e3c',
                  transform: 'translateY(-2px)',
                  boxShadow: isDarkMode
                    ? '0 6px 20px rgba(76, 175, 80, 0.3)'
                    : '0 6px 20px rgba(76, 175, 80, 0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Herramientas
            </Button>
          )}
          
          {/* Botón Panel de administración (solo admin) */}
          {user && user.role === 'admin' && (
            <Button 
              component={Link} 
              to="/admin"
              startIcon={<AdminPanelSettingsIcon />}
              sx={{ 
                color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '0.9rem',
                background: isDarkMode 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(255, 255, 255, 0.7)',
                border: isDarkMode
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  background: isDarkMode 
                    ? 'rgba(156, 39, 176, 0.2)' 
                    : 'rgba(156, 39, 176, 0.15)',
                  color: isDarkMode ? '#ba68c8' : '#7b1fa2',
                  transform: 'translateY(-2px)',
                  boxShadow: isDarkMode
                    ? '0 6px 20px rgba(156, 39, 176, 0.3)'
                    : '0 6px 20px rgba(156, 39, 176, 0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Panel de Administración
            </Button>
          )}

          
          {user ? (
            <>
              {/* Información del usuario */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5, 
                mx: 2,
                px: 2,
                py: 1,
                borderRadius: 3,
                background: isDarkMode 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(255, 255, 255, 0.7)',
                border: isDarkMode
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 0, 0, 0.08)',
              }}>
                <Avatar sx={{ 
                  width: 32, 
                  height: 32,
                  background: user.role === 'admin' 
                    ? 'linear-gradient(135deg, #ff9800, #f57c00)'
                    : 'linear-gradient(135deg, #2196f3, #1976d2)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}>
                  {user.role === 'admin' ? <AdminPanelSettingsIcon sx={{ fontSize: 18 }} /> : <PersonIcon sx={{ fontSize: 18 }} />}
                </Avatar>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography 
                    variant="body2"
                    sx={{ 
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {user.username}
                  </Typography>
                  <Chip 
                    label={user.role === 'admin' ? 'Administrador' : 'Usuario'}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      background: user.role === 'admin' 
                        ? 'linear-gradient(135deg, #ff9800, #f57c00)'
                        : 'linear-gradient(135deg, #2196f3, #1976d2)',
                      color: 'white',
                      '& .MuiChip-label': {
                        px: 1,
                      }
                    }}
                  />
                </Box>
              </Box>

              <ProfileMenu />

              <NotificationBell />

              <ThemeToggle />
              
              <Button 
                onClick={logout}
                startIcon={<LogoutIcon />}
                sx={{ 
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  background: isDarkMode 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(255, 255, 255, 0.7)',
                  border: isDarkMode
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(0, 0, 0, 0.08)',
                  '&:hover': {
                    background: isDarkMode 
                      ? 'rgba(244, 67, 54, 0.2)' 
                      : 'rgba(244, 67, 54, 0.15)',
                    color: isDarkMode ? '#ef5350' : '#d32f2f',
                    transform: 'translateY(-2px)',
                    boxShadow: isDarkMode
                      ? '0 6px 20px rgba(244, 67, 54, 0.3)'
                      : '0 6px 20px rgba(244, 67, 54, 0.2)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Salir
              </Button>
            </>
          ) : (
            null
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
