
import api from "./apiConfig";

export const dashboardAPI = {
  getDashboard: async () => {
    const response = await api.get("/dashboard");
    return response.data;
  },
};
