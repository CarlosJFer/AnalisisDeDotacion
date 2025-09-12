import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  IconButton,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  Alert,
  Snackbar,
} from "@mui/material";
import icons from "../ui/icons.js";
import { useTheme } from "../context/ThemeContext.jsx";
import AuthContext from "../context/AuthContext.jsx";
import apiClient from "../services/api";

const EnhancedAlert = ({ severity, children, sx = {} }) => {
  const { isDarkMode } = useTheme();

  return (
    <Alert
      severity={severity}
      sx={{
        mb: 2,
        "& .MuiAlert-message": {
          fontWeight: 600,
          fontSize: "1rem",
          lineHeight: 1.4,
        },
        "& .MuiAlert-icon": {
          fontSize: "1.4rem",
        },
        "&.MuiAlert-standardSuccess": {
          backgroundColor: isDarkMode
            ? "rgba(76, 175, 80, 0.15)"
            : "rgba(76, 175, 80, 0.1)",
          border: `1px solid ${isDarkMode ? "rgba(76, 175, 80, 0.3)" : "rgba(76, 175, 80, 0.2)"}`,
        },
        "&.MuiAlert-standardError": {
          backgroundColor: isDarkMode
            ? "rgba(244, 67, 54, 0.15)"
            : "rgba(244, 67, 54, 0.1)",
          border: `1px solid ${isDarkMode ? "rgba(244, 67, 54, 0.3)" : "rgba(244, 67, 54, 0.2)"}`,
        },
        ...sx,
      }}
    >
      {children}
    </Alert>
  );
};

const ProfileMenu = () => {
  const { user, updateUser } = useContext(AuthContext);
  const { isDarkMode } = useTheme();

  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const isProfileOpen = Boolean(profileAnchorEl);

  const [email, setEmail] = useState(user?.email || "");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.notificationsEnabled ?? true,
  );
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleProfileOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleDialogClose = (dialogType) => {
    switch (dialogType) {
      case "email":
        setShowEmailDialog(false);
        setNewEmail("");
        break;
      case "password":
        setShowPasswordDialog(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        break;
      case "username":
        setShowUsernameDialog(false);
        setNewUsername("");
        break;
      default:
        break;
    }
    setProfileError("");
    setProfileSuccess("");
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleEmailChange = async () => {
    try {
      setProfileError("");
      setProfileSuccess("");

      if (!newEmail.trim()) {
        setProfileError("El correo electrónico no puede estar vacío");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        setProfileError("Formato de correo electrónico inválido");
        return;
      }

      const response = await apiClient.put("/auth/update-email", {
        newEmail: newEmail.trim(),
      });
      const updatedEmail = response.data.email;
      setEmail(updatedEmail);
      setNewEmail("");
      setShowEmailDialog(false);
      updateUser({ email: updatedEmail });
      showSnackbar("Correo electrónico actualizado correctamente");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Error al actualizar el correo electrónico";
      setProfileError(errorMessage);
      showSnackbar(errorMessage, "error");
    }
  };

  const handleEmailDelete = async () => {
    try {
      setProfileError("");
      setProfileSuccess("");

      await apiClient.delete("/auth/delete-email");
      setEmail("");
      updateUser({ email: "" });
      showSnackbar("Correo electrónico eliminado correctamente");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Error al eliminar el correo electrónico";
      setProfileError(errorMessage);
      showSnackbar(errorMessage, "error");
    }
  };

  const handlePasswordChange = async () => {
    try {
      setProfileError("");
      setProfileSuccess("");

      if (!currentPassword || !newPassword || !confirmPassword) {
        setProfileError("Todos los campos son obligatorios");
        return;
      }

      if (newPassword !== confirmPassword) {
        setProfileError("Las contraseñas no coinciden");
        return;
      }

      if (newPassword.length < 6) {
        setProfileError("La contraseña debe tener al menos 6 caracteres");
        return;
      }

      await apiClient.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordDialog(false);
      showSnackbar("Contraseña actualizada correctamente");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error al cambiar la contraseña";
      setProfileError(errorMessage);
      showSnackbar(errorMessage, "error");
    }
  };

  const handleUsernameChange = async () => {
    try {
      setProfileError("");
      setProfileSuccess("");

      if (!newUsername.trim()) {
        setProfileError("El nombre de usuario no puede estar vacío");
        return;
      }

      if (newUsername.length < 3) {
        setProfileError(
          "El nombre de usuario debe tener al menos 3 caracteres",
        );
        return;
      }

      const response = await apiClient.put("/auth/update-username", {
        newUsername: newUsername.trim(),
      });
      setNewUsername("");
      setShowUsernameDialog(false);
      updateUser({ username: response.data.username });
      showSnackbar("Nombre de usuario actualizado correctamente");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Error al actualizar el nombre de usuario";
      setProfileError(errorMessage);
      showSnackbar(errorMessage, "error");
    }
  };

  const handleNotificationsToggle = async () => {
    try {
      const newValue = !notificationsEnabled;
      await apiClient.put("/auth/update-notifications", {
        notificationsEnabled: newValue,
      });
      setNotificationsEnabled(newValue);
      updateUser({ notificationsEnabled: newValue });
      showSnackbar("Preferencias de notificaciones actualizadas");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Error al actualizar las preferencias de notificaciones";
      showSnackbar(errorMessage, "error");
    }
  };

  useEffect(() => {
    if (user && user.token) {
      const userEmail = user.email || "";
      const userNotifications = user.notificationsEnabled ?? true;
      setEmail(userEmail);
      setNotificationsEnabled(userNotifications);
    } else {
      setEmail("");
      setNotificationsEnabled(true);
    }
  }, [user]);

  return (
    <>
      <Tooltip title="Configuración de Perfil" arrow>
        <IconButton
          onClick={handleProfileOpen}
          aria-label="Configuración"
          sx={{
            color: isDarkMode
              ? "rgba(255, 255, 255, 0.9)"
              : "rgba(0, 0, 0, 0.8)",
            background: isDarkMode
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(255, 255, 255, 0.7)",
            border: isDarkMode
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.08)",
            "&:hover": {
              background: isDarkMode
                ? "rgba(76, 175, 80, 0.2)"
                : "rgba(76, 175, 80, 0.15)",
              color: isDarkMode ? "#81c784" : "#2e7d32",
              transform: "scale(1.1)",
              boxShadow: isDarkMode
                ? "0 6px 20px rgba(76, 175, 80, 0.3)"
                : "0 6px 20px rgba(76, 175, 80, 0.2)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <icons.configuracion aria-hidden="true" />
        </IconButton>
      </Tooltip>

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
              ? "rgba(45, 55, 72, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: isDarkMode
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.08)",
            borderRadius: 3,
            boxShadow: isDarkMode
              ? "0 8px 32px rgba(0, 0, 0, 0.3)"
              : "0 8px 32px rgba(0, 0, 0, 0.1)",
            minWidth: 320,
            mt: 1,
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background:
                  user?.role === "admin"
                    ? "linear-gradient(135deg, #ff9800, #f57c00)"
                    : "linear-gradient(135deg, #2196f3, #1976d2)",
              }}
            >
              {user?.role === "admin" ? (
                <icons.admin aria-hidden="true" />
              ) : (
                <icons.persona aria-hidden="true" />
              )}
            </Avatar>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.9)"
                    : "rgba(0, 0, 0, 0.8)",
                }}
              >
                {user?.username}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.6)",
                }}
              >
                {user?.role === "admin" ? "Administrador" : "Usuario"}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 1 }}>
          {user?.role !== "admin" && (
            <MenuItem
              onClick={() => setShowEmailDialog(true)}
              sx={{
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                "&:hover": {
                  background: isDarkMode
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              <icons.correo
                sx={{
                  mr: 2,
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.6)",
                }}
                aria-hidden="true"
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.9)"
                      : "rgba(0, 0, 0, 0.8)",
                  }}
                >
                  Correo Electrónico
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.6)"
                      : "rgba(0, 0, 0, 0.5)",
                  }}
                >
                  {email || "No configurado"}
                </Typography>
              </Box>
            </MenuItem>
          )}

          {user?.role !== "admin" && (
            <MenuItem
              onClick={() => setShowPasswordDialog(true)}
              sx={{
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                "&:hover": {
                  background: isDarkMode
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              <icons.candado
                sx={{
                  mr: 2,
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.6)",
                }}
                aria-hidden="true"
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.9)"
                    : "rgba(0, 0, 0, 0.8)",
                }}
              >
                Cambiar Contraseña
              </Typography>
            </MenuItem>
          )}

          {user?.role !== "admin" && (
            <MenuItem
              onClick={() => setShowUsernameDialog(true)}
              sx={{
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                "&:hover": {
                  background: isDarkMode
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              <icons.cuenta
                sx={{
                  mr: 2,
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.6)",
                }}
                aria-hidden="true"
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.9)"
                    : "rgba(0, 0, 0, 0.8)",
                }}
              >
                Cambiar Usuario
              </Typography>
            </MenuItem>
          )}

          <Divider
            sx={{
              my: 1,
              borderColor: isDarkMode
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.08)",
            }}
          />

          <Box
            sx={{
              borderRadius: 2,
              mx: 1,
              px: 2,
              py: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              "&:hover": {
                background: isDarkMode
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.05)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
              <icons.campana
                sx={{
                  mr: 2,
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.6)",
                }}
                aria-hidden="true"
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.9)"
                      : "rgba(0, 0, 0, 0.8)",
                  }}
                >
                  Notificaciones de Dashboard
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.6)"
                      : "rgba(0, 0, 0, 0.5)",
                  }}
                >
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
                color: isDarkMode
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(0, 0, 0, 0.3)",
                "&.Mui-checked": {
                  color: isDarkMode ? "#81c784" : "#2e7d32",
                },
                "&:focus": {
                  outline: "none",
                },
                p: 1,
              }}
            />
          </Box>
        </Box>
      </Menu>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            fontWeight: 600,
            "& .MuiAlert-message": {
              fontSize: "1rem",
            },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog
        open={showEmailDialog}
        onClose={() => handleDialogClose("email")}
        PaperProps={{
          sx: {
            background: isDarkMode
              ? "rgba(45, 55, 72, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: isDarkMode
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.08)",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: isDarkMode
              ? "rgba(255, 255, 255, 0.9)"
              : "rgba(0, 0, 0, 0.8)",
          }}
        >
          {email ? "Editar Correo Electrónico" : "Agregar Correo Electrónico"}
        </DialogTitle>
        <DialogContent>
          {profileError && (
            <EnhancedAlert severity="error">{profileError}</EnhancedAlert>
          )}
          {profileSuccess && (
            <EnhancedAlert severity="success">{profileSuccess}</EnhancedAlert>
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
              "& .MuiOutlinedInput-root": {
                color: isDarkMode
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(0, 0, 0, 0.8)",
                "& fieldset": {
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.2)",
                },
                "&:hover fieldset": {
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(0, 0, 0, 0.3)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: isDarkMode ? "#81c784" : "#2e7d32",
                },
              },
              "& .MuiInputLabel-root": {
                color: isDarkMode
                  ? "rgba(255, 255, 255, 0.7)"
                  : "rgba(0, 0, 0, 0.6)",
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
                borderColor: isDarkMode
                  ? "rgba(244, 67, 54, 0.5)"
                  : "rgba(244, 67, 54, 0.5)",
                color: isDarkMode ? "#ef5350" : "#d32f2f",
                "&:hover": {
                  borderColor: isDarkMode ? "#ef5350" : "#d32f2f",
                  background: isDarkMode
                    ? "rgba(244, 67, 54, 0.1)"
                    : "rgba(244, 67, 54, 0.1)",
                },
              }}
            >
              Eliminar
            </Button>
          )}
          <Button
            onClick={() => handleDialogClose("email")}
            sx={{
              color: isDarkMode
                ? "rgba(255, 255, 255, 0.7)"
                : "rgba(0, 0, 0, 0.6)",
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleEmailChange}
            variant="contained"
            sx={{
              background: isDarkMode ? "#81c784" : "#2e7d32",
              "&:hover": {
                background: isDarkMode ? "#66bb6a" : "#1b5e20",
              },
            }}
          >
            {email ? "Actualizar" : "Agregar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showPasswordDialog}
        onClose={() => handleDialogClose("password")}
        PaperProps={{
          sx: {
            background: isDarkMode
              ? "rgba(45, 55, 72, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: isDarkMode
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.08)",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: isDarkMode
              ? "rgba(255, 255, 255, 0.9)"
              : "rgba(0, 0, 0, 0.8)",
          }}
        >
          Cambiar Contraseña
        </DialogTitle>
        <DialogContent>
          {profileError && (
            <EnhancedAlert severity="error">{profileError}</EnhancedAlert>
          )}
          {profileSuccess && (
            <EnhancedAlert severity="success">{profileSuccess}</EnhancedAlert>
          )}
          <TextField
            id="current-password"
            margin="dense"
            label="Contraseña Actual"
            type="password"
            fullWidth
            variant="outlined"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: isDarkMode
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(0, 0, 0, 0.8)",
                "& fieldset": {
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.2)",
                },
                "&:hover fieldset": {
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(0, 0, 0, 0.3)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: isDarkMode ? "#81c784" : "#2e7d32",
                },
              },
              "& .MuiInputLabel-root": {
                color: isDarkMode
                  ? "rgba(255, 255, 255, 0.7)"
                  : "rgba(0, 0, 0, 0.6)",
              },
            }}
          />
          <TextField
            id="new-password"
            margin="dense"
            label="Nueva Contraseña"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: isDarkMode
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(0, 0, 0, 0.8)",
                "& fieldset": {
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.2)",
                },
                "&:hover fieldset": {
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(0, 0, 0, 0.3)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: isDarkMode ? "#81c784" : "#2e7d32",
                },
              },
              "& .MuiInputLabel-root": {
                color: isDarkMode
                  ? "rgba(255, 255, 255, 0.7)"
                  : "rgba(0, 0, 0, 0.6)",
              },
            }}
          />
          <TextField
            id="confirm-password"
            margin="dense"
            label="Confirmar Contraseña"
            type="password"
            fullWidth
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: isDarkMode
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(0, 0, 0, 0.8)",
                "& fieldset": {
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.2)",
                },
                "&:hover fieldset": {
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(0, 0, 0, 0.3)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: isDarkMode ? "#81c784" : "#2e7d32",
                },
              },
              "& .MuiInputLabel-root": {
                color: isDarkMode
                  ? "rgba(255, 255, 255, 0.7)"
                  : "rgba(0, 0, 0, 0.6)",
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => handleDialogClose("password")}
            sx={{
              color: isDarkMode
                ? "rgba(255, 255, 255, 0.7)"
                : "rgba(0, 0, 0, 0.6)",
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            sx={{
              background: isDarkMode ? "#81c784" : "#2e7d32",
              "&:hover": {
                background: isDarkMode ? "#66bb6a" : "#1b5e20",
              },
            }}
          >
            Cambiar Contraseña
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showUsernameDialog}
        onClose={() => handleDialogClose("username")}
        PaperProps={{
          sx: {
            background: isDarkMode
              ? "rgba(45, 55, 72, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: isDarkMode
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.08)",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: isDarkMode
              ? "rgba(255, 255, 255, 0.9)"
              : "rgba(0, 0, 0, 0.8)",
          }}
        >
          Cambiar Nombre de Usuario
        </DialogTitle>
        <DialogContent>
          {profileError && (
            <EnhancedAlert severity="error">{profileError}</EnhancedAlert>
          )}
          {profileSuccess && (
            <EnhancedAlert severity="success">{profileSuccess}</EnhancedAlert>
          )}
          <TextField
            id="username-field"
            name="username"
            autoFocus
            margin="dense"
            label="Nuevo Nombre de Usuario"
            type="text"
            fullWidth
            variant="outlined"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: isDarkMode
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(0, 0, 0, 0.8)",
                "& fieldset": {
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.2)",
                },
                "&:hover fieldset": {
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(0, 0, 0, 0.3)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: isDarkMode ? "#81c784" : "#2e7d32",
                },
              },
              "& .MuiInputLabel-root": {
                color: isDarkMode
                  ? "rgba(255, 255, 255, 0.7)"
                  : "rgba(0, 0, 0, 0.6)",
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => handleDialogClose("username")}
            sx={{
              color: isDarkMode
                ? "rgba(255, 255, 255, 0.7)"
                : "rgba(0, 0, 0, 0.6)",
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUsernameChange}
            variant="contained"
            sx={{
              background: isDarkMode ? "#81c784" : "#2e7d32",
              "&:hover": {
                background: isDarkMode ? "#66bb6a" : "#1b5e20",
              },
            }}
          >
            Cambiar Usuario
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfileMenu;
