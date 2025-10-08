import React from "react";
import icons from "../../ui/icons.js";
import AdminSectionLayout from "../../components/AdminSectionLayout.jsx";
import ANUploadSection from "../../components/ANUploadSection.jsx";

const ANUploadPage = () => (
  <AdminSectionLayout
    title="Carga de Archivos Excel"
    description="Sube archivos para actualizar sólo los datos de Agrupamiento y Niveles. No afecta los dashboards."
    icon={icons.subir}
    color="#ff9800"
  >
    <ANUploadSection />
  </AdminSectionLayout>
);

export default ANUploadPage;

