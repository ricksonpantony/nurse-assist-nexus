
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit2, Trash2, CreditCard, Phone, Mail, MapPin } from "lucide-react";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import type { Student } from "@/hooks/useStudents";

interface StudentsTableProps {
  students: Student[];
  courses: any[];
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
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(students.map(s => s.id));
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Attended Online': 'bg-blue-100 text-blue-800 border-blue-200',
      'Attend sessions': 'bg-purple-100 text-purple-800 border-purple-200',
      'Attended F2F': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Exam cycle': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Awaiting results': 'bg-orange-100 text-orange-800 border-orange-200',
      'Pass': 'bg-green-100 text-green-800 border-green-200',
      'Fail': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleDeleteClick = (e: React.MouseEvent, studentId: string) => {
    e.stopPropagation();
    console.log('Delete button clicked for student:', studentId);
    setStudentToDelete(studentId);
    setShowDeleteModal(true);
  };

  const handleEditClick = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation();
    onEdit(student);
  };

  const handlePaymentClick = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation();
    onUpdatePayment(student);
  };

  const handleRowClick = (student: Student) => {
    onView(student);
  };

  const handleConfirmDelete = () => {
    if (studentToDelete) {
      console.log('Confirming delete for student:', studentToDelete);
      onDelete(studentToDelete);
      setStudentToDelete(null);
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedStudents.length > 0) {
      console.log('Bulk delete clicked for students:', selectedStudents);
      setShowBulkDeleteModal(true);
    }
  };

  const handleConfirmBulkDelete = () => {
    console.log('Confirming bulk delete for students:', selectedStudents);
    onDeleteMultiple(selectedStudents);
    setSelectedStudents([]);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {selectedStudents.length > 0 && (
        <div className="bg-blue-50 p-2 flex items-center justify-between">
          <div className="text-sm text-blue-700 font-medium pl-2">
            {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleBulkDeleteClick}
              className="gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-50">
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={students.length > 0 && selectedStudents.length === students.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="font-semibold text-blue-900">Student ID</TableHead>
              <TableHead className="font-semibold text-blue-900">Name</TableHead>
              <TableHead className="font-semibold text-blue-900">Contact</TableHead>
              <TableHead className="font-semibold text-blue-900">Course</TableHead>
              <TableHead className="font-semibold text-blue-900">Join Date</TableHead>
              <TableHead className="font-semibold text-blue-900">Status</TableHead>
              <TableHead className="font-semibold text-blue-900">Payment</TableHead>
              <TableHead className="font-semibold text-blue-900 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const course = courses.find(c => c.id === student.course_id);
              const isSelected = selectedStudents.includes(student.id);
              
              return (
                <TableRow 
                  key={student.id} 
                  className={`hover:bg-blue-50 transition-colors cursor-pointer ${isSelected ? 'bg-blue-100' : ''}`}
                  onClick={() => handleRowClick(student)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelectStudent(student.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{student.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{student.full_name}</div>
                    <div className="text-xs text-gray-500">{student.passport_id || 'No Passport ID'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center text-xs text-gray-600">
                        <Phone className="h-3 w-3 mr-1" />
                        {student.phone}
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <Mail className="h-3 w-3 mr-1" />
                        {student.email}
                      </div>
                      {student.address && (
                        <div className="flex items-center text-xs text-gray-600">
                          <MapPin className="h-3 w-3 mr-1" />
                          {student.country || 'N/A'}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {course ? (
                      <div>
                        <div className="font-medium">{course.title}</div>
                        <div className="text-xs text-gray-500">{course.period_months} months</div>
                      </div>
                    ) : (
                      <span className="text-gray-500">No course assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>{formatDate(student.join_date)}</div>
                    {student.class_start_date && (
                      <div className="text-xs text-gray-500">
                        Class: {formatDate(student.class_start_date)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(student.status)}`}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${student.total_course_fee.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      Advance: ${student.advance_payment?.toLocaleString() || 0}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => handleEditClick(e, student)}
                        className="text-green-600 hover:bg-green-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => handlePaymentClick(e, student)}
                        className="text-purple-600 hover:bg-purple-50"
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => handleDeleteClick(e, student.id)}
                        className="text-red-600 hover:bg-red-50"
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

      {students.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-lg">No students found</p>
          <p className="text-sm">Add a new student to get started</p>
        </div>
      )}

      {/* Single Delete Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setStudentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        count={1}
        studentNames={studentToDelete ? [students.find(s => s.id === studentToDelete)?.full_name || ''] : []}
      />

      {/* Bulk Delete Modal */}
      <DeleteConfirmationModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleConfirmBulkDelete}
        count={selectedStudents.length}
        studentNames={selectedStudents.map(id => 
          students.find(s => s.id === id)?.full_name || ''
        )}
      />
    </div>
  );
};
