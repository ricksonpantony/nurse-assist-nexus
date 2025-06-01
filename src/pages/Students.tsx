
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download } from "lucide-react";
import { StudentsTable } from "@/components/students/StudentsTable";
import { StudentDetailsView } from "@/components/students/StudentDetailsView";
import { PaymentUpdateModal } from "@/components/students/PaymentUpdateModal";
import { ImportStudentsModal } from "@/components/students/ImportStudentsModal";
import { useCourses } from "@/hooks/useCourses";
import { useStudents } from "@/hooks/useStudents";
import { exportStudentsToExcel } from "@/utils/excelUtils";
import { useToast } from "@/hooks/use-toast";

const Students = () => {
  const navigate = useNavigate();
  const { courses } = useCourses();
  const { students, loading, deleteStudent, fetchStudentPayments, refetch } = useStudents();
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentUpdateStudent, setPaymentUpdateStudent] = useState(null);
  const [studentPayments, setStudentPayments] = useState([]);
  const { toast } = useToast();

  const handleAddStudent = () => {
    navigate('/students/manage');
  };

  const handleEditStudent = (student: any) => {
    console.log('Editing student:', student);
    navigate(`/students/manage/${student.id}`);
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await deleteStudent(studentId);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDeleteMultipleStudents = async (studentIds: string[]) => {
    try {
      // Delete students one by one (could be optimized with batch delete)
      for (const studentId of studentIds) {
        await deleteStudent(studentId);
      }
      
      toast({
        title: "Success",
        description: `Successfully deleted ${studentIds.length} student${studentIds.length > 1 ? 's' : ''}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete some students",
        variant: "destructive",
      });
    }
  };

  const handleViewStudent = async (student: any) => {
    setSelectedStudent(student);
    const payments = await fetchStudentPayments(student.id);
    setStudentPayments(payments);
    setShowDetailsView(true);
  };

  const handleUpdatePayment = (student: any) => {
    setPaymentUpdateStudent(student);
    setShowPaymentModal(true);
  };

  const handleRefreshStudentDetails = async () => {
    if (selectedStudent) {
      const payments = await fetchStudentPayments(selectedStudent.id);
      setStudentPayments(payments);
      refetch();
    }
  };

  const handlePaymentAdded = () => {
    refetch();
  };

  const handleExportStudents = () => {
    if (students.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There are no students to export",
        variant: "destructive",
      });
      return;
    }

    exportStudentsToExcel(students, courses);
    toast({
      title: "Export Successful",
      description: "Students data has been exported to Excel",
    });
  };

  const handleImportComplete = () => {
    refetch();
    setShowImportModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-blue-600">Loading students...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="flex flex-col h-full">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-gradient-to-r from-white via-blue-50 to-white px-6 shadow-lg backdrop-blur-sm">
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">Student Management</h1>
            <p className="text-sm text-blue-600">Manage student enrollment and course assignments</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="gap-2"
              onClick={() => setShowImportModal(true)}
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button 
              variant="outline"
              className="gap-2"
              onClick={handleExportStudents}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button 
              onClick={handleAddStudent}
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Add Student
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <StudentsTable
            students={students}
            courses={courses}
            onEdit={handleEditStudent}
            onDelete={handleDeleteStudent}
            onDeleteMultiple={handleDeleteMultipleStudents}
            onView={handleViewStudent}
            onUpdatePayment={handleUpdatePayment}
          />
        </main>
      </div>

      {/* Student Details View Modal */}
      {showDetailsView && selectedStudent && (
        <StudentDetailsView
          student={{ ...selectedStudent, payments: studentPayments }}
          courses={courses}
          onClose={() => {
            setShowDetailsView(false);
            setSelectedStudent(null);
            setStudentPayments([]);
          }}
          onRefresh={handleRefreshStudentDetails}
        />
      )}

      {/* Payment Update Modal */}
      {showPaymentModal && paymentUpdateStudent && (
        <PaymentUpdateModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentUpdateStudent(null);
          }}
          student={paymentUpdateStudent}
          onPaymentAdded={handlePaymentAdded}
        />
      )}

      {/* Import Students Modal */}
      {showImportModal && (
        <ImportStudentsModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          courses={courses}
          onImportComplete={handleImportComplete}
        />
      )}
    </div>
  );
};

export default Students;
