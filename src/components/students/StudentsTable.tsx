
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Edit, Trash2, CreditCard, ChevronLeft, ChevronRight, User, Printer } from "lucide-react";
import { Student } from "@/hooks/useStudents";
import { Course } from "@/hooks/useCourses";
import { format } from "date-fns";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

interface StudentsTableProps {
  students: Student[];
  courses: Course[];
  onEdit: (student: Student) => void;
  onDelete: (studentId: string) => void;
  onDeleteMultiple: (studentIds: string[]) => void;
  onView: (student: Student) => void;
  onUpdatePayment: (student: Student) => void;
  selectedStudents: string[];
  onStudentSelection: (studentIds: string[]) => void;
}

export const StudentsTable = ({
  students,
  courses,
  onEdit,
  onDelete,
  onDeleteMultiple,
  onView,
  onUpdatePayment,
  selectedStudents,
  onStudentSelection,
}: StudentsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Calculate pagination
  const totalItems = students.length;
  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(totalItems / itemsPerPage);
  const startIndex = itemsPerPage === -1 ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === -1 ? totalItems : startIndex + itemsPerPage;
  const currentStudents = students.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = value === "all" ? -1 : parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all students from all pages
      onStudentSelection(students.map(student => student.id));
    } else {
      onStudentSelection([]);
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      onStudentSelection([...selectedStudents, studentId]);
    } else {
      onStudentSelection(selectedStudents.filter(id => id !== studentId));
    }
  };

  const handleMultiDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmMultiDelete = () => {
    onDeleteMultiple(selectedStudents);
    setShowDeleteModal(false);
    onStudentSelection([]);
  };

  const handlePrintSelected = () => {
    if (selectedStudents.length === 0) {
      alert('Please select students to print');
      return;
    }
    window.print();
  };

  const getCourse = (courseId: string | null) => {
    return courses.find(c => c.id === courseId);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'Attended Online': 'bg-blue-100 text-blue-800',
      'Attend sessions': 'bg-green-100 text-green-800',
      'Attended F2F': 'bg-purple-100 text-purple-800',
      'Exam cycle': 'bg-yellow-100 text-yellow-800',
      'Awaiting results': 'bg-orange-100 text-orange-800',
      'Pass': 'bg-emerald-100 text-emerald-800',
      'Fail': 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const isAllSelected = students.length > 0 && selectedStudents.length === students.length;
  const isPartialSelected = selectedStudents.length > 0 && selectedStudents.length < students.length;

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Get student names for delete confirmation
  const selectedStudentNames = students
    .filter(student => selectedStudents.includes(student.id))
    .map(student => student.full_name);

  return (
    <div className="space-y-4">
      {/* Pagination Controls Top */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show:</span>
          <Select value={itemsPerPage === -1 ? "all" : itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
              <SelectItem value="500">500</SelectItem>
              <SelectItem value="1000">1000</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} students
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {selectedStudents.length > 0 && (
            <>
              <div className="text-sm text-blue-600 font-medium">
                {selectedStudents.length} of {totalItems} students selected
              </div>
              <Button
                variant="destructive"
                onClick={handleMultiDelete}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedStudents.length})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800">
              <TableHead className="font-bold text-white text-sm w-[50px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className="border-white data-[state=checked]:bg-white data-[state=checked]:text-blue-600"
                />
                {isPartialSelected && !isAllSelected && (
                  <div className="text-xs text-blue-200 mt-1">Partial</div>
                )}
              </TableHead>
              <TableHead className="font-bold text-white text-sm w-[60px]">S.No</TableHead>
              <TableHead className="font-bold text-white text-sm">Student ID</TableHead>
              <TableHead className="font-bold text-white text-sm">Name & Contact</TableHead>
              <TableHead className="font-bold text-white text-sm">Course & Batch</TableHead>
              <TableHead className="font-bold text-white text-sm">Location</TableHead>
              <TableHead className="font-bold text-white text-sm">Join Date</TableHead>
              <TableHead className="font-bold text-white text-sm">Status</TableHead>
              <TableHead className="font-bold text-white text-sm">Course Fee</TableHead>
              <TableHead className="font-bold text-white text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentStudents.map((student, index) => {
              const course = getCourse(student.course_id);
              const isSelected = selectedStudents.includes(student.id);
              const actualIndex = startIndex + index + 1;
              
              return (
                <TableRow 
                  key={student.id} 
                  className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } ${isSelected ? 'bg-blue-50' : ''}`}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelectStudent(student.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-center">{actualIndex}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 font-mono text-xs">
                      {student.id}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900">{student.full_name}</div>
                      <div className="text-sm text-blue-600">{student.email}</div>
                      <div className="text-sm text-gray-500">{student.phone}</div>
                      {student.passport_id && (
                        <div className="text-xs text-gray-400">Passport: {student.passport_id}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {course ? (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {course.title}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-xs">No Course Assigned</span>
                      )}
                      {student.batch_id && (
                        <div className="text-xs text-gray-500">Batch: {student.batch_id}</div>
                      )}
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
                      {format(new Date(student.join_date), 'dd/MM/yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(student.status)}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      ${student.total_course_fee.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onView(student)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm hover:shadow-md transition-all duration-200 gap-2 text-xs px-3 py-1 h-8"
                        title="View Student Account"
                      >
                        <User className="h-3 w-3" />
                        View Account
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(student)}
                        className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                        title="Edit Student"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdatePayment(student)}
                        className="text-green-600 hover:text-green-800 hover:bg-green-100"
                        title="Update Payment"
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(student.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-100"
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
      </div>

      {/* Pagination Bottom */}
      {itemsPerPage !== -1 && totalPages > 1 && (
        <div className="flex items-center justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {getPageNumbers().map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => handlePageChange(pageNum)}
                    isActive={pageNum === currentPage}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Print Selected Button - After Pagination */}
      {selectedStudents.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handlePrintSelected}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 gap-2 px-6 py-3 text-base font-medium rounded-lg"
          >
            <Printer className="h-5 w-5" />
            Print Selected Students ({selectedStudents.length})
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmMultiDelete}
        count={selectedStudents.length}
        studentNames={selectedStudentNames}
      />
    </div>
  );
};
