
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Search, History, UserPlus } from "lucide-react";
import { Referral } from "@/hooks/useReferrals";

interface ReferralsTableProps {
  referrals: Referral[];
  onEdit: (referral: Referral) => void;
  onDelete: (referralId: string) => void;
  onViewHistory: (referral: Referral) => void;
}

export const ReferralsTable = ({ referrals, onEdit, onDelete, onViewHistory }: ReferralsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReferrals = referrals.filter(referral => 
    referral.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referral.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referral.phone.includes(searchTerm)
  );

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Search Controls */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search referrals by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Referrals Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-50">
              <TableHead className="font-semibold text-blue-900">Name</TableHead>
              <TableHead className="font-semibold text-blue-900">Email</TableHead>
              <TableHead className="font-semibold text-blue-900">Phone</TableHead>
              <TableHead className="font-semibold text-blue-900">Bank Details</TableHead>
              <TableHead className="font-semibold text-blue-900">Total Students</TableHead>
              <TableHead className="font-semibold text-blue-900">Total Payments</TableHead>
              <TableHead className="font-semibold text-blue-900 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReferrals.map((referral) => (
              <TableRow key={referral.id} className="hover:bg-blue-50 transition-colors">
                <TableCell className="font-medium">{referral.full_name}</TableCell>
                <TableCell className="text-gray-600">{referral.email}</TableCell>
                <TableCell>{referral.phone}</TableCell>
                <TableCell>
                  {referral.bank_name && (
                    <div className="text-sm">
                      <div className="font-medium">{referral.bank_name}</div>
                      {referral.bsb && <div className="text-gray-500">BSB: {referral.bsb}</div>}
                      {referral.account_number && <div className="text-gray-500">Acc: {referral.account_number}</div>}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                    0
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                    $0
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
                      History
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
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredReferrals.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No referrals found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};
