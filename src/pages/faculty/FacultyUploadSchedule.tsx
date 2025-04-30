
import { useState } from "react";
import { facultyAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FacultyUploadSchedule = () => {
  const [file, setFile] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    
    setIsUploading(true);
    
    try {
      const response = await facultyAPI.uploadSchedule(file);
      toast.success("Schedule uploaded successfully");
      
      // Clear the form
      setFile(null);
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      if (response.filename) {
        toast.info(`File uploaded as: ${response.filename}`);
      }
    } catch (error) {
      console.error("Error uploading schedule:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCsvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!csvFile) {
      toast.error("Please select a CSV file to upload");
      return;
    }
    
    setIsUploadingCsv(true);
    
    try {
      const response = await facultyAPI.uploadResitSchedule(csvFile);
      toast.success("Resit schedule CSV uploaded successfully");
      
      // Clear the form
      setCsvFile(null);
      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      if (response.updated) {
        toast.info(`Updated ${response.updated} resit exams`);
      }
    } catch (error) {
      console.error("Error uploading resit schedule:", error);
    } finally {
      setIsUploadingCsv(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gradient">Upload Exam Schedule</h1>

      <Tabs defaultValue="full-schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="full-schedule">Full Schedule</TabsTrigger>
          <TabsTrigger value="csv-upload">CSV Resit Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="full-schedule">
          <Card className="card-hover">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-xl border-b">
              <CardTitle className="flex items-center text-xl font-bold">
                <Upload className="h-5 w-5 mr-3 text-primary" />
                Upload Schedule File
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="file">Schedule File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".csv,.xlsx,.xls,.pdf"
                    onChange={handleFileChange}
                    required
                    className="bg-gradient-to-r from-gray-50 to-white hover:from-white hover:to-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground"
                  />
                  <p className="text-sm text-gray-500">
                    Upload the complete resit exam schedule (CSV, Excel, or PDF format)
                  </p>
                </div>
                <Button 
                  type="submit" 
                  disabled={isUploading} 
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
                      Upload Schedule
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-xl border">
                <h3 className="text-lg font-semibold mb-3">Schedule File Guidelines</h3>
                <div className="text-sm">
                  <p className="mb-2">Your schedule file should include:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Course code and name</li>
                    <li>Exam date and time</li>
                    <li>Location</li>
                    <li>Duration</li>
                    <li>Any special instructions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="csv-upload">
          <Card className="card-hover">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-xl border-b">
              <CardTitle className="flex items-center text-xl font-bold">
                <Calendar className="h-5 w-5 mr-3 text-primary" />
                Upload Resit Schedule CSV
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCsvSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="csv-file">Resit Schedule CSV</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleCsvFileChange}
                    required
                    className="bg-gradient-to-r from-gray-50 to-white hover:from-white hover:to-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground"
                  />
                  <p className="text-sm text-gray-500">
                    Upload a CSV file with columns: course_code, exam_date, location
                  </p>
                </div>
                <Button 
                  type="submit" 
                  disabled={isUploadingCsv} 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isUploadingCsv ? (
                    <div className="flex items-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Uploading CSV...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload CSV Schedule
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-xl border">
                <h3 className="text-lg font-semibold mb-3">CSV Format Guidelines</h3>
                <div className="text-sm">
                  <p className="mb-3">Your CSV file should include these columns:</p>
                  <ul className="list-disc pl-5 space-y-2 mb-3">
                    <li><strong>course_code</strong> - Course code (e.g., MATH101)</li>
                    <li><strong>exam_date</strong> - Date of the exam (YYYY-MM-DD format)</li>
                    <li><strong>location</strong> - Location of the exam</li>
                  </ul>
                  <p className="font-semibold mb-2">Example:</p>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-md font-mono text-xs">
                    <code>course_code,exam_date,location</code><br />
                    <code>MATH101,2025-06-15,Room 301</code><br />
                    <code>PHY301,2025-06-18,Science Hall</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FacultyUploadSchedule;
