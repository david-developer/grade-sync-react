
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
import { FileText, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Grade {
  course_code: string;
  course_name: string;
  grade: number | null;
  letter_grade: string;
}

const StudentGrades = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const data = await studentAPI.getGrades();
        setGrades(data.grades);
      } catch (error) {
        console.error("Error fetching grades:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  const getGradeColor = (letterGrade: string) => {
    switch (letterGrade) {
      case "AA":
        return "bg-green-100 text-green-800 border-green-300";
      case "BA":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "BB":
        return "bg-teal-100 text-teal-800 border-teal-300";
      case "CB":
        return "bg-sky-100 text-sky-800 border-sky-300";
      case "CC":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "DC":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "DD":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "FD":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "FF":
        return "bg-red-100 text-red-800 border-red-300";
      case "DZ":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const calculateGPAColor = () => {
    if (!grades.length) return "";
    
    // Just for visual demonstration - you might want to implement actual GPA calculation logic
    const avgGrade = grades.reduce((sum, grade) => {
      return sum + (grade.grade || 0);
    }, 0) / grades.length;
    
    if (avgGrade >= 80) return "bg-green-100 text-green-800";
    if (avgGrade >= 70) return "bg-teal-100 text-teal-800";
    if (avgGrade >= 60) return "bg-blue-100 text-blue-800";
    if (avgGrade >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const renderSkeletonRows = () => {
    return Array(5).fill(0).map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white dark:from-gray-900/30 dark:via-gray-900 dark:to-gray-900"></div>
      
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-xl">
        <h1 className="text-3xl font-bold flex items-center">
          <FileText className="mr-3 h-8 w-8" />
          My Academic Grades
        </h1>
        <p className="mt-2 text-blue-100">View your course performance and grades</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2 hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-b flex flex-row items-center justify-between">
            <CardTitle className="font-semibold flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Course Grades
            </CardTitle>
            {!loading && grades.length > 0 && (
              <Badge className={`${calculateGPAColor()} h-7 text-xs px-3`}>
                GPA: {(grades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / grades.length).toFixed(2)}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Numeric Grade</TableHead>
                      <TableHead>Letter Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderSkeletonRows()}
                  </TableBody>
                </Table>
              </div>
            ) : grades.length > 0 ? (
              <div className="overflow-hidden rounded-b-xl">
                <Table className="border-collapse">
                  <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                    <TableRow>
                      <TableHead className="font-medium">Course Code</TableHead>
                      <TableHead className="font-medium">Course Name</TableHead>
                      <TableHead className="font-medium">Numeric Grade</TableHead>
                      <TableHead className="font-medium">Letter Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((grade, index) => (
                      <TableRow 
                        key={index} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
                      >
                        <TableCell className="font-medium">{grade.course_code}</TableCell>
                        <TableCell>{grade.course_name}</TableCell>
                        <TableCell>{grade.grade ?? "N/A"}</TableCell>
                        <TableCell>
                          <Badge className={`${getGradeColor(grade.letter_grade)} border`}>
                            {grade.letter_grade}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-blue-50 p-3 mb-4">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-2">No grades available yet.</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Your grades will appear here once they're released.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-b">
            <CardTitle className="font-semibold flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Grade Key
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Below is a guide to understanding the letter grade system:
              </p>
              {[
                { grade: "AA", range: "90-100", description: "Excellent" },
                { grade: "BA", range: "85-89", description: "Very Good" },
                { grade: "BB", range: "80-84", description: "Good" },
                { grade: "CB", range: "75-79", description: "Above Average" },
                { grade: "CC", range: "70-74", description: "Average" },
                { grade: "DC", range: "65-69", description: "Below Average" },
                { grade: "DD", range: "60-64", description: "Pass" },
                { grade: "FD", range: "50-59", description: "Conditional Pass" },
                { grade: "FF", range: "0-49", description: "Fail" },
                { grade: "DZ", range: "N/A", description: "Did Not Attend" },
              ].map((item) => (
                <div 
                  key={item.grade} 
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                >
                  <Badge className={`${getGradeColor(item.grade)} border mr-2`}>
                    {item.grade}
                  </Badge>
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{item.description}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.range}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentGrades;
