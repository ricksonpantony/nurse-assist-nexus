
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, Search, History, UserPlus } from "lucide-react";
import { Referral } from "@/hooks/useReferrals";
import { useStudents } from "@/hooks/useStudents";
import { supabase } from "@/integrations/supabase/client";
import { SingleDeleteConfirmationModal } from "@/components/ui/single-delete-confirmation-modal";
import { DeleteConfirmationModal } from "@/components/students/DeleteConfirmationModal";

interface ReferralsTableProps {
  referrals: Referral[];
  onEdit: (referral: Referral) => void;
  onDelete: (referralId: string) => void;
  onViewHistory: (referral: Referral) => void;
  onMultiDelete?: (referralIds: string[]) => void;
}

export const ReferralsTable = ({ referrals, onEdit, onDelete, onViewHistory, onMultiDelete }: ReferralsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [referralStats, setReferralStats] = useState<Record<string, { studentCount: number; totalPayments: number }>>({});
  const [selectedReferrals, setSelectedReferrals] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMultiDeleteModal, setShowMultiDeleteModal] = useState(false);
  const [referralToDelete, setReferralToDelete] = useState<Referral | null>(null);
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReferrals(filteredReferrals.map(referral => referral.id));
    } else {
      setSelectedReferrals([]);
    }
  };

  const handleSelectReferral = (referralId: string, checked: boolean) => {
    if (checked) {
      setSelectedReferrals(prev => [...prev, referralId]);
    } else {
      setSelectedReferrals(prev => prev.filter(id => id !== referralId));
    }
  };

  const handleSingleDelete = (referral: Referral) => {
    setReferralToDelete(referral);
    setShowDeleteModal(true);
  };

  const handleMultiDelete = () => {
    if (selectedReferrals.length > 0) {
      setShowMultiDeleteModal(true);
    }
  };

  const confirmSingleDelete = () => {
    if (referralToDelete) {
      onDelete(referralToDelete.id);
      setReferralToDelete(null);
    }
  };

  const confirmMultiDelete = () => {
    if (onMultiDelete && selectedReferrals.length > 0) {
      onMultiDelete(selectedReferrals);
      setSelectedReferrals([]);
    }
  };

  return (
    <>
      <Card className="bg-white/70 backdrop-blur-sm border-blue-200/50 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Referral Partners
            </CardTitle>
            {selectedReferrals.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleMultiDelete}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedReferrals.length})
              </Button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search referrals by ID, name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-blue-200 focus:border-blue-400 bg-white/80"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50/50 border-b border-blue-200/30">
                  <TableHead className="font-semibold text-blue-900 w-12">
                    <Checkbox
                      checked={selectedReferrals.length === filteredReferrals.length && filteredReferrals.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-blue-900 w-16">SL</TableHead>
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
                {filteredReferrals.map((referral, index) => {
                  const stats = referralStats[referral.id] || { studentCount: 0, totalPayments: 0 };
                  const isSelected = selectedReferrals.includes(referral.id);
                  
                  return (
                    <TableRow key={referral.id} className="hover:bg-blue-50/30 transition-colors border-b border-blue-100/30">
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectReferral(referral.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-gray-600">{index + 1}</TableCell>
                      <TableCell className="font-medium text-blue-600">{referral.referral_id}</TableCell>
                      <TableCell className="font-medium text-gray-800">{referral.full_name}</TableCell>
                      <TableCell className="text-gray-600">{referral.email}</TableCell>
                      <TableCell className="text-gray-600">{referral.phone}</TableCell>
                      <TableCell className="text-center">
                        <span className="bg-blue-100/80 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {stats.studentCount}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="bg-green-100/80 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          ${stats.totalPayments.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onViewHistory(referral)}
                            className="gap-1 text-blue-600 hover:bg-blue-50 border-blue-200 hover:border-blue-300 transition-all duration-200"
                          >
                            <History className="h-4 w-4" />
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onEdit(referral)}
                            className="text-orange-600 hover:bg-orange-50 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleSingleDelete(referral)}
                            className="text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
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
              <div className="flex flex-col items-center space-y-4">
                <UserPlus className="h-16 w-16 text-gray-300" />
                <div>
                  {referrals.length === 0 ? (
                    <>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">No referrals yet</h3>
                      <p className="text-gray-500">Add your first referral partner to get started.</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">No matching results</h3>
                      <p className="text-gray-500">No referrals found matching your search criteria.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Single Delete Modal */}
      <SingleDeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setReferralToDelete(null);
        }}
        onConfirm={confirmSingleDelete}
        title="Delete Referral"
        description="Are you sure you want to delete this referral? This action cannot be undone."
        itemName={referralToDelete?.full_name}
      />

      {/* Multi Delete Modal */}
      <DeleteConfirmationModal
        isOpen={showMultiDeleteModal}
        onClose={() => setShowMultiDeleteModal(false)}
        onConfirm={confirmMultiDelete}
        count={selectedReferrals.length}
        studentNames={selectedReferrals.map(id => {
          const referral = referrals.find(r => r.id === id);
          return referral?.full_name || 'Unknown';
        })}
      />
    </>
  );
};
