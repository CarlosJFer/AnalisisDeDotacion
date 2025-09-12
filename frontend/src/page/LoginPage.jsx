// ARCHIVO: src/pages/LoginPage.jsx - Rediseño Institucional Moderno

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Box,
  IconButton,
  Tooltip,
  InputAdornment,
  Avatar,
} from "@mui/material";
import icons from "../ui/icons.js";
import { useTheme } from "../context/ThemeContext.jsx";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      navigate("/organigrama"); // Redirige al organigrama tras login
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: isDarkMode
          ? "linear-gradient(135deg, rgba(45, 55, 72, 0.95) 0%, rgba(26, 32, 44, 0.95) 100%)"
          : "linear-gradient(135deg, rgba(240, 249, 240, 0.95) 0%, rgba(227, 242, 253, 0.95) 30%, rgba(243, 229, 245, 0.95) 70%, rgba(252, 228, 236, 0.95) 100%)",
        position: "relative",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "20px",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDarkMode
            ? "radial-gradient(circle at 20% 80%, rgba(76, 175, 80, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(33, 150, 243, 0.1) 0%, transparent 50%)"
            : "radial-gradient(circle at 20% 80%, rgba(76, 175, 80, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(33, 150, 243, 0.05) 0%, transparent 50%)",
          zIndex: 1,
        },
      }}
    >
      {/* Selector de tema en la esquina superior derecha */}
      <Box sx={{ position: "absolute", top: 24, right: 32, zIndex: 10 }}>
        <Tooltip
          title={isDarkMode ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          arrow
        >
          <IconButton
            onClick={toggleTheme}
            aria-label={
              isDarkMode ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
            }
            sx={{
              background: isDarkMode
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.7)",
              border: isDarkMode
                ? "1px solid rgba(255, 255, 255, 0.1)"
                : "1px solid rgba(0, 0, 0, 0.08)",
              backdropFilter: "blur(20px)",
              color: isDarkMode ? "#ffc107" : "#f57c00",
              "&:hover": {
                background: isDarkMode
                  ? "rgba(255, 193, 7, 0.2)"
                  : "rgba(255, 193, 7, 0.15)",
                transform: "scale(1.1)",
                boxShadow: isDarkMode
                  ? "0 6px 20px rgba(255, 193, 7, 0.3)"
                  : "0 6px 20px rgba(255, 193, 7, 0.2)",
              },
              transition: "all 0.3s ease",
            }}
          >
            {isDarkMode ? (
              <icons.sol aria-hidden="true" />
            ) : (
              <icons.luna aria-hidden="true" />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Logo institucional centrado - Tamaño reducido */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 2,
          position: "relative",
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            background: isDarkMode
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(255, 255, 255, 0.7)",
            border: isDarkMode
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.08)",
            backdropFilter: "blur(20px)",
            boxShadow: isDarkMode
              ? "0 8px 32px rgba(0, 0, 0, 0.3)"
              : "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <img
            src="/logo-nuevo.png"
            alt="Logo Análisis de dotación municipal"
            style={{
              width: "100%",
              maxWidth: "400px", // Reducido de 600px a 400px
              height: "auto",
              aspectRatio: "3/1",
              objectFit: "contain",
              background: "transparent",
            }}
          />
        </Box>
      </Box>

      {/* Tarjeta de login modernizada */}
      <Card
        sx={{
          width: { xs: "100%", sm: 480 },
          maxWidth: 480,
          p: 0,
          borderRadius: 4,
          background: isDarkMode
            ? "rgba(45, 55, 72, 0.8)"
            : "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(20px)",
          border: isDarkMode
            ? "1px solid rgba(255, 255, 255, 0.1)"
            : "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow: isDarkMode
            ? "0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.2)"
            : "0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
          position: "relative",
          zIndex: 2,
        }}
      >
        <CardContent sx={{ p: 5 }}>
          {/* Header con ícono */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mb: 3,
                background: "linear-gradient(135deg, #4caf50, #388e3c)",
                boxShadow: "0 8px 25px rgba(76, 175, 80, 0.4)",
              }}
            >
              <icons.seguridad
                sx={{ fontSize: 40, color: "white" }}
                aria-hidden="true"
              />
            </Avatar>

            <Typography
              variant="h4"
              align="center"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: isDarkMode
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(0, 0, 0, 0.8)",
                letterSpacing: "0.5px",
              }}
            >
              Bienvenido
            </Typography>

            <Typography
              variant="h6"
              align="center"
              sx={{
                fontWeight: 400,
                mb: 2,
                color: isDarkMode
                  ? "rgba(255, 255, 255, 0.6)"
                  : "rgba(0, 0, 0, 0.6)",
                letterSpacing: "0.3px",
              }}
            >
              Análisis de dotación municipal
            </Typography>

            <Typography
              variant="body2"
              align="center"
              sx={{
                fontWeight: 400,
                color: isDarkMode
                  ? "rgba(255, 255, 255, 0.5)"
                  : "rgba(0, 0, 0, 0.5)",
                letterSpacing: "0.2px",
              }}
            >
              Ingresa tus credenciales para acceder al sistema
            </Typography>
          </Box>

          {/* Formulario */}
          <Box component="form" onSubmit={handleLogin} sx={{ width: "100%" }}>
            <TextField
              label="Usuario"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <icons.persona
                      sx={{
                        color: isDarkMode
                          ? "rgba(255, 255, 255, 0.6)"
                          : "rgba(0, 0, 0, 0.6)",
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  background: isDarkMode
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(10px)",
                  "& fieldset": {
                    borderColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(0, 0, 0, 0.15)",
                  },
                  "&:hover fieldset": {
                    borderColor: isDarkMode ? "#81c784" : "#4caf50",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: isDarkMode ? "#4caf50" : "#2e7d32",
                    borderWidth: 2,
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: isDarkMode ? "#4caf50" : "#2e7d32",
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <icons.candado
                      sx={{
                        color: isDarkMode
                          ? "rgba(255, 255, 255, 0.6)"
                          : "rgba(0, 0, 0, 0.6)",
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 4,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  background: isDarkMode
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(10px)",
                  "& fieldset": {
                    borderColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(0, 0, 0, 0.15)",
                  },
                  "&:hover fieldset": {
                    borderColor: isDarkMode ? "#81c784" : "#4caf50",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: isDarkMode ? "#4caf50" : "#2e7d32",
                    borderWidth: 2,
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: isDarkMode ? "#4caf50" : "#2e7d32",
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              size="large"
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <icons.login />
                )
              }
              sx={{
                py: 2,
                fontWeight: 600,
                fontSize: "1.1rem",
                borderRadius: 3,
                textTransform: "none",
                background: "linear-gradient(45deg, #4caf50, #388e3c)",
                boxShadow: "0 8px 25px rgba(76, 175, 80, 0.4)",
                "&:hover": {
                  background: "linear-gradient(45deg, #388e3c, #2e7d32)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 35px rgba(76, 175, 80, 0.5)",
                },
                "&:disabled": {
                  background: isDarkMode
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(0, 0, 0, 0.3)",
                  boxShadow: "none",
                },
                transition: "all 0.3s ease",
              }}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: 3,
                  borderRadius: 3,
                  background: isDarkMode
                    ? "rgba(244, 67, 54, 0.1)"
                    : "rgba(244, 67, 54, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: isDarkMode
                    ? "1px solid rgba(244, 67, 54, 0.3)"
                    : "1px solid rgba(244, 67, 54, 0.2)",
                  "& .MuiAlert-icon": {
                    color: "#f44336",
                  },
                  "& .MuiAlert-message": {
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.9)"
                      : "rgba(0, 0, 0, 0.8)",
                    fontWeight: 500,
                  },
                }}
              >
                {error}
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Footer institucional */}
      <Box
        sx={{
          mt: 4,
          textAlign: "center",
          zIndex: 2,
          position: "relative",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: isDarkMode
              ? "rgba(255, 255, 255, 0.4)"
              : "rgba(0, 0, 0, 0.4)",
            fontSize: "0.8rem",
            fontWeight: 400,
            letterSpacing: "0.5px",
          }}
        >
          Aplicación creada por Carlos Fernandez – © 2025
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
