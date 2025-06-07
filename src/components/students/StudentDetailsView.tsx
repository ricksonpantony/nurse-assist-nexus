
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, CreditCard, FileText, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { Student, Payment } from "@/hooks/useStudents";
import { Course } from "@/hooks/useCourses";
import { PaymentUpdateModal } from "./PaymentUpdateModal";
import { SingleDeleteConfirmationModal } from "@/components/ui/single-delete-confirmation-modal";

interface StudentDetailsViewProps {
  student: Student & { payments?: Payment[] };
  courses: Course[];
  onClose: () => void;
  onRefresh: () => void;
  isPageView?: boolean;
  onEdit?: (student: Student) => void;
  onDelete?: (studentId: string) => void;
}

export const StudentDetailsView = ({
  student,
  courses,
  onClose,
  onRefresh,
  isPageView = false,
  onEdit,
  onDelete,
}: StudentDetailsViewProps) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const course = courses.find(c => c.id === student.course_id);

  const getStatusBadge = (status: string) => {
    const colors = {
      'Attended Online': 'bg-blue-100 text-blue-800',
      'Attend sessions': 'bg-green-100 text-green-800',
      'Attended F2F': 'bg-purple-100 text-purple-800',
      'Exam cycle': 'bg-yellow-100 text-yellow-800',
      'Awaiting results': 'bg-orange-100 text-orange-800',
      'Pass': 'bg-emerald-100 text-emerald-800',
      'Fail': 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handlePaymentAdded = () => {
    onRefresh();
    setShowPaymentModal(false);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(student.id);
      onClose();
    }
  };

  const calculateTotalPaid = () => {
    if (!student.payments) return student.advance_payment || 0;
    return student.payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const totalPaid = calculateTotalPaid();
  const remainingBalance = student.total_course_fee - totalPaid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{student.full_name}</h2>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 font-mono">
            {student.id}
          </Badge>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button
              onClick={() => onEdit(student)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Student
            </Button>
          )}
          <Button
            onClick={() => setShowPaymentModal(true)}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <CreditCard className="h-4 w-4" />
            Add Payment
          </Button>
          {onDelete && (
            <Button
              onClick={() => setShowDeleteModal(true)}
              variant="destructive"
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Student
            </Button>
          )}
          {!isPageView && (
            <Button
              variant="outline"
              onClick={onClose}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Student Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{student.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-gray-900">{student.phone}</p>
            </div>
            {student.passport_id && (
              <div>
                <label className="text-sm font-medium text-gray-500">Passport ID</label>
                <p className="text-gray-900">{student.passport_id}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">Country</label>
              <p className="text-gray-900">{student.country || "Not specified"}</p>
            </div>
            {student.address && (
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-gray-900">{student.address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Course</label>
              <p className="text-gray-900">
                {course ? course.title : "No Course Assigned"}
              </p>
            </div>
            {student.batch_id && (
              <div>
                <label className="text-sm font-medium text-gray-500">Batch ID</label>
                <p className="text-gray-900">{student.batch_id}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">Join Date</label>
              <p className="text-gray-900">
                {format(new Date(student.join_date), 'dd/MM/yyyy')}
              </p>
            </div>
            {student.class_start_date && (
              <div>
                <label className="text-sm font-medium text-gray-500">Class Start Date</label>
                <p className="text-gray-900">
                  {format(new Date(student.class_start_date), 'dd/MM/yyyy')}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <Badge className={getStatusBadge(student.status)}>
                {student.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Total Course Fee</label>
              <p className="text-xl font-bold text-gray-900">
                ${student.total_course_fee.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Total Paid</label>
              <p className="text-xl font-bold text-green-600">
                ${totalPaid.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Remaining Balance</label>
              <p className={`text-xl font-bold ${remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${remainingBalance.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Payment Progress</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((totalPaid / student.total_course_fee) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {Math.round((totalPaid / student.total_course_fee) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      {student.payments && student.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {student.payments
                .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                .map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{payment.stage}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(payment.payment_date), 'dd/MM/yyyy')} • {payment.payment_mode}
                      </p>
                    </div>
                    <p className="font-bold text-green-600">
                      ${payment.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {student.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{student.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Payment Update Modal */}
      {showPaymentModal && (
        <PaymentUpdateModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          student={student}
          onPaymentAdded={handlePaymentAdded}
        />
      )}

      {/* Delete Confirmation Modal */}
      <SingleDeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Student"
        description="Are you sure you want to delete this student account? This action cannot be undone and will remove all associated data including payment history."
        itemName={student.full_name}
      />
    </div>
  );
};
