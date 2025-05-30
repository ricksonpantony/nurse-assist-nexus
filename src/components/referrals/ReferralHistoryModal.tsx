
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { X, FileText, Download } from "lucide-react";
import { Referral, ReferralPayment } from "@/hooks/useReferrals";
import { useStudents } from "@/hooks/useStudents";

interface ReferralHistoryModalProps {
  referral: Referral;
  onClose: () => void;
  referralPayments: ReferralPayment[];
}

export const ReferralHistoryModal = ({ referral, onClose, referralPayments }: ReferralHistoryModalProps) => {
  const { students } = useStudents();
  
  const referredStudents = students.filter(student => student.referral_id === referral.id);
  const totalPayments = referralPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportReport = () => {
    // Implementation for CSV export would go here
    console.log('Exporting referral report...');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-blue-900">
              Referral History - {referral.full_name}
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrintReport}>
                <FileText className="h-4 w-4 mr-2" />
                Print Report
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{referredStudents.length}</div>
              <div className="text-sm text-blue-600">Total Students Referred</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-900">${totalPayments.toFixed(2)}</div>
              <div className="text-sm text-green-600">Total Payments Made</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">{referralPayments.length}</div>
              <div className="text-sm text-purple-600">Payment Records</div>
            </div>
          </div>

          {/* Referred Students */}
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Referred Students</h3>
            {referredStudents.length > 0 ? (
              <div className="bg-white rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="font-semibold text-blue-900">Student ID</TableHead>
                      <TableHead className="font-semibold text-blue-900">Name</TableHead>
                      <TableHead className="font-semibold text-blue-900">Email</TableHead>
                      <TableHead className="font-semibold text-blue-900">Status</TableHead>
                      <TableHead className="font-semibold text-blue-900">Join Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-mono text-sm">{student.id}</TableCell>
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{student.status}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(student.join_date)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No students referred yet.
              </div>
            )}
          </div>

          {/* Payment History */}
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Payment History</h3>
            {referralPayments.length > 0 ? (
              <div className="bg-white rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="font-semibold text-blue-900">Date</TableHead>
                      <TableHead className="font-semibold text-blue-900">Student</TableHead>
                      <TableHead className="font-semibold text-blue-900">Amount</TableHead>
                      <TableHead className="font-semibold text-blue-900">Method</TableHead>
                      <TableHead className="font-semibold text-blue-900">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referralPayments.map((payment) => {
                      const student = students.find(s => s.id === payment.student_id);
                      return (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.payment_date)}</TableCell>
                          <TableCell>{student ? student.full_name : 'Unknown Student'}</TableCell>
                          <TableCell className="font-semibold text-green-600">
                            ${Number(payment.amount).toFixed(2)}
                          </TableCell>
                          <TableCell>{payment.payment_method}</TableCell>
                          <TableCell>{payment.notes || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No payments made yet.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
