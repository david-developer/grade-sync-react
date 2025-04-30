
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, CalendarClock, Users, TrendingUp, Layers, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
  role: string;
  // Student dashboard data
  total_courses?: number;
  registered_resits?: number;
  gpa?: string | null;
  courses?: Array<{ course_id: number; course_code: string; course_name: string }>;
  // Instructor dashboard data
  instructor_courses?: Array<{
    course_id: number;
    course_code: string;
    course_name: string;
    total_students: number;
  }>;
  resitStats?: Array<{
    course_code: string;
    resit_students: number;
  }>;
  // Faculty secretary dashboard data
  total_resit_registrations?: number;
  total_resit_exams?: number;
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardAPI.getDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getGradientClass = (index: number) => {
    const gradients = [
      "from-blue-500 to-purple-500",
      "from-green-500 to-emerald-500",
      "from-yellow-500 to-orange-500",
      "from-pink-500 to-rose-500",
      "from-indigo-500 to-blue-500",
      "from-teal-500 to-cyan-500"
    ];
    return gradients[index % gradients.length];
  };

  const renderStatCard = (title: string, value: string | number, icon: React.ReactNode, index: number) => (
    <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradientClass(index)} opacity-10 rounded-xl`}></div>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium text-gray-600 dark:text-gray-300">{title}</CardTitle>
        <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-full">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  const renderLoadingSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderStudentDashboard = () => {
    if (!dashboardData) return null;

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-xl mb-8">
          <h2 className="text-3xl font-bold flex items-center">
            <GraduationCap className="mr-3 h-8 w-8" />
            Student Dashboard
          </h2>
          <p className="mt-2 text-blue-100">Manage your courses, grades and exams</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {renderStatCard("Total Courses", dashboardData.total_courses || 0, 
            <BookOpen className="h-5 w-5 text-blue-600" />, 0)}
          {renderStatCard("Registered Resits", dashboardData.registered_resits || 0, 
            <CalendarClock className="h-5 w-5 text-green-600" />, 1)}
          {renderStatCard("GPA", dashboardData.gpa ?? "N/A", 
            <Award className="h-5 w-5 text-yellow-600" />, 2)}
        </div>

        {dashboardData.courses && dashboardData.courses.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Layers className="mr-2 h-5 w-5 text-indigo-500" />
              My Courses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.courses.map((course, index) => (
                <Card key={course.course_id} className="hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">{course.course_code}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{course.course_name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderInstructorDashboard = () => {
    if (!dashboardData || !dashboardData.instructor_courses) return null;

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-xl mb-8">
          <h2 className="text-3xl font-bold flex items-center">
            <Users className="mr-3 h-8 w-8" />
            Instructor Dashboard
          </h2>
          <p className="mt-2 text-indigo-100">Manage your courses and student grades</p>
        </div>
        
        <div className="space-y-6">
          <h3 className="text-xl font-semibold flex items-center">
            <Layers className="mr-2 h-5 w-5 text-indigo-500" />
            Your Courses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {dashboardData.instructor_courses.map((course, index) => (
              <Card key={course.course_id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`absolute inset-0 bg-gradient-to-br ${getGradientClass(index)} opacity-10 rounded-xl`}></div>
                <CardHeader className="pb-2 border-b">
                  <CardTitle className="text-lg flex items-center justify-between">
                    {course.course_code}
                    <span className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 py-1 px-2 rounded-full">
                      {course.total_students} Students
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{course.course_name}</p>
                  <p className="text-sm flex items-center">
                    <CalendarClock className="h-4 w-4 mr-1 text-amber-500" />
                    Resit Students: {
                      dashboardData.resitStats?.find(stat => stat.course_code === course.course_code)?.resit_students || 0
                    }
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFacultySecretaryDashboard = () => {
    if (!dashboardData) return null;

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white shadow-xl mb-8">
          <h2 className="text-3xl font-bold flex items-center">
            <TrendingUp className="mr-3 h-8 w-8" />
            Faculty Secretary Dashboard
          </h2>
          <p className="mt-2 text-emerald-100">Manage resit exams and registrations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderStatCard("Total Resit Registrations", dashboardData.total_resit_registrations || 0, 
            <BookOpen className="h-5 w-5 text-emerald-600" />, 0)}
          {renderStatCard("Total Resit Exams", dashboardData.total_resit_exams || 0, 
            <CalendarClock className="h-5 w-5 text-teal-600" />, 1)}
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="space-y-8">
          <Skeleton className="h-12 w-72 mb-8" />
          {renderLoadingSkeletons()}
        </div>
      );
    }

    if (!dashboardData) {
      return (
        <div className="text-center py-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <p className="text-lg text-gray-500 dark:text-gray-400">Unable to load dashboard data.</p>
        </div>
      );
    }

    switch (user?.role) {
      case "student":
        return renderStudentDashboard();
      case "instructor":
        return renderInstructorDashboard();
      case "faculty_secretary":
        return renderFacultySecretaryDashboard();
      default:
        return (
          <div className="text-center py-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <p className="text-lg text-gray-500 dark:text-gray-400">Unknown user role.</p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-white to-white dark:from-gray-900/50 dark:via-gray-900 dark:to-gray-900"></div>
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
