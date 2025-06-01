
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
      // Hide all non-printable elements before printing
      document.body.classList.add('printing-mode');
      window.print();
      // Restore normal view after printing
      setTimeout(() => {
        document.body.classList.remove('printing-mode');
      }, 1000);
    }
  };

  const handleExport = () => {
    if (referralPerson) {
      setShowExportOptions(true);
    } else {
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
    document.body.classList.add('printing-mode');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-mode');
    }, 1000);
  };

  const ExportOptionsModal = () => (
    <Dialog open={showExportOptions} onOpenChange={setShowExportOptions}>
      <DialogContent className="sm:max-w-md print:hidden">
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

  const PrintableContent = () => (
    <div className="student-printable-content">
      {/* Header */}
      <div className="text-center mb-8 print:mb-6">
        <h1 className="text-3xl font-bold text-blue-900 print:text-black mb-2">
          Nurse Assist International (NAI)
        </h1>
        <h2 className="text-xl text-blue-700 print:text-gray-700 font-semibold">
          Student Account Overview
        </h2>
      </div>

      {/* Section 1: Personal Information */}
      <div className="mb-8 print:mb-6">
        <div className="bg-blue-50 print:bg-gray-100 p-4 rounded-lg print:rounded-none border-l-4 border-blue-500 print:border-gray-400">
          <h3 className="text-lg font-bold text-blue-900 print:text-black mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            📋 Section 1: Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-6">
            <div>
              <span className="font-semibold text-gray-700 print:text-black">Full Name:</span>
              <div className="text-gray-900 print:text-black">{student.full_name}</div>
            </div>
            <div>
              <span className="font-semibold text-gray-700 print:text-black">Email:</span>
              <div className="text-gray-900 print:text-black">{student.email}</div>
            </div>
            <div>
              <span className="font-semibold text-gray-700 print:text-black">Phone Number:</span>
              <div className="text-gray-900 print:text-black">{student.phone}</div>
            </div>
            <div>
              <span className="font-semibold text-gray-700 print:text-black">Passport/ID:</span>
              <div className="text-gray-900 print:text-black">{student.passport_id || 'Not provided'}</div>
            </div>
            <div>
              <span className="font-semibold text-gray-700 print:text-black">Address:</span>
              <div className="text-gray-900 print:text-black">{student.address || 'Not provided'}</div>
            </div>
            <div>
              <span className="font-semibold text-gray-700 print:text-black">Country:</span>
              <div className="text-gray-900 print:text-black">{student.country || 'Not specified'}</div>
            </div>
            <div>
              <span className="font-semibold text-gray-700 print:text-black">Student Unique ID:</span>
              <div className="text-gray-900 print:text-black font-mono">{student.id}</div>
            </div>
            <div>
              <span className="font-semibold text-gray-700 print:text-black">Date Added:</span>
              <div className="text-gray-900 print:text-black">{formatDate(student.join_date)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Course Details */}
      <div className="mb-8 print:mb-6">
        <div className="bg-green-50 print:bg-gray-50 p-4 rounded-lg print:rounded-none border-l-4 border-green-500 print:border-gray-400">
          <h3 className="text-lg font-bold text-green-900 print:text-black mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            📘 Section 2: Course Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-6">
            <div>
              <span className="font-semibold text-gray-700 print:text-black">Selected Course:</span>
              <div className="text-gray-900 print:text-black">{course ? course.title : 'Not assigned'}</div>
            </div>
            <div>
              <span className="font-semibold text-gray-700 print:text-black">Course Fee:</span>
              <div className="text-gray-900 print:text-black">${student.total_course_fee.toFixed(2)}</div>
            </div>
            <div>
              <span className="font-semibold text-gray-700 print:text-black">Course Start Date:</span>
              <div className="text-gray-900 print:text-black">
                {student.class_start_date ? formatDate(student.class_start_date) : 'Not scheduled'}
              </div>
            </div>
            <div>
              <span className="font-semibold text-gray-700 print:text-black">Status:</span>
              <div className="text-gray-900 print:text-black">{student.status}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Referral Information */}
      <div className="mb-8 print:mb-6">
        <div className="bg-purple-50 print:bg-gray-50 p-4 rounded-lg print:rounded-none border-l-4 border-purple-500 print:border-gray-400">
          <h3 className="text-lg font-bold text-purple-900 print:text-black mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            🔗 Section 3: Referral Information
          </h3>
          {referralPerson ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-6">
              <div>
                <span className="font-semibold text-gray-700 print:text-black">Referred By:</span>
                <div className="text-gray-900 print:text-black">{referralPerson.full_name}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700 print:text-black">Contact Info:</span>
                <div className="text-gray-900 print:text-black">
                  <div>{referralPerson.email}</div>
                  <div>{referralPerson.phone}</div>
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-700 print:text-black">Referral Payment:</span>
                <div className="text-gray-900 print:text-black">To be processed</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700 print:text-black">Referral Status:</span>
                <div className="text-gray-900 print:text-black">Referred</div>
              </div>
            </div>
          ) : (
            <div>
              <span className="font-semibold text-gray-700 print:text-black">Referral Status:</span>
              <div className="text-gray-900 print:text-black">Direct (No referral)</div>
            </div>
          )}
        </div>
      </div>

      {/* Section 4: Payment History */}
      <div className="mb-8 print:mb-6">
        <div className="bg-yellow-50 print:bg-gray-50 p-4 rounded-lg print:rounded-none border-l-4 border-yellow-500 print:border-gray-400">
          <h3 className="text-lg font-bold text-yellow-900 print:text-black mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            💳 Section 4: Payment History
          </h3>
          
          {/* Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-6 mb-6">
            <div>
              <span className="font-semibold text-gray-700 print:text-black">Total Course Fee:</span>
              <div className="text-gray-900 print:text-black font-bold">${student.total_course_fee.toFixed(2)}</div>
            </div>
            <div>
              <span className="font-semibold text-gray-700 print:text-black">Total Paid:</span>
              <div className="text-green-600 print:text-black font-bold">${totalPaid.toFixed(2)}</div>
            </div>
            <div>
              <span className="font-semibold text-gray-700 print:text-black">Remaining Balance:</span>
              <div className={`font-bold ${remainingBalance > 0 ? 'text-red-600 print:text-black' : 'text-green-600 print:text-black'}`}>
                ${remainingBalance.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Payment Records Table */}
          <div className="print:break-inside-avoid">
            <h4 className="font-semibold text-gray-700 print:text-black mb-3">Payment Records:</h4>
            {student.payments.length > 0 ? (
              <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full border-collapse print:text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-300 print:border-black">
                      <th className="text-left p-3 print:p-2 font-semibold text-gray-700 print:text-black">Date</th>
                      <th className="text-left p-3 print:p-2 font-semibold text-gray-700 print:text-black">Stage</th>
                      <th className="text-left p-3 print:p-2 font-semibold text-gray-700 print:text-black">Amount</th>
                      <th className="text-left p-3 print:p-2 font-semibold text-gray-700 print:text-black">Payment Mode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.payments.map((payment, index) => (
                      <tr key={payment.id} className={`border-b border-gray-200 print:border-gray-400 ${index % 2 === 0 ? 'bg-gray-50 print:bg-white' : 'bg-white'}`}>
                        <td className="p-3 print:p-2 text-gray-900 print:text-black">{formatDate(payment.payment_date)}</td>
                        <td className="p-3 print:p-2 text-gray-900 print:text-black">{payment.stage}</td>
                        <td className="p-3 print:p-2 text-gray-900 print:text-black font-medium">${Number(payment.amount).toFixed(2)}</td>
                        <td className="p-3 print:p-2 text-gray-900 print:text-black">{payment.payment_mode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 print:text-black">
                No payments recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

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
      {/* Header with Actions - Only show in screen view */}
      <div className="flex justify-between items-start print:hidden">
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
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </div>

      <PrintableContent />
      <ExportOptionsModal />
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto print:relative print:inset-auto print:z-auto">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white shadow-lg print:hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Student Details</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="p-4 print:p-0">
          {content}
        </div>
      </div>
    );
  }
  else{

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible print:shadow-none print:border-none">
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-blue-900">Student Details</DialogTitle>
            {/* Remove the close button from here since it's now in the content header */}
          </div>
        </DialogHeader>
        <div className="print:p-0">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
  }
};
