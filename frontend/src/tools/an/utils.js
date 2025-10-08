import * as XLSX from "xlsx";
import {
  ASIGNACIONES_ESPECIALES,
  FUNCIONES_ESPECIALES_POR_NIVEL,
} from "./constants";

// Util: normalizar strings (trim, lower, sin acentos)
export function normalize(s) {
  if (s == null) return "";
  const txt = String(s).trim();
  if (!txt) return "";
  return txt
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Lee un archivo Excel y devuelve workbook
export async function readWorkbook(file) {
  const data = await file.arrayBuffer();
  return XLSX.read(data, { type: "array" });
}

// Convierte hoja a matriz de celdas (header:1)
export function sheetToMatrix(worksheet) {
  return XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
}

// Detecta fila de encabezados y mapea columnas en "Comparar"
export function detectCompareSheetMetadata(worksheet) {
  const MAX_ROWS_TO_SCAN = 15;
  const MIN_HEADERS_MATCH = 3;
  const keyHeaders = [
    "APELLIDO Y NOM.",
    "AGRUP",
    "NIVEL",
    "SITUACION DE REVISTA",
    "SECRETARIA",
  ];

  const headerMappingConfig = {
    dni: { names: ["DATOS CUIL"], instance: 2 },
    apellidoNombre: { names: ["APELLIDO Y NOM.", "APELLIDO Y NOMBRE"], instance: 1 },
    agrupamiento: { names: ["AGRUP", "AGRUPAMIENTO"], instance: 1 },
    nivel: { names: ["NIVEL"], instance: 1 },
    situacionRevista: { names: ["SITUACION DE REVISTA"], instance: 1 },
    secretaria: { names: ["SECRETARIA"], instance: 1 },
    funcion: { names: ["FUNCION", "FUNCIONES"], instance: 1 },
    dependencia: { names: ["DEPENDENCIA", "DEPENDENCIAS", "DEPENDENCIA DONDE TRABAJA"], instance: 1 },
  };

  const values = sheetToMatrix(worksheet);
  const rowsToScan = values.slice(0, Math.min(MAX_ROWS_TO_SCAN, values.length));

  let headerRowIndexInValues = -1; // 0-based
  for (let i = 0; i < rowsToScan.length; i++) {
    const row = rowsToScan[i].map((c) => String(c).toUpperCase().trim());
    let matchCount = 0;
    for (const cell of row) {
      if (!cell) continue;
      if (keyHeaders.some((kh) => cell.includes(kh))) matchCount++;
    }
    if (matchCount >= MIN_HEADERS_MATCH) {
      headerRowIndexInValues = i;
      break;
    }
  }
  if (headerRowIndexInValues === -1) return null;

  const actualHeaders = rowsToScan[headerRowIndexInValues].map((h) =>
    String(h).toUpperCase().trim(),
  );

  const columnMap = {}; // claveInterna -> index
  for (const key of Object.keys(headerMappingConfig)) {
    const { names, instance } = headerMappingConfig[key];
    let count = 0;
    let found = -1;
    for (let idx = 0; idx < actualHeaders.length; idx++) {
      const headerText = actualHeaders[idx];
      if (names.some((n) => headerText.includes(n.toUpperCase()))) {
        count++;
        if (count === instance) {
          found = idx;
          break;
        }
      }
    }
    if (found === -1 && instance > 1) {
      // fallback a la primera
      for (let idx = 0; idx < actualHeaders.length; idx++) {
        const headerText = actualHeaders[idx];
        if (names.some((n) => headerText.includes(n.toUpperCase()))) {
          found = idx;
          break;
        }
      }
    }
    if (found !== -1) columnMap[key] = found;
  }

  const essentialKeys = ["dni","apellidoNombre","agrupamiento","nivel","situacionRevista","secretaria"]; // funcion y dependencia opcionales
  const allFound = essentialKeys.every((k) => typeof columnMap[k] !== "undefined");
  if (!allFound) return null;

  const headerRowSheetIndex = headerRowIndexInValues + 1; // 1-based
  const dataRowSheetIndex = headerRowSheetIndex + 1;
  return { headerRowSheetIndex, dataRowSheetIndex, columnMap };
}

// Construye mapa de Original (desde fila 4)
export function buildOriginalMap(worksheet) {
  const data = sheetToMatrix(worksheet);
  const rows = data.slice(3); // desde fila 4 (1-based)
  const map = new Map(); // dni -> objeto
  for (const row of rows) {
    if (!row || !row.length) continue;
    const dni = String(row[2] ?? "").trim();
    if (!dni) continue;
    // filtrar filas vacias/encabezados repetidos
    const empty = row.every((c) => String(c).trim() === "");
    if (empty) continue;
    const obj = {
      legajo: row[0],
      dni,
      apellidoNombre: row[4],
      situacionRevista: row[6],
      funcion: row[7],
      dependencia: row[8],
      secretaria: row[9],
      subsecretaria: row[10],
      direccionesGenerales: row[11],
    };
    map.set(dni, obj);
  }
  return map;
}

// Reglas de conversión
export function procesarAgrupamiento(valor) {
  const num = Number(valor);
  if (Number.isNaN(num)) return String(valor).trim();
  const map = { 83: "IA", 84: "GG", 85: "SG", 86: "AI", 87: "FA", 88: "AC", 89: "IS" };
  return map[num] || String(valor);
}

export function procesarNivel(valor) {
  const num = Number(valor);
  if (Number.isNaN(num)) return String(valor).trim();
  const map = { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "F", 7: "G", 8: "H", 9: "I", 10: "J" };
  return map[num] || String(valor);
}

// Procesa comparación y genera Agentes con ID y Faltantes
export function compararYCombinar({ compararMatrix, metadata, originalMap, filtros }) {
  const { columnMap } = metadata;
  const startRow = metadata.dataRowSheetIndex - 1; // 0-based
  const datosComparar = compararMatrix
    .slice(startRow)
    .filter((row) => Array.isArray(row) && !row.every((c) => String(c).trim() === ""));

  // aplicar filtros
  const filtered = datosComparar.filter((row) => {
    const situacion = String(row[columnMap.situacionRevista] ?? "").trim();
    const secretaria = String(row[columnMap.secretaria] ?? "").trim();
    const sitOk = !filtros?.situaciones?.length || filtros.situaciones.includes(situacion);
    const secOk = !filtros?.secretarias?.length || filtros.secretarias.includes(secretaria);
    return sitOk && secOk;
  });

  const agentesConId = [];
  const faltantes = [];
  for (const row of filtered) {
    const dni = String(row[columnMap.dni] ?? "").trim();
    if (!dni) continue;
    const agrupProc = procesarAgrupamiento(row[columnMap.agrupamiento]);
    const nivelProc = procesarNivel(row[columnMap.nivel]);

    const registroOriginal = originalMap.get(dni);
    if (registroOriginal) {
      agentesConId.push([
        "", // ID vacío
        registroOriginal.dni,
        registroOriginal.apellidoNombre,
        registroOriginal.situacionRevista,
        agrupProc,
        nivelProc,
        registroOriginal.funcion,
        registroOriginal.dependencia,
        registroOriginal.secretaria,
        registroOriginal.subsecretaria,
        registroOriginal.direccionesGenerales,
      ]);
    } else {
      const apeNom = String(row[columnMap.apellidoNombre] ?? "N/A").trim();
      const sit = String(row[columnMap.situacionRevista] ?? "N/A").trim();
      const sec = String(row[columnMap.secretaria] ?? "N/A").trim();
      const funcComp = columnMap.funcion != null ? String(row[columnMap.funcion] ?? "").trim() : "";
      const depComp = columnMap.dependencia != null ? String(row[columnMap.dependencia] ?? "").trim() : "";
      // 9 columnas: ID, DNI, Apellido y nombre, Situación de revista, Agrupamiento, Nivel, Secretarias, Funciones, Dependencias
      faltantes.push(["", dni, apeNom, sit, agrupProc, nivelProc, sec, funcComp, depComp]);
    }
  }

  return { agentesConId, faltantes };
}

// Carga tabla de Funciones (id, funcion, agrupamiento)
export function parseFuncionesSheet(worksheet) {
  const matrix = sheetToMatrix(worksheet);
  if (!matrix.length) return [];
  // detectar encabezados en primera fila
  const headers = (matrix[0] || []).map((h) => normalize(h));
  let idIndex = headers.findIndex((h) => h.includes("id"));
  let funcIndex = headers.findIndex((h) => h.includes("funcion") || h.includes("función"));
  let agrupIndex = headers.findIndex((h) => h.includes("agrup"));
  if (idIndex === -1 || funcIndex === -1 || agrupIndex === -1) {
    // fallback: primeras 3 columnas
    idIndex = 0;
    funcIndex = 1;
    agrupIndex = 2;
  }
  const rows = matrix.slice(1).filter((r) => Array.isArray(r) && r.some((c) => String(c).trim() !== ""));
  return rows.map((r) => ({
    id: r[idIndex],
    funcion: String(r[funcIndex] ?? "").trim(),
    agrupamiento: normalize(r[agrupIndex]),
  }));
}

export function buildFuncionesMaps(funcionesRows) {
  const mapaPorId = {};
  const mapaPorNombreYAgrup = {};
  const mapaPorNombre = {};
  for (const row of funcionesRows) {
    const id = row.id;
    const nombre = String(row.funcion || "").trim();
    const nombreN = normalize(nombre);
    const agrup = String(row.agrupamiento || "").trim().toLowerCase();
    if (!id || !nombreN) continue;
    mapaPorId[id] = nombre;
    const clave = `${nombreN}|${agrup}`;
    mapaPorNombreYAgrup[clave] = { id, funcion: nombre, agrupamiento: agrup };
    if (!mapaPorNombre[nombreN]) mapaPorNombre[nombreN] = [];
    mapaPorNombre[nombreN].push({ id, funcion: nombre, agrupamiento: agrup });
  }
  return { mapaPorId, mapaPorNombreYAgrup, mapaPorNombre };
}

// Marca áreas con más de un director
export function detectarDirectoresDuplicados(agentesConId) {
  const areas = new Map(); // clave -> count
  for (const fila of agentesConId) {
    const funcion = normalize(fila[6]);
    if (!funcion.includes("director")) continue;
    const dependencia = normalize(fila[7]);
    if (dependencia.includes("cdi i-xvi")) continue; // excepción
    const secretaria = normalize(fila[8]);
    const subsecretaria = normalize(fila[9]);
    const dirGral = normalize(fila[10]);
    const key = `${dependencia}|${secretaria}|${subsecretaria}|${dirGral}`;
    areas.set(key, (areas.get(key) || 0) + 1);
  }
  const duplicadas = new Set(Array.from(areas.entries()).filter(([, c]) => c > 1).map(([k]) => k));
  return duplicadas;
}

export function asignarIdsYDetectarDiscrepancias(agentesConId, funcionesRows) {
  const { mapaPorId, mapaPorNombreYAgrup, mapaPorNombre } = buildFuncionesMaps(funcionesRows);
  const duplicadas = detectarDirectoresDuplicados(agentesConId);

  const resultados = [];
  const discrepancias = [];

  for (const fila of agentesConId) {
    if (!Array.isArray(fila) || fila.length < 11) {
      const obs = "Fila con datos incompletos; se esperaban 11 columnas";
      // DNI es índice 1 en Agentes con ID
      discrepancias.push([
        fila?.[1] ?? "N/A",
        fila?.[2] ?? "N/A",
        fila?.[3] ?? "N/A",
        fila?.[4] ?? "N/A",
        fila?.[5] ?? "N/A",
        fila?.[6] ?? "N/A",
        fila?.[7] ?? "N/A",
        fila?.[8] ?? "N/A",
        fila?.[9] ?? "N/A",
        fila?.[10] ?? "N/A",
        obs,
      ]);
      resultados.push(fila);
      continue;
    }

    const dni = fila[1];
    const apeNom = fila[2];
    const sitRev = fila[3];
    const agrup = String(fila[4] ?? "").trim();
    const nivel = String(fila[5] ?? "").trim();
    const funcion = String(fila[6] ?? "").trim();
    const dep = fila[7];
    const sec = fila[8];
    const subsec = fila[9];
    const dirGral = fila[10];

    const funcionN = normalize(funcion);
    const agrupN = normalize(agrup);
    const nivelN = normalize(nivel);
    const depN = normalize(dep);
    const secN = normalize(sec);
    const subsecN = normalize(subsec);
    const dirGralN = normalize(dirGral);
    const areaKey = `${depN}|${secN}|${subsecN}|${dirGralN}`;

    let idAsignado = null;
    let observacion = "";
    let funcionMod = funcion;

    if (ASIGNACIONES_ESPECIALES[funcionN]) {
      const idEsp = ASIGNACIONES_ESPECIALES[funcionN];
      idAsignado = idEsp;
      funcionMod = mapaPorId[idEsp] || funcion;
    } else if (funcionN.includes("director") && duplicadas.has(areaKey) && !depN.includes("cdi i-xvi")) {
      observacion = "Hay más de un director asignados en la misma área (Dependencia, Secretaría, SubSecretaría y Dirección General)";
    } else if (funcionN.includes("director")) {
      if (nivelN === "j") {
        idAsignado = 8;
        funcionMod = mapaPorId[idAsignado] || "DIRECTOR";
      } else {
        observacion = "La función de Director debe tener nivel ‘J’";
      }
    } else if (FUNCIONES_ESPECIALES_POR_NIVEL[funcionN]) {
      const conf = FUNCIONES_ESPECIALES_POR_NIVEL[funcionN];
      if (nivelN === conf.nivel) {
        idAsignado = conf.id;
        funcionMod = mapaPorId[idAsignado] || funcion;
      } else {
        observacion = `La función '${funcion}' debe tener nivel '${conf.nivel.toUpperCase()}'`;
      }
    } else if (
      ["administrativo", "administrativo calificado", "administrativo general"].includes(funcionN)
    ) {
      if (agrupN.includes("gg") || agrupN === "gg") {
        idAsignado = 100;
        funcionMod = mapaPorId[idAsignado] || "ADMINISTRATIVO GENERAL";
      } else {
        observacion = "La función 'Administrativo' debe tener agrupamiento 'GG'";
      }
    } else if (funcionN) {
      // Coincidencia exacta por nombre + agrupamiento
      const clave = `${funcionN}|${agrupN}`;
      const exact = mapaPorNombreYAgrup[clave];
      let encontrado = false;
      if (exact) {
        idAsignado = exact.id;
        funcionMod = exact.funcion;
        encontrado = true;
      }
      if (!encontrado) {
        const lista = mapaPorNombre[funcionN] || [];
        const agrupSet = new Set(lista.map((x) => x.agrupamiento));
        if (!agrupN && lista.length === 1) {
          idAsignado = lista[0].id;
          funcionMod = lista[0].funcion;
          encontrado = true;
        } else if (!agrupN && lista.length > 1 && agrupSet.size > 1) {
          observacion = `La función '${funcion}' existe con múltiples agrupamientos y no se especificó uno.`;
        } else if (agrupN && lista.length > 0) {
          observacion = `La función '${funcion}' existe pero con agrupamiento diferente. Esperado: '${agrup}', Encontrados: ${Array.from(agrupSet).join(", ")}`;
        }
      }
      if (!idAsignado) {
        // Coincidencias parciales
        const parciales = [];
        for (const nombreClave in mapaPorNombre) {
          if (
            funcionN.includes(nombreClave) ||
            nombreClave.includes(funcionN)
          ) {
            (mapaPorNombre[nombreClave] || []).forEach((f) => {
              if (!agrupN || f.agrupamiento === agrupN) parciales.push(f);
            });
          }
        }
        if (parciales.length === 1) {
          idAsignado = parciales[0].id;
          funcionMod = parciales[0].funcion;
        } else if (parciales.length > 1) {
          observacion = `Múltiples coincidencias parciales para '${funcion}' con agrupamiento '${agrup}'`;
        } else if (!encontrado) {
          observacion = `No se encontró coincidencia para la función '${funcion}' con agrupamiento '${agrup}'`;
        }
      }
    }

    const filaActualizada = [...fila];
    if (idAsignado != null) {
      filaActualizada[0] = idAsignado;
      filaActualizada[6] = funcionMod;
      resultados.push(filaActualizada);
    } else {
      const obs = observacion || "Función no encontrada o con conflicto no resuelto.";
      discrepancias.push([
        dni,
        apeNom,
        sitRev,
        agrup,
        nivel,
        funcion,
        dep,
        sec,
        subsec,
        dirGral,
        obs,
      ]);
      resultados.push(fila);
    }
  }

  // Control: conteo de funciones en discrepancias (columna 6 -> index 5)
  const conteo = new Map();
  for (const d of discrepancias) {
    const fn = d[5] || "Vacío";
    conteo.set(fn, (conteo.get(fn) || 0) + 1);
  }
  const control = Array.from(conteo.entries()).map(([funcion, cantidad]) => ({ funcion, cantidad }));

  return { agentesConId: resultados, discrepancias, control };
}

export function depurarDiscrepancias(discrepancias, eliminadosSet, proyectosSet) {
  if ((!eliminadosSet || eliminadosSet.size === 0) && (!proyectosSet || proyectosSet.size === 0)) {
    return discrepancias;
  }
  return discrepancias.filter((row) => {
    const dni = String(row[0] ?? "").trim();
    if (!dni) return true;
    if (eliminadosSet?.has(dni)) return false;
    if (proyectosSet?.has(dni)) return false;
    return true;
  });
}
