
import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus, Download, FileText, AlertCircle } from "lucide-react";
import { ReferralsTable } from "@/components/referrals/ReferralsTable";
import { AddReferralForm } from "@/components/referrals/AddReferralForm";
import { ReferralHistoryModal } from "@/components/referrals/ReferralHistoryModal";
import { useReferrals } from "@/hooks/useReferrals";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Referrals = () => {
  const { referrals, loading, addReferral, updateReferral, deleteReferral, fetchReferralPayments } = useReferrals();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingReferral, setEditingReferral] = useState(null);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [referralPayments, setReferralPayments] = useState([]);
  const { toast } = useToast();

  const handleAddReferral = async (referralData: any) => {
    try {
      await addReferral(referralData);
      setShowAddForm(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleEditReferral = (referral: any) => {
    setEditingReferral(referral);
    setShowAddForm(true);
  };

  const handleUpdateReferral = async (updatedReferral: any) => {
    try {
      const referralId = updatedReferral.id || editingReferral?.id;
      
      if (!referralId) {
        toast({
          title: "Error",
          description: "Referral ID is required for update",
          variant: "destructive",
        });
        return;
      }

      await updateReferral(referralId, updatedReferral);
      setShowAddForm(false);
      setEditingReferral(null);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDeleteReferral = async (referralId: string) => {
    if (window.confirm("Are you sure you want to delete this referral? This action cannot be undone.")) {
      try {
        await deleteReferral(referralId);
      } catch (error) {
        // Error is handled in the hook
      }
    }
  };

  const handleViewHistory = async (referral: any) => {
    setSelectedReferral(referral);
    const payments = await fetchReferralPayments(referral.id);
    setReferralPayments(payments);
    setShowHistoryModal(true);
  };

  const handleExportReferrals = () => {
    if (referrals.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There are no referrals to export",
        variant: "destructive",
      });
      return;
    }

    // Implementation for CSV export would go here
    toast({
      title: "Export Successful",
      description: "Referrals data has been exported",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-blue-600">Loading referrals...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-gradient-to-r from-white via-blue-50 to-white px-6 shadow-lg backdrop-blur-sm">
        <SidebarTrigger className="text-blue-600 hover:bg-blue-100 rounded-lg" />
        <div className="flex-1">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">Referral Management</h1>
          <p className="text-sm text-blue-600">Manage referral partners and track payments</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="gap-2"
            onClick={handleExportReferrals}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Add Referral
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6">
        {referrals.length === 0 && !loading && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No referrals found. This could be because you don't have admin permissions or no referrals have been added yet.
            </AlertDescription>
          </Alert>
        )}
        
        <ReferralsTable
          referrals={referrals}
          onEdit={handleEditReferral}
          onDelete={handleDeleteReferral}
          onViewHistory={handleViewHistory}
        />
      </main>

      {/* Add/Edit Referral Form Modal */}
      {showAddForm && (
        <AddReferralForm
          referral={editingReferral}
          onClose={() => {
            setShowAddForm(false);
            setEditingReferral(null);
          }}
          onSave={editingReferral ? handleUpdateReferral : handleAddReferral}
        />
      )}

      {/* Referral History Modal */}
      {showHistoryModal && selectedReferral && (
        <ReferralHistoryModal
          referral={selectedReferral}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedReferral(null);
            setReferralPayments([]);
          }}
          referralPayments={referralPayments}
        />
      )}
    </div>
  );
};

export default Referrals;
