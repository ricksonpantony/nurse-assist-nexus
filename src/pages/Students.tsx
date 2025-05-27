
import { useState } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download } from "lucide-react";
import { StudentsTable } from "@/components/students/StudentsTable";
import { AddStudentForm } from "@/components/students/AddStudentForm";
import { StudentDetailsView } from "@/components/students/StudentDetailsView";

// Sample courses data (this should come from the Courses tab)
const sampleCourses = [
  {
    id: "OBA-2024-001",
    title: "Objective Behavioral Assessment (OBA)",
    fee: 1850,
    periodMonths: 6
  },
  {
    id: "OSCE-2024-002", 
    title: "Objective Structured Clinical Examination (OSCE)",
    fee: 2200,
    periodMonths: 8
  },
  {
    id: "NCLEX-2024-003",
    title: "NCLEX-RN Next Generation (NGN)",
    fee: 2750,
    periodMonths: 12
  }
];

// Sample students data
const sampleStudents = [
  {
    id: "ATZ-2025-001",
    fullName: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1-555-0123",
    address: "123 Main St, New York, NY 10001",
    country: "United States",
    passportId: "US123456789",
    courseId: "OBA-2024-001",
    batchId: "BATCH-001",
    joinDate: "2025-01-15",
    classStartDate: "2025-02-01",
    status: "enrolled",
    totalCourseFee: 1850,
    advancePayment: 500,
    installments: 3,
    payments: [
      { date: "2025-01-15", stage: "Advance", amount: 500, mode: "Credit Card" },
      { date: "2025-02-15", stage: "Second", amount: 675, mode: "Bank Transfer" }
    ]
  },
  {
    id: "ATZ-2025-002",
    fullName: "Michael Chen",
    email: "michael.chen@email.com",
    phone: "+1-555-0124",
    address: "456 Oak Ave, Los Angeles, CA 90210",
    country: "United States",
    passportId: "US987654321",
    courseId: "OSCE-2024-002",
    batchId: "BATCH-002",
    joinDate: "2025-01-10",
    classStartDate: "2025-01-25",
    status: "online",
    totalCourseFee: 2200,
    advancePayment: 700,
    installments: 4,
    payments: [
      { date: "2025-01-10", stage: "Advance", amount: 700, mode: "Credit Card" }
    ]
  },
  {
    id: "ATZ-2025-003",
    fullName: "Emily Rodriguez",
    email: "emily.rodriguez@email.com",
    phone: "+1-555-0125",
    address: "789 Pine St, Miami, FL 33101",
    country: "United States",
    passportId: "US456789123",
    courseId: "NCLEX-2024-003",
    batchId: "BATCH-003",
    joinDate: "2025-01-05",
    classStartDate: "2025-02-10",
    status: "face-to-face",
    totalCourseFee: 2750,
    advancePayment: 1000,
    installments: 5,
    payments: [
      { date: "2025-01-05", stage: "Advance", amount: 1000, mode: "Bank Transfer" },
      { date: "2025-02-05", stage: "Second", amount: 550, mode: "Credit Card" }
    ]
  }
];

const Students = () => {
  const [students, setStudents] = useState(sampleStudents);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const generateStudentId = () => {
    const year = new Date().getFullYear();
    const nextNumber = students.length + 1;
    return `ATZ-${year}-${String(nextNumber).padStart(3, '0')}`;
  };

  const handleAddStudent = (studentData: any) => {
    const newStudent = {
      ...studentData,
      id: generateStudentId(),
      payments: studentData.advancePayment > 0 ? [
        { 
          date: new Date().toISOString().split('T')[0], 
          stage: "Advance", 
          amount: studentData.advancePayment, 
          mode: "Credit Card" 
        }
      ] : []
    };
    setStudents([...students, newStudent]);
    setShowAddForm(false);
  };

  const handleEditStudent = (student: any) => {
    setEditingStudent(student);
    setShowAddForm(true);
  };

  const handleUpdateStudent = (updatedStudent: any) => {
    setStudents(students.map(student => 
      student.id === updatedStudent.id ? updatedStudent : student
    ));
    setShowAddForm(false);
    setEditingStudent(null);
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(students.filter(student => student.id !== studentId));
  };

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setShowDetailsView(true);
  };

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
              courses={sampleCourses}
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
          courses={sampleCourses}
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
          student={selectedStudent}
          courses={sampleCourses}
          onClose={() => {
            setShowDetailsView(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </SidebarProvider>
  );
};

export default Students;
