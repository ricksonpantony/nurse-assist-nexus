
import { useState, useMemo } from 'react';
import { useStudents } from '@/hooks/useStudents';
import { useCourses } from '@/hooks/useCourses';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Search, X } from 'lucide-react';
import { exportStudentsToExcel } from '@/utils/excelUtils';
import { useToast } from '@/hooks/use-toast';
import { countries } from '@/utils/countries';

export const StudentReports = () => {
  const { students } = useStudents();
  const { courses } = useCourses();
  const { toast } = useToast();
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  
  // Extract unique countries from students
  const uniqueCountries = useMemo(() => {
    const countriesSet = new Set<string>();
    students.forEach(student => {
      if (student.country) {
        countriesSet.add(student.country);
      }
    });
    return Array.from(countriesSet).sort();
  }, [students]);

  // Extract unique statuses from students
  const uniqueStatuses = useMemo(() => {
    const statusesSet = new Set<string>();
    students.forEach(student => statusesSet.add(student.status));
    return Array.from(statusesSet);
  }, [students]);

  // Filter students based on search term and filters
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Search term filter (check name, email, phone, ID)
      if (
        searchTerm &&
        !student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !student.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !student.phone.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !student.id.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      
      // Course filter
      if (courseFilter !== 'all' && student.course_id !== courseFilter) {
        return false;
      }
      
      // Status filter
      if (statusFilter !== 'all' && student.status !== statusFilter) {
        return false;
      }
      
      // Country filter
      if (countryFilter !== 'all' && student.country !== countryFilter) {
        return false;
      }
      
      // Date range filter
      if (dateRangeStart) {
        const startDate = new Date(dateRangeStart);
        const joinDate = new Date(student.join_date);
        if (joinDate < startDate) {
          return false;
        }
      }
      
      if (dateRangeEnd) {
        const endDate = new Date(dateRangeEnd);
        const joinDate = new Date(student.join_date);
        if (joinDate > endDate) {
          return false;
        }
      }
      
      return true;
    });
  }, [students, searchTerm, courseFilter, statusFilter, countryFilter, dateRangeStart, dateRangeEnd]);

  const handleExport = () => {
    if (filteredStudents.length === 0) {
      toast({
        title: "No data to export",
        description: "Apply different filters to see students",
        variant: "destructive",
      });
      return;
    }
    
    exportStudentsToExcel(filteredStudents, courses);
    toast({
      title: "Export successful",
      description: `Exported ${filteredStudents.length} students to Excel`,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCourseFilter('all');
    setStatusFilter('all');
    setCountryFilter('all');
    setDateRangeStart('');
    setDateRangeEnd('');
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name, email, phone or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button 
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-1 sm:w-auto w-full"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
              <Button
                onClick={handleExport}
                className="flex items-center gap-1 sm:w-auto w-full"
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="course-filter">Course</Label>
                <Select 
                  value={courseFilter} 
                  onValueChange={setCourseFilter}
                >
                  <SelectTrigger id="course-filter">
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
              </div>
              
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {uniqueStatuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="country-filter">Country</Label>
                <Select 
                  value={countryFilter} 
                  onValueChange={setCountryFilter}
                >
                  <SelectTrigger id="country-filter">
                    <SelectValue placeholder="Filter by country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {uniqueCountries.map(country => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="date-start">Join Date From</Label>
                <Input
                  id="date-start"
                  type="date"
                  value={dateRangeStart}
                  onChange={(e) => setDateRangeStart(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="date-end">Join Date To</Label>
                <Input
                  id="date-end"
                  type="date"
                  value={dateRangeEnd}
                  onChange={(e) => setDateRangeEnd(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Results */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between mb-2">
            <h3 className="text-lg font-medium">Student Results</h3>
            <Badge variant="secondary">
              {filteredStudents.length} Students
            </Badge>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const course = courses.find(c => c.id === student.course_id);
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.phone}</TableCell>
                        <TableCell>{student.country || 'N/A'}</TableCell>
                        <TableCell>{course ? course.title : 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(student.join_date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No students match the current filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
