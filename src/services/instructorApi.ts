
import api from "./apiConfig";

export const instructorAPI = {
  getMyCourses: async () => {
    try {
      const response = await api.get("/instructor/my-courses");
      return response.data;
    } catch (error) {
      console.error("Error in getMyCourses:", error);
      return { courses: [] };
    }
  },
  uploadGradesFile: async (file: File, course_id: number) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("course_id", course_id.toString());
    
    const response = await api.post("/instructor/upload-grades-file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  addResitDetails: async (data: {
    course_id: number;
    exam_date?: string;
    no_of_questions?: number;
    allowed_tools?: string;
    notes?: string;
  }) => {
    const response = await api.post("/instructor/resit-details", data);
    return response.data;
  },
  getResitRegistrations: async (course_id: number) => {
    const response = await api.get(`/instructor/resit-registrations/${course_id}`);
    return response.data;
  },
  getStudents: async () => {
    try {
      const response = await api.get('/instructor/students');
      return response.data;
    } catch (error) {
      console.error("Error fetching students:", error);
      return { students: [] };
    }
  },
  exportResit: async (course_id: number) => {
    try {
      const response = await api.get(`/instructor/export-resit/${course_id}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resit-participants-${course_id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true, message: "Export completed successfully" };
    } catch (error) {
      console.error("Export error:", error);
      return { success: false, message: "Failed to export resit participants" };
    }
  },
  sendNotification: async (course_id: number | null = null, message: string, target_user_id?: number) => {
    const payload: any = { message };
    
    if (target_user_id) {
      payload.target_user_id = target_user_id;
    } else if (course_id) {
      payload.course_id = course_id;
    }
    
    try {
      const response = await api.post("/instructor/notify", payload);
      return response.data;
    } catch (error) {
      console.error("Notification error:", error);
      throw error;
    }
  },
};
