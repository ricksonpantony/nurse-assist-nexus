import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Download } from "lucide-react";
import { StudentsTable } from "@/components/students/StudentsTable";
import { StudentsPrintView } from "@/components/students/StudentsPrintView";
import { useStudents, Student } from "@/hooks/useStudents";
import { useCourses } from "@/hooks/useCourses";
import { useReferrals } from "@/hooks/useReferrals";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const Students = () => {
  const { students, loading, updateStudent, deleteStudent } = useStudents();
  const { courses } = useCourses();
  const { referrals } = useReferrals();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudentsForPrint, setSelectedStudentsForPrint] = useState<Student[]>([]);

  const handleEditStudent = (student: Student) => {
    navigate(`/students/manage/${student.id}`);
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudent(studentId);
      } catch (error) {
        console.error('Students page: Error deleting student:', error);
      }
    }
  };

  const handleViewStudent = (student: Student) => {
    navigate(`/students/preview/${student.id}`);
  };

  const handlePrintSelectedStudents = (selectedStudents: Student[]) => {
    setSelectedStudentsForPrint(selectedStudents);
    // Small delay to ensure the print view is rendered
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleExport = () => {
    toast({
      title: "Export",
      description: "Export functionality will be implemented soon",
    });
  };

  const handlePrint = () => {
    window.print();
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

  // Calculate stats
  const totalStudents = students.length;
  const activeStudents = students.filter(student => student.status === 'active').length;
  const completedStudents = students.filter(student => student.status === 'completed').length;
  const pendingStudents = students.filter(student => student.status === 'pending').length;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Print Content for Selected Students */}
      {selectedStudentsForPrint.length > 0 && (
        <StudentsPrintView 
          students={selectedStudentsForPrint} 
          courses={courses} 
          referrals={referrals} 
        />
      )}

      {/* Print Content - Hidden on screen, visible when printing */}
      <div className="print-content hidden print:block">
        {/* Print Header */}
        <div className="print-header">
          <div className="print-title">Nurse Assist International (NAI)</div>
          <div className="print-subtitle">Student Management Report</div>
        </div>

        {/* Print Statistics Summary */}
        <div className="print-section print-major-section">
          <div className="print-section-title">Student Statistics Summary</div>
          <div className="print-grid-4">
            <div className="print-payment-box">
              <div className="print-payment-label">Total Students</div>
              <div className="print-payment-amount">{totalStudents}</div>
            </div>
            <div className="print-payment-box">
              <div className="print-payment-label">Active Students</div>
              <div className="print-payment-amount">{activeStudents}</div>
            </div>
            <div className="print-payment-box">
              <div className="print-payment-label">Completed</div>
              <div className="print-payment-amount">{completedStudents}</div>
            </div>
            <div className="print-payment-box">
              <div className="print-payment-label">Pending</div>
              <div className="print-payment-amount">{pendingStudents}</div>
            </div>
          </div>
        </div>

        {/* Print Students Table */}
        <div className="print-section">
          <div className="print-section-title">Student Details</div>
          <table className="print-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Course</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const course = courses.find(c => c.id === student.interested_course_id);
                return (
                  <tr key={student.id}>
                    <td>{student.student_id || student.id}</td>
                    <td>{student.full_name}</td>
                    <td>{student.email}</td>
                    <td>{student.phone}</td>
                    <td>{course ? course.title : 'Not specified'}</td>
                    <td>
                      <span className="print-badge">{student.status}</span>
                    </td>
                    <td>{format(new Date(student.created_at), 'dd/MM/yyyy')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Print Student Status Distribution */}
        <div className="print-section">
          <div className="print-section-title">Student Status Distribution</div>
          <div className="print-grid-3">
            <div className="print-field">
              <div className="print-field-label">Active Students</div>
              <div className="print-field-value">{students.filter(s => s.status === 'active').length}</div>
            </div>
            <div className="print-field">
              <div className="print-field-label">Completed Students</div>
              <div className="print-field-value">{students.filter(s => s.status === 'completed').length}</div>
            </div>
            <div className="print-field">
              <div className="print-field-label">Pending Students</div>
              <div className="print-field-value">{students.filter(s => s.status === 'pending').length}</div>
            </div>
          </div>
        </div>

        {/* Print Course Interest Analysis */}
        <div className="print-section">
          <div className="print-section-title">Course Interest Analysis</div>
          <table className="print-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Interested Students</th>
                <th>Fee</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => {
                const interestedCount = students.filter(s => s.interested_course_id === course.id).length;
                return (
                  <tr key={course.id}>
                    <td>{course.title}</td>
                    <td>{interestedCount}</td>
                    <td>${course.fee}</td>
                    <td>{course.period_months} months</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Print Report Generated Info */}
        <div className="print-section">
          <div className="print-field">
            <div className="print-field-label">Report Generated</div>
            <div className="print-field-value">{format(new Date(), 'dd/MM/yyyy HH:mm')}</div>
          </div>
        </div>
      </div>

      {/* Regular Screen Content - Hidden when printing */}
      <div className="flex flex-col h-full print:hidden">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-gradient-to-r from-white via-blue-50 to-white px-6 shadow-lg backdrop-blur-sm">
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              Student Management
            </h1>
            <p className="text-sm text-blue-600">Manage student records and track enrollment</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="gap-2 hover:bg-blue-50 border-blue-200"
              onClick={handlePrint}
            >
              <FileText className="h-4 w-4" />
              Print
            </Button>
            <Button 
              variant="outline"
              className="gap-2 hover:bg-green-50 border-green-200"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button 
              onClick={() => navigate('/students/manage')}
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              Add Student
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Total Students</h3>
                    <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
                  </div>
                  <div className="w-4 h-16 bg-gradient-to-t from-blue-500 to-blue-300 rounded-full"></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Active Students</h3>
                    <p className="text-3xl font-bold text-green-600">{activeStudents}</p>
                  </div>
                  <div className="w-4 h-16 bg-gradient-to-t from-green-500 to-green-300 rounded-full"></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
                    <p className="text-3xl font-bold text-purple-600">{completedStudents}</p>
                  </div>
                  <div className="w-4 h-16 bg-gradient-to-t from-purple-500 to-purple-300 rounded-full"></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-white to-orange-50 p-6 rounded-xl shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
                    <p className="text-3xl font-bold text-orange-600">{pendingStudents}</p>
                  </div>
                  <div className="w-4 h-16 bg-gradient-to-t from-orange-500 to-orange-300 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <StudentsTable
            students={students}
            courses={courses}
            referrals={referrals}
            onEdit={handleEditStudent}
            onDelete={handleDeleteStudent}
            onView={handleViewStudent}
            onPrint={handlePrintSelectedStudents}
          />
        </main>
      </div>

      {/* Edit Student Modal */}
      {showEditModal && selectedStudent && (
        <div>Edit Student Modal Content Here</div>
      )}

      {/* Delete Student Modal */}
      {showDeleteModal && selectedStudent && (
        <div>Delete Student Modal Content Here</div>
      )}
    </div>
  );
};

export default Students;
