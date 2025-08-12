import React, { useState, useEffect } from 'react';
import { Card, CardContent, Grid, TextField, Button } from '@mui/material';

const defaultFilters = {
  dependencia: '',
  secretaria: '',
  subsecretaria: '',
  direccionGeneral: '',
  direccion: '',
  departamento: '',
  division: '',
  funcion: ''
};

const DependencyFilter = ({ filters = defaultFilters, onFilter }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (field) => (e) => {
    setLocalFilters(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = () => {
    if (onFilter) {
      onFilter(localFilters);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              required
              label="Dependencia"
              value={localFilters.dependencia}
              onChange={handleChange('dependencia')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Secretaría"
              value={localFilters.secretaria}
              onChange={handleChange('secretaria')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Subsecretaría"
              value={localFilters.subsecretaria}
              onChange={handleChange('subsecretaria')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Dirección General"
              value={localFilters.direccionGeneral}
              onChange={handleChange('direccionGeneral')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Dirección"
              value={localFilters.direccion}
              onChange={handleChange('direccion')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Departamento"
              value={localFilters.departamento}
              onChange={handleChange('departamento')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="División"
              value={localFilters.division}
              onChange={handleChange('division')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Función"
              value={localFilters.funcion}
              onChange={handleChange('funcion')}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Filtrar
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DependencyFilter;
