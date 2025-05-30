
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
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { countries } from '@/utils/countries';

export const PaymentReports = () => {
  const { students, fetchStudentPayments } = useStudents();
  const { courses } = useCourses();
  const { toast } = useToast();
  
  // State for payments data
  const [isLoading, setIsLoading] = useState(false);
  const [paymentsData, setPaymentsData] = useState<any[]>([]);
  const [hasLoadedPayments, setHasLoadedPayments] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [paymentModeFilter, setPaymentModeFilter] = useState('all');
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

  // Extract unique payment modes
  const uniquePaymentModes = useMemo(() => {
    const modesSet = new Set<string>();
    paymentsData.forEach(payment => {
      if (payment.payment_mode) {
        modesSet.add(payment.payment_mode);
      }
    });
    return Array.from(modesSet);
  }, [paymentsData]);

  // Load payment data for all students
  const loadAllPayments = async () => {
    setIsLoading(true);
    try {
      const allPayments = [];
      
      for (const student of students) {
        const payments = await fetchStudentPayments(student.id);
        
        // Enhance each payment with student details for better filtering
        const enhancedPayments = payments.map(payment => ({
          ...payment,
          studentId: student.id,
          studentName: student.full_name,
          studentEmail: student.email,
          courseId: student.course_id,
          country: student.country
        }));
        
        allPayments.push(...enhancedPayments);
      }
      
      setPaymentsData(allPayments);
      setHasLoadedPayments(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load payment data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter payments based on search term and filters
  const filteredPayments = useMemo(() => {
    return paymentsData.filter(payment => {
      // Search term filter
      if (searchTerm && 
          !payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !payment.payment_mode.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !payment.stage.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Course filter
      if (courseFilter !== 'all' && payment.courseId !== courseFilter) {
        return false;
      }
      
      // Payment mode filter
      if (paymentModeFilter !== 'all' && payment.payment_mode !== paymentModeFilter) {
        return false;
      }
      
      // Country filter
      if (countryFilter !== 'all' && payment.country !== countryFilter) {
        return false;
      }
      
      // Date range filter
      if (dateRangeStart) {
        const startDate = new Date(dateRangeStart);
        const paymentDate = new Date(payment.payment_date);
        if (paymentDate < startDate) {
          return false;
        }
      }
      
      if (dateRangeEnd) {
        const endDate = new Date(dateRangeEnd);
        const paymentDate = new Date(payment.payment_date);
        if (paymentDate > endDate) {
          return false;
        }
      }
      
      return true;
    });
  }, [paymentsData, searchTerm, courseFilter, paymentModeFilter, countryFilter, dateRangeStart, dateRangeEnd]);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return filteredPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  }, [filteredPayments]);

  const handleExport = () => {
    if (filteredPayments.length === 0) {
      toast({
        title: "No data to export",
        description: "Apply different filters to see payments",
        variant: "destructive",
      });
      return;
    }
    
    // Prepare data for export
    const exportData = filteredPayments.map(payment => ({
      'Student Name': payment.studentName,
      'Email': payment.studentEmail,
      'Country': payment.country || 'N/A',
      'Course': courses.find(c => c.id === payment.courseId)?.title || 'N/A',
      'Payment Date': new Date(payment.payment_date).toLocaleDateString(),
      'Amount': `$${Number(payment.amount).toFixed(2)}`,
      'Payment Mode': payment.payment_mode,
      'Stage': payment.stage
    }));
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    
    // Generate file name with current date
    const fileName = `Payments_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Export to Excel
    XLSX.writeFile(wb, fileName);
    
    toast({
      title: "Export successful",
      description: `Exported ${filteredPayments.length} payments to Excel`,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCourseFilter('all');
    setPaymentModeFilter('all');
    setCountryFilter('all');
    setDateRangeStart('');
    setDateRangeEnd('');
  };

  if (!hasLoadedPayments) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-gray-600 mb-4">Click the button below to load payment data for analysis</p>
        <Button 
          onClick={loadAllPayments}
          disabled={isLoading}
          className="min-w-[200px]"
        >
          {isLoading ? "Loading..." : "Load Payment Data"}
        </Button>
      </div>
    );
  }

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
                  placeholder="Search by student name, payment mode..."
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
                <Label htmlFor="payment-mode-filter">Payment Mode</Label>
                <Select 
                  value={paymentModeFilter} 
                  onValueChange={setPaymentModeFilter}
                >
                  <SelectTrigger id="payment-mode-filter">
                    <SelectValue placeholder="Filter by payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Modes</SelectItem>
                    {uniquePaymentModes.map(mode => (
                      <SelectItem key={mode} value={mode}>
                        {mode}
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
                <Label htmlFor="date-start">Payment Date From</Label>
                <Input
                  id="date-start"
                  type="date"
                  value={dateRangeStart}
                  onChange={(e) => setDateRangeStart(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="date-end">Payment Date To</Label>
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
            <h3 className="text-lg font-medium">Payment Results</h3>
            <div className="flex gap-3">
              <Badge variant="secondary">
                {filteredPayments.length} Payments
              </Badge>
              <Badge variant="secondary" className="bg-green-100">
                Total: ${totalAmount.toFixed(2)}
              </Badge>
            </div>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Student</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Stage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => {
                    const course = courses.find(c => c.id === payment.courseId);
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.studentName}</TableCell>
                        <TableCell>{payment.country || 'N/A'}</TableCell>
                        <TableCell>{course ? course.title : 'N/A'}</TableCell>
                        <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          ${Number(payment.amount).toFixed(2)}
                        </TableCell>
                        <TableCell>{payment.payment_mode}</TableCell>
                        <TableCell>{payment.stage}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No payments match the current filters
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
