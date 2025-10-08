/* eslint-disable no-restricted-globals */
import {
  compararYCombinar,
  asignarIdsYDetectarDiscrepancias,
  depurarDiscrepancias,
} from "./utils";

self.onmessage = async (e) => {
  const { type, payload } = e.data || {};
  try {
    if (type === "process") {
      const { compararMatrix, metadata, originalMapMatrix, filtros } = payload;
      // originalMapMatrix is a tuple [keys, values]? We expect already built Map in main thread normally,
      // but here we receive a simple array of [dni, obj] to reconstruct Map for worker-friendly transfer.
      const originalMap = new Map(originalMapMatrix);
      const result = compararYCombinar({ compararMatrix, metadata, originalMap, filtros });
      postMessage({ ok: true, type, result });
      return;
    }
    if (type === "assign") {
      const { agentesConId, funcionesRows } = payload;
      const result = asignarIdsYDetectarDiscrepancias(agentesConId, funcionesRows);
      postMessage({ ok: true, type, result });
      return;
    }
    if (type === "depurar") {
      const { discrepancias, eliminados, proyectos } = payload;
      const eliminadosSet = new Set(eliminados || []);
      const proyectosSet = new Set(proyectos || []);
      const result = depurarDiscrepancias(discrepancias, eliminadosSet, proyectosSet);
      postMessage({ ok: true, type, result });
      return;
    }
    postMessage({ ok: false, error: "Tipo de mensaje no soportado" });
  } catch (err) {
    postMessage({ ok: false, error: err?.message || String(err) });
  }
};

