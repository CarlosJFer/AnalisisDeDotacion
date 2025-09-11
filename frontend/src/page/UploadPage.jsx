import React from "react";
import icons from "../ui/icons.js";
import AdminSectionLayout from "../components/AdminSectionLayout.jsx";
import UploadSection from "../components/UploadSection.jsx";

const UploadPage = () => (
  <AdminSectionLayout
    title="Carga de Archivos Excel"
    description="Sube archivos de dotación para actualizar los datos del sistema de manera rápida y eficiente."
    icon={icons.subir}
    color="#ff9800"
  >
    <UploadSection />
  </AdminSectionLayout>
);

export default UploadPage;
