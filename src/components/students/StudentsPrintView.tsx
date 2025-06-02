

import { Student } from "@/hooks/useStudents";

interface StudentsPrintViewProps {
  students: Student[];
  courses: any[];
}

export const StudentsPrintView = ({ students, courses }: StudentsPrintViewProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCourseTitle = (courseId: string | null) => {
    if (!courseId) return 'No Course Assigned';
    const course = courses.find(c => c.id === courseId);
    return course?.title || 'Unknown Course';
  };

  return (
    <div className="print-content p-8 bg-white">
      <style>{`
        @media print {
          .print-content {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          body { 
            margin: 0; 
            padding: 0; 
          }
          
          .no-print { 
            display: none !important; 
          }
          
          .print-only { 
            display: block !important; 
          }
          
          .page-break { 
            page-break-before: always; 
          }
          
          .table-print {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          
          .table-print th,
          .table-print td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
          
          .table-print th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
        }
      `}</style>
      
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Student List Report</h1>
        <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
        <p className="text-gray-600">Total Students: {students.length}</p>
      </div>

      <table className="table-print w-full border-collapse border border-gray-400">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 px-4 py-2 text-left font-semibold">Student ID</th>
            <th className="border border-gray-400 px-4 py-2 text-left font-semibold">Name</th>
            <th className="border border-gray-400 px-4 py-2 text-left font-semibold">Email</th>
            <th className="border border-gray-400 px-4 py-2 text-left font-semibold">Phone</th>
            <th className="border border-gray-400 px-4 py-2 text-left font-semibold">Country</th>
            <th className="border border-gray-400 px-4 py-2 text-left font-semibold">Course</th>
            <th className="border border-gray-400 px-4 py-2 text-left font-semibold">Join Date</th>
            <th className="border border-gray-400 px-4 py-2 text-left font-semibold">Status</th>
            <th className="border border-gray-400 px-4 py-2 text-left font-semibold">Course Fee</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-400 px-4 py-2">{student.id}</td>
              <td className="border border-gray-400 px-4 py-2">{student.full_name}</td>
              <td className="border border-gray-400 px-4 py-2">{student.email}</td>
              <td className="border border-gray-400 px-4 py-2">{student.phone}</td>
              <td className="border border-gray-400 px-4 py-2">{student.country || 'N/A'}</td>
              <td className="border border-gray-400 px-4 py-2">{getCourseTitle(student.course_id)}</td>
              <td className="border border-gray-400 px-4 py-2">{formatDate(student.join_date)}</td>
              <td className="border border-gray-400 px-4 py-2">{student.status}</td>
              <td className="border border-gray-400 px-4 py-2">${student.total_course_fee.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {students.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No students found matching the selected criteria.</p>
        </div>
      )}
    </div>
  );
};

