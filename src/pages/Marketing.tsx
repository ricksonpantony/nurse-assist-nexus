
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download } from "lucide-react";
import { LeadsTable } from "@/components/marketing/LeadsTable";
import { AddLeadForm } from "@/components/marketing/AddLeadForm";
import { LeadDetailsView } from "@/components/marketing/LeadDetailsView";
import { TransferToStudentModal } from "@/components/marketing/TransferToStudentModal";
import { useLeads, transferLeadToStudent } from "@/hooks/useLeads";
import { useCourses } from "@/hooks/useCourses";
import { useReferrals } from "@/hooks/useReferrals";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Marketing = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [leadToTransfer, setLeadToTransfer] = useState(null);
  const { leads, loading, addLead, updateLead, deleteLead } = useLeads();
  const { courses, loading: coursesLoading } = useCourses();
  const { referrals, loading: referralsLoading } = useReferrals();
  const { toast } = useToast();

  const handleAddLead = async (leadData: any) => {
    try {
      await addLead(leadData);
      setShowAddForm(false);
      toast({
        title: "Success",
        description: "Lead added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add lead",
        variant: "destructive",
      });
    }
  };

  const handleEditLead = (lead: any) => {
    setSelectedLead(lead);
    setShowDetailsView(true);
  };

  const handleViewLead = (lead: any) => {
    setSelectedLead(lead);
    setShowDetailsView(true);
  };

  const handleTransferLead = (lead: any) => {
    setLeadToTransfer(lead);
    setShowTransferModal(true);
  };

  const confirmTransferLead = async () => {
    if (leadToTransfer) {
      try {
        await transferLeadToStudent(leadToTransfer.id);
        setShowTransferModal(false);
        setLeadToTransfer(null);
        toast({
          title: "Success",
          description: "Lead transferred to student successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to transfer lead",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLead(leadId);
      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      });
    }
  };

  const handleMultiDelete = async (leadIds: string[]) => {
    try {
      for (const leadId of leadIds) {
        await deleteLead(leadId);
      }
      toast({
        title: "Success",
        description: `${leadIds.length} leads deleted successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete leads",
        variant: "destructive",
      });
    }
  };

  const handlePrintLeads = (selectedLeads: any[]) => {
    // Implementation for printing leads
    console.log("Printing leads:", selectedLeads);
  };

  if (loading || coursesLoading || referralsLoading) {
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
                  Marketing & Leads
                </h1>
                <p className="text-sm text-blue-600/80">Manage leads and track conversions</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button 
                  variant="outline"
                  className="gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                >
                  <Upload className="h-4 w-4" />
                  Import
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

            {/* Main Content */}
            <main className="flex-1 p-6 space-y-6">
              <LeadsTable
                leads={leads}
                courses={courses}
                referrals={referrals}
                onEdit={handleEditLead}
                onDelete={handleDeleteLead}
                onView={handleViewLead}
                onTransfer={handleTransferLead}
                onPrint={handlePrintLeads}
              />
            </main>

            {/* Add Lead Form Modal */}
            {showAddForm && (
              <AddLeadForm
                onClose={() => setShowAddForm(false)}
                onSave={handleAddLead}
                courses={courses}
                referrals={referrals}
              />
            )}

            {/* Lead Details View Modal */}
            {showDetailsView && selectedLead && (
              <LeadDetailsView
                lead={selectedLead}
                courses={courses}
                referrals={referrals}
                onClose={() => {
                  setShowDetailsView(false);
                  setSelectedLead(null);
                }}
                onEdit={handleEditLead}
                onTransfer={handleTransferLead}
              />
            )}

            {/* Transfer to Student Modal */}
            {showTransferModal && leadToTransfer && (
              <TransferToStudentModal
                lead={leadToTransfer}
                onClose={() => {
                  setShowTransferModal(false);
                  setLeadToTransfer(null);
                }}
                onTransfer={confirmTransferLead}
              />
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Marketing;
