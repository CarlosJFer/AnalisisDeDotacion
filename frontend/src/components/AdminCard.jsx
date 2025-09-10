import React from "react";
import { CardContent, Typography, Box, Avatar, Button } from "@mui/material";
import { Link } from "react-router-dom";
import GlassCard from "./GlassCard.jsx";

const AdminCard = ({
  title,
  description,
  icon: IconComponent,
  link,
  color,
  bgColor,
  isDarkMode,
}) => (
  <GlassCard
    isDarkMode={isDarkMode}
    sx={{
      height: 320,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      "&:hover": {
        transform: "translateY(-8px)",
        boxShadow: isDarkMode
          ? `0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 12px ${color}40`
          : `0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px ${color}30`,
        background: bgColor,
      },
    }}
    component={Link}
    to={link}
    style={{ textDecoration: "none" }}
  >
    <CardContent
      sx={{
        textAlign: "center",
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flex: 1,
        }}
      >
        <Avatar
          sx={{
            width: 70,
            height: 70,
            mb: 2,
            background: `linear-gradient(135deg, ${color}, ${color}dd)`,
            boxShadow: `0 8px 25px ${color}40`,
          }}
        >
          <IconComponent sx={{ fontSize: 35, color: "white" }} />
        </Avatar>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 1.5,
            color: isDarkMode
              ? "rgba(255, 255, 255, 0.9)"
              : "rgba(0, 0, 0, 0.8)",
            fontSize: "1.1rem",
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: isDarkMode
              ? "rgba(255, 255, 255, 0.6)"
              : "rgba(0, 0, 0, 0.6)",
            lineHeight: 1.5,
            textAlign: "center",
            fontSize: "0.9rem",
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          {description}
        </Typography>
      </Box>

      <Button
        variant="contained"
        sx={{
          background: `linear-gradient(45deg, ${color}, ${color}dd)`,
          color: "white",
          fontWeight: 600,
          px: 3,
          py: 1,
          borderRadius: 2,
          boxShadow: `0 4px 15px ${color}40`,
          mt: 2,
          "&:hover": {
            background: `linear-gradient(45deg, ${color}dd, ${color}bb)`,
            transform: "translateY(-2px)",
            boxShadow: `0 6px 20px ${color}50`,
          },
          transition: "all 0.3s ease",
        }}
      >
        Acceder
      </Button>
    </CardContent>
  </GlassCard>
);

export default AdminCard;
