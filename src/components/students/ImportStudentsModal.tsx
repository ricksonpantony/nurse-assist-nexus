import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, FileText, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parseExcelFile, generateSampleExcel, parseDateFromExcel, StudentImportData } from "@/utils/excelUtils";
import { ImportPreviewModal } from "./ImportPreviewModal";
import { Course } from "@/hooks/useCourses";
import { supabase } from "@/integrations/supabase/client";

interface ImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onImportComplete: () => void;
}

interface ImportError {
  rowNumber: number;
  studentName: string;
  email: string;
  error: string;
  rawData: StudentImportData;
}

interface ImportResults {
  success: number;
  errors: ImportError[];
  referralsCreated: number;
  skipped: number;
  failedStudents: string[];
}

export const ImportStudentsModal = ({ isOpen, onClose, courses, onImportComplete }: ImportStudentsModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<StudentImportData[]>([]);
  const { toast } = useToast();

  const statusOptions = [
    'Attended Online',
    'Attend sessions', 
    'Attended F2F',
    'Exam cycle',
    'Awaiting results',
    'Pass',
    'Fail'
  ];

  const paymentModes = [
    'Credit Card',
    'Bank Transfer',
    'Cash',
    'Cheque',
    'Online Payment'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResults(null);
    }
  };

  const handleDownloadSample = () => {
    generateSampleExcel(courses);
    toast({
      title: "Template Downloaded",
      description: "Student import template with enhanced payment stages and batch details has been downloaded. Please delete sample rows before importing.",
    });
  };

  const handlePreviewImport = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select an Excel file to import",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Starting to parse Excel file:', file.name);
      const data = await parseExcelFile(file);
      console.log('Parsed Excel data:', data);
      
      if (!data || data.length === 0) {
        toast({
          title: "No Data Found",
          description: "The Excel file appears to be empty or contains no valid data rows.",
          variant: "destructive",
        });
        return;
      }

      setPreviewData(data);
      setShowPreview(true);
      console.log('Setting preview data and showing preview modal');
    } catch (error) {
      console.error('Excel parsing error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to parse Excel file";
      toast({
        title: "File Parsing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const generateStudentId = async () => {
    const year = new Date().getFullYear();
    
    try {
      // Get all existing student IDs that match the current year pattern
      const { data, error } = await supabase
        .from('students')
        .select('id')
        .like('id', `ATZ-${year}-%`);

      if (error) throw error;

      // Extract the numeric parts and find the highest number
      let maxNumber = 0;
      if (data && data.length > 0) {
        data.forEach(student => {
          const match = student.id.match(/ATZ-\d{4}-(\d{3})$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNumber) {
              maxNumber = num;
            }
          }
        });
      }

      // Generate the next ID
      const nextNumber = maxNumber + 1;
      return `ATZ-${year}-${String(nextNumber).padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating student ID:', error);
      // Fallback to timestamp-based ID if there's an error
      const timestamp = Date.now().toString().slice(-3);
      return `ATZ-${year}-${timestamp}`;
    }
  };

  const generateReferralId = async () => {
    const { data } = await supabase
      .from('referrals')
      .select('referral_id')
      .order('referral_id', { ascending: false })
      .limit(1);
    
    const lastId = data?.[0]?.referral_id || 'REF-000';
    const lastNumber = parseInt(lastId.split('-')[1]) || 0;
    const nextNumber = lastNumber + 1;
    return `REF-${String(nextNumber).padStart(3, '0')}`;
  };

  const findOrCreateReferral = async (row: StudentImportData) => {
    if (!row.referred_by_name || row.referred_by_name.trim() === '') {
      return null; // Direct referral
    }

    // First, try to find existing referral by name
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('*')
      .ilike('full_name', row.referred_by_name.trim())
      .single();

    if (existingReferral) {
      return existingReferral.id;
    }

    // Create new referral if not found
    const referralId = await generateReferralId();
    const { data: newReferral, error } = await supabase
      .from('referrals')
      .insert([{
        referral_id: referralId,
        full_name: row.referred_by_name.trim(),
        email: '',
        phone: '',
        address: '',
        bank_name: '',
        account_number: '',
        bsb: '',
        notes: 'Auto-created during student import'
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create referral: ${error.message}`);
    }

    return newReferral.id;
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('students')
      .select('id')
      .eq('email', email)
      .single();
    
    return !error && data !== null;
  };

  const handleConfirmImport = async (data: StudentImportData[]) => {
    setIsProcessing(true);
    setShowPreview(false);
    const errors: ImportError[] = [];
    const failedStudents: string[] = [];
    let successCount = 0;
    let referralsCreated = 0;
    let skippedCount = 0;

    try {
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNumber = i + 2;
        const studentName = row.full_name || 'Unknown Student';
        const studentEmail = row.email || 'No Email';
        
        try {
          // Check for duplicate email
          const emailExists = await checkEmailExists(row.email);
          if (emailExists) {
            errors.push({
              rowNumber,
              studentName,
              email: studentEmail,
              error: `Email "${row.email}" already exists in the database`,
              rawData: row
            });
            failedStudents.push(studentName);
            skippedCount++;
            continue;
          }

          // Find course by title and get its fee
          let courseId = null;
          let courseFee = 0;
          if (row.course_title) {
            const course = courses.find(c => c.title.toLowerCase() === row.course_title.toLowerCase());
            if (course) {
              courseId = course.id;
              courseFee = course.fee;
            } else {
              errors.push({
                rowNumber,
                studentName,
                email: studentEmail,
                error: `Course "${row.course_title}" not found in available courses`,
                rawData: row
              });
              failedStudents.push(studentName);
              continue;
            }
          }

          // Handle referral
          let referralId = null;
          try {
            referralId = await findOrCreateReferral(row);
            if (referralId && row.referred_by_name) {
              referralsCreated++;
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errors.push({
              rowNumber,
              studentName,
              email: studentEmail,
              error: `Referral processing failed: ${errorMessage}`,
              rawData: row
            });
          }

          // Generate student ID automatically
          const studentId = await generateStudentId();

          // Prepare student data - ensure phone is always a string
          const studentData = {
            id: studentId,
            full_name: row.full_name,
            email: row.email,
            phone: typeof row.phone === 'number' ? String(row.phone) : (row.phone || ''),
            address: row.address || null,
            country: row.country || null,
            passport_id: row.passport_id || null,
            course_id: courseId,
            batch_id: row.batch_id || null,
            join_date: parseDateFromExcel(row.join_date),
            class_start_date: row.class_start_date ? parseDateFromExcel(row.class_start_date) : null,
            status: statusOptions.includes(row.status) ? row.status : 'Attend sessions',
            total_course_fee: row.total_course_fee || courseFee,
            advance_payment: row.advance_payment_amount || 0,
            installments: 1,
            referral_id: referralId,
            notes: row.notes || null,
          };

          // Insert student
          const { error: studentError } = await supabase
            .from('students')
            .insert([studentData]);

          if (studentError) {
            const errorMessage = studentError.message || 'Unknown database error';
            if (errorMessage.includes && errorMessage.includes('duplicate key value violates unique constraint "students_email_key"')) {
              errors.push({
                rowNumber,
                studentName,
                email: studentEmail,
                error: `Email "${row.email}" already exists (duplicate detected during import)`,
                rawData: row
              });
              failedStudents.push(studentName);
              skippedCount++;
              continue;
            }
            errors.push({
              rowNumber,
              studentName,
              email: studentEmail,
              error: `Database error: ${errorMessage}`,
              rawData: row
            });
            failedStudents.push(studentName);
            continue;
          }

          // Process payments with new third payment stage
          const payments = [];
          
          if (row.advance_payment_amount && row.advance_payment_amount > 0) {
            payments.push({
              student_id: studentId,
              stage: 'Advance',
              amount: row.advance_payment_amount,
              payment_mode: paymentModes.includes(row.advance_payment_mode || '') ? row.advance_payment_mode : 'Bank Transfer',
              payment_date: row.advance_payment_date ? parseDateFromExcel(row.advance_payment_date) : parseDateFromExcel(row.join_date),
            });
          }

          if (row.second_payment_amount && row.second_payment_amount > 0) {
            payments.push({
              student_id: studentId,
              stage: 'Second',
              amount: row.second_payment_amount,
              payment_mode: paymentModes.includes(row.second_payment_mode || '') ? row.second_payment_mode : 'Bank Transfer',
              payment_date: row.second_payment_date ? parseDateFromExcel(row.second_payment_date) : parseDateFromExcel(row.join_date),
            });
          }

          if (row.third_payment_amount && row.third_payment_amount > 0) {
            payments.push({
              student_id: studentId,
              stage: 'Third',
              amount: row.third_payment_amount,
              payment_mode: paymentModes.includes(row.third_payment_mode || '') ? row.third_payment_mode : 'Bank Transfer',
              payment_date: row.third_payment_date ? parseDateFromExcel(row.third_payment_date) : parseDateFromExcel(row.join_date),
            });
          }

          if (row.final_payment_amount && row.final_payment_amount > 0) {
            payments.push({
              student_id: studentId,
              stage: 'Final',
              amount: row.final_payment_amount,
              payment_mode: paymentModes.includes(row.final_payment_mode || '') ? row.final_payment_mode : 'Bank Transfer',
              payment_date: row.final_payment_date ? parseDateFromExcel(row.final_payment_date) : parseDateFromExcel(row.join_date),
            });
          }

          // Insert payments
          if (payments.length > 0) {
            const { error: paymentError } = await supabase
              .from('payments')
              .insert(payments);

            if (paymentError) {
              const errorMessage = paymentError.message || 'Unknown payment error';
              errors.push({
                rowNumber,
                studentName,
                email: studentEmail,
                error: `Payment processing failed: ${errorMessage}`,
                rawData: row
              });
            }
          }

          // Add referral payment if specified
          if (referralId && row.referral_payment_amount && row.referral_payment_amount > 0) {
            const { error: referralPaymentError } = await supabase
              .from('referral_payments')
              .insert([{
                referral_id: referralId,
                student_id: studentId,
                amount: row.referral_payment_amount,
                payment_date: parseDateFromExcel(row.join_date),
                payment_method: 'Bank Transfer',
                notes: `Payment for referring student ${row.full_name}`
              }]);

            if (referralPaymentError) {
              const errorMessage = referralPaymentError.message || 'Unknown referral payment error';
              errors.push({
                rowNumber,
                studentName,
                email: studentEmail,
                error: `Referral payment failed: ${errorMessage}`,
                rawData: row
              });
            }
          }

          successCount++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          errors.push({
            rowNumber,
            studentName,
            email: studentEmail,
            error: errorMessage,
            rawData: row
          });
          failedStudents.push(studentName);
        }
      }

      setImportResults({ 
        success: successCount, 
        errors, 
        referralsCreated, 
        skipped: skippedCount,
        failedStudents
      });
      
      if (successCount > 0) {
        toast({
          title: "Import Completed",
          description: `Successfully imported ${successCount} students${referralsCreated > 0 ? `, created ${referralsCreated} referrals` : ''}${skippedCount > 0 ? `, skipped ${skippedCount} duplicates` : ''}`,
        });
        onImportComplete();
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to process file";
      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelImport = () => {
    setShowPreview(false);
    setPreviewData([]);
  };

  const handleClose = () => {
    setFile(null);
    setImportResults(null);
    setShowPreview(false);
    setPreviewData([]);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen && !showPreview} onOpenChange={handleClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-800 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Students - Enhanced Template with Additional Payment Stage
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Download Template Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Enhanced Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Download the enhanced student import template with additional payment stage (Third Payment) and comprehensive preview functionality.
                </p>
                <Button onClick={handleDownloadSample} variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Download Template
                </Button>
              </CardContent>
            </Card>

            {/* Template Information */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Enhanced Template Features:</strong>
                <div className="mt-2 text-sm space-y-1">
                  <div>• <strong>Additional Payment Stage:</strong> Third payment stage added between second and final payments</div>
                  <div>• <strong>Data Preview:</strong> Review and edit all data before importing to database</div>
                  <div>• <strong>Error Correction:</strong> Fix validation errors directly in the preview window</div>
                  <div>• <strong>Payment Stages:</strong> Advance → Second → Third → Final payment structure</div>
                  <div>• <strong>Batch Organization:</strong> Group students using batch_id field</div>
                  <div>• <strong>Duplicate Prevention:</strong> System will skip rows with existing email addresses</div>
                </div>
              </AlertDescription>
            </Alert>

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

            {/* Course Information */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Available Courses:</strong>
                <div className="mt-2 space-y-1 text-sm">
                  {courses.length > 0 ? (
                    courses.map(course => (
                      <div key={course.id}>
                        • <strong>{course.title}</strong> - ${course.fee} ({course.period_months} months)
                        {course.description && <div className="ml-4 text-gray-600">{course.description}</div>}
                      </div>
                    ))
                  ) : (
                    <div>No courses available. Please add courses first.</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {/* Important Guidelines */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Import Guidelines:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Course title must exactly match one from your course list</li>
                  <li>• Student ID is auto-generated, don't include it in import data</li>
                  <li>• Sample data rows are automatically excluded from import</li>
                  <li>• New referral accounts created for unrecognized referrer names</li>
                  <li>• Course fee auto-populated from course selection</li>
                  <li>• Empty payment amounts won't create payment records</li>
                  <li>• Required fields: full_name, email, phone, course_title, join_date</li>
                  <li>• Duplicate emails will be skipped and reported</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Enhanced Import Results */}
            {importResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Detailed Import Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="font-semibold text-green-800">Successfully Imported</div>
                        <div className="text-2xl font-bold text-green-600">{importResults.success}</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="font-semibold text-red-800">Failed</div>
                        <div className="text-2xl font-bold text-red-600">{importResults.errors.length}</div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="font-semibold text-yellow-800">Skipped (Duplicates)</div>
                        <div className="text-2xl font-bold text-yellow-600">{importResults.skipped}</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="font-semibold text-blue-800">Referrals Created</div>
                        <div className="text-2xl font-bold text-blue-600">{importResults.referralsCreated}</div>
                      </div>
                    </div>

                    {/* Failed Students List */}
                    {importResults.failedStudents.length > 0 && (
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-red-800 mb-2">Students Not Imported:</h4>
                        <div className="text-sm text-red-700">
                          {importResults.failedStudents.join(', ')}
                        </div>
                      </div>
                    )}
                    
                    {/* Detailed Error List */}
                    {importResults.errors.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-red-800 mb-3">Detailed Error Report:</h4>
                        <div className="max-h-60 overflow-y-auto space-y-3">
                          {importResults.errors.map((error, index) => (
                            <div key={index} className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="font-semibold text-red-800">
                                    Row {error.rowNumber}: {error.studentName}
                                  </div>
                                  <div className="text-sm text-red-600">Email: {error.email}</div>
                                </div>
                              </div>
                              <div className="text-sm text-red-700 mb-2">
                                <strong>Error:</strong> {error.error}
                              </div>
                              <details className="text-xs">
                                <summary className="cursor-pointer text-red-600 hover:text-red-800">
                                  View Raw Data
                                </summary>
                                <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto text-gray-700">
                                  {JSON.stringify(error.rawData, null, 2)}
                                </pre>
                              </details>
                            </div>
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
                onClick={handlePreviewImport} 
                disabled={!file || isProcessing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? "Processing..." : "Preview Import"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <ImportPreviewModal
        isOpen={showPreview}
        onClose={handleCancelImport}
        importData={previewData}
        courses={courses}
        onConfirmImport={handleConfirmImport}
        onCancelImport={handleCancelImport}
      />
    </>
  );
};
