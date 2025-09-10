import React from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AdminSectionLayout from "../components/AdminSectionLayout.jsx";
import UploadSection from "../components/UploadSection.jsx";

const UploadPage = () => (
  <AdminSectionLayout
    title="Carga de Archivos Excel"
    description="Sube archivos de dotación para actualizar los datos del sistema de manera rápida y eficiente."
    icon={CloudUploadIcon}
    color="#ff9800"
  >
    <UploadSection />
  </AdminSectionLayout>
);

export default UploadPage;
