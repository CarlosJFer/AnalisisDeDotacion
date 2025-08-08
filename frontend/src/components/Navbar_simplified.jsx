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
import NotificationBell from './NotificationBell.jsx';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import SettingsIcon from '@mui/icons-material/Settings';
import EmailIcon from '@mui/icons-material/Email';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

// Componente de notificación mejorado
const EnhancedAlert = ({ severity, children, sx = {} }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <Alert 
      severity={severity} 
      sx={{ 
        mb: 2,
        '& .MuiAlert-message': {
          fontWeight: 600,
          fontSize: '1rem',
          lineHeight: 1.4
        },
        '& .MuiAlert-icon': {
          fontSize: '1.4rem'
        },
        '&.MuiAlert-standardSuccess': {
          backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.1)',
          border: `1px solid ${isDarkMode ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.2)'}`,
        },
        '&.MuiAlert-standardError': {
          backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.15)' : 'rgba(244, 67, 54, 0.1)',
          border: `1px solid ${isDarkMode ? 'rgba(244, 67, 54, 0.3)' : 'rgba(244, 67, 54, 0.2)'}`,
        },
        ...sx
      }}
    >
      {children}
    </Alert>
  );
};

const Navbar = () => {
  const [secretarias, setSecretarias] = useState([]);
  const { user, logout, updateUser } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useTheme();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);
  const [adminMenuAnchorEl, setAdminMenuAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);
  const isAdminMenuOpen = Boolean(adminMenuAnchorEl);
  const isProfileOpen = Boolean(profileAnchorEl);

  // Estados para el perfil (solo email)
  const [email, setEmail] = useState(user?.email || '');
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled ?? true);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Estados para Snackbar (notificaciones persistentes)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

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

  const handleAdminMenuOpen = (event) => {
    setAdminMenuAnchorEl(event.currentTarget);
  };

  const handleAdminMenuClose = () => {
    setAdminMenuAnchorEl(null);
  };

  const handleProfileOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleDialogClose = () => {
    setShowEmailDialog(false);
    setNewEmail('');
    setProfileError('');
    setProfileSuccess('');
  };

  const handleLogoClick = () => {
    navigate('/organigrama');
  };

  // Función para mostrar notificación persistente
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Funciones para el perfil
  const handleEmailChange = async () => {
    try {
      setProfileError('');
      setProfileSuccess('');
      
      if (!newEmail.trim()) {
        setProfileError('El correo electrónico no puede estar vacío');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        setProfileError('Formato de correo electrónico inválido');
        return;
      }

      const response = await apiClient.put('/auth/update-email', { newEmail: newEmail.trim() });
      
      // Actualizar el estado local con el correo devuelto por el servidor
      const updatedEmail = response.data.email;
      setEmail(updatedEmail);
      setNewEmail('');
      setShowEmailDialog(false);
      
      // Actualizar el usuario en el contexto
      updateUser({ email: updatedEmail });
      
      // Mostrar notificación persistente
      showSnackbar('Correo electrónico actualizado correctamente');
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar el correo electrónico';
      setProfileError(errorMessage);
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleEmailDelete = async () => {
    try {
      setProfileError('');
      setProfileSuccess('');
      
      await apiClient.delete('/auth/delete-email');
      setEmail('');
      
      // Actualizar el usuario en el contexto
      updateUser({ email: '' });
      
      // Mostrar notificación persistente
      showSnackbar('Correo electrónico eliminado correctamente');
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar el correo electrónico';
      setProfileError(errorMessage);
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleNotificationsToggle = async () => {
    try {
      const newValue = !notificationsEnabled;
      
      const response = await apiClient.put('/auth/update-notifications', { 
        notificationsEnabled: newValue 
      });
      
      // Actualizar estados locales
      setNotificationsEnabled(newValue);
      
      // Actualizar el usuario en el contexto
      updateUser({ notificationsEnabled: newValue });
      
      // Mostrar notificación persistente
      showSnackbar('Preferencias de notificaciones actualizadas');
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar las preferencias de notificaciones';
      showSnackbar(errorMessage, 'error');
    }
  };

  // Actualizar estados cuando cambie el usuario
  useEffect(() => {
    if (user && user.token) {
      // Usar los datos del usuario directamente, sin hacer peticiones adicionales
      const userEmail = user.email || '';
      const userNotifications = user.notificationsEnabled ?? true;
      setEmail(userEmail);
      setNotificationsEnabled(userNotifications);
    } else {
      setEmail('');
      setNotificationsEnabled(true);
    }
  }, [user]); // Ejecutar cuando cambie el usuario


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
          
          {/* Botón Dashboard */}
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

              {/* Botón de Perfil */}
              <Tooltip title="Configuración de Perfil" arrow>
                <IconButton 
                  onClick={handleProfileOpen}
                  aria-label="Configuración"
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
                        ? 'rgba(76, 175, 80, 0.2)' 
                        : 'rgba(76, 175, 80, 0.15)',
                      color: isDarkMode ? '#81c784' : '#2e7d32',
                      transform: 'scale(1.1)',
                      boxShadow: isDarkMode
                        ? '0 6px 20px rgba(76, 175, 80, 0.3)'
                        : '0 6px 20px rgba(76, 175, 80, 0.2)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              
              {/* Campanita de notificaciones mejorada */}
              <NotificationBell />
              
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

      {/* Menú de Perfil Simplificado */}
      <Menu
        anchorEl={profileAnchorEl}
        open={isProfileOpen}
        onClose={handleProfileClose}
        disableRestoreFocus
        disableAutoFocus
        disableEnforceFocus
        keepMounted={false}
        PaperProps={{
          sx: {
            background: isDarkMode
              ? 'rgba(45, 55, 72, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: isDarkMode
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: 3,
            boxShadow: isDarkMode
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            minWidth: 320,
            mt: 1,
          }
        }}
      >
        {/* Header del perfil */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              width: 48, 
              height: 48,
              background: user?.role === 'admin' 
                ? 'linear-gradient(135deg, #ff9800, #f57c00)'
                : 'linear-gradient(135deg, #2196f3, #1976d2)',
            }}>
              {user?.role === 'admin' ? <AdminPanelSettingsIcon /> : <PersonIcon />}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)' }}>
                {user?.username}
              </Typography>
              <Typography variant="body2" sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}>
                {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Opciones del perfil simplificadas */}
        <Box sx={{ p: 1 }}>
          {/* Correo electrónico (solo para usuarios) */}
          {user?.role !== 'admin' && (
            <MenuItem 
              onClick={() => setShowEmailDialog(true)}
              sx={{ 
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
              <EmailIcon sx={{ mr: 2, color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)' }}>
                  Correo Electrónico
                </Typography>
                <Typography variant="caption" sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)' }}>
                  {email || 'No configurado'}
                </Typography>
              </Box>
            </MenuItem>
          )}

          <Divider sx={{ my: 1, borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)' }} />

          {/* Notificaciones */}
          <Box 
            sx={{ 
              borderRadius: 2,
              mx: 1,
              px: 2,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              '&:hover': {
                background: isDarkMode 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(0, 0, 0, 0.05)',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <NotificationsIcon sx={{ mr: 2, color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)' }}>
                  Notificaciones de Dashboard
                </Typography>
                <Typography variant="caption" sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)' }}>
                  Recibir notificaciones al cargar nuevos datos
                </Typography>
              </Box>
            </Box>
            <Checkbox
              checked={notificationsEnabled}
              onChange={handleNotificationsToggle}
              disableRipple
              disableFocusRipple
              sx={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                '&.Mui-checked': {
                  color: isDarkMode ? '#81c784' : '#2e7d32',
                },
                '&:focus': {
                  outline: 'none',
                },
                p: 1,
              }}
            />
          </Box>
        </Box>
      </Menu>

      {/* Snackbar para notificaciones persistentes */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ 
            width: '100%',
            fontWeight: 600,
            '& .MuiAlert-message': {
              fontSize: '1rem',
            }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Diálogo para correo electrónico */}
      <Dialog 
        open={showEmailDialog} 
        onClose={handleDialogClose}
        PaperProps={{
          sx: {
            background: isDarkMode
              ? 'rgba(45, 55, 72, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: isDarkMode
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)' }}>
          {email ? 'Editar Correo Electrónico' : 'Agregar Correo Electrónico'}
        </DialogTitle>
        <DialogContent>
          {profileError && (
            <EnhancedAlert severity="error">
              {profileError}
            </EnhancedAlert>
          )}
          {profileSuccess && (
            <EnhancedAlert severity="success">
              {profileSuccess}
            </EnhancedAlert>
          )}
          <TextField
            id="email-field"
            name="email"
            autoFocus
            margin="dense"
            label="Correo Electrónico"
            type="email"
            fullWidth
            variant="outlined"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                '& fieldset': {
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: isDarkMode ? '#81c784' : '#2e7d32',
                },
              },
              '& .MuiInputLabel-root': {
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          {email && (
            <Button 
              onClick={handleEmailDelete}
              color="error"
              variant="outlined"
              sx={{ 
                borderColor: isDarkMode ? 'rgba(244, 67, 54, 0.5)' : 'rgba(244, 67, 54, 0.5)',
                color: isDarkMode ? '#ef5350' : '#d32f2f',
                '&:hover': {
                  borderColor: isDarkMode ? '#ef5350' : '#d32f2f',
                  background: isDarkMode ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                },
              }}
            >
              Eliminar
            </Button>
          )}
          <Button 
            onClick={handleDialogClose}
            sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleEmailChange}
            variant="contained"
            sx={{ 
              background: isDarkMode ? '#81c784' : '#2e7d32',
              '&:hover': {
                background: isDarkMode ? '#66bb6a' : '#1b5e20',
              },
            }}
          >
            {email ? 'Actualizar' : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Navbar;