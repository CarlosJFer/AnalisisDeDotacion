import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { theme, modeVars, icons } from "../../ui";

const DashboardAccordionBase = ({ children, ...props }) => (
  <Accordion
    sx={{
      borderRadius: theme.radii.lg,
      boxShadow: theme.shadows.dashboard,
      overflow: "hidden",
      "&::before": { display: "none" }, // evita el borde cuadrado superior
    }}
    {...props}
  >
    {children}
  </Accordion>
);

const Summary = ({ isDarkMode, ...props }) => (
  <AccordionSummary
    expandIcon={<icons.expandir aria-hidden="true" />}
    sx={{
      borderRadius: theme.radii.lg,
      bgcolor: isDarkMode ? modeVars.dark.surface : modeVars.light.surface,
      "&:hover": {
        bgcolor: theme.palette.primaryHover,
      },
    }}
    {...props}
  />
);

const Details = ({ isDarkMode, ...props }) => (
  <AccordionDetails
    sx={{
      bgcolor: isDarkMode ? modeVars.dark.surface : modeVars.light.surface,
      borderRadius: `0 0 ${theme.radii.lg}px ${theme.radii.lg}px`,
    }}
    {...props}
  />
);

const DashboardAccordion = React.memo(DashboardAccordionBase);
DashboardAccordion.Summary = Summary;
DashboardAccordion.Details = Details;

export default DashboardAccordion;
