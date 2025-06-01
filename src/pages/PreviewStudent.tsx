
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { StudentDetailsView } from "@/components/students/StudentDetailsView";
import { useCourses } from "@/hooks/useCourses";
import { useStudents } from "@/hooks/useStudents";
import { useReferrals } from "@/hooks/useReferrals";
import { useToast } from "@/hooks/use-toast";

const PreviewStudent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { courses } = useCourses();
  const { students, fetchStudentPayments, refetch } = useStudents();
  const { referrals } = useReferrals();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentPayments, setStudentPayments] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    if (id && students.length > 0) {
      const student = students.find(s => s.id === id);
      if (student) {
        setSelectedStudent(student);
        loadStudentPayments(student.id);
      } else {
        toast({
          title: "Student Not Found",
          description: "The requested student could not be found.",
          variant: "destructive",
        });
        navigate('/students');
      }
    }
  }, [id, students, navigate, toast]);

  const loadStudentPayments = async (studentId: string) => {
    try {
      const payments = await fetchStudentPayments(studentId);
      setStudentPayments(payments);
    } catch (error) {
      console.error('Error loading student payments:', error);
    }
  };

  const handleRefreshStudentDetails = async () => {
    if (selectedStudent) {
      await loadStudentPayments(selectedStudent.id);
      refetch();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!selectedStudent) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-blue-600">Loading student details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="flex flex-col h-full">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-gradient-to-r from-white via-blue-50 to-white px-6 shadow-lg backdrop-blur-sm print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/students')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              Student Preview
            </h1>
            <p className="text-sm text-blue-600">
              Viewing details for {selectedStudent.full_name}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <StudentDetailsView
              student={{ ...selectedStudent, payments: studentPayments }}
              courses={courses}
              onClose={() => navigate('/students')}
              onRefresh={handleRefreshStudentDetails}
              isPageView={true}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PreviewStudent;
