import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Typography, CircularProgress, Alert, Grid } from '@mui/material';
import { useTheme } from '../context/ThemeContext.jsx';
import apiClient from '../services/api';
import StatCard from '../components/StatCard';
import CustomBarChart from '../components/CustomBarChart';
import CustomDonutChart from '../components/CustomDonutChart';
import CustomAreaChart from '../components/CustomAreaChart';
import DependencyFilter from '../components/DependencyFilter.jsx';

// Nuevo dashboard dedicado a la plantilla "Neikes y Beca"
const DashboardNeikeBeca = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    secretaria: '',
    subsecretaria: '',
    direccionGeneral: '',
    direccion: '',
    departamento: '',
    division: '',
    funcion: ''
  });

  // Estados para la plantilla Neikes y Beca
  const [totalAgents, setTotalAgents] = useState(0);
  const [ageDistribution, setAgeDistribution] = useState(null);
  const [ageByFunction, setAgeByFunction] = useState([]);
  const [agentsByFunction, setAgentsByFunction] = useState([]);
  const [agentsByEmploymentType, setAgentsByEmploymentType] = useState([]);
  const [agentsByDependency, setAgentsByDependency] = useState([]);
  const [agentsBySecretaria, setAgentsBySecretaria] = useState([]);
  const [agentsBySubsecretaria, setAgentsBySubsecretaria] = useState([]);
  const [agentsByDireccionGeneral, setAgentsByDireccionGeneral] = useState([]);
  const [agentsByDireccion, setAgentsByDireccion] = useState([]);
  const [agentsByDepartamento, setAgentsByDepartamento] = useState([]);
  const [agentsByDivision, setAgentsByDivision] = useState([]);

  const fetchAllData = async (appliedFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const funcRes = await apiClient.get('/functions');
      const funcs = funcRes.data.reduce((acc, f) => {
        acc[f.name] = f.endpoint;
        return acc;
      }, {});
      const safeGet = (endpoint, defaultData, plantilla) => {
        if (!endpoint) return Promise.resolve({ data: defaultData });
        const params = { ...appliedFilters };
        if (plantilla) params.plantilla = plantilla;
        return apiClient
          .get(endpoint, { params })
          .catch(() => ({ data: defaultData }));
      };
      const TEMPLATE_NEIKES_BECAS = 'Rama completa - Neikes y Beca';
      const [
        totalResponse,
        ageDistResponse,
        ageFunctionResponse,
        functionResponse,
        employmentResponse,
        dependencyResponse,
        secretariaResponse,
        subsecretariaResponse,
        direccionGeneralResponse,
        direccionResponse,
        departamentoResponse,
        divisionResponse
      ] = await Promise.all([
        safeGet(funcs.totalAgents, { total: 0 }, TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.ageDistribution, null, TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.ageByFunction, [], TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.agentsByFunction, [], TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.agentsByEmploymentType, [], TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.agentsByDependency, [], TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.agentsBySecretaria, [], TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.agentsBySubsecretaria, [], TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.agentsByDireccionGeneral, [], TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.agentsByDireccion, [], TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.agentsByDepartamento, [], TEMPLATE_NEIKES_BECAS),
        safeGet(funcs.agentsByDivision, [], TEMPLATE_NEIKES_BECAS)
      ]);
      setTotalAgents(totalResponse.data.total);
      setAgeDistribution(ageDistResponse.data);
      setAgeByFunction(ageFunctionResponse.data);
      setAgentsByFunction(functionResponse.data);
      setAgentsByEmploymentType(employmentResponse.data);
      setAgentsByDependency(dependencyResponse.data);
      setAgentsBySecretaria(secretariaResponse.data);
      setAgentsBySubsecretaria(subsecretariaResponse.data);
      setAgentsByDireccionGeneral(direccionGeneralResponse.data);
      setAgentsByDireccion(direccionResponse.data);
      setAgentsByDepartamento(departamentoResponse.data);
      setAgentsByDivision(divisionResponse.data);
    } catch (err) {
      setError('Error al cargar los datos del dashboard.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    fetchAllData(newFilters);
  };

  useEffect(() => {
    fetchAllData(filters);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
            Dashboard - Neikes y Becas
          </Typography>
          {/* Filtro sin campo Dependencia */}
          <DependencyFilter
            filters={filters}
            onFilter={handleApplyFilters}
          />
          {/* Estadísticas de resumen */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total de agentes"
                value={totalAgents}
                color1="#1976d2"
                color2="#0d47a1"
              />
            </Grid>
            {/* Agrega tarjetas adicionales si lo deseas */}
          </Grid>
          {/* Gráficos */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <CustomBarChart
                title="Distribución de Agentes por Función (Top 10) - Neikes y Beca"
                data={agentsByFunction}
                xKey="function"
                yKey="count"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomDonutChart
                title="Agentes por Situación de Revista - Neikes y Beca"
                data={agentsByEmploymentType}
                nameKey="tipo"
                valueKey="cantidad"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomAreaChart
                title="Distribución por Rangos de Edad - Neikes y Beca"
                data={ageDistribution?.rangeData || []}
                xKey="range"
                yKey="count"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomBarChart
                title="Distribución por Rangos de Edad según la Función - Neikes y Beca"
                data={ageByFunction}
                xKey="function"
                yKey="count"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomBarChart
                title="Agentes por Secretaría (Top 8) - Neikes y Beca"
                data={agentsBySecretaria}
                xKey="secretaria"
                yKey="count"
                limit={8}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomBarChart
                title="Agentes por Dependencia (Top 8) - Neikes y Beca"
                data={agentsByDependency}
                xKey="dependencia"
                yKey="count"
                limit={8}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomBarChart
                title="Agentes por Subsecretaría (Top 10) - Neikes y Beca"
                data={agentsBySubsecretaria}
                xKey="subsecretaria"
                yKey="count"
                limit={10}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomBarChart
                title="Agentes por Dirección General (Top 10) - Neikes y Beca"
                data={agentsByDireccionGeneral}
                xKey="direccionGeneral"
                yKey="count"
                limit={10}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomBarChart
                title="Agentes por Dirección (Top 10) - Neikes y Beca"
                data={agentsByDireccion}
                xKey="direccion"
                yKey="count"
                limit={10}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomBarChart
                title="Agentes por Departamento (Top 8) - Neikes y Beca"
                data={agentsByDepartamento}
                xKey="departamento"
                yKey="count"
                limit={8}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomBarChart
                title="Agentes por División (Top 8) - Neikes y Beca"
                data={agentsByDivision}
                xKey="division"
                yKey="count"
                limit={8}
              />
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default DashboardNeikeBeca;
