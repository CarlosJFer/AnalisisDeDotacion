import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  es: {
    translation: {
      ui: {
        noFilterFields:
          "Esta sección no tiene datos de Secretaría/Subsecretaría/Dirección...",
        noDataWithFilters: "No se encontraron datos con los filtros aplicados.",
      },
      dashboard: {
        planta: {
          title: "Dashboard - Planta y Contratos",
          subtitle:
            "Análisis detallado de la dotación municipal con gráficos especializados",
        },
        neike: {
          title: "Dashboard - Neikes y Becas",
          subtitle:
            "Análisis detallado de la dotación municipal con gráficos especializados",
        },
        tabs: {
          summary: "Resumen General",
          age: "Análisis de Edad",
          org: "Distribución Organizacional",
          studies: "Antigüedad y Estudios",
          control: "Control de certificaciones",
          expedients: "Expedientes",
          sac: "SAC",
        },
      },
      navbar: {
        language: "Idioma",
        home: "Inicio",
        dashboard: "Dashboard",
        tools: "Herramientas",
        adminPanel: "Panel de Administración",
        logout: "Salir",
      },
      filter: {
        title: "Filtrar datos",
        secretaria: "Secretaría",
        subsecretaria: "Subsecretaría",
        direccionGeneral: "Dirección General",
        direccion: "Dirección",
        departamento: "Departamento",
        division: "División",
        funcion: "Función",
        apply: "Filtrar",
      },
    },
  },
  en: {
    translation: {
      ui: {
        noFilterFields:
          "This section has no Secretaría/Subsecretaría/Dirección data...",
        noDataWithFilters: "No data found for the applied filters.",
      },
      dashboard: {
        planta: {
          title: "Dashboard - Staff and Contracts",
          subtitle:
            "Detailed analysis of municipal staffing with specialized charts",
        },
        neike: {
          title: "Dashboard - Neikes and Scholarships",
          subtitle:
            "Detailed analysis of municipal staffing with specialized charts",
        },
        tabs: {
          summary: "Overview",
          age: "Age Analysis",
          org: "Organizational Distribution",
          studies: "Seniority & Education",
          control: "Certification Control",
          expedients: "Proceedings",
          sac: "SAC",
        },
      },
      navbar: {
        language: "Language",
        home: "Home",
        dashboard: "Dashboard",
        tools: "Tools",
        adminPanel: "Admin Panel",
        logout: "Logout",
      },
      filter: {
        title: "Filter data",
        secretaria: "Secretariat",
        subsecretaria: "Undersecretariat",
        direccionGeneral: "General Directorate",
        direccion: "Directorate",
        departamento: "Department",
        division: "Division",
        funcion: "Function",
        apply: "Filter",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng:
    (typeof window !== "undefined" &&
      window.localStorage &&
      localStorage.getItem("lang")) ||
    "es",
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

export default i18n;
