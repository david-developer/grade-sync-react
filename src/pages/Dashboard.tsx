import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardAPI, facultyAPI, instructorAPI, studentAPI } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, CalendarClock, Users, TrendingUp, Layers, GraduationCap, Loader } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { toast } from "sonner";

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

interface ResitExam {
  course_id: number;
  course_code: string;
  course_name: string;
  instructor_name: string;
  exam_date: string;
}

interface ResitRegistration {
  course_id: number;
  course_code: string;
  course_name: string;
  student_count: number;
  students: Array<{
    student_id: number;
    student_name: string;
  }>;
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [resitExams, setResitExams] = useState<ResitExam[]>([]);
  const [resitRegistrations, setResitRegistrations] = useState<ResitRegistration[]>([]);
  const [showResitExams, setShowResitExams] = useState(false);
  const [showResitRegistrations, setShowResitRegistrations] = useState(false);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

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

    // For faculty secretary, fetch additional data
    const fetchFacultyData = async () => {
      if (user?.role === "faculty_secretary") {
        try {
          const examsData = await facultyAPI.getAllResitExams();
          setResitExams(examsData.resitExams || []);
          
          const registrationsData = await facultyAPI.getAllResitRegistrations();
          setResitRegistrations(registrationsData.registrations || []);
        } catch (error) {
          console.error("Error fetching faculty data:", error);
        }
      }
    };

    // For instructor, fetch course data
    const fetchInstructorData = async () => {
      if (user?.role === "instructor") {
        try {
          const coursesData = await instructorAPI.getMyCourses();
          setInstructorCourses(coursesData.courses || []);
        } catch (error) {
          console.error("Error fetching instructor courses:", error);
        }
      }
    };

    fetchDashboardData();
    if (user?.role === "faculty_secretary") {
      fetchFacultyData();
    }
    if (user?.role === "instructor") {
      fetchInstructorData();
    }
  }, [user?.role]);

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

  const renderStatCard = (title: string, value: string | number, icon: React.ReactNode, index: number, onClick?: () => void) => (
    <Card 
      className={`transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-xl mb-8 transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
          <h2 className="text-3xl font-bold flex items-center">
            <GraduationCap className="mr-3 h-8 w-8" />
            Student Dashboard
          </h2>
          <p className="mt-2 text-blue-100">Manage your courses, grades and exams</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {renderStatCard("Total Courses", dashboardData.total_courses || 0, 
            <BookOpen className="h-5 w-5 text-blue-600" />, 0, () => navigate("/student/grades"))}
          {renderStatCard("Registered Resits", dashboardData.registered_resits || 0, 
            <CalendarClock className="h-5 w-5 text-green-600" />, 1, () => navigate("/student/resit-exams"))}
          {renderStatCard("GPA", dashboardData.gpa ?? "N/A", 
            <Award className="h-5 w-5 text-yellow-600" />, 2, () => navigate("/student/grades"))}
        </div>

        {dashboardData.courses && dashboardData.courses.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Layers className="mr-2 h-5 w-5 text-indigo-500" />
              My Courses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.courses.map((course, index) => (
                <Card key={course.course_id} className="hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 bg-white dark:bg-gray-800">
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
    if (!dashboardData) return null;

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-xl mb-8 transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
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
            {dashboardData.instructor_courses && dashboardData.instructor_courses.length > 0 ? (
              dashboardData.instructor_courses.map((course, index) => (
                <Card key={course.course_id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
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
              ))
            ) : (
              <div className="col-span-3 text-center py-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-lg text-gray-500 dark:text-gray-400">No courses assigned yet.</p>
                <p className="text-sm text-gray-400">You'll see your courses here once they're assigned to you.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFacultySecretaryDashboard = () => {
    if (!dashboardData) return null;

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white shadow-xl mb-8 transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
          <h2 className="text-3xl font-bold flex items-center">
            <TrendingUp className="mr-3 h-8 w-8" />
            Faculty Secretary Dashboard
          </h2>
          <p className="mt-2 text-emerald-100">Manage resit exams and registrations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HoverCard>
            <HoverCardTrigger asChild>
              {renderStatCard("Total Resit Registrations", dashboardData.total_resit_registrations || 0, 
                <BookOpen className="h-5 w-5 text-emerald-600" />, 0, () => setShowResitRegistrations(true))}
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex justify-between space-x-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Resit Registrations</h4>
                  <p className="text-xs text-muted-foreground">
                    Click to view all students registered for resit exams
                  </p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
          
          <HoverCard>
            <HoverCardTrigger asChild>
              {renderStatCard("Total Resit Exams", dashboardData.total_resit_exams || 0, 
                <CalendarClock className="h-5 w-5 text-teal-600" />, 1, () => setShowResitExams(true))}
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex justify-between space-x-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Resit Exams</h4>
                  <p className="text-xs text-muted-foreground">
                    Click to view all scheduled resit exams
                  </p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>

        {showResitExams && (
          <Card className="mt-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg transform transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="font-semibold flex items-center">
                  <CalendarClock className="h-5 w-5 mr-2 text-teal-600" />
                  All Resit Exams
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowResitExams(false)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4">
                {resitExams.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {resitExams.map((exam, i) => (
                      <div key={i} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium">{exam.course_code} - {exam.course_name}</h4>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Instructor: {exam.instructor_name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Date: {new Date(exam.exam_date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500 dark:text-gray-400">No resit exams scheduled yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {showResitRegistrations && (
          <Card className="mt-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg transform transition-all duration-300 hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="font-semibold flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-emerald-600" />
                  All Resit Registrations
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowResitRegistrations(false)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4">
                {resitRegistrations.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {resitRegistrations.map((reg, i) => (
                      <div key={i} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium">{reg.course_code} - {reg.course_name}</h4>
                          <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                            {reg.student_count} students
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Registered Students:</p>
                          <ul className="text-sm text-gray-500 dark:text-gray-400 pl-4 list-disc">
                            {reg.students.slice(0, 5).map((student, j) => (
                              <li key={j}>{student.student_name}</li>
                            ))}
                            {reg.students.length > 5 && (
                              <li className="italic">And {reg.students.length - 5} more...</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500 dark:text-gray-400">No students have registered for resit exams yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="space-y-8">
          <Loader className="h-12 w-72 mb-8" />
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
