
import { useState } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Download } from "lucide-react";
import { AddLeadForm } from "@/components/marketing/AddLeadForm";
import { LeadsTable } from "@/components/marketing/LeadsTable";
import { LeadDetailsView } from "@/components/marketing/LeadDetailsView";
import { TransferToStudentModal } from "@/components/marketing/TransferToStudentModal";
import { useLeads, Lead } from "@/hooks/useLeads";
import { useCourses } from "@/hooks/useCourses";
import { useReferrals } from "@/hooks/useReferrals";
import { useStudents } from "@/hooks/useStudents";
import { useToast } from "@/hooks/use-toast";

const Marketing = () => {
  const { leads, loading, addLead, updateLead, deleteLead } = useLeads();
  const { courses } = useCourses();
  const { referrals } = useReferrals();
  const { addStudent } = useStudents();
  const { toast } = useToast();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleAddLead = async (leadData: any) => {
    try {
      await addLead(leadData);
      setShowAddForm(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setShowAddForm(true);
  };

  const handleUpdateLead = async (updatedLead: any) => {
    try {
      if (editingLead) {
        await updateLead(editingLead.id, updatedLead);
        setShowAddForm(false);
        setEditingLead(null);
      }
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLead(leadId);
      } catch (error) {
        // Error is handled in the hook
      }
    }
  };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowDetailsView(true);
  };

  const handleTransferLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowTransferModal(true);
  };

  const handleTransferToStudent = async (studentData: any) => {
    try {
      // Generate a unique student ID
      const studentId = `STU${Date.now()}`;
      const fullStudentData = {
        ...studentData,
        id: studentId,
      };

      await addStudent(fullStudentData);
      
      // Update lead status to transferred
      if (selectedLead) {
        await updateLead(selectedLead.id, { status: 'transferred' });
      }

      setShowTransferModal(false);
      setSelectedLead(null);
      
      toast({
        title: "Success",
        description: "Lead has been successfully transferred to student account",
      });
    } catch (error) {
      console.error('Error transferring lead to student:', error);
      toast({
        title: "Error",
        description: "Failed to transfer lead to student account",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast({
      title: "Export",
      description: "Export functionality will be implemented soon",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex items-center justify-center h-64">
              <div className="text-lg text-blue-600">Loading leads...</div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-gradient-to-r from-white via-blue-50 to-white px-6 shadow-lg backdrop-blur-sm">
            <SidebarTrigger className="text-blue-600 hover:bg-blue-100 rounded-lg" />
            <div className="flex-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                Marketing - Lead Management
              </h1>
              <p className="text-sm text-blue-600">Manage prospective students and track lead conversion</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="gap-2"
                onClick={handlePrint}
              >
                <FileText className="h-4 w-4" />
                Print
              </Button>
              <Button 
                variant="outline"
                className="gap-2"
                onClick={handleExport}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Add Lead
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                  <h3 className="text-lg font-semibold text-gray-900">Total Leads</h3>
                  <p className="text-3xl font-bold text-blue-600">{leads.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                  <h3 className="text-lg font-semibold text-gray-900">Active Leads</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {leads.filter(lead => lead.status === 'active').length}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
                  <h3 className="text-lg font-semibold text-gray-900">Transferred</h3>
                  <p className="text-3xl font-bold text-orange-600">
                    {leads.filter(lead => lead.status === 'transferred').length}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
                  <h3 className="text-lg font-semibold text-gray-900">Conversion Rate</h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {leads.length > 0 ? Math.round((leads.filter(lead => lead.status === 'transferred').length / leads.length) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>

            <LeadsTable
              leads={leads}
              courses={courses}
              referrals={referrals}
              onEdit={handleEditLead}
              onDelete={handleDeleteLead}
              onView={handleViewLead}
              onTransfer={handleTransferLead}
            />
          </main>
        </SidebarInset>
      </div>

      {/* Add/Edit Lead Form Modal */}
      {showAddForm && (
        <AddLeadForm
          lead={editingLead}
          courses={courses}
          onClose={() => {
            setShowAddForm(false);
            setEditingLead(null);
          }}
          onSave={editingLead ? handleUpdateLead : handleAddLead}
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
        />
      )}

      {/* Transfer to Student Modal */}
      {showTransferModal && selectedLead && (
        <TransferToStudentModal
          lead={selectedLead}
          courses={courses}
          onClose={() => {
            setShowTransferModal(false);
            setSelectedLead(null);
          }}
          onTransfer={handleTransferToStudent}
        />
      )}
    </SidebarProvider>
  );
};

export default Marketing;
