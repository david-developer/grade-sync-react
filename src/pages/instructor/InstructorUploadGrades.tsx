
import { useState, useEffect } from "react";
import { instructorAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import CourseSelect, { Course } from "@/components/CourseSelect";

const InstructorUploadGrades = () => {
  const [file, setFile] = useState<File | null>(null);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await instructorAPI.getMyCourses();
        setCourses(data.courses || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    
    if (!courseId) {
      toast.error("Please select a course");
      return;
    }
    
    setIsUploading(true);
    
    try {
      const response = await instructorAPI.uploadGradesFile(file, courseId);
      toast.success("Grades uploaded successfully");
      
      // Clear the form
      setFile(null);
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Display upload statistics
      if (response.processed) {
        toast.info(`Processed ${response.processed} grade entries`);
      }
      
      if (response.errors && response.errors.length > 0) {
        toast.error(`Encountered ${response.errors.length} errors during upload`);
      }
    } catch (error) {
      console.error("Error uploading grades:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gradient">Upload Grades</h1>

      <Card className="card-hover">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-xl border-b">
          <CardTitle className="flex items-center text-xl font-bold">
            <Upload className="h-5 w-5 mr-3 text-primary" />
            Upload Grades File
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <CourseSelect 
              courses={courses}
              onChange={(id) => setCourseId(id)}
              isLoading={isLoading}
              label="Course"
              placeholder="Select a course"
            />

            <div className="space-y-2">
              <Label htmlFor="file">Grades CSV File</Label>
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                required
                className="bg-gradient-to-r from-gray-50 to-white hover:from-white hover:to-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground"
              />
              <p className="text-sm text-gray-500">
                Upload a CSV file with columns: student_id (or email), grade
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={isUploading || !courseId} 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isUploading ? (
                <div className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Uploading...
                </div>
              ) : (
                <div className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Grades
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-xl border">
            <h3 className="text-lg font-semibold mb-3">CSV Format Guidelines</h3>
            <div className="text-sm">
              <p className="mb-3">Your CSV file should include these columns:</p>
              <ul className="list-disc pl-5 space-y-2 mb-3">
                <li>
                  <strong>student_id</strong> or <strong>email</strong> - Student ID or email address
                </li>
                <li>
                  <strong>grade</strong> - Numeric grade (0-100) or "DZ" for non-attendance
                </li>
              </ul>
              <p className="font-semibold mb-2">Example:</p>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-md font-mono text-xs">
                <code>email,grade</code><br />
                <code>student1@example.com,85</code><br />
                <code>student2@example.com,DZ</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorUploadGrades;
