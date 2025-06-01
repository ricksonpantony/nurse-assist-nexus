import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X, Printer, Trash2, RefreshCw, Phone, Mail, MapPin, Calendar, CreditCard, User, GraduationCap } from "lucide-react";
import { useStudents } from "@/hooks/useStudents";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { PaymentRecordForm } from "./PaymentRecordForm";

interface StudentDetailsViewProps {
  student: any;
  courses: any[];
  onClose: () => void;
  onRefresh: () => void;
  isPageView?: boolean;
}

export const StudentDetailsView = ({ 
  student, 
  courses, 
  onClose, 
  onRefresh, 
  isPageView = false 
}: StudentDetailsViewProps) => {
  const { deleteStudent } = useStudents();
  const { toast } = useToast();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);

  const course = courses.find(c => c.id === student.course_id);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Attended Online': 'bg-blue-100 text-blue-800 border-blue-200',
      'Attend sessions': 'bg-purple-100 text-purple-800 border-purple-200',
      'Attended F2F': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Exam cycle': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Awaiting results': 'bg-orange-100 text-orange-800 border-orange-200',
      'Pass': 'bg-green-100 text-green-800 border-green-200',
      'Fail': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setIsPrintMode(false);
    }, 100);
  };

  const handleDeleteStudent = async () => {
    if (window.confirm(`Are you sure you want to delete ${student.full_name}? This action cannot be undone.`)) {
      try {
        await deleteStudent(student.id);
        toast({
          title: "Success",
          description: "Student deleted successfully",
        });
        onClose();
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const handlePaymentAdded = () => {
    setShowPaymentForm(false);
    onRefresh();
  };

  const totalPaid = student.payments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0;
  const remainingBalance = student.total_course_fee - totalPaid;

  const content = (
    <div className={`bg-white ${isPageView ? 'rounded-lg shadow-lg' : ''} ${isPrintMode ? 'print-mode' : ''}`}>
      {/* Header - Hidden in print mode */}
      {!isPrintMode && (
        <div className={`flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 ${isPageView ? 'rounded-t-lg' : ''} print:hidden`}>
          <div>
            <h2 className="text-2xl font-bold text-blue-900">Student Account</h2>
            <p className="text-blue-600">Complete student information and payment history</p>
          </div>
          <div className="flex gap-2">
            {!isPageView && (
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            {!isPageView && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Print Header - Only visible in print mode */}
      {isPrintMode && (
        <div className="print-only mb-6 text-center border-b pb-4">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Student Account Report</h1>
          <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
        </div>
      )}

      {/* Student Information */}
      <div className="p-6 space-y-6">
        {/* Personal Information Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-blue-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <div className="font-medium">{student.full_name}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Student ID</label>
              <div className="font-medium font-mono text-blue-600">{student.id}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{student.email}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{student.phone}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Passport ID</label>
              <div>{student.passport_id || 'Not provided'}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Country</label>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{student.country || 'Not specified'}</span>
              </div>
            </div>
            {student.address && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Address</label>
                <div>{student.address}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Academic Information Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Course</label>
              <div className="font-medium">
                {course ? course.title : 'No course assigned'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Current Status</label>
              <div>
                <Badge variant="outline" className={getStatusColor(student.status)}>
                  {student.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Join Date</label>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{formatDate(student.join_date)}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Class Start Date</label>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{formatDate(student.class_start_date)}</span>
              </div>
            </div>
            {student.batch_id && (
              <div>
                <label className="text-sm font-medium text-gray-500">Batch ID</label>
                <div>{student.batch_id}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Information Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-blue-600">Total Course Fee</label>
                <div className="text-2xl font-bold text-blue-900">${student.total_course_fee.toLocaleString()}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-green-600">Total Paid</label>
                <div className="text-2xl font-bold text-green-900">${totalPaid.toLocaleString()}</div>
              </div>
              <div className={`${remainingBalance > 0 ? 'bg-orange-50' : 'bg-gray-50'} p-4 rounded-lg`}>
                <label className={`text-sm font-medium ${remainingBalance > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                  Remaining Balance
                </label>
                <div className={`text-2xl font-bold ${remainingBalance > 0 ? 'text-orange-900' : 'text-gray-900'}`}>
                  ${remainingBalance.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Payment History</h4>
                {!isPrintMode && (
                  <Button
                    size="sm"
                    onClick={() => setShowPaymentForm(true)}
                    className="gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Add Payment
                  </Button>
                )}
              </div>

              {student.payments && student.payments.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Date</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Mode</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.payments.map((payment: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(payment.payment_date)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{payment.stage}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">${payment.amount.toLocaleString()}</TableCell>
                          <TableCell>{payment.payment_mode}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No payment records found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons - Hidden in print mode */}
        {!isPrintMode && (
          <div className="flex justify-end gap-2 pt-4 print:hidden">
            <Button variant="destructive" onClick={handleDeleteStudent} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Student
            </Button>
          </div>
        )}
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Payment Record</h3>
            <PaymentRecordForm
              studentId={student.id}
              currentStatus={student.status}
              onPaymentAdded={handlePaymentAdded}
            />
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShowPaymentForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isPageView) {
    return content;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {content}
      </div>
    </div>
  );
};
