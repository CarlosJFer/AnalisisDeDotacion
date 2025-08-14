import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import OrganigramaTreeView from "../components/OrganigramaTreeView.jsx";
import { Box, Typography, CircularProgress, Alert, TextField, Button, Avatar, Card, CardContent } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTheme } from '../context/ThemeContext.jsx';
import apiClient from "../services/api";

// Construye un mapa de nodos por _id y asigna hijos correctamente
const buildTreeFromFlatList = (list) => {
  const map = {};
  const roots = [];
  list.forEach(item => {
    map[String(item._id)] = { ...item, children: [] };
  });
  list.forEach(item => {
    if (item.idPadre && map[String(item.idPadre)]) {
      map[String(item.idPadre)].children.push(map[String(item._id)]);
    } else {
      roots.push(map[String(item._id)]);
    }
  });
  // Ordenar hijos por 'orden' si existe
  const sortChildren = (nodes) => {
    nodes.sort((a, b) => (a.orden || 999) - (b.orden || 999));
    nodes.forEach(n => n.children && sortChildren(n.children));
  };
  sortChildren(roots);
  return roots;
};

// Obtiene todos los ancestros de un nodo
const getAncestors = (list, node) => {
  const ancestors = [];
  let current = node;
  while (current && current.idPadre) {
    const parent = list.find(dep => String(dep._id) === String(current.idPadre));
    if (parent) {
      ancestors.push(parent);
      current = parent;
    } else {
      break;
    }
  }
  return ancestors;
};

const OrganigramaPage = () => {
  const [tree, setTree] = useState([]);
  const [flatList, setFlatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [variables, setVariables] = useState([]);
  const [variableValues, setVariableValues] = useState([]);
  const treeViewRef = useRef();
  const [autoExpanded, setAutoExpanded] = useState([]);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [flatRes, varRes, valRes] = await Promise.all([
          apiClient.get("/dependencies/flat"),
          apiClient.get("/variables"),
          apiClient.get("/variable-values")
        ]);
        setFlatList(flatRes.data);
        setTree(buildTreeFromFlatList(flatRes.data));
        setVariables(varRes.data);
        setVariableValues(valRes.data);
      } catch (err) {
        setError("No se pudo cargar el árbol de dependencias, variables o valores actuales");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Obtener variables con valor actual para un nodo
  const getVariablesForNode = useCallback((node) => {
    // Filtrar valores actuales para esta dependencia
    const valuesForDep = variableValues.filter(vv => vv.dependenciaId && (vv.dependenciaId._id === node._id || vv.dependenciaId === node._id));
    // Mapear cada variable con su valor actual (si existe)
    return variables.map(v => {
      const valueObj = valuesForDep.find(val => val.variableId && (val.variableId._id === v._id || val.variableId === v._id));
      const valor_actual = valueObj ? valueObj.valor_actual : null;
      let estado = 'ok';
      if (valor_actual !== null) {
        if (v.flexible) {
          const cInf = v.umbral_critico_inferior;
          const pInf = v.umbral_preventivo_inferior;
          const pSup = v.umbral_preventivo_superior;
          const cSup = v.umbral_critico_superior;
          if (valor_actual < cInf || valor_actual > cSup) estado = 'critico';
          else if (valor_actual < pInf || valor_actual > pSup) estado = 'preventivo';
        } else {
          if (valor_actual >= v.umbral_preventivo) estado = 'critico';
          else if (valor_actual >= v.umbral_critico) estado = 'preventivo';
        }
      }
      return {
        ...v,
        valor_actual,
        estado
      };
    });
  }, [variables, variableValues]);

  // Búsqueda y reconstrucción del árbol filtrado
  const filteredTree = useMemo(() => {
    if (!search || search.length < 2) return tree;
    const term = search.toLowerCase();
    // Filtrar dependencias que coincidan por nombre o funcion
    const found = flatList.filter(dep =>
      (dep.nombre && dep.nombre.toLowerCase().includes(term)) ||
      (dep.funcion && dep.funcion.toLowerCase().includes(term))
    );
    if (found.length === 0) return [];
    // Obtener todos los IDs requeridos (resultados + ancestros)
    const requiredIds = new Set();
    const expandedIds = new Set();
    found.forEach(item => {
      requiredIds.add(String(item._id));
      const ancestors = getAncestors(flatList, item);
      ancestors.forEach(anc => {
        requiredIds.add(String(anc._id));
        expandedIds.add(String(anc._id));
      });
    });
    // Filtrar la lista para solo los nodos requeridos
    const filteredList = flatList.filter(dep => requiredIds.has(String(dep._id)));
    setAutoExpanded(Array.from(expandedIds));
    return buildTreeFromFlatList(filteredList);
  }, [search, flatList, tree]);

  // Efecto para expandir automáticamente los nodos relevantes al buscar
  useEffect(() => {
    if (treeViewRef.current) {
      if (search && search.length >= 2 && autoExpanded.length > 0) {
        // Expandir nodos relevantes cuando hay búsqueda
        if (treeViewRef.current.expandAll) {
          treeViewRef.current.expandAll(autoExpanded);
        }
      } else if (!search || search.length < 2) {
        // Colapsar todo cuando no hay búsqueda o es muy corta
        if (treeViewRef.current.collapseAll) {
          treeViewRef.current.collapseAll();
        }
      }
    }
  }, [autoExpanded, search]);



  // Funciones para expandir/colapsar todo (requiere soporte en OrganigramaTreeView)
  const handleExpandAll = () => {
    if (treeViewRef.current && treeViewRef.current.expandAll) treeViewRef.current.expandAll();
  };
  const handleCollapseAll = () => {
    if (treeViewRef.current && treeViewRef.current.collapseAll) treeViewRef.current.collapseAll();
  };

  return (
    <Box 
      sx={{ 
        p: 4,
        background: isDarkMode
          ? 'linear-gradient(135deg, rgba(45, 55, 72, 0.3) 0%, rgba(26, 32, 44, 0.3) 100%)'
          : 'linear-gradient(135deg, rgba(240, 249, 240, 0.3) 0%, rgba(227, 242, 253, 0.3) 100%)',
        borderRadius: 3,
        minHeight: '80vh',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Avatar sx={{ 
          width: 48, 
          height: 48, 
          background: 'linear-gradient(135deg, #4caf50, #388e3c)',
        }}>
          <AccountTreeIcon sx={{ fontSize: 24 }} />
        </Avatar>
        <Typography 
          variant="h3" 
          sx={{
            fontWeight: 700,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
          }}
        >
          Organigrama de Dependencias
        </Typography>
      </Box>

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
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Buscar dependencia o función"
              value={search}
              onChange={e => setSearch(e.target.value)}
              size="small"
              variant="outlined"
              sx={{ 
                minWidth: 300,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ 
                    mr: 1, 
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' 
                  }} />
                ),
              }}
            />
            <Button 
              onClick={() => setSearch("")} 
              variant="outlined" 
              disabled={!search}
              startIcon={<ClearIcon />}
              sx={{ 
                color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(76, 175, 80, 0.5)',
                fontWeight: 500,
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(76, 175, 80, 0.15)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(76, 175, 80, 0.8)',
                  color: isDarkMode ? '#ffffff' : '#2e7d32',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Limpiar
            </Button>
            <Button 
              onClick={handleExpandAll} 
              variant="outlined"
              startIcon={<ExpandMoreIcon />}
              sx={{ 
                color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(76, 175, 80, 0.5)',
                fontWeight: 500,
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(76, 175, 80, 0.15)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(76, 175, 80, 0.8)',
                  color: isDarkMode ? '#ffffff' : '#2e7d32',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Expandir todo
            </Button>
            <Button 
              onClick={handleCollapseAll} 
              variant="outlined"
              startIcon={<ChevronRightIcon />}
              sx={{ 
                color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(76, 175, 80, 0.5)',
                fontWeight: 500,
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(76, 175, 80, 0.15)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(76, 175, 80, 0.8)',
                  color: isDarkMode ? '#ffffff' : '#2e7d32',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Contraer todo
            </Button>
          </Box>
        </CardContent>
      </Card>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        filteredTree.length === 0 && search ? (
          <Alert severity="info">No se encontraron resultados para "{search}".</Alert>
        ) : (
          <OrganigramaTreeView
            ref={treeViewRef}
            tree={filteredTree}
            getVariablesForNode={getVariablesForNode}
            searchTerm={search}
            onNodeSelect={(node) => navigate('/dashboard', { state: { dependencia: node.nombre } })}
          />
        )
      )}
    </Box>
  );
};

export default OrganigramaPage; 