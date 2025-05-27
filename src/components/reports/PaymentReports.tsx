
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
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Download, Filter, Printer } from 'lucide-react';
import { formatDateForExcel } from '@/utils/excelUtils';
import * as XLSX from 'xlsx';

interface Payment {
  id: string;
  student_id: string;
  payment_date: string;
  stage: string;
  amount: number;
  payment_mode: string;
  student_name?: string;
  student_email?: string;
  course_title?: string;
}

export const PaymentReports = () => {
  const { students } = useStudents();
  const { courses } = useCourses();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    month: 'all',
    year: new Date().getFullYear().toString(),
    stage: 'all',
    paymentMode: 'all',
    student: 'all',
  });

  const [sortBy, setSortBy] = useState('payment_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch payments with student details
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .order('payment_date', { ascending: false });

        if (error) throw error;

        // Enrich payments with student and course details
        const enrichedPayments = data?.map(payment => {
          const student = students.find(s => s.id === payment.student_id);
          const course = student ? courses.find(c => c.id === student.course_id) : null;
          
          return {
            ...payment,
            student_name: student?.full_name || 'Unknown Student',
            student_email: student?.email || 'N/A',
            course_title: course?.title || 'No Course Assigned',
          };
        }) || [];

        setPayments(enrichedPayments);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (students.length > 0) {
      fetchPayments();
    }
  }, [students, courses]);

  // Filter and sort payments
  const filteredPayments = useMemo(() => {
    let filtered = [...payments];

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(payment => 
        new Date(payment.payment_date) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(payment => 
        new Date(payment.payment_date) <= new Date(filters.dateTo)
      );
    }

    // Filter by specific month/year
    if (filters.month && filters.month !== 'all' && filters.year) {
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.payment_date);
        return paymentDate.getMonth() === parseInt(filters.month) - 1 && 
               paymentDate.getFullYear() === parseInt(filters.year);
      });
    }

    // Filter by stage
    if (filters.stage && filters.stage !== 'all') {
      filtered = filtered.filter(payment => payment.stage === filters.stage);
    }

    // Filter by payment mode
    if (filters.paymentMode && filters.paymentMode !== 'all') {
      filtered = filtered.filter(payment => payment.payment_mode === filters.paymentMode);
    }

    // Filter by student
    if (filters.student && filters.student !== 'all') {
      filtered = filtered.filter(payment => payment.student_id === filters.student);
    }

    // Sort payments
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'payment_date':
          aValue = new Date(a.payment_date);
          bValue = new Date(b.payment_date);
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'student_name':
          aValue = a.student_name?.toLowerCase() || '';
          bValue = b.student_name?.toLowerCase() || '';
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
  }, [payments, filters, sortBy, sortOrder]);

  // Calculate totals
  const totalPayments = filteredPayments.length;
  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);

  // Get unique payment stages and modes, filter out empty/null values
  const paymentStages = [...new Set(payments.map(p => p.stage))]
    .filter(stage => stage && stage.trim() !== '');
  const paymentModes = [...new Set(payments.map(p => p.payment_mode))]
    .filter(mode => mode && mode.trim() !== '');

  const getStageBadge = (stage: string) => {
    const colors = {
      'Advance': 'bg-blue-100 text-blue-800',
      'Second': 'bg-green-100 text-green-800',
      'Third': 'bg-purple-100 text-purple-800',
      'Final': 'bg-orange-100 text-orange-800',
      'Other': 'bg-gray-100 text-gray-800',
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getModeBadge = (mode: string) => {
    const colors = {
      'Credit Card': 'bg-indigo-100 text-indigo-800',
      'Bank Transfer': 'bg-green-100 text-green-800',
      'Cash': 'bg-yellow-100 text-yellow-800',
      'Check': 'bg-purple-100 text-purple-800',
      'Online Payment': 'bg-blue-100 text-blue-800',
    };
    return colors[mode as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleExport = () => {
    const exportData = filteredPayments.map((payment, index) => ({
      serial_number: index + 1,
      student_id: payment.student_id,
      student_name: payment.student_name,
      student_email: payment.student_email,
      course_title: payment.course_title,
      payment_date: formatDateForExcel(payment.payment_date),
      stage: payment.stage,
      amount: payment.amount,
      payment_mode: payment.payment_mode,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payment Report");

    // Add totals row
    const totalRow = [
      { serial_number: '', student_id: '', student_name: '', student_email: '', course_title: '', payment_date: '', stage: 'TOTAL:', amount: totalAmount, payment_mode: `${totalPayments} payments` }
    ];
    XLSX.utils.sheet_add_json(ws, totalRow, { origin: -1, skipHeader: true });

    const currentDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `payment_report_${currentDate}.xlsx`);
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
      stage: 'all',
      paymentMode: 'all',
      student: 'all',
    });
  };

  if (loading) {
    return <div className="p-6 text-center">Loading payment reports...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card className="shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
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

            {/* Payment Mode Filter */}
            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <Select value={filters.paymentMode} onValueChange={(value) => setFilters(prev => ({ ...prev, paymentMode: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All modes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  {paymentModes.map(mode => (
                    <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                  ))}
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
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment_date">Payment Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="student_name">Student Name</SelectItem>
                  <SelectItem value="stage">Payment Stage</SelectItem>
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

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Payments</p>
                <p className="text-2xl font-bold">{totalPayments}</p>
              </div>
              <CreditCard className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Amount</p>
                <p className="text-2xl font-bold">${totalAmount.toLocaleString()}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-200" />
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

      {/* Payment Report Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Payment Report ({totalPayments} payments)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Mode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment, index) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{payment.student_id}</TableCell>
                    <TableCell className="font-medium">{payment.student_name}</TableCell>
                    <TableCell>{payment.course_title}</TableCell>
                    <TableCell>{formatDateForExcel(payment.payment_date)}</TableCell>
                    <TableCell>
                      <Badge className={getStageBadge(payment.stage)}>
                        {payment.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold">${payment.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getModeBadge(payment.payment_mode)}>
                        {payment.payment_mode}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Total Row */}
            {filteredPayments.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-t-2 border-gray-200">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total: {totalPayments} payments</span>
                  <span className="text-green-600">Total Amount: ${totalAmount.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
          
          {filteredPayments.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>No payments found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
