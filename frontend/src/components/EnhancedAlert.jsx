import React from "react";
import Alert from "@mui/material/Alert";
import { useTheme } from "../context/ThemeContext.jsx";

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

export default EnhancedAlert;
