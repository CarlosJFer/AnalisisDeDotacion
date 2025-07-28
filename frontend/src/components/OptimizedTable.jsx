import React, { memo, useMemo, useState, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  TextField,
  Pagination,
  Typography,
  Card,
} from '@mui/material';
import { useTheme } from '../context/ThemeContext.jsx';
import { optimizedStyles, useDebounce, useVirtualPagination } from '../utils/performance.js';

// Componente de fila memoizado para evitar re-renders innecesarios
const TableRowMemo = memo(({ index, style, data }) => {
  const { items, columns, onRowClick, isDarkMode } = data;
  const item = items[index];

  return (
    <div style={style}>
      <TableRow
        onClick={() => onRowClick?.(item)}
        sx={{
          cursor: onRowClick ? 'pointer' : 'default',
          '&:hover': {
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(76, 175, 80, 0.05)',
          },
          transition: 'background-color 0.15s ease', // Optimizado
        }}
      >
        {columns.map((column) => (
          <TableCell key={column.key} sx={{ py: 1 }}>
            {column.render ? column.render(item) : item[column.key]}
          </TableCell>
        ))}
      </TableRow>
    </div>
  );
});

// Componente principal de tabla optimizada
const OptimizedTable = ({
  data = [],
  columns = [],
  searchable = true,
  searchPlaceholder = "Buscar...",
  onRowClick,
  itemHeight = 60,
  maxHeight = 400,
  pageSize = 50,
  enableVirtualization = true,
}) => {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Debounce para optimizar búsquedas

  // Filtrado optimizado con useMemo
  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm) return data;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    return data.filter(item =>
      columns.some(column => {
        const value = item[column.key];
        return value && value.toString().toLowerCase().includes(searchLower);
      })
    );
  }, [data, debouncedSearchTerm, columns]);

  // Paginación virtual para datasets grandes
  const {
    paginatedData,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useVirtualPagination(filteredData, pageSize);

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(0); // Reset a primera página al buscar
  }, [setCurrentPage]);

  const handlePageChange = useCallback((event, page) => {
    setCurrentPage(page - 1);
  }, [setCurrentPage]);

  // Datos para la virtualización
  const listData = useMemo(() => ({
    items: enableVirtualization ? paginatedData : filteredData,
    columns,
    onRowClick,
    isDarkMode,
  }), [paginatedData, filteredData, columns, onRowClick, isDarkMode, enableVirtualization]);

  return (
    <Card sx={optimizedStyles.glassmorphism(isDarkMode, 'normal')}>
      {/* Barra de búsqueda optimizada */}
      {searchable && (
        <Box sx={{ p: 2, borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}` }}>
          <TextField
            fullWidth
            size="small"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'border-color 0.15s ease', // Optimizado
              }
            }}
          />
        </Box>
      )}

      {/* Información de resultados */}
      <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {filteredData.length} resultado{filteredData.length !== 1 ? 's' : ''}
          {debouncedSearchTerm && ` para "${debouncedSearchTerm}"`}
        </Typography>
        {enableVirtualization && totalPages > 1 && (
          <Typography variant="body2" color="text.secondary">
            Página {currentPage + 1} de {totalPages}
          </Typography>
        )}
      </Box>

      {/* Tabla con virtualización condicional */}
      <TableContainer sx={{ maxHeight: enableVirtualization ? maxHeight : 'none' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow
              sx={{
                background: isDarkMode
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(76, 175, 80, 0.05)',
              }}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    py: 1.5,
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          
          {enableVirtualization && paginatedData.length > 20 ? (
            // Virtualización para listas muy grandes
            <TableBody>
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ p: 0 }}>
                  <List
                    height={Math.min(maxHeight, paginatedData.length * itemHeight)}
                    itemCount={paginatedData.length}
                    itemSize={itemHeight}
                    itemData={listData}
                    overscanCount={5} // Renderiza 5 elementos extra para scroll suave
                  >
                    {TableRowMemo}
                  </List>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            // Renderizado normal para listas pequeñas
            <TableBody>
              {(enableVirtualization ? paginatedData : filteredData).map((item, index) => (
                <TableRow
                  key={item.id || index}
                  onClick={() => onRowClick?.(item)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover': {
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(76, 175, 80, 0.05)',
                    },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} sx={{ py: 1 }}>
                      {column.render ? column.render(item) : item[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </TableContainer>

      {/* Paginación optimizada */}
      {enableVirtualization && totalPages > 1 && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={currentPage + 1}
            onChange={handlePageChange}
            color="primary"
            size="small"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Estado vacío */}
      {filteredData.length === 0 && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {debouncedSearchTerm ? 'No se encontraron resultados' : 'No hay datos para mostrar'}
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default memo(OptimizedTable);