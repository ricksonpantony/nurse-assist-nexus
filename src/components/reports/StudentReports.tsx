
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search } from "lucide-react";
import { useStudents, Student } from "@/hooks/useStudents";
import { useCourses } from "@/hooks/useCourses";
import { countries } from "@/utils/countries";
import * as XLSX from "xlsx";

export const StudentReports = () => {
  const { students } = useStudents();
  const { courses } = useCourses();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  useEffect(() => {
    let filtered = [...students];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.phone.includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((student) => student.status === statusFilter);
    }

    // Filter by course
    if (courseFilter !== "all") {
      filtered = filtered.filter((student) => student.course_id === courseFilter);
    }
    
    // Filter by country
    if (countryFilter !== "all") {
      filtered = filtered.filter((student) => student.country === countryFilter);
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, statusFilter, courseFilter, countryFilter]);

  const getCourseTitle = (courseId: string | null) => {
    if (!courseId) return "N/A";
    const course = courses.find((c) => c.id === courseId);
    return course ? course.title : "Unknown Course";
  };

  const exportToExcel = () => {
    // Prepare data for export
    const dataToExport = filteredStudents.map((student) => ({
      "Student ID": student.id,
      "Full Name": student.full_name,
      "Email": student.email,
      "Phone": student.phone,
      "Address": student.address || "",
      "Country": student.country || "",
      "Course": getCourseTitle(student.course_id),
      "Join Date": student.join_date,
      "Status": student.status,
      "Course Fee": student.total_course_fee,
      "Advance Payment": student.advance_payment,
      "Installments": student.installments,
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    
    // Generate Excel file
    XLSX.writeFile(wb, "students_report.xlsx");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Student Reports</CardTitle>
        <CardDescription>
          Comprehensive report of all students with filtering options.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Attended Online">Attended Online</SelectItem>
                <SelectItem value="Attend sessions">Attend sessions</SelectItem>
                <SelectItem value="Attended F2F">Attended F2F</SelectItem>
                <SelectItem value="Exam cycle">Exam cycle</SelectItem>
                <SelectItem value="Awaiting results">Awaiting results</SelectItem>
                <SelectItem value="Pass">Pass</SelectItem>
                <SelectItem value="Fail">Fail</SelectItem>
              </SelectContent>
            </Select>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by course" />
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
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {Array.from(new Set(students.map(s => s.country).filter(Boolean))).sort().map((country) => (
                  <SelectItem key={country} value={country as string}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={exportToExcel} variant="outline" className="hidden md:flex">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
          <Button onClick={exportToExcel} variant="outline" className="w-full md:hidden">
            <Download className="h-4 w-4 mr-2" /> Export to Excel
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Course Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-mono text-sm">{student.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{student.full_name}</div>
                      <div className="text-xs text-gray-500">{student.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getCourseTitle(student.course_id)}</TableCell>
                  <TableCell>{student.country || "N/A"}</TableCell>
                  <TableCell>{new Date(student.join_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        student.status === "Pass"
                          ? "bg-green-100 text-green-800"
                          : student.status === "Fail"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {student.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    ${student.total_course_fee.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No students found matching the criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
