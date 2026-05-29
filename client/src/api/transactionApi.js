import api from "./axiosInstance";

export const transactionApi = {
  getAll: (params) => api.get("/transactions", { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post("/transactions", data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  bulkDelete: (ids) => api.post("/transactions/bulk-delete", { ids }),
  export: (params) => api.get("/transactions/export", { params, responseType: "blob" }),
};
