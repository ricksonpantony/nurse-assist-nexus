import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Edit, Trash2, Printer } from "lucide-react";
import { Student } from "@/hooks/useStudents";
import { useStudentPaymentDetails } from "@/hooks/useStudentPaymentDetails";
import { PaymentUpdateModal } from "@/components/students/PaymentUpdateModal";
import { DeleteConfirmationModal } from "@/components/students/DeleteConfirmationModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useReferrals } from "@/hooks/useReferrals";
import { useIsMobile } from "@/hooks/use-mobile";
import { Course } from "@/hooks/useCourses";

interface StudentDetailsViewProps {
  student: Student;
  courses: Course[];
  onClose: () => void;
  onEdit: (student: Student) => void;
  onDelete: (studentId: string) => void;
}

// Add a new component for the print modal
const PrintOptionsModal = ({ isOpen, onClose, onConfirm }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (includeReferral: boolean) => void;
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Print/Export Options</h3>
        <p className="mb-4">Do you want to include referral details in the print/export?</p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => onConfirm(false)}>
            No
          </Button>
          <Button onClick={() => onConfirm(true)}>
            Yes
          </Button>
        </div>
      </div>
    </div>
  );
};

export const StudentDetailsView = ({ student, courses, onClose, onEdit, onDelete }: StudentDetailsViewProps) => {
  const { totalPaid, remainingAmount, paymentData, isLoading, fetchPayments } = useStudentPaymentDetails(student?.id);
  const [activeTab, setActiveTab] = useState<'overview' | 'payments'>('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { referrals } = useReferrals();
  const isMobile = useIsMobile();
  const [showPrintModal, setShowPrintModal] = useState(false);
  
  // Calculate actual remaining amount using student's total course fee
  const actualRemainingAmount = student.total_course_fee - totalPaid;
  
  useEffect(() => {
    if (student?.id) {
      fetchPayments();
    }
  }, [student?.id, fetchPayments]);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid Date';
    }
  };

  const renderStudentInfo = () => (
    <div className="border rounded-md p-4 bg-blue-50 print:break-inside-avoid">
      <h3 className="font-semibold text-lg mb-2 text-blue-700">Student Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Full Name</p>
          <p>{student.full_name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p>{student.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Phone</p>
          <p>{student.phone}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Address</p>
          <p>{student.address || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Country</p>
          <p>{student.country || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Passport ID</p>
          <p>{student.passport_id || 'N/A'}</p>
        </div>
      </div>
    </div>
  );

  const renderCourseInfo = () => (
    <div className="border rounded-md p-4 bg-green-50 print:break-inside-avoid">
      <h3 className="font-semibold text-lg mb-2 text-green-700">Course Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Course ID</p>
          <p>{student.course_id || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Batch ID</p>
          <p>{student.batch_id || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Join Date</p>
          <p>{formatDate(student.join_date)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Class Start Date</p>
          <p>{formatDate(student.class_start_date)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <Badge variant="outline">{student.status}</Badge>
        </div>
      </div>
    </div>
  );

  const renderFinancialInfo = () => (
    <div className="border rounded-md p-4 bg-yellow-50 print:break-inside-avoid">
      <h3 className="font-semibold text-lg mb-2 text-yellow-700">Financial Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Total Course Fee</p>
          <p>${student.total_course_fee.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Advance Payment</p>
          <p>${student.advance_payment.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Installments</p>
          <p>{student.installments}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Paid</p>
          <p>${totalPaid.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Remaining Amount</p>
          <p>${actualRemainingAmount.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );

  const renderStudentOverview = () => (
    <div className="print:break-inside-avoid">
      <h3 className="font-semibold text-lg mb-4">Student Overview</h3>
      <div className="space-y-2">
        <p>
          <span className="font-semibold">Name:</span> {student.full_name}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {student.email}
        </p>
        {/* Add other relevant student details here */}
      </div>
    </div>
  );

  const renderPaymentHistory = () => (
    <div className="print:break-inside-avoid">
      <h3 className="font-semibold text-lg mb-4">Payment History</h3>
      {isLoading ? (
        <p>Loading payment history...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Mode</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentData.map(payment => (
              <TableRow key={payment.id}>
                <TableCell>{formatDate(payment.payment_date)}</TableCell>
                <TableCell>{payment.stage}</TableCell>
                <TableCell>${payment.amount.toFixed(2)}</TableCell>
                <TableCell>{payment.payment_mode}</TableCell>
              </TableRow>
            ))}
            {paymentData.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">No payments found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
      <Button size="sm" className="mt-4" onClick={() => setShowPaymentModal(true)}>
        Add Payment
      </Button>
    </div>
  );

  const handlePrintRequest = () => {
    setShowPrintModal(true);
  };

  const handlePrintConfirmed = (includeReferral: boolean) => {
    setShowPrintModal(false);
    // Here you would implement the actual printing/exporting logic
    console.log("Printing with referral details:", includeReferral);
    window.print();
  };

  const referral = student?.referral_id ? referrals.find(r => r.id === student.referral_id) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm print:bg-white print:backdrop-blur-none">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden print:shadow-none print:max-w-full print:max-h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white flex justify-between items-center print:hidden">
          <h2 className="text-xl font-bold">Student Details</h2>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handlePrintRequest}
              className="text-white hover:bg-white/20"
            >
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-60px)] print:max-h-full">
          <div className="space-y-6">
            {/* Student Information */}
            {renderStudentInfo()}

            {/* Referral Information */}
            {referral && (
              <div className="border rounded-md p-4 bg-blue-50 print:break-inside-avoid">
                <h3 className="font-semibold text-lg mb-2 text-blue-700">Referral Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Referred By</p>
                    <p>{referral.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p>{referral.email} | {referral.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Course & Financial Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderCourseInfo()}
              {renderFinancialInfo()}
            </div>

            {/* Tabs Navigation */}
            <div className="border-b print:hidden">
              <nav className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-1 -mb-px ${
                    activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`py-2 px-1 -mb-px ${
                    activeTab === 'payments' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
                  }`}
                >
                  Payment History
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && renderStudentOverview()}
            {activeTab === 'payments' && renderPaymentHistory()}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 p-4 flex justify-between print:hidden">
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete Student
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button size="sm" onClick={() => onEdit(student)}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentUpdateModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          student={student}
          onPaymentAdded={() => {
            setShowPaymentModal(false);
            fetchPayments();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            onDelete(student.id);
            setShowDeleteModal(false);
            onClose();
          }}
          count={1}
          studentNames={[student.full_name]}
        />
      )}

      {/* Print Options Modal */}
      {showPrintModal && (
        <PrintOptionsModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          onConfirm={handlePrintConfirmed}
        />
      )}
    </div>
  );
};
