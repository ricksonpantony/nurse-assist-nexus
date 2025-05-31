
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Search, History, UserPlus } from "lucide-react";
import { Referral } from "@/hooks/useReferrals";
import { useStudents } from "@/hooks/useStudents";
import { supabase } from "@/integrations/supabase/client";

interface ReferralsTableProps {
  referrals: Referral[];
  onEdit: (referral: Referral) => void;
  onDelete: (referralId: string) => void;
  onViewHistory: (referral: Referral) => void;
}

export const ReferralsTable = ({ referrals, onEdit, onDelete, onViewHistory }: ReferralsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [referralStats, setReferralStats] = useState<Record<string, { studentCount: number; totalPayments: number }>>({});
  const { students } = useStudents();

  useEffect(() => {
    const fetchReferralStats = async () => {
      if (referrals.length === 0) return;
      
      const stats: Record<string, { studentCount: number; totalPayments: number }> = {};
      
      for (const referral of referrals) {
        try {
          const referredStudents = students.filter(student => student.referral_id === referral.id);
          
          const { data: payments, error } = await supabase
            .from('referral_payments')
            .select('amount')
            .eq('referral_id', referral.id);
          
          if (error) {
            console.error('Error fetching payments for referral:', referral.id, error);
          }
          
          const totalPayments = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
          
          stats[referral.id] = {
            studentCount: referredStudents.length,
            totalPayments: totalPayments
          };
        } catch (error) {
          console.error('Error calculating stats for referral:', referral.id, error);
          stats[referral.id] = {
            studentCount: 0,
            totalPayments: 0
          };
        }
      }
      
      setReferralStats(stats);
    };

    if (referrals.length > 0 && students.length >= 0) {
      fetchReferralStats();
    }
  }, [referrals, students]);

  const filteredReferrals = referrals.filter(referral => 
    referral.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referral.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referral.phone.includes(searchTerm) ||
    referral.referral_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search referrals by ID, name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-50">
              <TableHead className="font-semibold text-blue-900">Referral ID</TableHead>
              <TableHead className="font-semibold text-blue-900">Name</TableHead>
              <TableHead className="font-semibold text-blue-900">Email</TableHead>
              <TableHead className="font-semibold text-blue-900">Phone</TableHead>
              <TableHead className="font-semibold text-blue-900">Total Students Referred</TableHead>
              <TableHead className="font-semibold text-blue-900">Total Referral Payment Received</TableHead>
              <TableHead className="font-semibold text-blue-900 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReferrals.map((referral) => {
              const stats = referralStats[referral.id] || { studentCount: 0, totalPayments: 0 };
              
              return (
                <TableRow key={referral.id} className="hover:bg-blue-50 transition-colors">
                  <TableCell className="font-medium text-blue-600">{referral.referral_id}</TableCell>
                  <TableCell className="font-medium">{referral.full_name}</TableCell>
                  <TableCell className="text-gray-600">{referral.email}</TableCell>
                  <TableCell>{referral.phone}</TableCell>
                  <TableCell className="text-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                      {stats.studentCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                      ${stats.totalPayments.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onViewHistory(referral)}
                        className="gap-1 text-blue-600 hover:bg-blue-50 border-blue-200"
                      >
                        <History className="h-4 w-4" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(referral)}>
                        <Edit className="h-4 w-4 text-orange-600" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(referral.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredReferrals.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          {referrals.length === 0 ? (
            <p>No referrals found. Add your first referral to get started.</p>
          ) : (
            <p>No referrals found matching your search criteria.</p>
          )}
        </div>
      )}
    </div>
  );
};
