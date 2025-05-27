
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Search } from "lucide-react";
import { Student } from "@/hooks/useStudents";
import { Course } from "@/hooks/useCourses";

interface StudentsTableProps {
  students: Student[];
  courses: Course[];
  onEdit: (student: Student) => void;
  onDelete: (studentId: string) => void;
  onView: (student: Student) => void;
}

export const StudentsTable = ({ students, courses, onEdit, onDelete, onView }: StudentsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const getCourseName = (courseId: string | null) => {
    if (!courseId) return "No Course";
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : courseId;
  };

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
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = courseFilter === "all" || student.course_id === courseFilter;
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
      <CardHeader>
        <CardTitle className="text-blue-900">Students</CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Filter by Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by Status" />
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
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id} className="hover:bg-blue-50">
                  <TableCell className="font-mono text-sm">{student.id}</TableCell>
                  <TableCell className="font-medium">{student.full_name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell className="text-sm">{getCourseName(student.course_id)}</TableCell>
                  <TableCell>{new Date(student.join_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(student.status)}>
                      {getStatusLabel(student.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onView(student)}
                        className="h-8 w-8 p-0 hover:bg-blue-100"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onEdit(student)}
                        className="h-8 w-8 p-0 hover:bg-blue-100"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onDelete(student.id)}
                        className="h-8 w-8 p-0 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
