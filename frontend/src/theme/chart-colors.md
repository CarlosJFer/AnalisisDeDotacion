# Esquema de Colores por Módulo - Dashboard

## Colores Distintivos por Módulo

### 🔵 **Resumen General**
- **Color Principal:** `#00C49F` (Teal)
- **Icono:** `DashboardIcon`
- **Chip:** "Resumen General"
- **Componentes:** CustomHorizontalBarChart, StatCard

### 🟢 **Análisis de Edad**
- **Color Principal:** `#00C49F` (Teal)
- **Icono:** `AnalyticsIcon`
- **Chip:** "Análisis de Edad"
- **Componentes:** AgeRangeByAreaChart, AverageAgeByFunctionChart, CustomBarChart (edad)

### 🟣 **Distribución Organizacional**
- **Secretaría:** `#14b8a6` (Teal) + `BusinessIcon`
- **Dependencia:** `#6366f1` (Indigo) + `HubIcon`
- **Subsecretaría:** `#f59e0b` (Amber) + `AccountTreeIcon`
- **Dirección General:** `#a855f7` (Purple) + `CorporateFareIcon`
- **Dirección:** `#06b6d4` (Cyan) + `DomainIcon`
- **Departamento:** `#f43f5e` (Rose) + `ApartmentIcon`
- **División:** `#84cc16` (Lime) + `DeviceHubIcon`

### 🟡 **Antigüedad y Estudios**
- **Color Principal:** `#8b5cf6` (Violet)
- **Icono:** `SchoolIcon`
- **Chip:** "Antigüedad y Estudios"
- **Componentes:** CustomBarChart (antigüedad/estudios), CustomDonutChart (estudios)

### 🟠 **Control de Certificaciones**
- **Color Principal:** `#f59e0b` (Amber)
- **Icono:** `AssignmentTurnedInIcon`
- **Chip:** "Control de Certificaciones"
- **Componentes:** CustomBarChart (certificaciones), CustomDonutChart (horarios)

### 🔴 **Expedientes**
- **Color Principal:** `#ef4444` (Red)
- **Icono:** `FolderOpenIcon`
- **Chip:** "Expedientes"
- **Componentes:** CustomBarChart (expedientes)

### 📞 **SAC**
- **Color Principal:** `#10b981` (Emerald)
- **Icono:** `PhoneIcon`
- **Chip:** "SAC"
- **Componentes:** SacSection

## Implementación

### Componentes Actualizados:
1. ✅ **CustomBarChart** - Detección automática por título
2. ✅ **CustomDonutChart** - Detección automática por título
3. ✅ **CustomHorizontalBarChart** - Estilo consistente
4. ✅ **AgeRangeByAreaChart** - Estilo de Análisis de Edad
5. ✅ **AverageAgeByFunctionChart** - Estilo de Análisis de Edad
6. ✅ **Componentes Organizacionales** - Colores específicos por nivel

### Características Comunes:
- **Borde izquierdo:** 6px sólido del color del módulo
- **Icono:** Representativo del módulo/función
- **Chip:** Etiqueta identificativa del módulo
- **Glass Morphism:** Fondo translúcido con blur
- **Hover Effects:** Transform y shadow consistentes
- **Tooltips:** UnifiedTooltip con estilo consistente
- **Paginación:** Botones con colores del módulo

## Uso

Los componentes detectan automáticamente su módulo basándose en el título y aplican:
- Color del borde izquierdo
- Icono apropiado
- Chip con etiqueta del módulo
- Color de las barras/elementos del gráfico
- Color de los botones de paginación

Esta implementación asegura consistencia visual y facilita el mantenimiento.