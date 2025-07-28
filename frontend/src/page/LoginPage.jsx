// ARCHIVO: src/pages/LoginPage.jsx - Rediseño Institucional

import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Card, CardContent, Typography, CircularProgress, Alert, Box, IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../context/ThemeContext.jsx';
import MunicipalLogo from '../components/MunicipalLogo.jsx';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/organigrama'); // Redirige al organigrama tras login
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDarkMode
        ? 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)'
        : 'linear-gradient(135deg, #f0f9f0 0%, #e3f2fd 30%, #f3e5f5 70%, #fce4ec 100%)',
      position: 'relative',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '20px'
    }}>
      {/* Selector de tema en la esquina superior derecha */}
      <Box sx={{ position: 'absolute', top: 24, right: 32 }}>
        <Tooltip title={isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}>
          <IconButton 
            onClick={toggleTheme}
            sx={{
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(76, 175, 80, 0.1)',
              color: isDarkMode ? '#a5d6a7' : '#43a047',
              '&:hover': {
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(76, 175, 80, 0.2)',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Logo institucional centrado */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img 
          src="/logo-nuevo.png" 
          alt="Logo Análisis de dotación municipal" 
          style={{
            width: '140px',
            height: '141px',
            objectFit: 'contain',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(43,51,66,0.25)',
            background: 'transparent',
            border: '2px solid #a5d6a7'
          }}
        />
      </Box>

      {/* Tarjeta de login */}
      <Card sx={{
        width: { xs: '100%', sm: 420 },
        maxWidth: 420,
        p: 4,
        borderRadius: 3,
        boxShadow: isDarkMode
          ? '0 8px 32px rgba(43,51,66,0.45), 0 1.5px 3px rgba(165,214,167,0.15)'
          : '0 8px 32px rgba(76,175,80,0.15), 0 1.5px 3px rgba(76,175,80,0.10)',
        background: isDarkMode
          ? 'linear-gradient(135deg, #2b3342 0%, #3a4256 100%)'
          : 'linear-gradient(135deg, #f0f9f0 0%, #e3f2fd 30%, #f3e5f5 70%, #fce4ec 100%)',
        border: isDarkMode
          ? '2px solid #a5d6a7'
          : '2px solid #43a047',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'box-shadow 0.3s',
        overflow: 'hidden',
        position: 'relative',
        marginTop: '0',
        marginBottom: '0',
        zIndex: 2,
      }}>
        {/* Subtítulo institucional */}
        <Typography 
          variant="h6" 
          align="center" 
          sx={{
            fontWeight: 400,
            mb: 4,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
            letterSpacing: '0.5px'
          }}
        >
          Análisis de dotación municipal
        </Typography>

        {/* Formulario */}
        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
          <TextField
            label="Usuario"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            fullWidth
            margin="normal"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: isDarkMode ? '#a5d6a7' : '#43a047',
                },
                '&.Mui-focused fieldset': {
                  borderColor: isDarkMode ? '#81d4fa' : '#039be5',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: isDarkMode ? '#81d4fa' : '#039be5',
              },
            }}
          />
          <TextField
            label="Contraseña"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            margin="normal"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: isDarkMode ? '#a5d6a7' : '#43a047',
                },
                '&.Mui-focused fieldset': {
                  borderColor: isDarkMode ? '#81d4fa' : '#039be5',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: isDarkMode ? '#81d4fa' : '#039be5',
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            fullWidth
            size="large"
            sx={{ 
              mt: 3, 
              mb: 2, 
              py: 1.8, 
              fontWeight: 600, 
              fontSize: 16,
              borderRadius: 2,
              background: isDarkMode
                ? 'linear-gradient(45deg, #43a047, #039be5)'
                : 'linear-gradient(45deg, #66bb6a, #29b6f6)',
              boxShadow: isDarkMode
                ? '0 4px 15px rgba(67, 160, 71, 0.3)'
                : '0 4px 15px rgba(102, 187, 106, 0.4)',
              '&:hover': {
                background: isDarkMode
                  ? 'linear-gradient(45deg, #388e3c, #0288d1)'
                  : 'linear-gradient(45deg, #4caf50, #03a9f4)',
                transform: 'translateY(-2px)',
                boxShadow: isDarkMode
                  ? '0 6px 20px rgba(67, 160, 71, 0.4)'
                  : '0 6px 20px rgba(102, 187, 106, 0.5)',
              },
              '&:disabled': {
                background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? (
              <CircularProgress 
                size={24} 
                sx={{ color: 'inherit' }} 
              />
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                borderRadius: 2,
                backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.05)',
                border: isDarkMode ? '1px solid rgba(244, 67, 54, 0.3)' : '1px solid rgba(244, 67, 54, 0.2)'
              }}
            >
              {error}
            </Alert>
          )}
        </Box>
      </Card>

      {/* Footer institucional */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography 
          variant="caption" 
          sx={{
            color: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
            fontSize: '0.75rem'
          }}
        >
          Aplicación creada por Carlos Fernandez – © 2025
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
