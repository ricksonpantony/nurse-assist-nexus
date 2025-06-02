import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Edit, Trash2, Printer } from "lucide-react";
import { Student } from "@/hooks/useStudents";
import { Course } from "@/hooks/useCourses";
import { countries } from "@/utils/countries";
import { format } from "date-fns";

interface StudentsTableProps {
  students: Student[];
  courses: Course[];
  referrals: any[];
  onEdit: (student: Student) => void;
  onDelete: (studentId: string) => void;
  onView: (student: Student) => void;
  onPrint?: (selectedStudents: Student[]) => void;
}

export const StudentsTable = ({ students, courses, referrals, onEdit, onDelete, onView, onPrint }: StudentsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const filteredAndSortedStudents = students
    .filter(student => {
      const matchesSearch = searchTerm === "" || 
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.includes(searchTerm) ||
        (student.country && student.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.student_id && student.student_id.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCountry = countryFilter === "all" || student.country === countryFilter;
      const matchesCourse = courseFilter === "all" || student.interested_course_id === courseFilter;
      
      return matchesSearch && matchesCountry && matchesCourse;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "country":
          return (a.country || "").localeCompare(b.country || "");
        case "course":
          const courseA = courses.find(c => c.id === a.interested_course_id)?.title || "";
          const courseB = courses.find(c => c.id === b.interested_course_id)?.title || "";
          return courseA.localeCompare(courseB);
        case "created_at":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const getCourse = (courseId: string) => {
    return courses.find(c => c.id === courseId);
  };

  const handleRowClick = (student: Student, event: React.MouseEvent) => {
    // Don't navigate if user clicked on a button or checkbox
    if ((event.target as HTMLElement).closest('button') || (event.target as HTMLElement).closest('[role="checkbox"]')) {
      return;
    }
    onView(student);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(filteredAndSortedStudents.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId]);
    }
  };

  const handlePrint = () => {
    if (selectedStudents.length === 0) return;
    const selectedStudentData = filteredAndSortedStudents.filter(student => selectedStudents.includes(student.id));
    onPrint?.(selectedStudentData);
  };

  const isAllSelected = filteredAndSortedStudents.length > 0 && selectedStudents.length === filteredAndSortedStudents.length;
  const isPartiallySelected = selectedStudents.length > 0 && selectedStudents.length < filteredAndSortedStudents.length;

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-gradient-to-r from-white via-blue-50 to-white p-6 rounded-xl shadow-lg border border-blue-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
              <Input
                placeholder="Search by name, email, phone, country, or Student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 border-blue-200 focus:border-blue-400 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>
          
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-[200px] h-11 border-blue-200 bg-white/80 backdrop-blur-sm">
              <SelectValue placeholder="Filter by Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-[200px] h-11 border-blue-200 bg-white/80 backdrop-blur-sm">
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

          {selectedStudents.length > 0 && (
            <Button
              onClick={handlePrint}
              className="gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <Printer className="h-4 w-4" />
              Print Selected ({selectedStudents.length})
            </Button>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header with total count */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
          <div className="text-lg font-semibold text-blue-900">
            Total Students: {filteredAndSortedStudents.length}
            {filteredAndSortedStudents.length !== students.length && (
              <span className="text-sm text-blue-600 ml-2">
                (filtered from {students.length})
              </span>
            )}
            {selectedStudents.length > 0 && (
              <span className="text-sm text-green-600 ml-2">
                • {selectedStudents.length} selected
              </span>
            )}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:bg-gradient-to-r hover:from-blue-700 hover:via-blue-800 hover:to-blue-900">
              <TableHead className="font-bold text-white text-sm w-[50px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className="border-white data-[state=checked]:bg-white data-[state=checked]:text-blue-600"
                />
                {isPartiallySelected && (
                  <div className="text-xs text-blue-200 mt-1">Partial</div>
                )}
              </TableHead>
              <TableHead className="font-bold text-white text-sm w-[60px]">S.No</TableHead>
              <TableHead className="font-bold text-white text-sm">Student ID</TableHead>
              <TableHead className="font-bold text-white text-sm">Name & Contact</TableHead>
              <TableHead className="font-bold text-white text-sm">Location</TableHead>
              <TableHead className="font-bold text-white text-sm">Course Interest</TableHead>
              <TableHead className="font-bold text-white text-sm">Date Added</TableHead>
              <TableHead className="font-bold text-white text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedStudents.map((student, index) => {
              const course = getCourse(student.interested_course_id || "");
              const isSelected = selectedStudents.includes(student.id);
              
              return (
                <TableRow 
                  key={student.id} 
                  className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } ${isSelected ? 'bg-blue-50' : ''}`}
                  onClick={(e) => handleRowClick(student, e)}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelectStudent(student.id, checked as boolean)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-center">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 font-mono text-xs">
                        {student.student_id || 'N/A'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900">{student.full_name}</div>
                      <div className="text-sm text-blue-600">{student.email}</div>
                      <div className="text-sm text-gray-500">{student.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        {student.country || "Not specified"}
                      </Badge>
                      {student.address && (
                        <div className="text-xs text-gray-500 max-w-[150px] truncate">
                          {student.address}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {course ? (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {course.title}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-xs">Not specified</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {format(new Date(student.created_at), 'dd/MM/yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(student);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs gap-1"
                        title="View Details"
                      >
                        <Eye className="h-3 w-3" />
                        Account View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(student);
                        }}
                        className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200"
                        title="Edit Student"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(student.id);
                        }}
                        className="text-red-600 hover:text-red-800 hover:bg-red-100 transition-all duration-200"
                        title="Delete Student"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {filteredAndSortedStudents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No students found</div>
            <div className="text-gray-500 text-sm">
              Try adjusting your search criteria or add a new student to get started.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
