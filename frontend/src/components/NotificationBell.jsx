import React, { useState } from "react";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Alert,
  Snackbar,
  Fade,
} from "@mui/material";
import icons from "../ui/icons.js";
import { useTheme } from "../context/ThemeContext";
import { useNotifications } from "../context/NotificationContext";

const NotificationBell = () => {
  const { isDarkMode } = useTheme();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    showToast,
  } = useNotifications();

  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      showSnackbar("Notificación marcada como leída", "success");
    } catch (error) {
      showSnackbar("Error al marcar notificación como leída", "error");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      showSnackbar("Todas las notificaciones marcadas como leídas", "success");
      handleClose();
    } catch (error) {
      showSnackbar(
        "Error al marcar todas las notificaciones como leídas",
        "error",
      );
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      showSnackbar("Notificación eliminada", "success");
    } catch (error) {
      showSnackbar("Error al eliminar notificación", "error");
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

    if (diffInMinutes < 1) return "Ahora";
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays}d`;

    return notificationDate.toLocaleDateString("es-ES");
  };

  const getNotificationIcon = (type, data) => {
    if (data?.action === "upload") {
      return <icons.upload sx={{ color: "#4caf50", fontSize: 20 }} />;
    }
    if (data?.action === "modify") {
      return <icons.editar sx={{ color: "#ff9800", fontSize: 20 }} />;
    }

    switch (type) {
      case "success":
        return <icons.exito sx={{ color: "#4caf50", fontSize: 20 }} />;
      case "warning":
        return <icons.advertencia sx={{ color: "#ff9800", fontSize: 20 }} />;
      case "error":
        return <icons.error sx={{ color: "#f44336", fontSize: 20 }} />;
      case "info":
      default:
        return <icons.info sx={{ color: "#2196f3", fontSize: 20 }} />;
    }
  };

  const getNotificationColor = (type, data) => {
    if (data?.action === "upload") return "#4caf50";
    if (data?.action === "modify") return "#ff9800";

    switch (type) {
      case "success":
        return "#4caf50";
      case "warning":
        return "#ff9800";
      case "error":
        return "#f44336";
      case "info":
      default:
        return "#2196f3";
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification._id || notification.id);
    }

    // Si la notificación es sobre dashboard, podrías redirigir al dashboard
    if (
      notification.data?.action &&
      (notification.data.action === "upload" ||
        notification.data.action === "modify")
    ) {
      console.log("Navegando al dashboard...");
    }
  };

  return (
    <>
      <Tooltip
        title={
          unreadCount > 0
            ? `${unreadCount} notificaciones nuevas`
            : "Sin notificaciones nuevas"
        }
        arrow
      >
        <Box sx={{ position: "relative" }}>
          <IconButton
            onClick={handleClick}
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
              width: 40,
              height: 40,
              "&:hover": {
                background: isDarkMode
                  ? "rgba(255, 152, 0, 0.2)"
                  : "rgba(255, 152, 0, 0.15)",
                color: isDarkMode ? "#ffb74d" : "#f57c00",
                transform: "scale(1.1)",
                boxShadow: isDarkMode
                  ? "0 6px 20px rgba(255, 152, 0, 0.3)"
                  : "0 6px 20px rgba(255, 152, 0, 0.2)",
              },
              transition: "all 0.3s ease",
            }}
          >
            {unreadCount > 0 ? (
              <icons.campanaActiva />
            ) : (
              <icons.campana />
            )}
          </IconButton>
          {unreadCount > 0 && (
            <Box
              sx={{
                position: "absolute",
                bottom: "2px",
                right: "2px",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f44336, #d32f2f)",
                border: "2px solid",
                borderColor: isDarkMode
                  ? "rgba(45, 55, 72, 1)"
                  : "rgba(255, 255, 255, 1)",
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%": {
                    transform: "scale(1)",
                    opacity: 1,
                  },
                  "50%": {
                    transform: "scale(1.2)",
                    opacity: 0.8,
                  },
                  "100%": {
                    transform: "scale(1)",
                    opacity: 1,
                  },
                },
              }}
            />
          )}
        </Box>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            minWidth: 400,
            maxWidth: 450,
            maxHeight: 600,
            background: isDarkMode
              ? "rgba(45, 55, 72, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: isDarkMode
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.08)",
            borderRadius: 3,
            boxShadow: isDarkMode
              ? "0 8px 32px rgba(0, 0, 0, 0.4)"
              : "0 8px 32px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <icons.campana
              sx={{
                color: isDarkMode
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(0, 0, 0, 0.8)",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: isDarkMode
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(0, 0, 0, 0.8)",
              }}
            >
              Notificaciones
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                size="small"
                sx={{
                  background: "linear-gradient(135deg, #f44336, #d32f2f)",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                }}
              />
            )}
          </Box>

          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              sx={{
                background: "linear-gradient(135deg, #4caf50, #388e3c)",
                color: "white",
                fontWeight: 600,
                fontSize: "0.7rem",
                textTransform: "none",
                "&:hover": {
                  background: "linear-gradient(135deg, #388e3c, #2e7d32)",
                },
              }}
            >
              Marcar todas como leídas
            </Button>
          )}
        </Box>

        {/* Notifications List */}
        <Box sx={{ maxHeight: 400, overflow: "auto" }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <icons.campana
                sx={{
                  fontSize: 48,
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(0, 0, 0, 0.3)",
                  mb: 2,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: isDarkMode
                    ? "rgba(255, 255, 255, 0.6)"
                    : "rgba(0, 0, 0, 0.6)",
                  fontStyle: "italic",
                }}
              >
                No tienes notificaciones
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.slice(0, 10).map((notification, index) => (
                <React.Fragment
                  key={notification._id || notification.id || index}
                >
                  <ListItem
                    sx={{
                      cursor: "pointer",
                      backgroundColor: !notification.read
                        ? isDarkMode
                          ? "rgba(33, 150, 243, 0.1)"
                          : "rgba(33, 150, 243, 0.05)"
                        : "transparent",
                      "&:hover": {
                        backgroundColor: isDarkMode
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(0, 0, 0, 0.03)",
                      },
                      py: 2,
                      px: 2,
                      flexDirection: "column",
                      alignItems: "stretch",
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        width: "100%",
                      }}
                    >
                      <Box sx={{ mr: 2, mt: 0.5 }}>
                        {getNotificationIcon(
                          notification.type,
                          notification.data,
                        )}
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Título */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: notification.read ? 400 : 600,
                              color: isDarkMode
                                ? "rgba(255, 255, 255, 0.9)"
                                : "rgba(0, 0, 0, 0.8)",
                              flex: 1,
                            }}
                          >
                            {notification.title || "Notificación"}
                          </Typography>
                          {!notification.read && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: getNotificationColor(
                                  notification.type,
                                  notification.data,
                                ),
                              }}
                            />
                          )}
                        </Box>

                        {/* Mensaje */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: isDarkMode
                              ? "rgba(255, 255, 255, 0.7)"
                              : "rgba(0, 0, 0, 0.6)",
                            mb: 1,
                            lineHeight: 1.4,
                          }}
                        >
                          {notification.message}
                        </Typography>

                        {/* Chips de información */}
                        {notification.data &&
                          (notification.data.fileName ||
                            notification.data.totalRecords) && (
                            <Box
                              sx={{
                                display: "flex",
                                gap: 0.5,
                                mb: 1,
                                flexWrap: "wrap",
                              }}
                            >
                              {notification.data.fileName && (
                                <Chip
                                  label={`📄 ${notification.data.fileName}`}
                                  size="small"
                                  sx={{
                                    fontSize: "0.65rem",
                                    height: 20,
                                    backgroundColor: isDarkMode
                                      ? "rgba(255, 255, 255, 0.1)"
                                      : "rgba(0, 0, 0, 0.05)",
                                  }}
                                />
                              )}
                              {notification.data.totalRecords && (
                                <Chip
                                  label={`📊 ${notification.data.totalRecords} registros`}
                                  size="small"
                                  sx={{
                                    fontSize: "0.65rem",
                                    height: 20,
                                    backgroundColor: isDarkMode
                                      ? "rgba(255, 255, 255, 0.1)"
                                      : "rgba(0, 0, 0, 0.05)",
                                  }}
                                />
                              )}
                            </Box>
                          )}

                        {/* Footer con tiempo y acciones */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: isDarkMode
                                ? "rgba(255, 255, 255, 0.5)"
                                : "rgba(0, 0, 0, 0.4)",
                              fontSize: "0.7rem",
                            }}
                          >
                            {formatTimeAgo(
                              notification.createdAt || notification.timestamp,
                            )}
                          </Typography>

                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            {!notification.read && (
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(
                                    notification._id || notification.id,
                                  );
                                }}
                                sx={{
                                  color: isDarkMode
                                    ? "rgba(255, 255, 255, 0.6)"
                                    : "rgba(0, 0, 0, 0.4)",
                                  "&:hover": {
                                    color: "#4caf50",
                                  },
                                }}
                              >
                                <icons.exito sx={{ fontSize: 16 }} />
                              </IconButton>
                            )}
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(
                                  notification._id || notification.id,
                                );
                              }}
                              sx={{
                                color: isDarkMode
                                  ? "rgba(255, 255, 255, 0.6)"
                                  : "rgba(0, 0, 0, 0.4)",
                                "&:hover": {
                                  color: "#f44336",
                                },
                              }}
                            >
                              <icons.cerrar sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </ListItem>
                  {index < notifications.length - 1 && (
                    <Divider
                      sx={{
                        borderColor: isDarkMode
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(0, 0, 0, 0.05)",
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        {notifications.length > 10 && (
          <Box
            sx={{
              p: 2,
              borderTop: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
              textAlign: "center",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: isDarkMode
                  ? "rgba(255, 255, 255, 0.6)"
                  : "rgba(0, 0, 0, 0.6)",
                fontSize: "0.8rem",
              }}
            >
              Mostrando las 10 notificaciones más recientes
            </Typography>
          </Box>
        )}
      </Menu>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
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
              fontSize: "0.9rem",
            },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationBell;
