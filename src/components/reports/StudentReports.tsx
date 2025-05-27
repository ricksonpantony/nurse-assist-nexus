
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useStudents } from '@/hooks/useStudents';
import { useCourses } from '@/hooks/useCourses';
import { Download, FileText, Search, Filter, Users } from 'lucide-react';
import * as XLSX from 'xlsx';

export const StudentReports = () => {
  const { students } = useStudents();
  const { courses } = useCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Get unique statuses for filter
  const uniqueStatuses = useMemo(() => {
    const statuses = students.map(s => s.status).filter(Boolean);
    return [...new Set(statuses)];
  }, [students]);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let filtered = students.filter(student => {
      const matchesSearch = student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
      const matchesCourse = courseFilter === 'all' || student.course_id === courseFilter;
      
      return matchesSearch && matchesStatus && matchesCourse;
    });

    // Sort students
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.full_name || '').localeCompare(b.full_name || '');
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        case 'date':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [students, searchTerm, statusFilter, courseFilter, sortBy]);

  const exportToExcel = () => {
    const exportData = filteredStudents.map(student => {
      const course = courses.find(c => c.id === student.course_id);
      return {
        'Student ID': student.student_id || '',
        'Full Name': student.full_name || '',
        'Email': student.email || '',
        'Phone': student.phone || '',
        'Status': student.status || '',
        'Course': course?.title || 'Not Assigned',
        'Date of Birth': student.date_of_birth || '',
        'Address': student.address || '',
        'Emergency Contact': student.emergency_contact_name || '',
        'Emergency Phone': student.emergency_contact_phone || '',
        'Registration Date': student.created_at ? new Date(student.created_at).toLocaleDateString() : ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student Report');
    XLSX.writeFile(wb, `student-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const printReport = () => {
    window.print();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'enrolled': return 'default';
      case 'online': return 'secondary';
      case 'face-to-face': return 'outline';
      case 'awaiting-course': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 1in;
            }
            
            body * {
              visibility: hidden;
            }
            
            .print-area, .print-area * {
              visibility: visible;
            }
            
            .print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            
            .no-print {
              display: none !important;
            }
            
            .print-break {
              page-break-before: always;
            }
            
            .print-table {
              font-size: 10px;
            }
            
            .print-header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
          }
        `}
      </style>

      {/* Filters and Controls */}
      <Card className="no-print">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status?.replace('-', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="date">Registration Date</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button onClick={exportToExcel} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={printReport} variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <div className="print-area">
        <div className="print-header">
          <h1 className="text-2xl font-bold">Student Report</h1>
          <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
          <p className="text-sm text-gray-500">Total Students: {filteredStudents.length}</p>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <table className="w-full print-table">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Info
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student, index) => {
                    const course = courses.find(c => c.id === student.course_id);
                    return (
                      <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {student.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {student.student_id}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.email}</div>
                          <div className="text-sm text-gray-500">{student.phone}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge variant={getStatusBadgeVariant(student.status || '')}>
                            {student.status?.replace('-', ' ').toUpperCase() || 'Unknown'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {course?.title || 'Not Assigned'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.created_at ? new Date(student.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
