
import { useEffect, useState } from "react";
import { studentAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar, List } from "lucide-react";
import { toast } from "sonner";
import CourseSelect, { Course } from "@/components/CourseSelect";
import { Badge } from "@/components/ui/badge";

interface ResitExam {
  course_id: number;
  course_code: string;
  course_name: string;
  exam_date: string;
  location: string | null;
  no_of_questions: number | null;
  allowed_tools: string | null;
  notes: string | null;
}

const StudentResitExams = () => {
  const [resitExams, setResitExams] = useState<ResitExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchResitExams = async () => {
      try {
        const data = await studentAPI.getResitExams();
        setResitExams(data.resitExams || []);
      } catch (error) {
        console.error("Error fetching resit exams:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCourses = async () => {
      try {
        const data = await studentAPI.getMyCourses();
        setCourses(data.courses || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchResitExams();
    fetchCourses();
  }, []);

  const handleDeclareResit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourseId) {
      toast.error("Please select a course");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await studentAPI.declareResit(selectedCourseId);
      toast.success("Successfully registered for the resit exam");
      
      // Refresh the list
      const data = await studentAPI.getResitExams();
      setResitExams(data.resitExams || []);
      
      // Reset selection
      setSelectedCourseId(null);
    } catch (error: any) {
      console.error("Error declaring resit:", error);
      
      // Improved error handling
      if (error.response?.data?.error?.includes("No resit exam scheduled")) {
        toast.error("No resit exam available for this course yet");
      } else if (error.response?.data?.error?.includes("not eligible")) {
        toast.error("You are not eligible for a resit in this course");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gradient">Resit Exams</h1>

      <div className="grid grid-cols-1 gap-6">
        <Card className="card-hover">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-xl border-b">
            <CardTitle className="flex items-center text-xl font-bold">
              <Calendar className="h-5 w-5 mr-3 text-primary" />
              Declare for Resit Exam
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleDeclareResit} className="space-y-5">
              <CourseSelect 
                courses={courses}
                onChange={(id) => setSelectedCourseId(id)}
                isLoading={isLoadingCourses}
                label="Select Course"
                placeholder="Choose a course for resit"
              />
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                disabled={isSubmitting || !selectedCourseId}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Declare for Resit
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-xl border-b">
            <CardTitle className="flex items-center text-xl font-bold">
              <List className="h-5 w-5 mr-3 text-primary" />
              My Registered Resit Exams
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {resitExams.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Exam Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resitExams.map((exam, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="font-medium">{exam.course_code}</p>
                            <p className="text-sm text-gray-500">{exam.course_name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(exam.exam_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{exam.location || "TBA"}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const details = `
                                Questions: ${exam.no_of_questions || 'Not specified'}
                                Tools: ${exam.allowed_tools || 'Not specified'}
                                Notes: ${exam.notes || 'None'}
                              `;
                              toast.info(details, {
                                description: `Course: ${exam.course_code} - ${exam.course_name}`,
                                duration: 5000
                              });
                            }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md bg-gray-50">
                <p className="text-gray-500">
                  You are not registered for any resit exams.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentResitExams;
