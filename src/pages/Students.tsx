
import { useState } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download } from "lucide-react";
import { StudentsTable } from "@/components/students/StudentsTable";
import { AddStudentForm } from "@/components/students/AddStudentForm";
import { StudentDetailsView } from "@/components/students/StudentDetailsView";
import { useCourses } from "@/hooks/useCourses";
import { useStudents } from "@/hooks/useStudents";

const Students = () => {
  const { courses } = useCourses();
  const { students, loading, addStudent, updateStudent, deleteStudent, fetchStudentPayments } = useStudents();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentPayments, setStudentPayments] = useState([]);

  const handleAddStudent = async (studentData: any) => {
    try {
      await addStudent(studentData);
      setShowAddForm(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleEditStudent = (student: any) => {
    setEditingStudent(student);
    setShowAddForm(true);
  };

  const handleUpdateStudent = async (updatedStudent: any) => {
    try {
      await updateStudent(updatedStudent.id, updatedStudent);
      setShowAddForm(false);
      setEditingStudent(null);
    } catch (error) {
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
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button 
                variant="outline"
                className="gap-2"
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
        />
      )}
    </SidebarProvider>
  );
};

export default Students;
