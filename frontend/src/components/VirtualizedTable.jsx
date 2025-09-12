import React, { useMemo, useState, useEffect, useCallback } from "react";
import { FixedSizeList as List } from "react-window";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Tooltip,
} from "@mui/material";
import icons from "../ui/icons.js";
import { chunkArray } from "../utils/performance.js";

const VirtualizedTable = ({
  data,
  onEdit,
  onDelete,
  getNombrePadre,
  height = 400,
}) => {
  const [processedData, setProcessedData] = useState([]);

  useEffect(() => {
    if (data.length > 1000) {
      const chunks = chunkArray(data, 500);
      let index = 0;
      setProcessedData([]);
      const schedule =
        typeof requestIdleCallback === "function"
          ? requestIdleCallback
          : (cb) => setTimeout(cb, 0);
      const processChunk = (deadline) => {
        while (
          index < chunks.length &&
          (!deadline || deadline.timeRemaining() > 0)
        ) {
          setProcessedData((prev) => [...prev, ...chunks[index]]);
          index++;
        }
        if (index < chunks.length) schedule(processChunk);
      };
      schedule(processChunk);
    } else {
      setProcessedData(data);
    }
  }, [data]);

  // Componente para renderizar cada fila
  const Row = useCallback(
    ({ index, style }) => {
      const sec = processedData[index];

    return (
      <div
        style={{
          ...style,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid rgba(224, 224, 224, 1)",
          padding: "8px 16px",
          backgroundColor:
            index % 2 === 0 ? "transparent" : "rgba(0, 0, 0, 0.02)",
        }}
        onMouseEnter={(e) =>
          (e.target.style.backgroundColor = "rgba(0, 0, 0, 0.04)")
        }
        onMouseLeave={(e) =>
          (e.target.style.backgroundColor =
            index % 2 === 0 ? "transparent" : "rgba(0, 0, 0, 0.02)")
        }
      >
        {/* Nombre */}
        <div
          style={{
            flex: "2 1 300px",
            maxWidth: 300,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            paddingRight: "16px",
          }}
        >
          {sec.nivel > 1 && (
            <icons.chevronDerecha
              fontSize="small"
              sx={{ verticalAlign: "middle", color: "gray.500", mr: 0.5 }}
            />
          )}
          <span title={sec.nombre}>{sec.nombre}</span>
        </div>

        {/* Código */}
        <div
          style={{
            flex: "1 1 150px",
            maxWidth: 150,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            paddingRight: "16px",
          }}
        >
          <span title={sec.codigo}>{sec.codigo}</span>
        </div>

        {/* Pertenece a */}
        <div
          style={{
            flex: "1.5 1 200px",
            maxWidth: 200,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            paddingRight: "16px",
          }}
        >
          {getNombrePadre(sec.idPadre)}
        </div>

        {/* Posición */}
        <div
          style={{
            flex: "0.5 1 80px",
            textAlign: "center",
            paddingRight: "16px",
          }}
        >
          {sec.orden !== undefined ? sec.orden : "-"}
        </div>

        {/* Activo */}
        <div
          style={{
            flex: "0.8 1 100px",
            textAlign: "center",
            paddingRight: "16px",
          }}
        >
          {sec.activo !== false ? "Activo" : "Desactivado"}
        </div>

        {/* Acciones */}
        <div style={{ flex: "1 1 150px", textAlign: "center" }}>
          <Tooltip title="Editar">
            <Button
              size="small"
              variant="outlined"
              sx={{ mr: 1, minWidth: "auto", px: 1 }}
              onClick={() => onEdit(sec)}
            >
              Editar
            </Button>
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button
              size="small"
              variant="outlined"
              color="error"
              sx={{ minWidth: "auto", px: 1 }}
              onClick={() => onDelete(sec._id)}
            >
              Eliminar
            </Button>
          </Tooltip>
        </div>
      </div>
    );
    },
    [processedData, getNombrePadre, onDelete, onEdit],
  );

  const memoizedData = useMemo(() => processedData, [processedData]);

  return (
    <div style={{ marginTop: "24px" }}>
      {/* Encabezado de la tabla */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 16px",
          backgroundColor: "rgba(0, 0, 0, 0.04)",
          borderBottom: "2px solid rgba(224, 224, 224, 1)",
          fontWeight: "bold",
          fontSize: "0.875rem",
        }}
      >
        <div style={{ flex: "2 1 300px", paddingRight: "16px" }}>Nombre</div>
        <div style={{ flex: "1 1 150px", paddingRight: "16px" }}>Código</div>
        <div style={{ flex: "1.5 1 200px", paddingRight: "16px" }}>
          Pertenece a:
        </div>
        <div
          style={{
            flex: "0.5 1 80px",
            textAlign: "center",
            paddingRight: "16px",
          }}
        >
          Posición
        </div>
        <div
          style={{
            flex: "0.8 1 100px",
            textAlign: "center",
            paddingRight: "16px",
          }}
        >
          Activo
        </div>
        <div style={{ flex: "1 1 150px", textAlign: "center" }}>Acciones</div>
      </div>

      {/* Lista virtualizada */}
      <div
        style={{
          height: height,
          border: "1px solid rgba(224, 224, 224, 1)",
          borderTop: "none",
        }}
      >
        <List
          height={height}
          itemCount={memoizedData.length}
          itemSize={60}
          itemData={memoizedData}
        >
          {Row}
        </List>
      </div>

      {/* Información de total de registros */}
      <div
        style={{
          padding: "8px 16px",
          borderTop: "1px solid rgba(224, 224, 224, 1)",
          backgroundColor: "rgba(0, 0, 0, 0.02)",
          fontSize: "0.875rem",
          color: "rgba(0, 0, 0, 0.6)",
          textAlign: "center",
        }}
      >
        Total: {memoizedData.length} dependencias
      </div>
    </div>
  );
};

export default VirtualizedTable;
