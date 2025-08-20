import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Box,
  Button,
  Avatar,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { OptimizedTextField } from './OptimizedFormField.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

// Eliminar el campo dependencia del filtro por solicitud del usuario
const defaultFilters = {
  secretaria: '',
  subsecretaria: '',
  direccionGeneral: '',
  direccion: '',
  departamento: '',
  division: '',
  funcion: ''
};

const DependencyFilter = ({ filters = defaultFilters, onFilter }) => {
  const { isDarkMode } = useTheme();
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (name, value) => {
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (onFilter) {
      onFilter(localFilters);
    }
  };

  return (
    <Card
      sx={{
        mb: 3,
        background: isDarkMode
          ? 'rgba(45, 55, 72, 0.8)'
          : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: isDarkMode
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #2196f3, #1976d2)',
            }}
          >
            <SearchIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filtrar datos
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>
          {/* Campo Dependencia eliminado */}
          <OptimizedTextField
            name="secretaria"
            label="Secretaría"
            value={localFilters.secretaria}
            onChange={handleChange}
            sx={{ minWidth: 200 }}
          />
          <OptimizedTextField
            name="subsecretaria"
            label="Subsecretaría"
            value={localFilters.subsecretaria}
            onChange={handleChange}
            sx={{ minWidth: 200 }}
          />
          <OptimizedTextField
            name="direccionGeneral"
            label="Dirección General"
            value={localFilters.direccionGeneral}
            onChange={handleChange}
            sx={{ minWidth: 200 }}
          />
          <OptimizedTextField
            name="direccion"
            label="Dirección"
            value={localFilters.direccion}
            onChange={handleChange}
            sx={{ minWidth: 200 }}
          />
          <OptimizedTextField
            name="departamento"
            label="Departamento"
            value={localFilters.departamento}
            onChange={handleChange}
            sx={{ minWidth: 200 }}
          />
          <OptimizedTextField
            name="division"
            label="División"
            value={localFilters.division}
            onChange={handleChange}
            sx={{ minWidth: 200 }}
          />
          <OptimizedTextField
            name="funcion"
            label="Función"
            value={localFilters.funcion}
            onChange={handleChange}
            sx={{ minWidth: 200 }}
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              background: 'linear-gradient(135deg, #2196f3, #1976d2)',
              color: 'white',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 3,
              textTransform: 'none',
              mt: { xs: 2, sm: 0 },
              '&:hover': {
                background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(33, 150, 243, 0.3)',
              },
            }}
          >
            Filtrar
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DependencyFilter;
