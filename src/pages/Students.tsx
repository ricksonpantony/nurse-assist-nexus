import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Upload, Users, BookOpen, TrendingUp, GraduationCap } from "lucide-react";
import { StudentsTable } from "@/components/students/StudentsTable";
import { StudentsFilter } from "@/components/students/StudentsFilter";
import { ImportStudentsModal } from "@/components/students/ImportStudentsModal";
import { AddStudentForm } from "@/components/students/AddStudentForm";
import { DeleteConfirmationModal } from "@/components/students/DeleteConfirmationModal";
import { useStudents } from "@/hooks/useStudents";
import { useCourses } from "@/hooks/useCourses";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Students = () => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { students, loading, addStudent, updateStudent, deleteStudent } = useStudents();
  const { courses, loading: coursesLoading } = useCourses();
  const { toast } = useToast();

  const filteredStudents = useMemo(() => {
    let filtered = [...students];

    if (selectedStatus) {
      filtered = filtered.filter(student => student.status === selectedStatus);
    }

    if (selectedCourse) {
      filtered = filtered.filter(student => student.course_id === selectedCourse);
    }

    if (searchQuery) {
      const lowerSearchQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(student =>
        student.first_name.toLowerCase().includes(lowerSearchQuery) ||
        student.last_name.toLowerCase().includes(lowerSearchQuery) ||
        student.email.toLowerCase().includes(lowerSearchQuery)
      );
    }

    return filtered;
  }, [students, selectedStatus, selectedCourse, searchQuery]);

  const handleAddStudent = async (studentData: any) => {
    try {
      await addStudent(studentData);
      setShowAddForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStudent = async (studentId: string, updatedStudentData: any) => {
    try {
      await updateStudent(studentId, updatedStudentData);
      toast({
        title: "Success",
        description: "Student updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = async () => {
    if (studentToDelete) {
      try {
        await deleteStudent(studentToDelete);
        setShowDeleteConfirmation(false);
        setStudentToDelete(null);
        toast({
          title: "Success",
          description: "Student deleted successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete student. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleOpenDeleteConfirmation = (studentId: string) => {
    setStudentToDelete(studentId);
    setShowDeleteConfirmation(true);
  };

  const handleCloseDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
    setStudentToDelete(null);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
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

    // Implementation for CSV export would go here
    toast({
      title: "Export Successful",
      description: "Students data has been exported",
    });
  };

  if (loading || coursesLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <div className="text-lg text-blue-600 font-medium">Loading students...</div>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-white/80 backdrop-blur-lg px-6 shadow-sm">
              <div className="flex-1">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
                  Student Management
                </h1>
                <p className="text-sm text-blue-600/80">Manage student records and track enrollments</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  onClick={handleExportStudents}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button 
                  variant="outline"
                  className="gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                  onClick={() => setShowImportModal(true)}
                >
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Add Student
                </Button>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white/70 backdrop-blur-sm border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-800">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {students.length}
                    </div>
                    <p className="text-xs text-blue-600/70 mt-1">Registered students</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">Active Enrollments</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {students.filter(s => s.status === 'Pass').length}
                    </div>
                    <p className="text-xs text-green-600/70 mt-1">Currently enrolled</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-800">Graduated</CardTitle>
                    <GraduationCap className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {students.filter(s => s.status === 'Pass').length}
                    </div>
                    <p className="text-xs text-purple-600/70 mt-1">Successfully completed</p>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <StudentsFilter
                courses={courses}
                onStatusChange={handleStatusChange}
                onCourseChange={handleCourseChange}
                onSearchChange={handleSearchChange}
              />

              {/* Students Table */}
              <StudentsTable
                students={filteredStudents}
                onEdit={(studentId: string, updatedStudentData: any) => {
                  // Find the student by ID
                  const studentToUpdate = students.find(student => student.id === studentId);
                  if (studentToUpdate) {
                    // Update the student
                    handleUpdateStudent(studentId, updatedStudentData);
                  } else {
                    toast({
                      title: "Error",
                      description: "Student not found.",
                      variant: "destructive",
                    });
                  }
                }}
                onDelete={handleOpenDeleteConfirmation}
              />
            </main>

            {/* Import Students Modal */}
            <ImportStudentsModal
              open={showImportModal}
              onClose={() => setShowImportModal(false)}
            />

            {/* Add Student Form Modal */}
            <AddStudentForm
              open={showAddForm}
              onClose={() => setShowAddForm(false)}
              onSubmit={handleAddStudent}
              courses={courses}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
              open={showDeleteConfirmation}
              onClose={handleCloseDeleteConfirmation}
              onConfirm={handleDeleteStudent}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Students;
