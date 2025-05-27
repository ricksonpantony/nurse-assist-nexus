
import { useState, useMemo } from 'react';
import { useStudents } from '@/hooks/useStudents';
import { useCourses } from '@/hooks/useCourses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, Filter, Printer, Users } from 'lucide-react';
import { exportStudentsToExcel, formatDateForExcel } from '@/utils/excelUtils';

export const StudentReports = () => {
  const { students } = useStudents();
  const { courses } = useCourses();
  
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    month: 'all',
    year: new Date().getFullYear().toString(),
    status: 'all',
    course: 'all',
  });

  const [sortBy, setSortBy] = useState('join_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort students based on criteria
  const filteredStudents = useMemo(() => {
    let filtered = [...students];

    // Filter by join date range
    if (filters.dateFrom) {
      filtered = filtered.filter(student => 
        new Date(student.join_date) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(student => 
        new Date(student.join_date) <= new Date(filters.dateTo)
      );
    }

    // Filter by specific month/year
    if (filters.month && filters.month !== 'all' && filters.year) {
      filtered = filtered.filter(student => {
        const joinDate = new Date(student.join_date);
        return joinDate.getMonth() === parseInt(filters.month) - 1 && 
               joinDate.getFullYear() === parseInt(filters.year);
      });
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(student => student.status === filters.status);
    }

    // Filter by course
    if (filters.course && filters.course !== 'all') {
      filtered = filtered.filter(student => student.course_id === filters.course);
    }

    // Sort students
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'join_date':
          aValue = new Date(a.join_date);
          bValue = new Date(b.join_date);
          break;
        case 'full_name':
          aValue = a.full_name.toLowerCase();
          bValue = b.full_name.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a[sortBy as keyof typeof a];
          bValue = b[sortBy as keyof typeof b];
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [students, filters, sortBy, sortOrder]);

  // Calculate totals
  const totalStudents = filteredStudents.length;
  const totalCourseFees = filteredStudents.reduce((sum, student) => sum + student.total_course_fee, 0);

  const getStatusBadge = (status: string) => {
    const colors = {
      'enrolled': 'bg-blue-100 text-blue-800',
      'online': 'bg-green-100 text-green-800',
      'face-to-face': 'bg-purple-100 text-purple-800',
      'awaiting-course': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCourseName = (courseId: string | null) => {
    if (!courseId) return 'No Course Assigned';
    const course = courses.find(c => c.id === courseId);
    return course?.title || 'Unknown Course';
  };

  const handleExport = () => {
    exportStudentsToExcel(filteredStudents, courses);
  };

  const handlePrint = () => {
    window.print();
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      month: 'all',
      year: new Date().getFullYear().toString(),
      status: 'all',
      course: 'all',
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card className="shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range Filters */}
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>

            {/* Month/Year Filters */}
            <div className="space-y-2">
              <Label>Specific Month</Label>
              <Select value={filters.month} onValueChange={(value) => setFilters(prev => ({ ...prev, month: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  <SelectItem value="1">January</SelectItem>
                  <SelectItem value="2">February</SelectItem>
                  <SelectItem value="3">March</SelectItem>
                  <SelectItem value="4">April</SelectItem>
                  <SelectItem value="5">May</SelectItem>
                  <SelectItem value="6">June</SelectItem>
                  <SelectItem value="7">July</SelectItem>
                  <SelectItem value="8">August</SelectItem>
                  <SelectItem value="9">September</SelectItem>
                  <SelectItem value="10">October</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                  <SelectItem value="12">December</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Input
                type="number"
                value={filters.year}
                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                min="2020"
                max="2030"
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Student Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="enrolled">Enrolled</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="face-to-face">Face-to-Face</SelectItem>
                  <SelectItem value="awaiting-course">Awaiting Course</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Course Filter */}
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={filters.course} onValueChange={(value) => setFilters(prev => ({ ...prev, course: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All courses" />
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
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="join_date">Join Date</SelectItem>
                  <SelectItem value="full_name">Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="total_course_fee">Course Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={clearFilters} variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Students</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total Course Fees</p>
                <p className="text-2xl font-bold">${totalCourseFees.toLocaleString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleExport} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4" />
          Export to Excel
        </Button>
        <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print Report
        </Button>
      </div>

      {/* Report Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Student Report ({totalStudents} students)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Course Fee</TableHead>
                  <TableHead>Country</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{student.id}</TableCell>
                    <TableCell className="font-medium">{student.full_name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phone}</TableCell>
                    <TableCell>{getCourseName(student.course_id)}</TableCell>
                    <TableCell>{formatDateForExcel(student.join_date)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(student.status)}>
                        {student.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>${student.total_course_fee.toLocaleString()}</TableCell>
                    <TableCell>{student.country || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
