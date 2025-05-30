
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, CreditCard, Search, User, Download } from "lucide-react";
import { Course } from "@/hooks/useCourses";
import { Student } from "@/hooks/useStudents";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

interface StudentsTableProps {
  students: Student[];
  courses: Course[];
  onEdit: (student: Student) => void;
  onDelete: (studentId: string) => void;
  onDeleteMultiple: (studentIds: string[]) => void;
  onView: (student: Student) => void;
  onUpdatePayment: (student: Student) => void;
}

export const StudentsTable = ({ 
  students, 
  courses, 
  onEdit, 
  onDelete, 
  onDeleteMultiple,
  onView, 
  onUpdatePayment 
}: StudentsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single' | 'multiple', ids: string[] }>({ type: 'single', ids: [] });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Attended Online":
        return "bg-green-100 text-green-800";
      case "Attend sessions":
        return "bg-blue-100 text-blue-800";
      case "Attended F2F":
        return "bg-purple-100 text-purple-800";
      case "Exam cycle":
        return "bg-orange-100 text-orange-800";
      case "Awaiting results":
        return "bg-yellow-100 text-yellow-800";
      case "Pass":
        return "bg-emerald-100 text-emerald-800";
      case "Fail":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getCourseTitle = (courseId: string | null) => {
    if (!courseId) return "No Course Assigned";
    const course = courses.find(c => c.id === courseId);
    return course?.title || "Unknown Course";
  };

  const formatDateToDDMMYYYY = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedStudents.length === 0) return;
    
    setDeleteTarget({ type: 'multiple', ids: selectedStudents });
    setShowDeleteConfirmation(true);
  };

  const handleDeleteSingle = (studentId: string) => {
    setDeleteTarget({ type: 'single', ids: [studentId] });
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    if (deleteTarget.type === 'multiple') {
      onDeleteMultiple(deleteTarget.ids);
      setSelectedStudents([]);
    } else {
      onDelete(deleteTarget.ids[0]);
    }
    setShowDeleteConfirmation(false);
  };

  const getSelectedStudentNames = () => {
    return deleteTarget.ids.map(id => {
      const student = students.find(s => s.id === id);
      return student ? student.full_name : 'Unknown Student';
    });
  };

  const allSelected = filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length;
  const someSelected = selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length;

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Bulk Actions Bar */}
        {selectedStudents.length > 0 && (
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-medium">
                {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Selected
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Attended Online">Attended Online</SelectItem>
                <SelectItem value="Attend sessions">Attend sessions</SelectItem>
                <SelectItem value="Attended F2F">Attended F2F</SelectItem>
                <SelectItem value="Exam cycle">Exam cycle</SelectItem>
                <SelectItem value="Awaiting results">Awaiting results</SelectItem>
                <SelectItem value="Pass">Pass</SelectItem>
                <SelectItem value="Fail">Fail</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all students"
                    className={someSelected ? "data-[state=checked]:bg-blue-600" : ""}
                  />
                </TableHead>
                <TableHead className="font-semibold text-blue-900">Student ID</TableHead>
                <TableHead className="font-semibold text-blue-900">Name</TableHead>
                <TableHead className="font-semibold text-blue-900">Email</TableHead>
                <TableHead className="font-semibold text-blue-900">Course</TableHead>
                <TableHead className="font-semibold text-blue-900">Status</TableHead>
                <TableHead className="font-semibold text-blue-900">Course Fee</TableHead>
                <TableHead className="font-semibold text-blue-900">Join Date</TableHead>
                <TableHead className="font-semibold text-blue-900 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id} className="hover:bg-blue-50 transition-colors">
                  <TableCell>
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={(checked) => handleSelectStudent(student.id, checked as boolean)}
                      aria-label={`Select ${student.full_name}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{student.id}</TableCell>
                  <TableCell className="font-medium">{student.full_name}</TableCell>
                  <TableCell className="text-gray-600">{student.email}</TableCell>
                  <TableCell>{getCourseTitle(student.course_id)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(student.status)}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    ${student.total_course_fee}
                  </TableCell>
                  <TableCell>{formatDateToDDMMYYYY(student.join_date)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onView(student)}
                        className="gap-1 text-blue-600 hover:bg-blue-50 border-blue-200"
                      >
                        <User className="h-4 w-4" />
                        View Account
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onUpdatePayment(student)}
                        className="gap-1 text-green-600 hover:bg-green-50 border-green-200"
                      >
                        <CreditCard className="h-4 w-4" />
                        Update Payment
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(student)}>
                        <Edit className="h-4 w-4 text-orange-600" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteSingle(student.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p>No students found matching your criteria.</p>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDelete}
        count={deleteTarget.ids.length}
        studentNames={getSelectedStudentNames()}
      />
    </>
  );
};
