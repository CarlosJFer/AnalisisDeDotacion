
import apiClient from './api'; // Usamos el apiClient existente

const API_URL = '/templates';

// Obtener todas las plantillas
const getAllTemplates = () => {
  return apiClient.get(API_URL);
};

// Obtener una plantilla por ID
const getTemplateById = (id) => {
  return apiClient.get(`${API_URL}/${id}`);
};

// Crear una nueva plantilla
const createTemplate = (templateData) => {
  return apiClient.post(API_URL, templateData);
};

// Actualizar una plantilla
const updateTemplate = (id, templateData) => {
  return apiClient.put(`${API_URL}/${id}`, templateData);
};

// Eliminar una plantilla
const deleteTemplate = (id) => {
  return apiClient.delete(`${API_URL}/${id}`);
};

const templateService = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};

export default templateService;
