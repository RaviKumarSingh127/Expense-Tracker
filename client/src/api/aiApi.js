import api from "./axiosInstance";

export const aiApi = {
  categorize: (data) => api.post("/ai/categorize", data),
  getInsights: () => api.get("/ai/insights"),
  suggestBudget: (data) => api.post("/ai/suggest-budget", data),
  chat: (message) => api.post("/ai/chat", { message }),
  scanReceipt: (formData) =>
    api.post("/ai/scan-receipt", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  getAnomalies: () => api.get("/ai/anomalies"),
};
