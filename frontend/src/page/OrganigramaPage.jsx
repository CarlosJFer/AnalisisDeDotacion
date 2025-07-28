import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import OrganigramaTreeView from "../components/OrganigramaTreeView.jsx";
import { Box, Typography, CircularProgress, Alert, TextField, Button } from "@mui/material";
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
        if (valor_actual >= v.umbral_critico && valor_actual < v.umbral_preventivo) estado = 'preventivo';
        if (valor_actual >= v.umbral_preventivo) estado = 'critico';
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Organigrama de Dependencias
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Buscar dependencia o función"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          variant="outlined"
        />
        <Button onClick={() => setSearch("")} variant="outlined" disabled={!search}>
          Limpiar
        </Button>
        <Button onClick={handleExpandAll} variant="outlined">Expandir todo</Button>
        <Button onClick={handleCollapseAll} variant="outlined">Contraer todo</Button>
      </Box>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        filteredTree.length === 0 && search ? (
          <Alert severity="info">No se encontraron resultados para "{search}".</Alert>
        ) : (
          <OrganigramaTreeView ref={treeViewRef} tree={filteredTree} getVariablesForNode={getVariablesForNode} searchTerm={search} />
        )
      )}
    </Box>
  );
};

export default OrganigramaPage; 