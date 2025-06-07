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
import { Checkbox } from '@/components/ui/checkbox';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Calendar, Download, Filter, Printer, Users, Trash2 } from 'lucide-react';
import { exportStudentsToExcel, formatDateForExcel } from '@/utils/excelUtils';
import { countries } from '@/utils/countries';
import '../../styles/studentReportsPrint.css';

export const StudentReports = () => {
  const { students } = useStudents();
  const { courses } = useCourses();
  
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    month: 'all',
    year: new Date().getFullYear().toString(),
    status: 'all',
    course: 'all',
    batch: 'all',
    country: 'all',
  });

  const [sortBy, setSortBy] = useState('join_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get unique batches from students for the filter dropdown
  const uniqueBatches = useMemo(() => {
    const studentBatches = students
      .map(student => student.batch_id)
      .filter(batch => batch && batch.trim() !== '')
      .filter((batch, index, array) => array.indexOf(batch) === index)
      .sort();
    return studentBatches;
  }, [students]);

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

    // Filter by batch
    if (filters.batch && filters.batch !== 'all') {
      filtered = filtered.filter(student => student.batch_id === filters.batch);
    }

    // Filter by country
    if (filters.country && filters.country !== 'all') {
      filtered = filtered.filter(student => student.country === filters.country);
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
        case 'country':
          aValue = (a.country || '').toLowerCase();
          bValue = (b.country || '').toLowerCase();
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

  // Calculate pagination
  const totalItems = filteredStudents.length;
  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(totalItems / itemsPerPage);
  const startIndex = itemsPerPage === -1 ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === -1 ? totalItems : startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = value === "all" ? -1 : parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate totals
  const totalStudents = filteredStudents.length;
  const totalCourseFees = filteredStudents.reduce((sum, student) => sum + student.total_course_fee, 0);

  // Get selected students data
  const selectedStudentsData = filteredStudents.filter(student => 
    selectedStudents.includes(student.id)
  );

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all students from all pages
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

  const handleBulkExport = () => {
    const selectedStudentData = filteredStudents.filter(student => 
      selectedStudents.includes(student.id)
    );
    exportStudentsToExcel(selectedStudentData, courses);
  };

  const handleDeleteSelected = () => {
    // This would typically call a delete function
    console.log('Delete selected students:', selectedStudents);
    setSelectedStudents([]);
  };

  const handlePrintSelected = () => {
    if (selectedStudents.length === 0) {
      alert('Please select students to print');
      return;
    }
    window.print();
  };

  // Get unique countries from students for the filter dropdown
  const uniqueCountries = useMemo(() => {
    const studentCountries = students
      .map(student => student.country)
      .filter(country => country && country.trim() !== '')
      .filter((country, index, array) => array.indexOf(country) === index)
      .sort();
    return studentCountries;
  }, [students]);

  const isAllSelected = filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length;
  const isPartialSelected = selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length;

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
      batch: 'all',
      country: 'all',
    });
  };

  // Date range helper functions
  const setTodayRange = () => {
    const today = new Date().toISOString().split('T')[0];
    setFilters(prev => ({
      ...prev,
      dateFrom: today,
      dateTo: today
    }));
  };

  const setYesterdayRange = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    setFilters(prev => ({
      ...prev,
      dateFrom: yesterdayStr,
      dateTo: yesterdayStr
    }));
  };

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

  return (
    <div className="space-y-6 student-reports-page">
      {/* Print Content - Hidden on screen, visible only when printing */}
      <div className="student-reports-print-content" style={{ display: 'none' }}>
        <div className="student-reports-print-header">
          <div className="student-reports-print-title">
            Student Report Overview
          </div>
          <div className="student-reports-print-date">
            Generated on: {new Date().toLocaleDateString()}
          </div>
        </div>

        <div className="student-reports-print-summary">
          <h3>Report Summary</h3>
          <p>Total Selected Students: {selectedStudentsData.length}</p>
          <p>Total Course Fees: ${selectedStudentsData.reduce((sum, student) => sum + student.total_course_fee, 0).toLocaleString()}</p>
        </div>

        <table className="student-reports-print-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Course</th>
              <th>Join Date</th>
              <th>Status</th>
              <th>Course Fee</th>
              <th>Country</th>
            </tr>
          </thead>
          <tbody>
            {selectedStudentsData.map((student, index) => (
              <tr key={student.id}>
                <td>{index + 1}</td>
                <td>{student.id}</td>
                <td>{student.full_name}</td>
                <td>{student.email}</td>
                <td>{student.phone}</td>
                <td>{getCourseName(student.course_id)}</td>
                <td>{formatDateForExcel(student.join_date)}</td>
                <td>
                  <span className="student-reports-print-badge">
                    {student.status}
                  </span>
                </td>
                <td>${student.total_course_fee.toLocaleString()}</td>
                <td>{student.country || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Proper footer element */}
        <div className="student-reports-print-footer">
          📞 +61 478 320 397  |  ✉️ admin@nurseassistinternational.com  |  📍 Suite 104, Level 1, 25 Grose Street, Parramatta, 2150, Sydney
        </div>
      </div>

      {/* Filters Card */}
      <Card className="shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 no-print">
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

            {/* Batch Filter */}
            <div className="space-y-2">
              <Label>Batch</Label>
              <Select value={filters.batch} onValueChange={(value) => setFilters(prev => ({ ...prev, batch: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All batches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {uniqueBatches.map(batch => (
                    <SelectItem key={batch} value={batch}>
                      {batch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Country Filter */}
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={filters.country} onValueChange={(value) => setFilters(prev => ({ ...prev, country: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All countries" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <SelectItem value="all">All Countries</SelectItem>
                  {uniqueCountries.map(country => (
                    <SelectItem key={country} value={country}>
                      {country}
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
                  <SelectItem value="country">Country</SelectItem>
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
            <Button onClick={setTodayRange} variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Today
            </Button>
            <Button onClick={setYesterdayRange} variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Yesterday
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
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

      {/* Selection Actions */}
      {selectedStudents.length > 0 && (
        <Card className="shadow-lg bg-gradient-to-r from-green-50 to-blue-50 selection-actions">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">
                {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-2">
                <Button onClick={handleBulkExport} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4" />
                  Export Selected
                </Button>
                <Button onClick={handlePrintSelected} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 print-selected-btn">
                  <Printer className="h-4 w-4" />
                  Print Selected
                </Button>
                <Button onClick={handleDeleteSelected} variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </Button>
                <Button onClick={() => setSelectedStudents([])} variant="outline">
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-2 no-print">
        <Button onClick={handleExport} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4" />
          Export to Excel
        </Button>
        <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print Report
        </Button>
      </div>

      {/* Pagination Controls Top */}
      <div className="flex items-center justify-between no-print">
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
        
        {selectedStudents.length > 0 && (
          <div className="text-sm text-blue-600 font-medium">
            {selectedStudents.length} of {totalItems} students selected
          </div>
        )}
      </div>

      {/* Report Table */}
      <Card className="shadow-lg no-print">
        <CardHeader>
          <CardTitle>Student Report ({totalStudents} students)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      className={isPartialSelected ? "opacity-50" : ""}
                    />
                  </TableHead>
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
                {currentStudents.map((student, index) => {
                  const actualIndex = startIndex + index + 1;
                  return (
                    <TableRow 
                      key={student.id}
                      className={selectedStudents.includes(student.id) ? 'bg-blue-50' : ''}
                    >
                      <TableCell>
                        <Checkbox 
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={(checked) => handleSelectStudent(student.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{actualIndex}</TableCell>
                      <TableCell>{student.id}</TableCell>
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.phone}</TableCell>
                      <TableCell>{getCourseName(student.course_id)}</TableCell>
                      <TableCell>{formatDateForExcel(student.join_date)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(student.status)}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>${student.total_course_fee.toLocaleString()}</TableCell>
                      <TableCell>{student.country || 'N/A'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Bottom */}
      {itemsPerPage !== -1 && totalPages > 1 && (
        <div className="flex items-center justify-center no-print">
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
    </div>
  );
};
