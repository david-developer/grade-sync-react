
import api from "./apiConfig";

export const studentAPI = {
  getGrades: async () => {
    const response = await api.get("/student/my-grades");
    return response.data;
  },
  getMyCourses: async () => {
    const response = await api.get("/student/my-courses");
    return response.data;
  },
  getEligibleResitCourses: async () => {
    // New endpoint to get only courses eligible for resit
    try {
      const response = await api.get("/student/eligible-resit-courses");
      return response.data;
    } catch (error) {
      console.error("Error fetching eligible resit courses:", error);
      throw error;
    }
  },
  getResitExams: async () => {
    try {
      const response = await api.get("/student/my-resit-exams");
      return response.data;
    } catch (error) {
      console.error("Error in getResitExams:", error);
      throw error;
    }
  },
  declareResit: async (course_id: number) => {
    try {
      const response = await api.post("/student/declare-resit", { course_id });
      return response.data;
    } catch (error) {
      console.error("Error declaring resit:", error);
      throw error;
    }
  },
  getNotifications: async () => {
    const response = await api.get("/student/notifications");
    return response.data;
  },
};
