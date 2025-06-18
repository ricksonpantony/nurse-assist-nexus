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
  const [importResults, setImportResults] = useState<{ success: number; errors: string[]; referralsCreated: number; skipped: number } | null>(null);
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
      description: "Student import template with batch details and sample data has been downloaded. Please delete sample rows before importing.",
    });
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
    let referralsCreated = 0;
    let skippedCount = 0;

    try {
      const data = await parseExcelFile(file);
      
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          // Skip sample data (already filtered in parseExcelFile)
          if (row.full_name?.includes('(SAMPLE - DELETE THIS ROW)')) {
            continue;
          }

          // Check for duplicate email
          const emailExists = await checkEmailExists(row.email);
          if (emailExists) {
            errors.push(`Row ${i + 1}: Email "${row.email}" already exists in the database`);
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
              errors.push(`Row ${i + 1}: Course "${row.course_title}" not found in available courses`);
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
            errors.push(`Row ${i + 1} referral: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }

          // Generate student ID automatically
          const studentId = await generateStudentId();

          // Prepare student data with batch_id
          const studentData = {
            id: studentId,
            full_name: row.full_name,
            email: row.email,
            phone: row.phone,
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
            if (studentError.message.includes('duplicate key value violates unique constraint "students_email_key"')) {
              errors.push(`Row ${i + 1}: Email "${row.email}" already exists (duplicate detected during import)`);
              skippedCount++;
              continue;
            }
            errors.push(`Row ${i + 1}: ${studentError.message}`);
            continue;
          }

          // Process payments
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
              errors.push(`Row ${i + 1} payments: ${paymentError.message}`);
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
              errors.push(`Row ${i + 1} referral payment: ${referralPaymentError.message}`);
            }
          }

          successCount++;
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      setImportResults({ success: successCount, errors, referralsCreated, skipped: skippedCount });
      
      if (successCount > 0) {
        toast({
          title: "Import Completed",
          description: `Successfully imported ${successCount} students${referralsCreated > 0 ? `, created ${referralsCreated} referrals` : ''}${skippedCount > 0 ? `, skipped ${skippedCount} duplicates` : ''}`,
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-blue-800 flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Students - Enhanced Template with Batch Details
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
                Download the enhanced student import template with batch details, improved date format (DD/MM/YYYY) and duplicate prevention.
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
                <div>• <strong>Date Format:</strong> Use DD/MM/YYYY format (e.g., 15/01/2024)</div>
                <div>• <strong>Batch Details:</strong> Add batch_id column for organizing students into groups</div>
                <div>• <strong>Duplicate Prevention:</strong> System will skip rows with existing email addresses</div>
                <div>• <strong>Sample Data:</strong> Delete all sample rows before importing your data</div>
                <div>• <strong>Email Validation:</strong> Each email must be unique in your import file</div>
                <div>• <strong>Batch Examples:</strong> Check the "Batch_Examples" sheet for format suggestions</div>
              </div>
            </AlertDescription>
          </Alert>

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

          {/* Import Results */}
          {importResults && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Import Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-green-600">✓ Successfully imported: {importResults.success} students</p>
                  {importResults.referralsCreated > 0 && (
                    <p className="text-blue-600">✓ Created new referrals: {importResults.referralsCreated}</p>
                  )}
                  {importResults.skipped > 0 && (
                    <p className="text-yellow-600">⚠ Skipped duplicates: {importResults.skipped}</p>
                  )}
                  
                  {importResults.errors.length > 0 && (
                    <div>
                      <p className="text-red-600 font-medium">Errors encountered:</p>
                      <div className="max-h-40 overflow-y-auto bg-red-50 p-2 rounded mt-1">
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
