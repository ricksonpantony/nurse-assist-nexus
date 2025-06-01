
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X, Printer, RefreshCw, User, Phone, Mail, MapPin, CreditCard, Calendar, BookOpen } from "lucide-react";
import { Student, Payment } from "@/hooks/useStudents";
import { Course } from "@/hooks/useCourses";
import { useReferrals } from "@/hooks/useReferrals";
import { useIsMobile } from "@/hooks/use-mobile";

interface StudentDetailsViewProps {
  student: Student & { payments: Payment[] };
  courses: Course[];
  onClose: () => void;
  onRefresh: () => void;
}

export const StudentDetailsView = ({ student, courses, onClose, onRefresh }: StudentDetailsViewProps) => {
  const isMobile = useIsMobile();
  const { referrals } = useReferrals();
  
  const course = courses.find(c => c.id === student.course_id);
  const referralPerson = referrals.find(r => r.id === student.referral_id);
  
  const totalPaid = student.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const remainingBalance = student.total_course_fee - totalPaid;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handlePrintAccount = () => {
    window.print();
  };

  const getStatusBadgeColor = (status: string) => {
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

  const PrintableContent = () => (
    <div className="print:block print:p-8 print:bg-white print:text-black print:shadow-none">
      {/* Header */}
      <div className="text-center mb-8 print:mb-6">
        <h1 className="text-3xl font-bold text-blue-900 print:text-black mb-2">
          Nurse Assist International (NAI)
        </h1>
        <h2 className="text-xl text-blue-700 print:text-gray-700 font-semibold">
          Student Account Overview
        </h2>
      </div>

      {/* Student Header Info */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-blue-900 print:text-black">{student.full_name}</h2>
            <p className="text-blue-600 print:text-gray-600">Student ID: {student.id}</p>
          </div>
          <div className="text-right print:text-black">
            <p className="text-sm text-gray-600 print:text-black">
              Generated: {new Date().toLocaleDateString('en-AU')}
            </p>
            <Badge variant="outline" className={`${getStatusBadgeColor(student.status)} print:border-gray-400 print:text-black`}>
              {student.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <Card className="mb-6 print:border print:border-gray-300 print:shadow-none">
        <CardHeader className="bg-blue-50 print:bg-gray-100">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-900 print:text-black">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600 print:text-black">Full Name</label>
              <p className="text-gray-900 print:text-black">{student.full_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 print:text-black">Email</label>
              <p className="text-gray-900 print:text-black">{student.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 print:text-black">Phone</label>
              <p className="text-gray-900 print:text-black">{student.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 print:text-black">Passport/ID</label>
              <p className="text-gray-900 print:text-black">{student.passport_id || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 print:text-black">Address</label>
              <p className="text-gray-900 print:text-black">{student.address || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 print:text-black">Country</label>
              <p className="text-gray-900 print:text-black">{student.country || 'Not specified'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information Section */}
      <Card className="mb-6 print:border print:border-gray-300 print:shadow-none">
        <CardHeader className="bg-green-50 print:bg-gray-100">
          <CardTitle className="text-lg flex items-center gap-2 text-green-900 print:text-black">
            <BookOpen className="h-5 w-5" />
            Academic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600 print:text-black">Course</label>
              <p className="text-gray-900 print:text-black">{course ? course.title : 'Not assigned'}</p>
              {course && (
                <p className="text-sm text-gray-500 print:text-black">{course.period_months} months duration</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 print:text-black">Course Fee</label>
              <p className="text-gray-900 print:text-black font-semibold">${student.total_course_fee.toFixed(2)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 print:text-black">Join Date</label>
              <p className="text-gray-900 print:text-black">{formatDate(student.join_date)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 print:text-black">Class Start Date</label>
              <p className="text-gray-900 print:text-black">
                {student.class_start_date ? formatDate(student.class_start_date) : 'Not scheduled'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 print:text-black">Status</label>
              <Badge variant="outline" className={`${getStatusBadgeColor(student.status)} print:border-gray-400 print:text-black`}>
                {student.status}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 print:text-black">Installments</label>
              <p className="text-gray-900 print:text-black">{student.installments || 1}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Information Section */}
      <Card className="mb-6 print:border print:border-gray-300 print:shadow-none">
        <CardHeader className="bg-purple-50 print:bg-gray-100">
          <CardTitle className="text-lg flex items-center gap-2 text-purple-900 print:text-black">
            <User className="h-5 w-5" />
            Referral Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {referralPerson ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600 print:text-black">Referred By</label>
                <p className="text-gray-900 print:text-black">{referralPerson.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 print:text-black">Contact Info</label>
                <div className="text-gray-900 print:text-black">
                  <p>{referralPerson.email}</p>
                  <p>{referralPerson.phone}</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-gray-600 print:text-black">Referral Status</label>
              <p className="text-gray-900 print:text-black">Direct (No referral)</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Information Section */}
      <Card className="mb-6 print:border print:border-gray-300 print:shadow-none">
        <CardHeader className="bg-yellow-50 print:bg-gray-100">
          <CardTitle className="text-lg flex items-center gap-2 text-yellow-900 print:text-black">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-6 mb-6">
            <div className="text-center p-4 bg-gray-50 print:bg-gray-100 rounded-lg print:rounded-none">
              <label className="text-sm font-medium text-gray-600 print:text-black">Total Course Fee</label>
              <p className="text-xl font-bold text-gray-900 print:text-black">${student.total_course_fee.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-green-50 print:bg-gray-100 rounded-lg print:rounded-none">
              <label className="text-sm font-medium text-gray-600 print:text-black">Total Paid</label>
              <p className="text-xl font-bold text-green-600 print:text-black">${totalPaid.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-red-50 print:bg-gray-100 rounded-lg print:rounded-none">
              <label className="text-sm font-medium text-gray-600 print:text-black">Remaining Balance</label>
              <p className={`text-xl font-bold ${remainingBalance > 0 ? 'text-red-600' : 'text-green-600'} print:text-black`}>
                ${remainingBalance.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Payment History Table */}
          {student.payments.length > 0 ? (
            <div className="overflow-x-auto print:overflow-visible">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-300 print:border-black">
                    <TableHead className="font-semibold text-gray-700 print:text-black">Date</TableHead>
                    <TableHead className="font-semibold text-gray-700 print:text-black">Stage</TableHead>
                    <TableHead className="font-semibold text-gray-700 print:text-black">Amount</TableHead>
                    <TableHead className="font-semibold text-gray-700 print:text-black">Payment Mode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.payments.map((payment, index) => (
                    <TableRow key={payment.id} className={`border-b border-gray-200 print:border-gray-400 ${index % 2 === 0 ? 'bg-gray-50 print:bg-white' : 'bg-white'}`}>
                      <TableCell className="text-gray-900 print:text-black">{formatDate(payment.payment_date)}</TableCell>
                      <TableCell className="text-gray-900 print:text-black">{payment.stage}</TableCell>
                      <TableCell className="text-gray-900 print:text-black font-medium">${Number(payment.amount).toFixed(2)}</TableCell>
                      <TableCell className="text-gray-900 print:text-black">{payment.payment_mode}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 print:text-black">
              No payments recorded yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-12 print:mt-8 print:fixed print:bottom-0 print:left-0 print:right-0 print:bg-white border-t-2 border-gray-300 print:border-black pt-4 print:pt-2">
        <div className="text-center text-sm text-gray-600 print:text-black print:text-xs">
          <div className="font-bold text-blue-900 print:text-black mb-2">Nurse Assist International (NAI)</div>
          <div className="space-y-1">
            <div>Suite 104, Level 1, 25 Grose Street, Parramatta, 2150, Sydney</div>
            <div>2/2 Sorrel Street, Parramatta, 2150, Sydney</div>
            <div>📞 +61 478 320 397 | ✉️ admin@nurseassistinternational.com</div>
          </div>
        </div>
      </div>
    </div>
  );

  const content = (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-start print:hidden mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">{student.full_name}</h2>
          <p className="text-blue-600">Student ID: {student.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrintAccount} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Account
          </Button>
          <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <PrintableContent />
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white shadow-lg print:hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Student Account</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="p-4">
          {content}
        </div>
      </div>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible">
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-blue-900">Student Account</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};
