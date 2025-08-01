# Estructura del Archivo Excel - Dotación Municipal

## Descripción General
El archivo Excel contiene información de los agentes municipales con una estructura específica de columnas. Los datos comienzan a partir de la **fila 4** (inclusive) y pueden contener encabezados, filas combinadas o filas vacías en el medio del archivo.

## Estructura de Columnas

| Columna | Campo | Descripción | Puede estar vacío |
|---------|-------|-------------|-------------------|
| **A** | Legajo | Número de legajo del agente | ✅ Sí |
| **B** | - | (No utilizada) | - |
| **C** | DNI | Documento Nacional de Identidad del agente | ✅ Sí |
| **D** | - | (No utilizada) | - |
| **E** | Nombre y Apellido | Nombre completo del agente | ✅ Sí |
| **F** | Fecha de Nacimiento | Fecha de nacimiento del agente | ✅ Sí |
| **G** | Situación de Revista | Situación laboral del agente (ej: planta permanente) | ✅ Sí |
| **H** | Función | Función que cumple el agente | ✅ Sí |
| **I** | Dependencia | Dependencia donde trabaja el agente | ✅ Sí |
| **J** | Secretaría | Secretaría donde trabaja el agente | ✅ Sí |
| **K** | Subsecretaría | Subsecretaría donde trabaja el agente | ✅ Sí |
| **L** | Dirección General | Dirección general donde trabaja el agente | ✅ Sí |
| **M** | Dirección | Dirección donde trabaja el agente | ✅ Sí |
| **N** | Departamento | Departamento donde trabaja el agente | ✅ Sí |
| **O** | División | División donde trabaja el agente | ✅ Sí |

## Mapeo para Base de Datos

```javascript
const columnMapping = {
  A: 'legajo',
  C: 'dni', 
  E: 'nombreCompleto',
  F: 'fechaNacimiento',
  G: 'situacionRevista',
  H: 'funcion',
  I: 'dependencia',
  J: 'secretaria',
  K: 'subsecretaria',
  L: 'direccionGeneral',
  M: 'direccion',
  N: 'departamento',
  O: 'division'
};
```

## Consideraciones Especiales

### Fila de Inicio
- Los datos válidos comienzan en la **fila 4**
- Las primeras 3 filas pueden contener títulos o encabezados

### Filas Intermedias
- Pueden existir filas vacías en medio del archivo
- Pueden existir filas con celdas combinadas
- El sistema debe ser capaz de saltar estas filas automáticamente

### Campos Vacíos
- **Todos los campos pueden estar vacíos**
- El sistema debe manejar valores nulos o vacíos en cualquier columna
- Se debe validar que al menos algunos campos críticos tengan datos para considerar la fila válida

### Jerarquía Organizacional
La estructura jerárquica sigue este orden:
1. **Secretaría** (nivel más alto)
2. **Subsecretaría**
3. **Dirección General**
4. **Dirección**
5. **Departamento**
6. **División** (nivel más bajo)

## Análisis Implementados

### Por Edad
- Cálculo automático de edad basado en `fechaNacimiento`
- Rangos de edad: 18-25, 26-35, 36-45, 46-55, 56-65, 65+
- Gráfico de dispersión edad vs función
- Edad promedio por función

### Por Estructura Organizacional
- Distribución por secretaría
- Distribución por subsecretaría  
- Distribución por dirección general
- Distribución por dirección
- Distribución por departamento
- Distribución por división
- Distribución por dependencia

### Por Situación Laboral
- Análisis por situación de revista
- Análisis por función
- Conteo total de agentes

## Notas Técnicas
- El sistema utiliza las APIs `/analytics/agents/*` para procesar estos datos
- Los gráficos se generan automáticamente basados en la información procesada
- Todos los análisis manejan valores nulos y campos vacíos apropiadamente