
import apiClient from './api'; // Usamos el apiClient existente

const API_URL = '/templates';

const extractError = (err) => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.message) return err.message;
  return 'Error de red o del servidor';
};

// Obtener todas las plantillas
const getAllTemplates = async () => {
  try {
    return await apiClient.get(API_URL);
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// Obtener una plantilla por ID
const getTemplateById = async (id) => {
  try {
    return await apiClient.get(`${API_URL}/${id}`);
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// Crear una nueva plantilla
const createTemplate = async (templateData) => {
  try {
    return await apiClient.post(API_URL, templateData);
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// Actualizar una plantilla
const updateTemplate = async (id, templateData) => {
  try {
    return await apiClient.put(`${API_URL}/${id}`, templateData);
  } catch (err) {
    throw new Error(extractError(err));
  }
};

// Eliminar una plantilla
const deleteTemplate = async (id) => {
  try {
    return await apiClient.delete(`${API_URL}/${id}`);
  } catch (err) {
    throw new Error(extractError(err));
  }
};

const templateService = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};

export default templateService;
