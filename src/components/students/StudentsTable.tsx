import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Eye, Search } from "lucide-react";
import { Course } from "@/hooks/useCourses";
import { Student } from "@/hooks/useStudents";

interface StudentsTableProps {
  students: Student[];
  courses: Course[];
  onEdit: (student: Student) => void;
  onDelete: (studentId: string) => void;
  onView: (student: Student) => void;
}

export const StudentsTable = ({ students, courses, onEdit, onDelete, onView }: StudentsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "awaiting-course":
        return "bg-yellow-100 text-yellow-800";
      case "enrolled":
        return "bg-blue-100 text-blue-800";
      case "online":
        return "bg-green-100 text-green-800";
      case "face-to-face":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "awaiting-course":
        return "Awaiting Course";
      case "enrolled":
        return "Enrolled";
      case "online":
        return "Online";
      case "face-to-face":
        return "Face to Face";
      default:
        return status;
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

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
              <SelectItem value="awaiting-course">Awaiting Course</SelectItem>
              <SelectItem value="enrolled">Enrolled</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="face-to-face">Face to Face</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-50">
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
                <TableCell className="font-mono text-sm">{student.id}</TableCell>
                <TableCell className="font-medium">{student.full_name}</TableCell>
                <TableCell className="text-gray-600">{student.email}</TableCell>
                <TableCell>{getCourseTitle(student.course_id)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(student.status)}>
                    {getStatusLabel(student.status)}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold text-green-600">
                  ${student.total_course_fee}
                </TableCell>
                <TableCell>{new Date(student.join_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-center">
                    <Button variant="ghost" size="sm" onClick={() => onView(student)}>
                      <Eye className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(student)}>
                      <Edit className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(student.id)}>
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
  );
};
