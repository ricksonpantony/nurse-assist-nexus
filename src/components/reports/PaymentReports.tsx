import { useState, useEffect, useMemo } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Download, Filter, Printer, Trash2, Calendar } from 'lucide-react';
import { formatDateForExcel } from '@/utils/excelUtils';
import * as XLSX from 'xlsx';
import '../../styles/paymentReportsPrint.css';

interface Payment {
  id: string;
  student_id: string;
  payment_date: string;
  stage: string;
  amount: number;
  payment_mode: string;
}

interface PaymentBreakdown {
  sl_number: number;
  student_id: string;
  student_name: string;
  course_title: string;
  stage: string;
  student_status: string;
  student_batch: string;
  student_country: string;
  course_fee: number;
  advance_payment: number;
  advance_date: string;
  second_payment: number;
  second_date: string;
  third_payment: number;
  third_date: string;
  final_payment: number;
  final_date: string;
  other_payments: number;
  other_dates: string;
  balance_fee: number;
}

export const PaymentReports = () => {
  const { students } = useStudents();
  const { courses } = useCourses();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showPrintView, setShowPrintView] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  // Enhanced filters state
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    month: 'all',
    year: new Date().getFullYear().toString(),
    stage: 'all',
    paymentMode: 'all',
    student: 'all',
    studentStatus: 'all',
    course: 'all',
    batch: 'all',
    country: 'all',
    balanceFilter: 'all', // 'all', 'with_balance', 'no_balance'
  });

  const [sortBy, setSortBy] = useState('payment_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get unique values for filters
  const uniqueBatches = useMemo(() => {
    const batches = students
      .map(student => student.batch_id)
      .filter(batch => batch && batch.trim() !== '')
      .filter((batch, index, array) => array.indexOf(batch) === index)
      .sort();
    return batches;
  }, [students]);

  const uniqueCountries = useMemo(() => {
    const countries = students
      .map(student => student.country)
      .filter(country => country && country.trim() !== '')
      .filter((country, index, array) => array.indexOf(country) === index)
      .sort();
    return countries;
  }, [students]);

  // Fetch payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .order('payment_date', { ascending: false });

        if (error) throw error;
        setPayments(data || []);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const paymentBreakdown = useMemo(() => {
    const breakdown: PaymentBreakdown[] = [];
    
    students.forEach((student) => {
      const studentPayments = payments.filter(p => p.student_id === student.id);
      const course = courses.find(c => c.id === student.course_id);
      
      // Organize payments by stage
      const advancePayment = studentPayments.find(p => p.stage === 'Advance');
      const secondPayment = studentPayments.find(p => p.stage === 'Second');
      const thirdPayment = studentPayments.find(p => p.stage === 'Third');
      const finalPayment = studentPayments.find(p => p.stage === 'Final');
      const otherPayments = studentPayments.filter(p => !['Advance', 'Second', 'Third', 'Final'].includes(p.stage));
      
      const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
      const balanceFee = student.total_course_fee - totalPaid;
      
      breakdown.push({
        sl_number: 0, // Will be set after sorting
        student_id: student.id,
        student_name: student.full_name,
        course_title: course?.title || 'No Course Assigned',
        stage: filters.stage === 'all' ? 'All' : filters.stage,
        student_status: student.status,
        student_batch: student.batch_id || '',
        student_country: student.country || '',
        course_fee: student.total_course_fee,
        advance_payment: advancePayment?.amount || 0,
        advance_date: advancePayment?.payment_date || '',
        second_payment: secondPayment?.amount || 0,
        second_date: secondPayment?.payment_date || '',
        third_payment: thirdPayment?.amount || 0,
        third_date: thirdPayment?.payment_date || '',
        final_payment: finalPayment?.amount || 0,
        final_date: finalPayment?.payment_date || '',
        other_payments: otherPayments.reduce((sum, p) => sum + p.amount, 0),
        other_dates: otherPayments.map(p => formatDateForExcel(p.payment_date)).join(', '),
        balance_fee: balanceFee,
      });
    });
    
    return breakdown;
  }, [students, courses, payments, filters.stage]);

  const filteredBreakdown = useMemo(() => {
    let filtered = [...paymentBreakdown];

    // Filter by date range - check ALL payment dates for the student
    if (filters.dateFrom || filters.dateTo) {
      filtered = filtered.filter(item => {
        const studentPayments = payments.filter(p => p.student_id === item.student_id);
        
        return studentPayments.some(payment => {
          const paymentDate = new Date(payment.payment_date);
          let matchesDateRange = true;
          
          if (filters.dateFrom) {
            matchesDateRange = matchesDateRange && paymentDate >= new Date(filters.dateFrom);
          }
          if (filters.dateTo) {
            matchesDateRange = matchesDateRange && paymentDate <= new Date(filters.dateTo);
          }
          
          return matchesDateRange;
        });
      });
    }

    // Filter by specific month/year - check ALL payment dates for the student
    if (filters.month && filters.month !== 'all' && filters.year) {
      filtered = filtered.filter(item => {
        const studentPayments = payments.filter(p => p.student_id === item.student_id);
        
        return studentPayments.some(payment => {
          const paymentDate = new Date(payment.payment_date);
          return paymentDate.getMonth() === parseInt(filters.month) - 1 && 
                 paymentDate.getFullYear() === parseInt(filters.year);
        });
      });
    }

    // Filter by student
    if (filters.student && filters.student !== 'all') {
      filtered = filtered.filter(item => item.student_id === filters.student);
    }

    // Filter by student status
    if (filters.studentStatus && filters.studentStatus !== 'all') {
      filtered = filtered.filter(item => item.student_status === filters.studentStatus);
    }

    // Filter by course
    if (filters.course && filters.course !== 'all') {
      const studentsInCourse = students.filter(s => s.course_id === filters.course).map(s => s.id);
      filtered = filtered.filter(item => studentsInCourse.includes(item.student_id));
    }

    // Filter by batch
    if (filters.batch && filters.batch !== 'all') {
      filtered = filtered.filter(item => item.student_batch === filters.batch);
    }

    // Filter by country
    if (filters.country && filters.country !== 'all') {
      filtered = filtered.filter(item => item.student_country === filters.country);
    }

    // Filter by payment stage - show only students who have made that specific payment
    if (filters.stage && filters.stage !== 'all') {
      const relevantPayments = payments.filter(p => p.stage === filters.stage);
      const studentIdsWithStage = [...new Set(relevantPayments.map(p => p.student_id))];
      filtered = filtered.filter(item => studentIdsWithStage.includes(item.student_id));
    }

    // Filter by balance payment status
    if (filters.balanceFilter === 'with_balance') {
      filtered = filtered.filter(item => item.balance_fee > 0);
    } else if (filters.balanceFilter === 'no_balance') {
      filtered = filtered.filter(item => item.balance_fee <= 0);
    }

    // Sort by student status if selected
    if (sortBy === 'student_status') {
      filtered.sort((a, b) => {
        const comparison = a.student_status.localeCompare(b.student_status);
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    } else {
      // Default sorting by payment date or other criteria
      filtered.sort((a, b) => {
        if (sortBy === 'payment_date') {
          const aDate = new Date(a.advance_date || '1970-01-01');
          const bDate = new Date(b.advance_date || '1970-01-01');
          return sortOrder === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
        }
        return 0;
      });
    }

    // Reassign sequential sl_number after filtering and sorting
    return filtered.map((item, index) => ({
      ...item,
      sl_number: index + 1
    }));
  }, [paymentBreakdown, filters, payments, sortBy, sortOrder, students]);

  // Pagination calculations
  const totalItems = filteredBreakdown.length;
  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(totalItems / itemsPerPage);
  const startIndex = itemsPerPage === -1 ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === -1 ? totalItems : startIndex + itemsPerPage;
  const currentBreakdown = filteredBreakdown.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = value === "all" ? -1 : parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

  // Get selected payment data for printing
  const selectedPaymentData = filteredBreakdown.filter(item => 
    selectedRows.includes(item.student_id)
  );

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredBreakdown.map(item => item.student_id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedRows(prev => [...prev, studentId]);
    } else {
      setSelectedRows(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleBulkExport = () => {
    const selectedData = filteredBreakdown.filter(item => 
      selectedRows.includes(item.student_id)
    );
    
    const exportData = selectedData.map((item) => ({
      sl_number: item.sl_number,
      student_id: item.student_id,
      student_name: item.student_name,
      course_title: item.course_title,
      stage: item.stage,
      student_status: item.student_status,
      course_fee: item.course_fee,
      advance_payment: item.advance_payment,
      advance_date: item.advance_date ? formatDateForExcel(item.advance_date) : '',
      second_payment: item.second_payment,
      second_date: item.second_date ? formatDateForExcel(item.second_date) : '',
      third_payment: item.third_payment,
      third_date: item.third_date ? formatDateForExcel(item.third_date) : '',
      final_payment: item.final_payment,
      final_date: item.final_date ? formatDateForExcel(item.final_date) : '',
      other_payments: item.other_payments,
      other_dates: item.other_dates,
      balance_fee: item.balance_fee,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Selected Payment Report");

    const currentDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `selected_payment_breakdown_report_${currentDate}.xlsx`);
  };

  const handlePrintSelected = () => {
    if (selectedRows.length === 0) {
      alert('Please select payment records to print');
      return;
    }
    setShowPrintView(true);
    setTimeout(() => {
      window.print();
      setShowPrintView(false);
    }, 100);
  };

  const handleDeleteSelected = () => {
    // This would typically call a delete function
    console.log('Delete selected payment records:', selectedRows);
    setSelectedRows([]);
  };

  const totalStudents = filteredBreakdown.length;
  const totalCourseFees = filteredBreakdown.reduce((sum, item) => sum + item.course_fee, 0);
  const totalAdvancePayments = filteredBreakdown.reduce((sum, item) => sum + item.advance_payment, 0);
  const totalSecondPayments = filteredBreakdown.reduce((sum, item) => sum + item.second_payment, 0);
  const totalThirdPayments = filteredBreakdown.reduce((sum, item) => sum + item.third_payment, 0);
  const totalFinalPayments = filteredBreakdown.reduce((sum, item) => sum + item.final_payment, 0);
  const totalOtherPayments = filteredBreakdown.reduce((sum, item) => sum + item.other_payments, 0);
  const totalBalanceFee = filteredBreakdown.reduce((sum, item) => sum + item.balance_fee, 0);
  const totalPaidAmount = totalAdvancePayments + totalSecondPayments + totalThirdPayments + totalFinalPayments + totalOtherPayments;

  // Get unique payment stages, modes, and student statuses
  const paymentStages = [...new Set(payments.map(p => p.stage))].filter(stage => stage && stage.trim() !== '');
  const paymentModes = [...new Set(payments.map(p => p.payment_mode))].filter(mode => mode && mode.trim() !== '');
  const studentStatuses = ['Attended Online', 'Attend sessions', 'Attended F2F', 'Exam cycle', 'Awaiting results', 'Pass', 'Fail'];

  const handleExport = () => {
    const exportData = filteredBreakdown.map((item) => ({
      sl_number: item.sl_number,
      student_id: item.student_id,
      student_name: item.student_name,
      course_title: item.course_title,
      stage: item.stage,
      student_status: item.student_status,
      course_fee: item.course_fee,
      advance_payment: item.advance_payment,
      advance_date: item.advance_date ? formatDateForExcel(item.advance_date) : '',
      second_payment: item.second_payment,
      second_date: item.second_date ? formatDateForExcel(item.second_date) : '',
      third_payment: item.third_payment,
      third_date: item.third_date ? formatDateForExcel(item.third_date) : '',
      final_payment: item.final_payment,
      final_date: item.final_date ? formatDateForExcel(item.final_date) : '',
      other_payments: item.other_payments,
      other_dates: item.other_dates,
      balance_fee: item.balance_fee,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payment Report");

    const currentDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `payment_breakdown_report_${currentDate}.xlsx`);
  };

  const handlePrint = () => {
    // window.print();
    setShowPrintView(true);
    setTimeout(() => {
      window.print();
      setShowPrintView(false);
    }, 100);
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      month: 'all',
      year: new Date().getFullYear().toString(),
      stage: 'all',
      paymentMode: 'all',
      student: 'all',
      studentStatus: 'all',
      course: 'all',
      batch: 'all',
      country: 'all',
      balanceFilter: 'all',
    });
    setSortBy('payment_date');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // Date range helper functions
  const setTodayRange = () => {
    const today = new Date().toISOString().split('T')[0];
    setFilters(prev => ({
      ...prev,
      dateFrom: today,
      dateTo: today
    }));
    setCurrentPage(1);
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
    setCurrentPage(1);
  };

  const isAllSelected = filteredBreakdown.length > 0 && selectedRows.length === filteredBreakdown.length;
  const isPartialSelected = selectedRows.length > 0 && selectedRows.length < filteredBreakdown.length;

  if (loading) {
    return <div className="p-6 text-center">Loading payment reports...</div>;
  }

  return (
    <div className="space-y-6 payment-reports-page">
      {/* Print Content - Hidden on screen, visible only when printing */}
      { showPrintView && (<div className="payment-reports-print-content" style={{ display: 'none' }}>
        <div className="payment-reports-print-header">
          <div className="payment-reports-print-title">
            Nurse Assist International (NAI)
          </div>
          <div className="payment-reports-print-subtitle">
            Payment Breakdown Report
          </div>
          <div className="payment-reports-print-date">
            Generated on: {new Date().toLocaleDateString()}
          </div>
        </div>

        <div className="payment-reports-print-summary">
          <h3>Report Summary</h3>
          <p>Total Selected Records: {selectedPaymentData.length > 0 ? selectedPaymentData.length : filteredBreakdown.length}</p>
          <p>Total Course Fees: ${(selectedPaymentData.length > 0 ? selectedPaymentData : filteredBreakdown).reduce((sum, item) => sum + item.course_fee, 0).toLocaleString()}</p>
          <p>Total Advance Payments: ${(selectedPaymentData.length > 0 ? selectedPaymentData : filteredBreakdown).reduce((sum, item) => sum + item.advance_payment, 0).toLocaleString()}</p>
          <p>Total Second Payments: ${(selectedPaymentData.length > 0 ? selectedPaymentData : filteredBreakdown).reduce((sum, item) => sum + item.second_payment, 0).toLocaleString()}</p>
          <p>Total Third Payments: ${(selectedPaymentData.length > 0 ? selectedPaymentData : filteredBreakdown).reduce((sum, item) => sum + item.third_payment, 0).toLocaleString()}</p>
          <p>Total Final Payments: ${(selectedPaymentData.length > 0 ? selectedPaymentData : filteredBreakdown).reduce((sum, item) => sum + item.final_payment, 0).toLocaleString()}</p>
          <p>Total Other Payments: ${(selectedPaymentData.length > 0 ? selectedPaymentData : filteredBreakdown).reduce((sum, item) => sum + item.other_payments, 0).toLocaleString()}</p>
          <p>Total Balance Fees: ${(selectedPaymentData.length > 0 ? selectedPaymentData : filteredBreakdown).reduce((sum, item) => sum + item.balance_fee, 0).toLocaleString()}</p>
        </div>

        <table className="payment-reports-print-table">
          <thead>
            <tr>
              <th rowSpan={2}>Sl No.</th>
              <th rowSpan={2}>Student ID</th>
              <th rowSpan={2}>Student Name</th>
              <th rowSpan={2}>Course</th>
              <th rowSpan={2}>Course Fee</th>
              <th colSpan={10} style={{textAlign:'center'}}>Payments</th>
              <th rowSpan={2}>Balance Fee</th>
            </tr>
            <tr>
            <th>Advance</th>
              <th>Date</th>
              <th>Second</th>
              <th>Date</th>
              <th>Third</th>
              <th>Date</th>
              <th>Final</th>
              <th>Date</th>
              <th>Other</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {(selectedPaymentData.length > 0 ? selectedPaymentData : filteredBreakdown).map((item) => (
              <tr key={item.student_id}>
                <td>{item.sl_number}</td>
                <td>{item.student_id}</td>
                <td>{item.student_name}</td>
                <td>{item.course_title}</td>
                <td>${item.course_fee.toLocaleString()}</td>
                <td>${item.advance_payment.toLocaleString()}</td>
                <td>{item.advance_date ? formatDateForExcel(item.advance_date) : '-'}</td>
                <td>${item.second_payment.toLocaleString()}</td>
                <td>{item.second_date ? formatDateForExcel(item.second_date) : '-'}</td>
                <td>${item.third_payment.toLocaleString()}</td>
                <td>{item.third_date ? formatDateForExcel(item.third_date) : '-'}</td>
                <td>${item.final_payment.toLocaleString()}</td>
                <td>{item.final_date ? formatDateForExcel(item.final_date) : '-'}</td>
                <td>${item.other_payments.toLocaleString()}</td>
                <td>{item.other_dates || '-'}</td>
                <td>${item.balance_fee.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>)}

      {/* Filters Card */}
      { !showPrintView && (<Card className="shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Filter className="h-5 w-5" />
            Payment Report Filters
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

            {/* Payment Stage Filter */}
            <div className="space-y-2">
              <Label>Payment Stage</Label>
              <Select value={filters.stage} onValueChange={(value) => setFilters(prev => ({ ...prev, stage: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {paymentStages.map(stage => (
                    <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Student Status Filter */}
            <div className="space-y-2">
              <Label>Student Status</Label>
              <Select value={filters.studentStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, studentStatus: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {studentStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
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

            {/* Balance Filter */}
            <div className="space-y-2">
              <Label>Balance Status</Label>
              <Select value={filters.balanceFilter} onValueChange={(value) => setFilters(prev => ({ ...prev, balanceFilter: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All balance status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="with_balance">With Balance Due</SelectItem>
                  <SelectItem value="no_balance">No Balance Due</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Student Filter */}
            <div className="space-y-2">
              <Label>Student</Label>
              <Select value={filters.student} onValueChange={(value) => setFilters(prev => ({ ...prev, student: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name} ({student.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment_date">Payment Date</SelectItem>
                  <SelectItem value="student_status">Student Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={clearFilters} variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Clear Filters
            </Button>
            <Button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} variant="outline">
              Sort: {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
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
      </Card>)}

      {/* Payment Summary Cards - Updated with all payment stages */}
      { !showPrintView && (<div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-blue-100 text-sm">Students</p>
              <p className="text-xl font-bold">{totalStudents}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-purple-100 text-sm">Course Fees</p>
              <p className="text-xl font-bold">${totalCourseFees.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-green-100 text-sm">Advance</p>
              <p className="text-xl font-bold">${totalAdvancePayments.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-yellow-100 text-sm">Second</p>
              <p className="text-xl font-bold">${totalSecondPayments.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-indigo-100 text-sm">Third</p>
              <p className="text-xl font-bold">${totalThirdPayments.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-orange-100 text-sm">Final</p>
              <p className="text-xl font-bold">${totalFinalPayments.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-pink-100 text-sm">Other</p>
              <p className="text-xl font-bold">${totalOtherPayments.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-red-100 text-sm">Balance</p>
              <p className="text-xl font-bold">${totalBalanceFee.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>)}

      {/* Pagination Controls Top */}
      {!showPrintView && (
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
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} payment records
            </span>
          </div>
        </div>
      )}

      {/* Selection Actions */}
      {selectedRows.length > 0 && (
        <Card className="shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">
                {selectedRows.length} record{selectedRows.length > 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-2">
                <Button onClick={handleBulkExport} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4" />
                  Export Selected
                </Button>
                <Button onClick={handlePrintSelected} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <Printer className="h-4 w-4" />
                  Print Selected
                </Button>
                <Button onClick={handleDeleteSelected} variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </Button>
                <Button onClick={() => setSelectedRows([])} variant="outline">
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Payment Breakdown Table */}
      { !showPrintView && (<Card className="shadow-lg no-print">
        <CardHeader>
          <CardTitle>Payment Breakdown Report ({totalStudents} students)</CardTitle>
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
                  <TableHead className="w-16">Sl No.</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Course Fee</TableHead>
                  <TableHead>Advance Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Second Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Third Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Final Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Other Payments</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Balance Fee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentBreakdown.map((item) => (
                  <TableRow 
                    key={item.student_id}
                    className={selectedRows.includes(item.student_id) ? 'bg-blue-50' : ''}
                  >
                    <TableCell>
                      <Checkbox 
                        checked={selectedRows.includes(item.student_id)}
                        onCheckedChange={(checked) => handleSelectRow(item.student_id, !!checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.sl_number}</TableCell>
                    <TableCell>{item.student_id}</TableCell>
                    <TableCell className="font-medium">{item.student_name}</TableCell>
                    <TableCell>{item.course_title}</TableCell>
                    <TableCell className="font-bold">${item.course_fee.toLocaleString()}</TableCell>
                    <TableCell>${item.advance_payment.toLocaleString()}</TableCell>
                    <TableCell>{item.advance_date ? formatDateForExcel(item.advance_date) : '-'}</TableCell>
                    <TableCell>${item.second_payment.toLocaleString()}</TableCell>
                    <TableCell>{item.second_date ? formatDateForExcel(item.second_date) : '-'}</TableCell>
                    <TableCell>${item.third_payment.toLocaleString()}</TableCell>
                    <TableCell>{item.third_date ? formatDateForExcel(item.third_date) : '-'}</TableCell>
                    <TableCell>${item.final_payment.toLocaleString()}</TableCell>
                    <TableCell>{item.final_date ? formatDateForExcel(item.final_date) : '-'}</TableCell>
                    <TableCell>${item.other_payments.toLocaleString()}</TableCell>
                    <TableCell className="max-w-32 truncate" title={item.other_dates}>
                      {item.other_dates || '-'}
                    </TableCell>
                    <TableCell className={`font-bold ${item.balance_fee > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${item.balance_fee.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Totals Row */}
            {filteredBreakdown.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border-t-2 border-gray-200">
                <div className="grid grid-cols-8 gap-4 text-sm font-bold">
                  <div>Total Students: {totalStudents}</div>
                  <div>Course Fees: ${totalCourseFees.toLocaleString()}</div>
                  <div>Advance: ${totalAdvancePayments.toLocaleString()}</div>
                  <div>Second: ${totalSecondPayments.toLocaleString()}</div>
                  <div>Third: ${totalThirdPayments.toLocaleString()}</div>
                  <div>Final: ${totalFinalPayments.toLocaleString()}</div>
                  <div>Other: ${totalOtherPayments.toLocaleString()}</div>
                  <div className={totalBalanceFee > 0 ? 'text-red-600' : 'text-green-600'}>
                    Balance: ${totalBalanceFee.toLocaleString()}
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <div className="text-lg font-bold text-blue-600">
                    Total Paid Amount: ${totalPaidAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {filteredBreakdown.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>No payment data found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>)}
    </div>
  );
};
