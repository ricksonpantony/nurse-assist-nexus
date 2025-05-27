
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { X, Printer, Download } from "lucide-react";

interface Course {
  id: string;
  title: string;
  fee: number;
  period_months: number;  // Changed from periodMonths to period_months
}

interface StudentDetailsViewProps {
  student: any;
  courses: Course[];
  onClose: () => void;
}

export const StudentDetailsView = ({ student, courses, onClose }: StudentDetailsViewProps) => {
  const course = courses.find(c => c.id === student.course_id);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "awaiting-course":
        return "bg-yellow-100 text-yellow-800";
      case "enrolled":
        return "bg-blue-100 text-blue-800";
      case "online":
        return "bg-green-100 text-green-800";
      case "face-to-face":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "awaiting-course":
        return "Awaiting Course";
      case "enrolled":
        return "Enrolled";
      case "online":
        return "Online";
      case "face-to-face":
        return "Face to Face";
      default:
        return status;
    }
  };

  const totalPaid = student.payments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0;
  const balanceDue = student.total_course_fee - totalPaid;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 bg-white rounded-lg shadow-2xl">
        {/* Header with controls */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 print:hidden">
          <h2 className="text-2xl font-bold text-blue-900">Student Account Details</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* A4 Style Content */}
        <div className="p-8 bg-white print:p-6">
          {/* Institute Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-blue-200">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Nurse Assist International</h1>
            <p className="text-blue-600">Professional Nursing Education & Training Institute</p>
          </div>

          {/* Student Details Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-blue-800 text-lg">Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-700">Student ID:</span>
                    <span className="ml-2 font-mono">{student.id}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Full Name:</span>
                    <span className="ml-2">{student.full_name}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Email:</span>
                    <span className="ml-2">{student.email}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Phone:</span>
                    <span className="ml-2">{student.phone}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-700">Passport ID:</span>
                    <span className="ml-2">{student.passport_id}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Country:</span>
                    <span className="ml-2">{student.country}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Address:</span>
                    <span className="ml-2">{student.address}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Status:</span>
                    <Badge className={`ml-2 ${getStatusColor(student.status)}`}>
                      {getStatusLabel(student.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Details Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-blue-800 text-lg">Course Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-700">Course Name:</span>
                    <span className="ml-2">{course?.title}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Duration:</span>
                    <span className="ml-2">{course?.period_months} months</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Batch ID:</span>
                    <span className="ml-2">{student.batch_id}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-700">Join Date:</span>
                    <span className="ml-2">{new Date(student.join_date).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Class Start Date:</span>
                    <span className="ml-2">{student.class_start_date ? new Date(student.class_start_date).toLocaleDateString() : 'Not set'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Total Fee:</span>
                    <span className="ml-2 font-semibold text-green-600">${student.total_course_fee}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-blue-800 text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Payment Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">${student.total_course_fee}</div>
                  <div className="text-sm text-gray-600">Total Fee</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${totalPaid}</div>
                  <div className="text-sm text-gray-600">Total Paid</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">${balanceDue}</div>
                  <div className="text-sm text-gray-600">Balance Due</div>
                </div>
              </div>

              {/* Payment History Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Fee Stage</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Mode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.payments?.map((payment: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                      <TableCell>{payment.stage}</TableCell>
                      <TableCell className="font-semibold">${payment.amount}</TableCell>
                      <TableCell>{payment.payment_mode}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Installment Plan */}
              {student.installments > 1 && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Installment Plan</h4>
                  <p className="text-sm text-yellow-700">
                    Payment is divided into {student.installments} installments of approximately ${Math.round(student.total_course_fee / student.installments)} each.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 border-t pt-4">
            <p>Generated on {new Date().toLocaleDateString()} | Nurse Assist International</p>
          </div>
        </div>
      </div>
    </div>
  );
};
