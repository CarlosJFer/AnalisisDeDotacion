import React from "react";
import { Alert, Box, Typography } from "@mui/material";

const MonthCutoffAlert = ({ systemName, startDate, endDate }) => {
  const start = new Date(startDate).toLocaleDateString("es-AR");
  const end = new Date(endDate).toLocaleDateString("es-AR");
  return (
    <Box my={2}>
      <Alert
        severity="info"
        icon={false}
        sx={{
          bgcolor: "rgba(33,150,243,0.1)",
          borderLeft: "6px solid #2196f3",
        }}
      >
        <Typography variant="body2" fontWeight={600}>
          {`Datos tomados del sistema ${systemName} con corte del ${start} al ${end}.`}
        </Typography>
      </Alert>
    </Box>
  );
};

export default MonthCutoffAlert;
