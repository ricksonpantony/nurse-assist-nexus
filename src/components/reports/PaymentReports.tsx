
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useStudents } from '@/hooks/useStudents';
import { Download, FileText, Search, CreditCard } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Payment {
  id: string;
  student_id: string;
  payment_date: string;
  stage: string;
  amount: number;
  payment_mode: string;
}

export const PaymentReports = () => {
  const { students } = useStudents();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
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

  // Get unique stages and payment modes for filters
  const uniqueStages = useMemo(() => {
    const stages = payments.map(p => p.stage).filter(Boolean);
    return [...new Set(stages)];
  }, [payments]);

  const uniqueModes = useMemo(() => {
    const modes = payments.map(p => p.payment_mode).filter(Boolean);
    return [...new Set(modes)];
  }, [payments]);

  // Filter and sort payments
  const filteredPayments = useMemo(() => {
    let filtered = payments.filter(payment => {
      const student = students.find(s => s.id === payment.student_id);
      const matchesSearch = student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student?.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStage = stageFilter === 'all' || payment.stage === stageFilter;
      const matchesMode = modeFilter === 'all' || payment.payment_mode === modeFilter;
      
      return matchesSearch && matchesStage && matchesMode;
    });

    // Sort payments
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime();
        case 'amount':
          return b.amount - a.amount;
        case 'stage':
          return (a.stage || '').localeCompare(b.stage || '');
        case 'mode':
          return (a.payment_mode || '').localeCompare(b.payment_mode || '');
        case 'student':
          const studentA = students.find(s => s.id === a.student_id);
          const studentB = students.find(s => s.id === b.student_id);
          return (studentA?.full_name || '').localeCompare(studentB?.full_name || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [payments, students, searchTerm, stageFilter, modeFilter, sortBy]);

  const exportToExcel = () => {
    const exportData = filteredPayments.map(payment => {
      const student = students.find(s => s.id === payment.student_id);
      return {
        'Payment ID': payment.id,
        'Student Name': student?.full_name || 'Unknown',
        'Student ID': student?.student_id || 'Unknown',
        'Student Email': student?.email || 'Unknown',
        'Payment Date': new Date(payment.payment_date).toLocaleDateString(),
        'Stage': payment.stage || '',
        'Amount': payment.amount,
        'Payment Mode': payment.payment_mode || ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payment Report');
    XLSX.writeFile(wb, `payment-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const printReport = () => {
    window.print();
  };

  const getStageBadgeVariant = (stage: string) => {
    switch (stage) {
      case 'registration': return 'default';
      case 'first-installment': return 'secondary';
      case 'second-installment': return 'outline';
      case 'final-payment': return 'destructive';
      default: return 'outline';
    }
  };

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);

  if (loading) {
    return <div className="p-6 text-center">Loading payment reports...</div>;
  }

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
            <CreditCard className="h-5 w-5" />
            Payment Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {uniqueStages.map(stage => (
                  <SelectItem key={stage} value={stage}>
                    {stage?.replace('-', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={modeFilter} onValueChange={setModeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Modes</SelectItem>
                {uniqueModes.map(mode => (
                  <SelectItem key={mode} value={mode}>
                    {mode?.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Payment Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="stage">Stage</SelectItem>
                <SelectItem value="mode">Payment Mode</SelectItem>
                <SelectItem value="student">Student Name</SelectItem>
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

            <div className="text-sm font-medium">
              Total: ${totalAmount.toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <div className="print-area">
        <div className="print-header">
          <h1 className="text-2xl font-bold">Payment Report</h1>
          <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
          <p className="text-sm text-gray-500">Total Payments: {filteredPayments.length}</p>
          <p className="text-sm text-gray-500">Total Amount: ${totalAmount.toLocaleString()}</p>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <table className="w-full print-table">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Mode
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment, index) => {
                    const student = students.find(s => s.id === payment.student_id);
                    return (
                      <tr key={payment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {payment.id.slice(0, 8)}...
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {student?.full_name || 'Unknown Student'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student?.student_id || 'Unknown ID'}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge variant={getStageBadgeVariant(payment.stage)}>
                            {payment.stage?.replace('-', ' ').toUpperCase() || 'Unknown'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${payment.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.payment_mode?.toUpperCase() || 'Unknown'}
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
