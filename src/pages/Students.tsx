
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download } from "lucide-react";
import { StudentsTable } from "@/components/students/StudentsTable";
import { StudentsFilter } from "@/components/students/StudentsFilter";
import { StudentsPrintView } from "@/components/students/StudentsPrintView";
import { PaymentUpdateModal } from "@/components/students/PaymentUpdateModal";
import { ImportStudentsModal } from "@/components/students/ImportStudentsModal";
import { useCourses } from "@/hooks/useCourses";
import { useStudents } from "@/hooks/useStudents";
import { exportStudentsToExcel } from "@/utils/excelUtils";
import { useToast } from "@/hooks/use-toast";
import type { Student } from "@/hooks/useStudents";

const Students = () => {
  const navigate = useNavigate();
  const { courses } = useCourses();
  const { students, loading, deleteStudent, refetch } = useStudents();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [paymentUpdateStudent, setPaymentUpdateStudent] = useState(null);
  const { toast } = useToast();

  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [sortBy, setSortBy] = useState("join_date");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("desc");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Get unique countries and batches for filters
  const { countries, batches } = useMemo(() => {
    const uniqueCountries = [...new Set(students.filter(s => s.country).map(s => s.country))].sort();
    const uniqueBatches = [...new Set(students.filter(s => s.batch_id).map(s => s.batch_id))].sort();
    return { 
      countries: uniqueCountries as string[], 
      batches: uniqueBatches as string[] 
    };
  }, [students]);

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = [...students];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        student.full_name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.phone.includes(searchTerm) ||
        student.id.toLowerCase().includes(searchLower) ||
        (student.passport_id && student.passport_id.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    // Apply course filter
    if (courseFilter !== "all") {
      filtered = filtered.filter(student => student.course_id === courseFilter);
    }

    // Apply country filter
    if (countryFilter !== "all") {
      filtered = filtered.filter(student => student.country === countryFilter);
    }

    // Apply batch filter
    if (batchFilter !== "all") {
      filtered = filtered.filter(student => student.batch_id === batchFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'full_name':
          aValue = a.full_name.toLowerCase();
          bValue = b.full_name.toLowerCase();
          break;
        case 'join_date':
          aValue = new Date(a.join_date);
          bValue = new Date(b.join_date);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'total_course_fee':
          aValue = a.total_course_fee;
          bValue = b.total_course_fee;
          break;
        case 'country':
          aValue = a.country || '';
          bValue = b.country || '';
          break;
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        default:
          aValue = a[sortBy as keyof Student];
          bValue = b[sortBy as keyof Student];
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [students, searchTerm, statusFilter, courseFilter, countryFilter, batchFilter, sortBy, sortOrder]);

  // Get selected students for printing
  const selectedStudentsForPrint = useMemo(() => {
    return filteredAndSortedStudents.filter(student => selectedStudents.includes(student.id));
  }, [filteredAndSortedStudents, selectedStudents]);

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

  const handleViewStudent = (student: any) => {
    navigate(`/students/preview/${student.id}`);
  };

  const handleUpdatePayment = (student: any) => {
    setPaymentUpdateStudent(student);
    setShowPaymentModal(true);
  };

  const handlePaymentAdded = () => {
    refetch();
  };

  const handleExportStudents = () => {
    const studentsToExport = filteredAndSortedStudents.length > 0 ? filteredAndSortedStudents : students;
    
    if (studentsToExport.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There are no students to export",
        variant: "destructive",
      });
      return;
    }

    exportStudentsToExcel(studentsToExport, courses);
    toast({
      title: "Export Successful",
      description: `${studentsToExport.length} student records exported to Excel`,
    });
  };

  const handleImportComplete = () => {
    refetch();
    setShowImportModal(false);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCourseFilter("all");
    setCountryFilter("all");
    setBatchFilter("all");
    setSortBy("join_date");
    setSortOrder("desc");
    setSelectedStudents([]);
  };

  const handlePrintSelected = () => {
    if (selectedStudents.length === 0) {
      toast({
        title: "No Students Selected",
        description: "Please select students to print",
        variant: "destructive",
      });
      return;
    }
    setShowPrintView(true);
    // Use setTimeout to ensure the component is rendered before printing
    setTimeout(() => {
      window.print();
      setShowPrintView(false);
    }, 100);
  };

  const handleStudentSelection = (studentIds: string[]) => {
    setSelectedStudents(studentIds);
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

  if (showPrintView) {
    return (
      <StudentsPrintView 
        students={selectedStudentsForPrint} 
        courses={courses}
      />
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
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
              Import Template
            </Button>
            <Button 
              variant="outline"
              className="gap-2"
              onClick={handleExportStudents}
            >
              <Download className="h-4 w-4" />
              Export {filteredAndSortedStudents.length !== students.length && `(${filteredAndSortedStudents.length})`}
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
          <StudentsFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            courseFilter={courseFilter}
            onCourseFilterChange={setCourseFilter}
            countryFilter={countryFilter}
            onCountryFilterChange={setCountryFilter}
            batchFilter={batchFilter}
            onBatchFilterChange={setBatchFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            onClearFilters={handleClearFilters}
            onPrintSelected={handlePrintSelected}
            courses={courses}
            countries={countries}
            batches={batches}
            selectedStudentsCount={selectedStudents.length}
          />

          <StudentsTable
            students={filteredAndSortedStudents}
            courses={courses}
            onEdit={handleEditStudent}
            onDelete={handleDeleteStudent}
            onDeleteMultiple={handleDeleteMultipleStudents}
            onView={handleViewStudent}
            onUpdatePayment={handleUpdatePayment}
            onPrintSelected={handlePrintSelected}
            selectedStudents={selectedStudents}
            onStudentSelection={handleStudentSelection}
          />

          {filteredAndSortedStudents.length === 0 && students.length > 0 && (
            <div className="mt-8 text-center text-gray-500">
              <p className="text-lg">No students match your search criteria</p>
              <p className="text-sm">Try adjusting your filters or search terms</p>
            </div>
          )}
        </main>
      </div>

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
