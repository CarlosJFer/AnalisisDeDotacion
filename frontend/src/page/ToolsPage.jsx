import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import LayersIcon from '@mui/icons-material/Layers';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import TagIcon from '@mui/icons-material/Tag';
import DescriptionIcon from '@mui/icons-material/Description';
import ToolCard from '../components/ToolCard.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const tools = [
  { title: 'Expedientes', description: 'Ver expedientes sin movimiento', icon: FolderIcon, route: '/tools/expedientes' },
  { title: 'Agrupamiento y Niveles', description: 'Detectar agentes en agrupamientos o niveles erróneos', icon: LayersIcon, route: '/tools/agrupamiento-niveles' },
  { title: 'ABNA', description: 'Antigüedad de Becas, Neikes y Asesores', icon: TimelapseIcon, route: '/tools/abna' },
  { title: 'AID', description: 'Asignador de ID según función', icon: TagIcon, route: '/tools/aid' },
  { title: 'Registro de resoluciones', description: 'Seguimiento y avisos de resoluciones', icon: DescriptionIcon, route: '/tools/resoluciones' }
];

const ToolsPage = () => {
  const { isDarkMode } = useTheme();
  return (
    <Box
      sx={{
        maxWidth: 1000,
        mx: 'auto',
        p: 4,
        background: isDarkMode
          ? 'linear-gradient(135deg, rgba(45, 55, 72, 0.3) 0%, rgba(26, 32, 44, 0.3) 100%)'
          : 'linear-gradient(135deg, rgba(240, 249, 240, 0.3) 0%, rgba(227, 242, 253, 0.3) 100%)',
        borderRadius: 3,
        minHeight: '80vh',
      }}
    >
      <Typography
        variant="h3"
        gutterBottom
        align="center"
        sx={{
          fontWeight: 700,
          mb: 2,
          color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
        }}
      >
        Herramientas
      </Typography>
      <Typography
        variant="h6"
        align="center"
        sx={{
          mb: 5,
          color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
          fontWeight: 400,
        }}
      >
        Accede a utilidades complementarias del sistema.
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {tools.map(tool => (
          <Grid item xs={12} md={6} lg={4} key={tool.title}>
            <ToolCard {...tool} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ToolsPage;
