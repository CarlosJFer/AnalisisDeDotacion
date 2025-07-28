import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import apiClient from '../services/api';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import Badge from '@mui/material/Badge';
import { useNotifications } from '../context/NotificationContext.jsx';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';

const Navbar = () => {
  const [secretarias, setSecretarias] = useState([]);
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useTheme();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleMarkAll = () => {
    markAllAsRead();
    handleClose();
  };

  const handleLogoClick = () => {
    navigate('/organigrama');
  };

  useEffect(() => {
    const fetchSecretarias = async () => {
      try {
        const { data } = await apiClient.get('/analytics/secretarias');
        setSecretarias(data);
      } catch (error) {
        console.error('Error al cargar las secretarías:', error);
        setSecretarias([]);
      }
    };
    if (user) {
      fetchSecretarias();
    } else {
      setSecretarias([]);
    }
  }, [user]);

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
          
          {/* Botón Dashboard */}
          {user && (
            <Button 
              component={Link} 
              to={user.role === 'admin' ? '/dashboard/default' : '/dashboard/default'}
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
              Dashboard
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
              Admin
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
              
              {/* Campanita de notificaciones */}
              <Tooltip 
                title={unreadCount > 0 ? `Tienes ${unreadCount} notificaciones nuevas` : 'Sin notificaciones nuevas'}
                arrow
              >
                <IconButton 
                  onClick={handleOpen}
                  sx={{ 
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                    background: isDarkMode 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(255, 255, 255, 0.7)',
                    border: isDarkMode
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(0, 0, 0, 0.08)',
                    '&:hover': {
                      background: isDarkMode 
                        ? 'rgba(255, 152, 0, 0.2)' 
                        : 'rgba(255, 152, 0, 0.15)',
                      color: isDarkMode ? '#ffb74d' : '#f57c00',
                      transform: 'scale(1.1)',
                      boxShadow: isDarkMode
                        ? '0 6px 20px rgba(255, 152, 0, 0.3)'
                        : '0 6px 20px rgba(255, 152, 0, 0.2)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Badge 
                    badgeContent={unreadCount} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }
                    }}
                  >
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <Menu 
                anchorEl={anchorEl} 
                open={open} 
                onClose={handleClose} 
                PaperProps={{ 
                  sx: { 
                    minWidth: 350,
                    background: isDarkMode
                      ? 'rgba(45, 55, 72, 0.95)'
                      : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: isDarkMode
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: 3,
                    boxShadow: isDarkMode
                      ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                      : '0 8px 32px rgba(0, 0, 0, 0.15)',
                  } 
                }}
              >
                <MenuItem disabled divider sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Notificaciones
                    </Typography>
                    {unreadCount > 0 && (
                      <Button 
                        size="small" 
                        onClick={handleMarkAll}
                        sx={{
                          background: 'linear-gradient(135deg, #4caf50, #388e3c)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #388e3c, #2e7d32)',
                          }
                        }}
                      >
                        Marcar todas como leídas
                      </Button>
                    )}
                  </Box>
                </MenuItem>
                {notifications.length === 0 && (
                  <MenuItem disabled sx={{ py: 2, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      No tienes notificaciones
                    </Typography>
                  </MenuItem>
                )}
                {notifications.slice(0, 5).map((n) => (
                  <MenuItem 
                    key={n.id} 
                    onClick={() => { markAsRead(n.id); handleClose(); }} 
                    selected={!n.read} 
                    sx={{ 
                      whiteSpace: 'normal', 
                      fontWeight: n.read ? 'normal' : 'bold',
                      py: 2,
                      borderRadius: 2,
                      mx: 1,
                      mb: 0.5,
                      '&:hover': {
                        background: isDarkMode 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.05)',
                      }
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {n.title || 'Notificación'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                        {n.message}
                      </Typography>
                      {!n.read && (
                        <Chip 
                          label="Nueva" 
                          size="small" 
                          sx={{ 
                            mt: 0.5,
                            height: 16,
                            fontSize: '0.6rem',
                            background: 'linear-gradient(135deg, #2196f3, #1976d2)',
                            color: 'white',
                            fontWeight: 600,
                          }} 
                        />
                      )}
                    </Box>
                  </MenuItem>
                ))}
                {notifications.length > 5 && (
                  <MenuItem disabled sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Ver más en el panel de notificaciones
                    </Typography>
                  </MenuItem>
                )}
              </Menu>
              
              {/* Selector de tema */}
              <Tooltip 
                title={isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                arrow
              >
                <IconButton 
                  onClick={toggleTheme}
                  sx={{ 
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                    background: isDarkMode 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(255, 255, 255, 0.7)',
                    border: isDarkMode
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(0, 0, 0, 0.08)',
                    '&:hover': {
                      background: isDarkMode 
                        ? 'rgba(255, 193, 7, 0.2)' 
                        : 'rgba(255, 193, 7, 0.15)',
                      color: isDarkMode ? '#ffc107' : '#f57c00',
                      transform: 'scale(1.1)',
                      boxShadow: isDarkMode
                        ? '0 6px 20px rgba(255, 193, 7, 0.3)'
                        : '0 6px 20px rgba(255, 193, 7, 0.2)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
              
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