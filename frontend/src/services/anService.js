import apiClient from "./api";

const base = "/tools/agrupamiento-niveles";

export const getFunciones = async () => {
  const { data } = await apiClient.get(`${base}/funciones`);
  return data || [];
};

export const saveFunciones = async (rows) => {
  const { data } = await apiClient.put(`${base}/funciones`, { rows });
  return data;
};

export default { getFunciones, saveFunciones };

