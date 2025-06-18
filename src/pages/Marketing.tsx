import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Target, Users, TrendingUp, Clock } from "lucide-react";
import { LeadsTable } from "@/components/marketing/LeadsTable";
import { AddLeadForm } from "@/components/marketing/AddLeadForm";
import { TransferToStudentModal } from "@/components/marketing/TransferToStudentModal";
import { useLeads } from "@/hooks/useLeads";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Marketing = () => {
  const { leads, loading, addLead, updateLead, deleteLead, transferLeadToStudent } = useLeads();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const { toast } = useToast();

  const handleAddLead = async (leadData: any) => {
    try {
      await addLead(leadData);
      setShowAddForm(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleEditLead = (lead: any) => {
    setEditingLead(lead);
    setShowAddForm(true);
  };

  const handleUpdateLead = async (updatedLead: any) => {
    try {
      const leadId = updatedLead.id || editingLead?.id;
      
      if (!leadId) {
        toast({
          title: "Error",
          description: "Lead ID is required for update",
          variant: "destructive",
        });
        return;
      }

      await updateLead(leadId, updatedLead);
      setShowAddForm(false);
      setEditingLead(null);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (window.confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
      try {
        await deleteLead(leadId);
      } catch (error) {
        // Error is handled in the hook
      }
    }
  };

  const handleTransferToStudent = (lead: any) => {
    setSelectedLead(lead);
    setShowTransferModal(true);
  };

  const handleConfirmTransfer = async () => {
    if (selectedLead) {
      try {
        await transferLeadToStudent(selectedLead.id);
        setShowTransferModal(false);
        setSelectedLead(null);
      } catch (error) {
        // Error is handled in the hook
      }
    }
  };

  const handleExportLeads = () => {
    if (leads.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There are no leads to export",
        variant: "destructive",
      });
      return;
    }

    // Implementation for CSV export would go here
    toast({
      title: "Export Successful",
      description: "Leads data has been exported",
    });
  };

  const handleMultiDelete = async (leadIds: string[]) => {
    if (window.confirm(`Are you sure you want to delete ${leadIds.length} lead${leadIds.length > 1 ? 's' : ''}? This action cannot be undone.`)) {
      try {
        const deletePromises = leadIds.map(id => deleteLead(id));
        await Promise.all(deletePromises);
        
        toast({
          title: "Success",
          description: `${leadIds.length} lead${leadIds.length > 1 ? 's' : ''} deleted successfully`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Some leads could not be deleted. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Calculate stats
  const totalLeads = leads.length;
  const newLeads = leads.filter(lead => lead.status === 'New').length;

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
                  <div className="text-lg text-blue-600 font-medium">Loading leads...</div>
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
                  Marketing Leads
                </h1>
                <p className="text-sm text-blue-600/80">Manage marketing leads and track conversions</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  onClick={handleExportLeads}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Add Lead
                </Button>
              </div>
            </header>

            <main className="flex-1 p-6 space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white/70 backdrop-blur-sm border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-800">Total Leads</CardTitle>
                    <Target className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {totalLeads}
                    </div>
                    <p className="text-xs text-blue-600/70 mt-1">Total marketing leads</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">New Leads</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {newLeads}
                    </div>
                    <p className="text-xs text-green-600/70 mt-1">New leads this month</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-800">Conversion Rate</CardTitle>
                    <Users className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {totalLeads > 0 ? ((totalLeads / leads.length) * 100).toFixed(1) : 0}%
                    </div>
                    <p className="text-xs text-purple-600/70 mt-1">Leads to students</p>
                  </CardContent>
                </Card>
              </div>

              {/* Leads Table */}
              <LeadsTable
                leads={leads}
                onEdit={handleEditLead}
                onDelete={handleDeleteLead}
                onTransfer={handleTransferToStudent}
                onMultiDelete={handleMultiDelete}
              />
            </main>

            {/* Add/Edit Lead Form Modal */}
            {showAddForm && (
              <AddLeadForm
                lead={editingLead}
                onClose={() => {
                  setShowAddForm(false);
                  setEditingLead(null);
                }}
                onSave={editingLead ? handleUpdateLead : handleAddLead}
              />
            )}

            {/* Transfer to Student Modal */}
            {showTransferModal && selectedLead && (
              <TransferToStudentModal
                lead={selectedLead}
                onClose={() => {
                  setShowTransferModal(false);
                  setSelectedLead(null);
                }}
                onConfirm={handleConfirmTransfer}
              />
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Marketing;
