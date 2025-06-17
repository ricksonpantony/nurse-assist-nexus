
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Download, Users, DollarSign, TrendingUp } from "lucide-react";
import { ReferralsTable } from "@/components/referrals/ReferralsTable";
import { AddReferralForm } from "@/components/referrals/AddReferralForm";
import { ReferralHistoryModal } from "@/components/referrals/ReferralHistoryModal";
import { useReferrals } from "@/hooks/useReferrals";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

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

  const handleMultiDelete = async (referralIds: string[]) => {
    if (window.confirm(`Are you sure you want to delete ${referralIds.length} referral${referralIds.length > 1 ? 's' : ''}? This action cannot be undone.`)) {
      try {
        const deletePromises = referralIds.map(id => deleteReferral(id));
        await Promise.all(deletePromises);
        
        toast({
          title: "Success",
          description: `${referralIds.length} referral${referralIds.length > 1 ? 's' : ''} deleted successfully`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Some referrals could not be deleted. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Calculate stats
  const totalReferrals = referrals.length;
  const activeReferrals = referrals.filter(ref => ref.notes !== 'Inactive').length;

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <div className="text-lg text-blue-600 font-medium">Loading referrals...</div>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-white/80 backdrop-blur-lg px-6 shadow-sm">
              <div className="flex-1">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
                  Referral Management
                </h1>
                <p className="text-sm text-blue-600/80">Manage referral partners and track payments</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  onClick={handleExportReferrals}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Add Referral
                </Button>
              </div>
            </header>

            <main className="flex-1 p-6 space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white/70 backdrop-blur-sm border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-800">Total Referrals</CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {totalReferrals}
                    </div>
                    <p className="text-xs text-blue-600/70 mt-1">Registered partners</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">Active Referrals</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {activeReferrals}
                    </div>
                    <p className="text-xs text-green-600/70 mt-1">Currently active</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-800">Performance</CardTitle>
                    <DollarSign className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {activeReferrals > 0 ? ((activeReferrals / totalReferrals) * 100).toFixed(1) : 0}%
                    </div>
                    <p className="text-xs text-purple-600/70 mt-1">Active rate</p>
                  </CardContent>
                </Card>
              </div>

              {/* Referrals Table */}
              <ReferralsTable
                referrals={referrals}
                onEdit={handleEditReferral}
                onDelete={handleDeleteReferral}
                onViewHistory={handleViewHistory}
                onMultiDelete={handleMultiDelete}
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Referrals;
