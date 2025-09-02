import React from 'react';
import { Grid, Box } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import LayersIcon from '@mui/icons-material/Layers';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import TagIcon from '@mui/icons-material/Tag';
import DescriptionIcon from '@mui/icons-material/Description';
import ToolCard from '../components/ToolCard.jsx';

const tools = [
  { title: 'Expedientes', description: 'Ver expedientes sin movimiento', icon: FolderIcon, route: '/tools/expedientes' },
  { title: 'Agrupamiento y Niveles', description: 'Detectar agentes en agrupamientos o niveles erróneos', icon: LayersIcon, route: '/tools/agrupamiento-niveles' },
  { title: 'ABNA', description: 'Antigüedad de Becas, Neikes y Asesores', icon: TimelapseIcon, route: '/tools/abna' },
  { title: 'AID', description: 'Asignador de ID según función', icon: TagIcon, route: '/tools/aid' },
  { title: 'Registro de resoluciones', description: 'Seguimiento y avisos de resoluciones', icon: DescriptionIcon, route: '/tools/resoluciones' }
];

const ToolsPage = () => (
  <Box sx={{ p: 4 }}>
    <Grid container spacing={3}>
      {tools.map(tool => (
        <Grid item xs={12} md={6} lg={4} key={tool.title}>
          <ToolCard {...tool} />
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default ToolsPage;
