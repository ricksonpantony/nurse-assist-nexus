
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Printer, RefreshCw, User, Phone, Mail, MapPin, CreditCard, Calendar, BookOpen } from "lucide-react";
import { useStudents, Student, Payment } from "@/hooks/useStudents";
import { useCourses } from "@/hooks/useCourses";
import { useReferrals } from "@/hooks/useReferrals";
import { useToast } from "@/hooks/use-toast";

const StudentAccount = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { students, fetchStudentPayments } = useStudents();
  const { courses } = useCourses();
  const { referrals } = useReferrals();
  const { toast } = useToast();
  const [studentPayments, setStudentPayments] = useState<Payment[]>([]);

  const student = students.find(s => s.id === studentId);
  const course = courses.find(c => c.id === student?.course_id);
  const referralPerson = referrals.find(r => r.id === student?.referral_id);

  useEffect(() => {
    if (student) {
      loadStudentPayments();
    }
  }, [student]);

  const loadStudentPayments = async () => {
    if (student) {
      try {
        const payments = await fetchStudentPayments(student.id);
        setStudentPayments(payments);
      } catch (error) {
        console.error('Error loading student payments:', error);
      }
    }
  };

  if (!student) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-blue-600">Student not found</div>
        </div>
      </div>
    );
  }

  const totalPaid = studentPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const remainingBalance = student.total_course_fee - totalPaid;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handlePrintAccount = () => {
    window.print();
  };

  const getStatusBadgeColor = (status: string) => {
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-gradient-to-r from-white via-blue-50 to-white px-6 shadow-lg backdrop-blur-sm print:hidden">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/students')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              {student.full_name}
            </h1>
            <p className="text-sm text-blue-600">Student ID: {student.id}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadStudentPayments} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrintAccount} className="gap-2">
              <Printer className="h-4 w-4" />
              Print Account
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Student Status */}
            <div className="flex justify-between items-center mb-6">
              <Badge variant="outline" className={`${getStatusBadgeColor(student.status)} text-lg px-4 py-2`}>
                {student.status}
              </Badge>
              <div className="text-right print:text-black">
                <p className="text-sm text-gray-600 print:text-black">
                  Generated: {new Date().toLocaleDateString('en-AU')}
                </p>
              </div>
            </div>

            {/* Personal Information */}
            <Card className="print:border print:border-gray-300 print:shadow-none">
              <CardHeader className="bg-blue-50 print:bg-gray-100">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-900 print:text-black">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600 print:text-black">Full Name</label>
                    <p className="text-gray-900 print:text-black font-medium">{student.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 print:text-black">Email</label>
                    <p className="text-gray-900 print:text-black">{student.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 print:text-black">Phone</label>
                    <p className="text-gray-900 print:text-black">{student.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 print:text-black">Passport/ID</label>
                    <p className="text-gray-900 print:text-black">{student.passport_id || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 print:text-black">Address</label>
                    <p className="text-gray-900 print:text-black">{student.address || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 print:text-black">Country</label>
                    <p className="text-gray-900 print:text-black">{student.country || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card className="print:border print:border-gray-300 print:shadow-none">
              <CardHeader className="bg-green-50 print:bg-gray-100">
                <CardTitle className="text-lg flex items-center gap-2 text-green-900 print:text-black">
                  <BookOpen className="h-5 w-5" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600 print:text-black">Course</label>
                    <p className="text-gray-900 print:text-black font-medium">{course ? course.title : 'Not assigned'}</p>
                    {course && (
                      <p className="text-sm text-gray-500 print:text-black">{course.period_months} months duration</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 print:text-black">Course Fee</label>
                    <p className="text-gray-900 print:text-black font-semibold">${student.total_course_fee.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 print:text-black">Join Date</label>
                    <p className="text-gray-900 print:text-black">{formatDate(student.join_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 print:text-black">Class Start Date</label>
                    <p className="text-gray-900 print:text-black">
                      {student.class_start_date ? formatDate(student.class_start_date) : 'Not scheduled'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 print:text-black">Installments</label>
                    <p className="text-gray-900 print:text-black">{student.installments || 1}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referral Information */}
            <Card className="print:border print:border-gray-300 print:shadow-none">
              <CardHeader className="bg-purple-50 print:bg-gray-100">
                <CardTitle className="text-lg flex items-center gap-2 text-purple-900 print:text-black">
                  <User className="h-5 w-5" />
                  Referral Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {referralPerson ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-600 print:text-black">Referred By</label>
                      <p className="text-gray-900 print:text-black font-medium">{referralPerson.full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 print:text-black">Contact Info</label>
                      <div className="text-gray-900 print:text-black">
                        <p>{referralPerson.email}</p>
                        <p>{referralPerson.phone}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-gray-600 print:text-black">Referral Status</label>
                    <p className="text-gray-900 print:text-black">Direct (No referral)</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="print:border print:border-gray-300 print:shadow-none">
              <CardHeader className="bg-yellow-50 print:bg-gray-100">
                <CardTitle className="text-lg flex items-center gap-2 text-yellow-900 print:text-black">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Payment Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-gray-50 print:bg-gray-100 rounded-lg">
                    <label className="text-sm font-medium text-gray-600 print:text-black">Total Course Fee</label>
                    <p className="text-2xl font-bold text-gray-900 print:text-black">${student.total_course_fee.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 print:bg-gray-100 rounded-lg">
                    <label className="text-sm font-medium text-gray-600 print:text-black">Total Paid</label>
                    <p className="text-2xl font-bold text-green-600 print:text-black">${totalPaid.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 print:bg-gray-100 rounded-lg">
                    <label className="text-sm font-medium text-gray-600 print:text-black">Remaining Balance</label>
                    <p className={`text-2xl font-bold ${remainingBalance > 0 ? 'text-red-600' : 'text-green-600'} print:text-black`}>
                      ${remainingBalance.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Payment History */}
                {studentPayments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b-2 border-gray-300">
                          <TableHead className="font-semibold text-gray-700 print:text-black">Date</TableHead>
                          <TableHead className="font-semibold text-gray-700 print:text-black">Stage</TableHead>
                          <TableHead className="font-semibold text-gray-700 print:text-black">Amount</TableHead>
                          <TableHead className="font-semibold text-gray-700 print:text-black">Payment Mode</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentPayments.map((payment, index) => (
                          <TableRow key={payment.id} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                            <TableCell className="text-gray-900 print:text-black">{formatDate(payment.payment_date)}</TableCell>
                            <TableCell className="text-gray-900 print:text-black">{payment.stage}</TableCell>
                            <TableCell className="text-gray-900 print:text-black font-medium">${Number(payment.amount).toFixed(2)}</TableCell>
                            <TableCell className="text-gray-900 print:text-black">{payment.payment_mode}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 print:text-black">
                    No payments recorded yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentAccount;
