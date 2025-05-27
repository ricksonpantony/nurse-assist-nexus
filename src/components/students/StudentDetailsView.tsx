
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { X, Printer, Download, DollarSign, Receipt, Calendar } from "lucide-react";
import { PaymentRecordForm } from "./PaymentRecordForm";

interface Course {
  id: string;
  title: string;
  fee: number;
  period_months: number;
}

interface StudentDetailsViewProps {
  student: any;
  courses: Course[];
  onClose: () => void;
  onRefresh?: () => void;
}

export const StudentDetailsView = ({ student, courses, onClose, onRefresh }: StudentDetailsViewProps) => {
  const course = courses.find(c => c.id === student.course_id);
  const [refreshKey, setRefreshKey] = useState(0);
  
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
  const paymentProgress = (totalPaid / student.total_course_fee) * 100;

  const handlePrint = () => {
    window.print();
  };

  const handlePaymentAdded = () => {
    setRefreshKey(prev => prev + 1);
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-6xl max-h-[95vh] overflow-y-auto mx-4 bg-white rounded-lg shadow-2xl">
        {/* Header with controls */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 print:hidden bg-gradient-to-r from-blue-50 to-white">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Student & Course Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Student Details Section */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800 text-lg flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Student Information
                  </CardTitle>
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
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800 text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Course Information
                  </CardTitle>
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

              {/* Payment History Table */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800 text-lg flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {payment.stage}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-green-600">${payment.amount}</TableCell>
                          <TableCell>{payment.payment_mode}</TableCell>
                        </TableRow>
                      ))}
                      {(!student.payments || student.payments.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-gray-500 py-6">
                            No payments recorded yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Payment Summary & Actions */}
            <div className="space-y-6">
              {/* Payment Summary */}
              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="text-green-800 text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Payment Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Payment Progress</span>
                      <span className="font-semibold">{paymentProgress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Payment Stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                      <span className="text-gray-600">Total Course Fee</span>
                      <span className="text-lg font-bold text-blue-600">${student.total_course_fee}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                      <span className="text-gray-600">Total Paid</span>
                      <span className="text-lg font-bold text-green-600">${totalPaid}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                      <span className="text-gray-600">Balance Due</span>
                      <span className={`text-lg font-bold ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${balanceDue}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="text-center pt-2">
                    {balanceDue <= 0 ? (
                      <Badge className="bg-green-100 text-green-800 px-4 py-2">
                        ✓ Fully Paid
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 px-4 py-2">
                        ⏳ Payment Pending
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Add Payment Form */}
              <div className="print:hidden">
                <PaymentRecordForm 
                  studentId={student.id} 
                  onPaymentAdded={handlePaymentAdded}
                />
              </div>

              {/* Installment Plan */}
              {student.installments > 1 && (
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-800 text-lg">Installment Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Payment is divided into <span className="font-semibold">{student.installments}</span> installments
                      </p>
                      <p className="text-sm text-gray-600">
                        Approximately <span className="font-semibold text-blue-600">
                          ${Math.round(student.total_course_fee / student.installments)}
                        </span> per installment
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 border-t pt-4 mt-8">
            <p>Generated on {new Date().toLocaleDateString()} | Nurse Assist International</p>
          </div>
        </div>
      </div>
    </div>
  );
};
