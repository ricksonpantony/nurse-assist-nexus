
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X, FileText, Download, RefreshCw, User, Phone, Mail, MapPin, CreditCard, Calendar, BookOpen } from "lucide-react";
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
  const [showExportOptions, setShowExportOptions] = useState(false);
  
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

  const handlePrint = () => {
    if (referralPerson) {
      setShowExportOptions(true);
    } else {
      window.print();
    }
  };

  const handleExport = () => {
    if (referralPerson) {
      setShowExportOptions(true);
    } else {
      // Handle export without referral details
      console.log('Exporting student data without referral details');
    }
  };

  const handleExportWithReferral = (includeReferral: boolean) => {
    setShowExportOptions(false);
    if (includeReferral) {
      console.log('Exporting with referral details');
    } else {
      console.log('Exporting without referral details');
    }
    // Implement actual export logic here
  };

  const ExportOptionsModal = () => (
    <Dialog open={showExportOptions} onOpenChange={setShowExportOptions}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Options</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Do you want to include referral details in the print/export?</p>
          <div className="flex gap-3">
            <Button 
              onClick={() => handleExportWithReferral(true)}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700"
            >
              ✅ Yes - Include Referral Details
            </Button>
            <Button 
              onClick={() => handleExportWithReferral(false)}
              variant="outline"
              className="flex-1"
            >
              ❌ No - Student Details Only
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const content = (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">{student.full_name}</h2>
          <p className="text-blue-600">Student ID: {student.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <FileText className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Student Information Grid */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{student.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{student.phone}</span>
            </div>
            {student.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{student.address}</span>
              </div>
            )}
            {student.country && (
              <div>
                <span className="text-sm text-gray-500">Country: </span>
                <span>{student.country}</span>
              </div>
            )}
            {student.passport_id && (
              <div>
                <span className="text-sm text-gray-500">Passport ID: </span>
                <span>{student.passport_id}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <BookOpen className="h-5 w-5" />
              Course Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Course: </span>
              <span className="font-medium">{course ? course.title : 'Not assigned'}</span>
            </div>
            {student.batch_id && (
              <div>
                <span className="text-sm text-gray-500">Batch ID: </span>
                <span>{student.batch_id}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Joined: {formatDate(student.join_date)}</span>
            </div>
            {student.class_start_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Classes started: {formatDate(student.class_start_date)}</span>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-500">Status: </span>
              <Badge variant="secondary">{student.status}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Referral Information - Only show if student has a referral */}
        {referralPerson && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <User className="h-5 w-5" />
                Referral Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Referred by: </span>
                <span className="font-medium">{referralPerson.full_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{referralPerson.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{referralPerson.phone}</span>
              </div>
              {referralPerson.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{referralPerson.address}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <CreditCard className="h-5 w-5" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Total Course Fee:</span>
              <span className="font-medium">${student.total_course_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Paid:</span>
              <span className="font-medium text-green-600">${totalPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Remaining Balance:</span>
              <span className={`font-bold ${remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${remainingBalance.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Installments: </span>
              <span>{student.installments}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-900">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {student.payments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Mode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.payment_date)}</TableCell>
                      <TableCell>{payment.stage}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        ${Number(payment.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>{payment.payment_mode}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No payments recorded yet.
            </div>
          )}
        </CardContent>
      </Card>

      <ExportOptionsModal />
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Student Details</h2>
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-blue-900">Student Details</DialogTitle>
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
