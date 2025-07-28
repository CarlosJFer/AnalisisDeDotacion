import React, { useMemo } from "react";
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Typography, useTheme, Tooltip, Box } from "@mui/material";
import { FaExclamationTriangle } from 'react-icons/fa';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useImperativeHandle, forwardRef, useState } from "react";
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Función para determinar el estado de las variables (solo alerta si hay preventivo/crítico)
function getEstadoVariables(variables) {
  if (!variables || variables.length === 0) return 'sin';
  let hayCritico = false;
  let hayPreventivo = false;
  for (const v of variables) {
    if (v.estado === 'critico') hayCritico = true;
    else if (v.estado === 'preventivo') hayPreventivo = true;
  }
  if (hayCritico) return 'critico';
  if (hayPreventivo) return 'preventivo';
  return 'ok'; // Verde si todas están ok
}

// Ícono de estado
function EstadoIcon({ estado }) {
  if (estado === 'critico') return <FaExclamationTriangle color="#e53935" title="Crítico" style={{ marginLeft: 8 }} />;
  if (estado === 'preventivo') return <FaExclamationTriangle color="#fbc02d" title="Preventivo" style={{ marginLeft: 8 }} />;
  if (estado === 'ok') return <FaExclamationTriangle color="#43a047" title="Normal" style={{ marginLeft: 8 }} />;
  if (estado === 'sin') return <FaExclamationTriangle color="#bdbdbd" title="Sin variables" style={{ marginLeft: 8 }} />;
  return null;
}

function highlightText(text, term) {
  if (!term || term.length < 2) return text;
  const regex = new RegExp(`(${term})`, 'gi');
  const parts = String(text).split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <span key={i} style={{ background: '#e3f2fd', color: '#1565c0', fontWeight: 600 }}>{part}</span> : part
  );
}

// Renderizado recursivo del árbol
const renderTree = (node, textColor, getVariablesForNode, expanded = [], searchTerm = "") => {
  const variables = getVariablesForNode ? getVariablesForNode(node) : [];
  const estado = getEstadoVariables(variables);
  const variablesAlerta = variables.filter(v => v.estado === 'critico' || v.estado === 'preventivo');
  let tooltipContent = null;
  if (estado === 'sin') {
    tooltipContent = <Box color="gray">Sin variables asociadas</Box>;
  } else if (variablesAlerta.length > 0) {
    tooltipContent = (
      <Box>
        {variablesAlerta.map((v, i) => (
          <Box key={i}>
            <b>{v.nombre}</b>: {v.valor_actual} {v.unidad_medida} (<b>{v.estado.toUpperCase()}</b>)<br/>
            <small>Umbral crítico: {v.umbral_critico}, preventivo: {v.umbral_preventivo}, máximo: {v.valor_maximo}</small>
          </Box>
        ))}
      </Box>
    );
  } else if (estado === 'ok') {
    tooltipContent = <Box color="#43a047">Todas las variables en estado normal</Box>;
  }
  // Tooltip de función
  const funcionTooltip = node.funcion && node.funcion.trim().length > 0
    ? node.funcion
    : 'Sin descripción de funciones';
  const isExpanded = Array.isArray(expanded) && expanded.includes(node._id);
  return (
    <TreeItem
      key={node._id}
      itemId={String(node._id)}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: textColor }}>
            <b>{highlightText(node.nombre, searchTerm)}</b>
          </Typography>
          {estado && tooltipContent && (
            <Tooltip title={tooltipContent} placement="right" arrow>
              <span><EstadoIcon estado={estado} /></span>
            </Tooltip>
          )}
          {node.funcion && node.funcion.trim().length > 0 ? (
            <Tooltip title={<span>{highlightText(node.funcion, searchTerm)}</span>} placement="right" arrow>
              <InfoOutlinedIcon fontSize="small" sx={{ ml: 1, color: '#888' }} />
            </Tooltip>
          ) : null}
        </Box>
      }
    >
      {Array.isArray(node.children) && node.children.length > 0
        ? node.children.map((child) => renderTree(child, textColor, getVariablesForNode, expanded, searchTerm))
        : null}
    </TreeItem>
  );
};

const OrganigramaTreeView = forwardRef(({ tree, getVariablesForNode, searchTerm }, ref) => {
  const theme = useTheme();
  const treeMemo = useMemo(() => tree, [tree]);
  const bgColor = theme.palette.background.paper;
  const textColor = theme.palette.text.primary;
  // Estado para nodos expandidos
  const [expanded, setExpanded] = useState([]);

  // Funciones para expandir/colapsar todo
  useImperativeHandle(ref, () => ({
    expandAll: (ids) => {
      if (Array.isArray(ids) && ids.length > 0) {
        setExpanded(ids);
      } else {
        // Expandir todo el árbol si no se pasa argumento
        const getAllIds = (nodes) => nodes.flatMap(n => [n._id, ...(n.children ? getAllIds(n.children) : [])]);
        setExpanded(getAllIds(treeMemo));
      }
    },
    collapseAll: () => {
      setExpanded([]);
    }
  }), [treeMemo]);

  if (!treeMemo || treeMemo.length === 0) {
    return <Typography color="text.secondary">No hay dependencias para mostrar.</Typography>;
  }
  return (
    <SimpleTreeView
      expandedItems={expanded}
      onExpandedItemsChange={(_event, nodeIds) => setExpanded(nodeIds)}
      sx={{ flexGrow: 1, overflowY: 'auto', mt: 2, background: bgColor, borderRadius: 2, p: 2 }}
    >
      {treeMemo.map((node) => renderTree(node, textColor, getVariablesForNode, expanded, searchTerm))}
    </SimpleTreeView>
  );
});

export default OrganigramaTreeView; 