import React, { useMemo, memo, useCallback, useState, useRef } from "react";
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Typography, Tooltip, Box, Avatar, Chip, Card } from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BusinessIcon from '@mui/icons-material/Business';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useImperativeHandle, forwardRef } from "react";
import { useTheme } from '../context/ThemeContext.jsx';

// Función memoizada para determinar estado de variables
const getEstadoVariables = (variables) => {
  if (!variables || variables.length === 0) return 'sin';
  let hayCritico = false;
  let hayPreventivo = false;
  for (const v of variables) {
    if (v.estado === 'critico') hayCritico = true;
    else if (v.estado === 'preventivo') hayPreventivo = true;
  }
  if (hayCritico) return 'critico';
  if (hayPreventivo) return 'preventivo';
  return 'ok';
};

// Componente de ícono ultra-optimizado
const EstadoIcon = memo(({ estado }) => {
  const iconMap = {
    critico: <ErrorIcon fontSize="small" sx={{ color: '#f44336' }} />,
    preventivo: <WarningIcon fontSize="small" sx={{ color: '#ff9800' }} />,
    ok: <CheckCircleIcon fontSize="small" sx={{ color: '#4caf50' }} />,
    sin: <HelpOutlineIcon fontSize="small" sx={{ color: '#9e9e9e' }} />
  };
  return iconMap[estado] || null;
});

// Chip ultra-optimizado con estilos pre-calculados
const EstadoChip = memo(({ estado, variablesCount }) => {
  const chipStyles = useMemo(() => ({
    critico: {
      background: 'linear-gradient(135deg, #f44336, #d32f2f)',
      color: 'white',
      fontWeight: 600,
      fontSize: '0.7rem',
      height: 20,
    },
    preventivo: {
      background: 'linear-gradient(135deg, #ff9800, #f57c00)',
      color: 'white',
      fontWeight: 600,
      fontSize: '0.7rem',
      height: 20,
    },
    ok: {
      background: 'linear-gradient(135deg, #4caf50, #388e3c)',
      color: 'white',
      fontWeight: 600,
      fontSize: '0.7rem',
      height: 20,
    },
    sin: {
      background: 'linear-gradient(135deg, #9e9e9e, #757575)',
      color: 'white',
      fontWeight: 600,
      fontSize: '0.7rem',
      height: 20,
    }
  }), []);

  const style = chipStyles[estado];
  if (!style) return null;

  return (
    <Chip 
      size="small" 
      label={`${variablesCount} ${estado === 'critico' ? 'Críticas' : estado === 'preventivo' ? 'Preventivas' : estado === 'ok' ? 'OK' : 'Sin variables'}`}
      sx={style}
    />
  );
});

// Función de resaltado ultra-optimizada
const HighlightText = memo(({ text, term }) => {
  if (!term || term.length < 2) return text;
  
  const parts = String(text).split(new RegExp(`(${term})`, 'gi'));
  return parts.map((part, i) =>
    new RegExp(term, 'i').test(part) ? (
      <span 
        key={i} 
        style={{ 
          background: 'linear-gradient(135deg, #2196f3, #1976d2)', 
          color: 'white', 
          fontWeight: 600,
          padding: '2px 4px',
          borderRadius: '4px',
        }}
      >
        {part}
      </span>
    ) : part
  );
});

// Componente de nodo ultra-optimizado
const TreeNode = memo(({
  node,
  isDarkMode,
  getVariablesForNode,
  searchTerm,
  level = 0,
  expanded,
  onToggle,
  onNodeSelect
}) => {
  // Memoización agresiva de variables
  const variables = useMemo(() => 
    getVariablesForNode ? getVariablesForNode(node) : [], 
    [getVariablesForNode, node._id] // Solo re-calcular si cambia el ID del nodo
  );
  
  const estado = useMemo(() => getEstadoVariables(variables), [variables]);
  
  // Tooltip simplificado para mejor rendimiento
  const tooltipContent = useMemo(() => {
    if (estado === 'sin') return 'Sin variables asociadas';
    if (estado === 'ok') return 'Todas las variables en estado normal';
    
    const variablesAlerta = variables.filter(v => v.estado === 'critico' || v.estado === 'preventivo');
    if (variablesAlerta.length > 0) {
      return `${variablesAlerta.length} variables en alerta`;
    }
    return null;
  }, [estado, variables]);

  const funcionTooltip = useMemo(() => {
    return node.funcion && node.funcion.trim() ? node.funcion : 'Sin descripción de funciones';
  }, [node.funcion]);

  // Estilos pre-calculados
  const avatarColor = useMemo(() => {
    const colors = {
      critico: 'linear-gradient(135deg, #f44336, #d32f2f)',
      preventivo: 'linear-gradient(135deg, #ff9800, #f57c00)',
      ok: 'linear-gradient(135deg, #4caf50, #388e3c)',
      sin: 'linear-gradient(135deg, #9e9e9e, #757575)'
    };
    return colors[estado];
  }, [estado]);

  const avatarSize = level === 0 ? 28 : 24;
  const fontSize = level === 0 ? '0.95rem' : '0.85rem';

  return (
    <TreeItem
      itemId={String(node._id)}
      sx={{
        '& .MuiTreeItem-content': {
          padding: '6px 8px', // Padding reducido
          borderRadius: 2,
          margin: '1px 0', // Margin reducido
          background: isDarkMode
            ? 'rgba(45, 55, 72, 0.8)'
            : 'rgba(255, 255, 255, 0.9)',
          border: isDarkMode
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(0, 0, 0, 0.1)',
          transition: 'background-color 0.15s ease', // Solo transición de color
          '&:hover': {
            background: isDarkMode
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(76, 175, 80, 0.08)',
          },
        },
      }}
      label={
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 0.25, // Padding vertical reducido
        }} onClick={(e) => { e.stopPropagation(); onNodeSelect && onNodeSelect(node); }}>
          <Avatar 
            sx={{ 
              width: avatarSize, 
              height: avatarSize,
              background: avatarColor,
            }}
          >
            {level === 0 
              ? <BusinessIcon sx={{ fontSize: avatarSize * 0.6 }} />
              : <AccountTreeIcon sx={{ fontSize: avatarSize * 0.6 }} />
            }
          </Avatar>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: level === 0 ? 700 : 600,
                  fontSize,
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                  lineHeight: 1.2,
                }}
              >
                <HighlightText text={node.nombre} term={searchTerm} />
              </Typography>
              
              {estado && variables.length > 0 && (
                <EstadoChip estado={estado} variablesCount={variables.length} />
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {estado && tooltipContent && (
              <Tooltip title={tooltipContent} placement="right" enterDelay={300}>
                <Box sx={{ cursor: 'help' }}>
                  <EstadoIcon estado={estado} />
                </Box>
              </Tooltip>
            )}
            
            {node.funcion && node.funcion.trim() && (
              <Tooltip title={funcionTooltip} placement="right" enterDelay={300}>
                <InfoOutlinedIcon 
                  fontSize="small" 
                  sx={{ 
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                    cursor: 'help',
                  }} 
                />
              </Tooltip>
            )}
          </Box>
        </Box>
      }
    >
      {Array.isArray(node.children) && node.children.length > 0 && 
        node.children.map((child) => (
          <TreeNode
            key={child._id}
            node={child}
            isDarkMode={isDarkMode}
            getVariablesForNode={getVariablesForNode}
            searchTerm={searchTerm}
            level={level + 1}
            expanded={expanded}
            onToggle={onToggle}
            onNodeSelect={onNodeSelect}
          />
        ))
      }
    </TreeItem>
  );
});

const OptimizedOrganigramaTreeView = forwardRef(({ tree, getVariablesForNode, searchTerm, onNodeSelect }, ref) => {
  const { isDarkMode } = useTheme();
  const treeMemo = useMemo(() => tree, [tree]);
  const [expanded, setExpanded] = useState([]);
  
  // Función optimizada para obtener todos los IDs
  const getAllIds = useCallback((nodes) => {
    const ids = [];
    const traverse = (nodeList) => {
      for (const node of nodeList) {
        ids.push(node._id);
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      }
    };
    traverse(nodes);
    return ids;
  }, []);

  // Callbacks ultra-optimizados con batching
  const handleExpandedItemsChange = useCallback((event, nodeIds) => {
    // Usar requestAnimationFrame para batching
    requestAnimationFrame(() => {
      setExpanded(nodeIds);
    });
  }, []);

  useImperativeHandle(ref, () => ({
    expandAll: (ids) => {
      // Usar setTimeout para evitar bloqueo del UI
      setTimeout(() => {
        if (Array.isArray(ids) && ids.length > 0) {
          setExpanded(ids);
        } else {
          const allIds = getAllIds(treeMemo);
          // Expandir en chunks para mejor rendimiento
          const chunkSize = 50;
          let currentIndex = 0;
          
          const expandChunk = () => {
            const chunk = allIds.slice(currentIndex, currentIndex + chunkSize);
            if (chunk.length > 0) {
              setExpanded(prev => [...prev, ...chunk]);
              currentIndex += chunkSize;
              if (currentIndex < allIds.length) {
                requestAnimationFrame(expandChunk);
              }
            }
          };
          
          setExpanded([]); // Limpiar primero
          requestAnimationFrame(expandChunk);
        }
      }, 0);
    },
    collapseAll: () => {
      // Colapsar inmediatamente
      setExpanded([]);
    }
  }), [treeMemo, getAllIds]);

  if (!treeMemo || treeMemo.length === 0) {
    return (
      <Card sx={{
        background: isDarkMode
          ? 'rgba(45, 55, 72, 0.8)'
          : 'rgba(255, 255, 255, 0.9)',
        border: isDarkMode
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: 3,
      }}>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Avatar sx={{ 
            width: 64, 
            height: 64, 
            mx: 'auto',
            mb: 2,
            background: 'linear-gradient(135deg, #9e9e9e, #757575)',
          }}>
            <HelpOutlineIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            No hay dependencias para mostrar
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={{
      background: isDarkMode
        ? 'rgba(45, 55, 72, 0.8)'
        : 'rgba(255, 255, 255, 0.9)',
      border: isDarkMode
        ? '1px solid rgba(255, 255, 255, 0.1)'
        : '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: 3,
      overflow: 'hidden',
    }}>
      <SimpleTreeView
        expandedItems={expanded}
        onExpandedItemsChange={handleExpandedItemsChange}
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          p: 2,
          maxHeight: '70vh',
          // Optimizaciones de scroll
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
          },
        }}
      >
        {treeMemo.map((node) => (
          <TreeNode
            key={node._id}
            node={node}
            isDarkMode={isDarkMode}
            getVariablesForNode={getVariablesForNode}
            searchTerm={searchTerm}
            level={0}
            expanded={expanded}
            onNodeSelect={onNodeSelect}
          />
        ))}
      </SimpleTreeView>
    </Card>
  );
});

export default memo(OptimizedOrganigramaTreeView);