import apiClient from "./api";

const API_URL = "/chart-configs";

const getChartConfigOptions = () => apiClient.get(`${API_URL}/options`);
const getAllChartConfigs = () => apiClient.get(API_URL);
const getChartConfigById = (id) => apiClient.get(`${API_URL}/${id}`);
const createChartConfig = (data) => apiClient.post(API_URL, data);
const updateChartConfig = (id, data) => apiClient.put(`${API_URL}/${id}`, data);
const deleteChartConfig = (id) => apiClient.delete(`${API_URL}/${id}`);
const getChartConfigData = (id) => apiClient.get(`${API_URL}/${id}/data`);

const chartConfigService = {
  getChartConfigOptions,
  getAllChartConfigs,
  getChartConfigById,
  createChartConfig,
  updateChartConfig,
  deleteChartConfig,
  getChartConfigData,
};

export default chartConfigService;
