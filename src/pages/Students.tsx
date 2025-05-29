import { useState } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download } from "lucide-react";
import { StudentsTable } from "@/components/students/StudentsTable";
import { AddStudentForm } from "@/components/students/AddStudentForm";
import { StudentDetailsView } from "@/components/students/StudentDetailsView";
import { PaymentUpdateModal } from "@/components/students/PaymentUpdateModal";
import { ImportStudentsModal } from "@/components/students/ImportStudentsModal";
import { useCourses } from "@/hooks/useCourses";
import { useStudents } from "@/hooks/useStudents";
import { exportStudentsToExcel } from "@/utils/excelUtils";
import { useToast } from "@/hooks/use-toast";

const Students = () => {
  const { courses } = useCourses();
  const { students, loading, addStudent, updateStudent, deleteStudent, fetchStudentPayments, refetch } = useStudents();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentUpdateStudent, setPaymentUpdateStudent] = useState(null);
  const [studentPayments, setStudentPayments] = useState([]);
  const { toast } = useToast();

  const handleAddStudent = async (studentData: any) => {
    try {
      await addStudent(studentData);
      setShowAddForm(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleEditStudent = (student: any) => {
    console.log('Editing student:', student);
    setEditingStudent(student);
    setShowAddForm(true);
  };

  const handleUpdateStudent = async (updatedStudent: any) => {
    try {
      console.log('Updating student in page:', updatedStudent);
      // Ensure we have the student ID - use either the provided ID or the editing student's ID
      const studentId = updatedStudent.id || editingStudent?.id;
      
      if (!studentId) {
        console.error('No student ID found for update');
        toast({
          title: "Error",
          description: "Student ID is required for update",
          variant: "destructive",
        });
        return;
      }

      console.log('Final student ID for update:', studentId);
      await updateStudent(studentId, updatedStudent);
      setShowAddForm(false);
      setEditingStudent(null);
    } catch (error) {
      console.error('Error in handleUpdateStudent:', error);
      // Error is handled in the hook
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await deleteStudent(studentId);
    } catch (error) {
      // Error is handled in the hook
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
      // Also refresh the students list to get updated data
      refetch();
    }
  };

  const handlePaymentAdded = () => {
    refetch(); // Refresh the students list after payment is added
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
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex items-center justify-center h-64">
              <div className="text-lg text-blue-600">Loading students...</div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-gradient-to-r from-white via-blue-50 to-white px-6 shadow-lg backdrop-blur-sm">
            <SidebarTrigger className="text-blue-600 hover:bg-blue-100 rounded-lg" />
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
                onClick={() => setShowAddForm(true)}
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
              onView={handleViewStudent}
              onUpdatePayment={handleUpdatePayment}
            />
          </main>
        </SidebarInset>
      </div>

      {/* Add/Edit Student Form Modal */}
      {showAddForm && (
        <AddStudentForm
          student={editingStudent}
          courses={courses}
          onClose={() => {
            setShowAddForm(false);
            setEditingStudent(null);
          }}
          onSave={editingStudent ? handleUpdateStudent : handleAddStudent}
        />
      )}

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
    </SidebarProvider>
  );
};

export default Students;
