import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import apiClient from "../../services/api";

const AgrupamientoNivelesView = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [datasetInfo, setDatasetInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await apiClient.get("/tools/agrupamiento-niveles/records");
        setDatasetInfo(data.dataset);
        setRecords(data.records || []);
      } catch (e) {
        setError(e?.response?.data?.message || "Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = records.length ? Object.keys(records[0].data || {}) : [];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Ver Agrupamientos y Niveles
      </Typography>
      {loading && <Typography>Cargando...</Typography>}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {!loading && !error && (
        <>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {datasetInfo ? `Conjunto: ${datasetInfo._id} — Registros: ${records.length}` : "Sin datos cargados aún."}
          </Typography>
          {records.length > 0 && (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {columns.map((c) => (
                      <TableCell key={c}>{c}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.slice(0, 20).map((r) => (
                    <TableRow key={r._id}>
                      {columns.map((c) => (
                        <TableCell key={c}>{String(r.data?.[c] ?? "")}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Box>
  );
};

export default AgrupamientoNivelesView;
