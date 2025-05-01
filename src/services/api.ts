
import axios from "axios";
import { toast } from "sonner";

// Create an axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.error || "An error occurred";
    toast.error(message);
    
    // Handle 401 unauthorized errors by logging out
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/login", { email, password });
    return response.data;
  },
  register: async (email: string, password: string, role: string) => {
    const response = await api.post("/register", { email, password, role });
    return response.data;
  },
  verify: async () => {
    const response = await api.get("/verify");
    return response.data;
  },
};

// Dashboard API calls
export const dashboardAPI = {
  getDashboard: async () => {
    const response = await api.get("/dashboard");
    return response.data;
  },
};

// Student API calls
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
    const response = await api.get("/student/eligible-resit-courses");
    return response.data;
  },
  getResitExams: async () => {
    try {
      const response = await api.get("/student/my-resit-exams");
      return response.data;
    } catch (error) {
      console.error("Error in getResitExams:", error);
      // Fallback in case the API fails
      return { resitExams: [] };
    }
  },
  declareResit: async (course_id: number) => {
    const response = await api.post("/student/declare-resit", { course_id });
    return response.data;
  },
  getNotifications: async () => {
    const response = await api.get("/student/notifications");
    return response.data;
  },
};

// Instructor API calls
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
    const response = await api.get('/instructor/students');
    return response.data;
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

// Faculty Secretary API calls
export const facultyAPI = {
  getCourses: async () => {
    try {
      const response = await api.get("/faculty/courses");
      return response.data;
    } catch (error) {
      console.error("Error fetching faculty courses:", error);
      return { courses: [] };
    }
  },
  uploadSchedule: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await api.post("/faculty/upload-schedule", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  uploadResitSchedule: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await api.post("/faculty/upload-resit-schedule", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateResitInfo: async (data: {
    course_id: number;
    exam_date?: string;
    location?: string;
  }) => {
    const response = await api.patch("/faculty/update-resit-info", data);
    return response.data;
  },
  getResitRegistrations: async (course_id: number) => {
    const response = await api.get(`/faculty/resit-registrations/${course_id}`);
    return response.data;
  },
  getAllResitRegistrations: async () => {
    const response = await api.get('/faculty/all-resit-registrations');
    return response.data;
  },
  getAllResitExams: async () => {
    const response = await api.get('/faculty/all-resit-exams');
    return response.data;
  },
  exportResit: async (course_id: number) => {
    try {
      const response = await api.get(`/faculty/export-resit/${course_id}`, {
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
      const response = await api.post("/faculty/notify", payload);
      return response.data;
    } catch (error) {
      console.error("Notification error:", error);
      throw error;
    }
  },
};

export default api;
