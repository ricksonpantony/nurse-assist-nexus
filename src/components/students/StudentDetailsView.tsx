import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Printer, Trash2, RefreshCw, Phone, Mail, MapPin, Calendar, CreditCard, User, GraduationCap, UserPlus, Plus } from "lucide-react";
import { useStudents } from "@/hooks/useStudents";
import { useReferrals } from "@/hooks/useReferrals";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { PaymentRecordForm } from "./PaymentRecordForm";
import { QuickAddReferralModal } from "./QuickAddReferralModal";

interface StudentDetailsViewProps {
  student: any;
  courses: any[];
  onClose: () => void;
  onRefresh: () => void;
  isPageView?: boolean;
}

export const StudentDetailsView = ({ 
  student, 
  courses, 
  onClose, 
  onRefresh, 
  isPageView = false 
}: StudentDetailsViewProps) => {
  const { deleteStudent, updateStudent } = useStudents();
  const { referrals, addReferralPayment } = useReferrals();
  const { toast } = useToast();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [selectedReferralId, setSelectedReferralId] = useState(student.referral_id || "");
  const [referralPaymentAmount, setReferralPaymentAmount] = useState("");
  const [filteredReferrals, setFilteredReferrals] = useState(referrals);
  const [searchTerm, setSearchTerm] = useState("");

  const course = courses.find(c => c.id === student.course_id);
  const selectedReferral = referrals.find(r => r.id === selectedReferralId);

  useEffect(() => {
    const filtered = referrals.filter(referral =>
      referral.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReferrals(filtered);
  }, [referrals, searchTerm]);

  const getStatusColor = (status: string) => {
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setIsPrintMode(false);
    }, 100);
  };

  const handleDeleteStudent = async () => {
    if (window.confirm(`Are you sure you want to delete ${student.full_name}? This action cannot be undone.`)) {
      try {
        await deleteStudent(student.id);
        toast({
          title: "Success",
          description: "Student deleted successfully",
        });
        onClose();
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const handlePaymentAdded = () => {
    setShowPaymentForm(false);
    onRefresh();
  };

  const handleReferralChange = async (referralId: string) => {
    setSelectedReferralId(referralId);
    
    try {
      await updateStudent(student.id, { referral_id: referralId });
      toast({
        title: "Success",
        description: "Referral information updated successfully",
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update referral information",
        variant: "destructive",
      });
    }
  };

  const handleReferralPaymentSubmit = async () => {
    if (!selectedReferralId || !referralPaymentAmount) {
      toast({
        title: "Validation Error",
        description: "Please select a referral and enter payment amount",
        variant: "destructive",
      });
      return;
    }

    try {
      await addReferralPayment({
        referral_id: selectedReferralId,
        student_id: student.id,
        amount: parseFloat(referralPaymentAmount),
        payment_date: new Date().toISOString(),
        payment_method: "Commission",
        notes: `Payment for student: ${student.full_name}`,
      });

      toast({
        title: "Success",
        description: "Referral payment added successfully",
      });

      setReferralPaymentAmount("");
      onRefresh();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleNewReferralAdded = (newReferral: any) => {
    setSelectedReferralId(newReferral.id);
    setShowReferralModal(false);
    handleReferralChange(newReferral.id);
    toast({
      title: "Success",
      description: "New referral added and linked to student",
    });
  };

  const totalPaid = student.payments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0;
  const remainingBalance = student.total_course_fee - totalPaid;

  const content = (
    <div className={`bg-white ${isPageView ? 'rounded-lg shadow-lg' : ''} ${isPrintMode ? 'print-mode' : ''}`}>
      {/* Header - Hidden in print mode */}
      {!isPrintMode && (
        <div className={`flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 ${isPageView ? 'rounded-t-lg' : ''} print:hidden`}>
          <div>
            <h2 className="text-2xl font-bold text-blue-900">Student Account</h2>
            <p className="text-blue-600">Complete student information and payment history</p>
          </div>
          <div className="flex gap-2">
            {!isPageView && (
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            {!isPageView && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Print Header - Only visible in print mode */}
      {isPrintMode && (
        <div className="print-only mb-6 text-center border-b pb-4">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Student Account Report</h1>
          <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
        </div>
      )}

      {/* Student Information */}
      <div className="p-6 space-y-6">
        {/* Personal Information Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-blue-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <div className="font-medium">{student.full_name}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Student ID</label>
              <div className="font-medium font-mono text-blue-600">{student.id}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{student.email}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{student.phone}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Passport ID</label>
              <div>{student.passport_id || 'Not provided'}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Country</label>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{student.country || 'Not specified'}</span>
              </div>
            </div>
            {student.address && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Address</label>
                <div>{student.address}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referral Information Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Referral Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="referral-select" className="text-sm font-medium text-gray-500">
                  Referral Name
                </Label>
                <div className="flex gap-2">
                  <Select value={selectedReferralId} onValueChange={handleReferralChange}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a referral partner" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Search referrals..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="mb-2"
                        />
                      </div>
                      {filteredReferrals.length > 0 ? (
                        filteredReferrals.map((referral) => (
                          <SelectItem key={referral.id} value={referral.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{referral.full_name}</span>
                              <span className="text-xs text-gray-500">{referral.email}</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500">No referrals found</div>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReferralModal(true)}
                    className="gap-1 whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4" />
                    Add New
                  </Button>
                </div>
                {selectedReferral && (
                  <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                    <p><strong>Contact:</strong> {selectedReferral.phone}</p>
                    <p><strong>Email:</strong> {selectedReferral.email}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="referral-payment" className="text-sm font-medium text-gray-500">
                  Referral Payment (Optional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="referral-payment"
                    type="number"
                    placeholder="Enter payment amount"
                    value={referralPaymentAmount}
                    onChange={(e) => setReferralPaymentAmount(e.target.value)}
                  />
                  <Button
                    size="sm"
                    onClick={handleReferralPaymentSubmit}
                    disabled={!selectedReferralId || !referralPaymentAmount}
                    className="whitespace-nowrap"
                  >
                    Add Payment
                  </Button>
                </div>
              </div>
            </div>

            {selectedReferral && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                  <UserPlus className="h-4 w-4" />
                  Linked Referral Partner
                </div>
                <div className="text-sm text-green-700">
                  This student is linked to <strong>{selectedReferral.full_name}</strong>. 
                  Any referral payments will be automatically synced to their account.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Academic Information Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Course</label>
              <div className="font-medium">
                {course ? course.title : 'No course assigned'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Current Status</label>
              <div>
                <Badge variant="outline" className={getStatusColor(student.status)}>
                  {student.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Join Date</label>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{formatDate(student.join_date)}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Class Start Date</label>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{formatDate(student.class_start_date)}</span>
              </div>
            </div>
            {student.batch_id && (
              <div>
                <label className="text-sm font-medium text-gray-500">Batch ID</label>
                <div>{student.batch_id}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Information Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-blue-600">Total Course Fee</label>
                <div className="text-2xl font-bold text-blue-900">${student.total_course_fee.toLocaleString()}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-green-600">Total Paid</label>
                <div className="text-2xl font-bold text-green-900">${totalPaid.toLocaleString()}</div>
              </div>
              <div className={`${remainingBalance > 0 ? 'bg-orange-50' : 'bg-gray-50'} p-4 rounded-lg`}>
                <label className={`text-sm font-medium ${remainingBalance > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                  Remaining Balance
                </label>
                <div className={`text-2xl font-bold ${remainingBalance > 0 ? 'text-orange-900' : 'text-gray-900'}`}>
                  ${remainingBalance.toLocaleString()}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Payment History</h4>
                {!isPrintMode && (
                  <Button
                    size="sm"
                    onClick={() => setShowPaymentForm(true)}
                    className="gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Add Payment
                  </Button>
                )}
              </div>

              {student.payments && student.payments.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Date</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Mode</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.payments.map((payment: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(payment.payment_date)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{payment.stage}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">${payment.amount.toLocaleString()}</TableCell>
                          <TableCell>{payment.payment_mode}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No payment records found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons - Hidden in print mode */}
        {!isPrintMode && (
          <div className="flex justify-end gap-2 pt-4 print:hidden">
            <Button variant="destructive" onClick={handleDeleteStudent} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Student
            </Button>
          </div>
        )}
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Payment Record</h3>
            <PaymentRecordForm
              studentId={student.id}
              currentStatus={student.status}
              onPaymentAdded={handlePaymentAdded}
            />
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShowPaymentForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Referral Modal */}
      {showReferralModal && (
        <QuickAddReferralModal
          isOpen={showReferralModal}
          onClose={() => setShowReferralModal(false)}
          onReferralAdded={handleNewReferralAdded}
        />
      )}
    </div>
  );

  if (isPageView) {
    return content;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {content}
      </div>
    </div>
  );
};
