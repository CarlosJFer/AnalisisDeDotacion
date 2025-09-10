import React from "react";
import { Box } from "@mui/material";

const MunicipalLogo = ({ width = 200, height = "auto", className = "" }) => {
  return (
    <Box
      component="div"
      className={className}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: width,
        height: height === "auto" ? "auto" : height,
        maxWidth: "100%",
      }}
    >
      {/* Logo SVG de la Municipalidad de Corrientes */}
      <svg
        width={width}
        height={height === "auto" ? width * 0.6 : height}
        viewBox="0 0 200 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ maxWidth: "100%", height: "auto" }}
      >
        {/* Escudo principal */}
        <path
          d="M100 10 L130 25 L130 85 L100 100 L70 85 L70 25 Z"
          fill="url(#municipalGradient)"
          stroke="#43a047"
          strokeWidth="2"
        />

        {/* Cruz central */}
        <rect x="95" y="30" width="10" height="40" fill="#ffffff" />
        <rect x="85" y="45" width="30" height="10" fill="#ffffff" />

        {/* Elementos decorativos */}
        <circle cx="85" cy="35" r="3" fill="#81d4fa" />
        <circle cx="115" cy="35" r="3" fill="#81d4fa" />
        <circle cx="85" cy="75" r="3" fill="#ce93d8" />
        <circle cx="115" cy="75" r="3" fill="#ce93d8" />

        {/* Texto "CORRIENTES" */}
        <text
          x="100"
          y="110"
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill="#43a047"
          fontFamily="Inter, sans-serif"
        >
          CORRIENTES
        </text>

        {/* Gradiente */}
        <defs>
          <linearGradient
            id="municipalGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#a5d6a7" />
            <stop offset="25%" stopColor="#81d4fa" />
            <stop offset="50%" stopColor="#ce93d8" />
            <stop offset="75%" stopColor="#f48fb1" />
            <stop offset="100%" stopColor="#a5d6a7" />
          </linearGradient>
        </defs>
      </svg>
    </Box>
  );
};

export default MunicipalLogo;
