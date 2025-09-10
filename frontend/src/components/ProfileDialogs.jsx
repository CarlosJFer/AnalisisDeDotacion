import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import EnhancedAlert from "./EnhancedAlert.jsx";

export const EmailDialog = ({
  open,
  onClose,
  isDarkMode,
  email,
  newEmail,
  setNewEmail,
  profileError,
  profileSuccess,
  handleEmailChange,
  handleEmailDelete,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
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
        color: isDarkMode ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)",
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
        onClick={onClose}
        sx={{
          color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
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
);

export const PasswordDialog = ({
  open,
  onClose,
  isDarkMode,
  currentPassword,
  newPassword,
  confirmPassword,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword,
  profileError,
  profileSuccess,
  handlePasswordChange,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
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
        color: isDarkMode ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)",
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
        id="current-password-field"
        name="currentPassword"
        autoFocus
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
        id="new-password-field"
        name="newPassword"
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
        id="confirm-password-field"
        name="confirmPassword"
        margin="dense"
        label="Confirmar Nueva Contraseña"
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
        onClick={onClose}
        sx={{
          color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
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
);

export const UsernameDialog = ({
  open,
  onClose,
  isDarkMode,
  newUsername,
  setNewUsername,
  profileError,
  profileSuccess,
  handleUsernameChange,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
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
        color: isDarkMode ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)",
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
        onClick={onClose}
        sx={{
          color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
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
);
