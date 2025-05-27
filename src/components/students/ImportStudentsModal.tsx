
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parseExcelFile, generateSampleExcel, parseDateFromExcel, StudentImportData } from "@/utils/excelUtils";
import { Course } from "@/hooks/useCourses";
import { supabase } from "@/integrations/supabase/client";

interface ImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onImportComplete: () => void;
}

export const ImportStudentsModal = ({ isOpen, onClose, courses, onImportComplete }: ImportStudentsModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; errors: string[] } | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResults(null);
    }
  };

  const handleDownloadSample = () => {
    generateSampleExcel();
    toast({
      title: "Sample Downloaded",
      description: "Sample Excel file has been downloaded to your device",
    });
  };

  const generateStudentId = async () => {
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });
    
    const nextNumber = (count || 0) + 1;
    return `ATZ-${year}-${String(nextNumber).padStart(3, '0')}`;
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select an Excel file to import",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const errors: string[] = [];
    let successCount = 0;

    try {
      const data = await parseExcelFile(file);
      
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          // Find course by title
          let courseId = null;
          if (row.course_title) {
            const course = courses.find(c => c.title.toLowerCase() === row.course_title.toLowerCase());
            courseId = course?.id || null;
          }

          // Generate student ID
          const studentId = await generateStudentId();

          // Prepare student data
          const studentData = {
            id: studentId,
            full_name: row.full_name,
            email: row.email,
            phone: row.phone,
            address: row.address || null,
            country: row.country || null,
            passport_id: row.passport_id || null,
            course_id: courseId,
            join_date: parseDateFromExcel(row.join_date),
            class_start_date: row.class_start_date ? parseDateFromExcel(row.class_start_date) : null,
            status: row.status || 'enrolled',
            total_course_fee: row.total_course_fee,
            advance_payment: row.advance_payment || 0,
            installments: row.installments || 1,
          };

          // Insert student
          const { error: studentError } = await supabase
            .from('students')
            .insert([studentData]);

          if (studentError) {
            errors.push(`Row ${i + 1}: ${studentError.message}`);
            continue;
          }

          // Process payments
          const payments = [];
          
          // Advance payment
          if (row.advance_payment_amount && row.advance_payment_amount > 0) {
            payments.push({
              student_id: studentId,
              stage: 'Advance',
              amount: row.advance_payment_amount,
              payment_mode: row.advance_payment_mode || 'Bank Transfer',
              payment_date: row.advance_payment_date ? parseDateFromExcel(row.advance_payment_date) : parseDateFromExcel(row.join_date),
            });
          }

          // Second payment
          if (row.second_payment_amount && row.second_payment_amount > 0) {
            payments.push({
              student_id: studentId,
              stage: 'Second',
              amount: row.second_payment_amount,
              payment_mode: row.second_payment_mode || 'Bank Transfer',
              payment_date: row.second_payment_date ? parseDateFromExcel(row.second_payment_date) : parseDateFromExcel(row.join_date),
            });
          }

          // Third payment
          if (row.third_payment_amount && row.third_payment_amount > 0) {
            payments.push({
              student_id: studentId,
              stage: 'Third',
              amount: row.third_payment_amount,
              payment_mode: row.third_payment_mode || 'Bank Transfer',
              payment_date: row.third_payment_date ? parseDateFromExcel(row.third_payment_date) : parseDateFromExcel(row.join_date),
            });
          }

          // Final payment
          if (row.final_payment_amount && row.final_payment_amount > 0) {
            payments.push({
              student_id: studentId,
              stage: 'Final',
              amount: row.final_payment_amount,
              payment_mode: row.final_payment_mode || 'Bank Transfer',
              payment_date: row.final_payment_date ? parseDateFromExcel(row.final_payment_date) : parseDateFromExcel(row.join_date),
            });
          }

          // Insert payments
          if (payments.length > 0) {
            const { error: paymentError } = await supabase
              .from('payments')
              .insert(payments);

            if (paymentError) {
              errors.push(`Row ${i + 1} payments: ${paymentError.message}`);
            }
          }

          successCount++;
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      setImportResults({ success: successCount, errors });
      
      if (successCount > 0) {
        toast({
          title: "Import Completed",
          description: `Successfully imported ${successCount} students`,
        });
        onImportComplete();
      }

    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportResults(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-blue-800 flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Students from Excel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Download Sample Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Sample File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Download a sample Excel file to see the required format and column structure.
              </p>
              <Button onClick={handleDownloadSample} variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Download Sample Excel
              </Button>
            </CardContent>
          </Card>

          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Upload Excel File</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="excel-file">Select Excel File (.xlsx)</Label>
                <Input
                  id="excel-file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="mt-1"
                />
              </div>
              
              {file && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Format Information */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important Notes:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Use DD-MM-YYYY format for all dates</li>
                <li>• If payment mode is not specified, it will default to "Bank Transfer"</li>
                <li>• If payment amount is empty or 0, no payment record will be created for that stage</li>
                <li>• Course title must match exactly with existing courses</li>
                <li>• All required fields (name, email, phone, course fee) must be filled</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Import Results */}
          {importResults && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Import Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-green-600">✓ Successfully imported: {importResults.success} students</p>
                  
                  {importResults.errors.length > 0 && (
                    <div>
                      <p className="text-red-600 font-medium">Errors encountered:</p>
                      <div className="max-h-32 overflow-y-auto bg-red-50 p-2 rounded mt-1">
                        {importResults.errors.map((error, index) => (
                          <p key={index} className="text-sm text-red-700">{error}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!file || isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? "Processing..." : "Import Students"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
