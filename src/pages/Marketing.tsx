import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Download } from "lucide-react";
import { LeadsTable } from "@/components/marketing/LeadsTable";
import { LeadsPrintView } from "@/components/marketing/LeadsPrintView";
import { EnhancedTransferModal } from "@/components/marketing/EnhancedTransferModal";
import { useLeads, Lead } from "@/hooks/useLeads";
import { useCourses } from "@/hooks/useCourses";
import { useReferrals } from "@/hooks/useReferrals";
import { useStudents } from "@/hooks/useStudents";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import "../styles/marketingPrint.css";

const Marketing = () => {
  const { leads, loading, updateLead, deleteLead } = useLeads();
  const { courses } = useCourses();
  const { referrals } = useReferrals();
  const { addStudent } = useStudents();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeadsForPrint, setSelectedLeadsForPrint] = useState<Lead[]>([]);

  const handleEditLead = (lead: Lead) => {
    navigate(`/marketing/manage/${lead.id}`);
  };

  const handleDeleteLead = async (leadId: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLead(leadId);
      } catch (error) {
        console.error('Marketing page: Error deleting lead:', error);
      }
    }
  };

  const handleViewLead = (lead: Lead) => {
    navigate(`/marketing/preview/${lead.id}`);
  };

  const handleTransferLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowTransferModal(true);
  };

  const handlePrintSelectedLeads = (selectedLeads: Lead[]) => {
    if (selectedLeads.length === 0) {
      toast({
        title: "No leads selected",
        description: "Please select at least one lead to print.",
        variant: "destructive",
      });
      return;
    }

    console.log('Marketing page: Printing selected leads:', selectedLeads.length);
    setSelectedLeadsForPrint(selectedLeads);
    
    // Small delay to ensure the print view is rendered
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleTransferToStudent = async (studentData: any) => {
    try {
      console.log('Marketing page: Transferring student with data:', studentData);
      
      await addStudent(studentData);
      
      if (selectedLead) {
        await updateLead(selectedLead.id, { 
          status: 'transferred',
          lead_status: 'Converted to Student'
        });
      }

      setShowTransferModal(false);
      setSelectedLead(null);
      
      toast({
        title: "Success",
        description: `Lead ${selectedLead?.lead_id} has been successfully transferred to student account ${studentData.id}`,
      });
    } catch (error) {
      console.error('Marketing page: Error transferring lead to student:', error);
      toast({
        title: "Error",
        description: `Failed to transfer lead to student account: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    toast({
      title: "Export",
      description: "Export functionality will be implemented soon",
    });
  };

  const handlePrint = () => {
    // This will print all leads using the old print view
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-blue-600">Loading leads...</div>
        </div>
      </div>
    );
  }

  // Calculate stats including lead status distribution
  const totalLeads = leads.length;
  
  // Define which lead statuses are considered "active"
  const activeLeadStatuses = ['New', 'Contacted', 'Interested', 'Follow-up Pending', 'Waiting for Documents / Payment'];
  const activeLeads = leads.filter(lead => activeLeadStatuses.includes(lead.lead_status || 'New')).length;
  
  const transferredLeads = leads.filter(lead => lead.status === 'transferred').length;
  const convertedLeads = leads.filter(lead => lead.lead_status === 'Converted to Student').length;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 marketing-page">
      {/* Print Content for Selected Leads Only */}
      {selectedLeadsForPrint.length > 0 && (
        <LeadsPrintView 
          leads={selectedLeadsForPrint} 
          courses={courses} 
          referrals={referrals} 
        />
      )}

      {/* Regular Screen Content - Hidden when printing */}
      <div className="flex flex-col h-full print:hidden">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-gradient-to-r from-white via-blue-50 to-white px-6 shadow-lg backdrop-blur-sm">
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              Marketing - Lead Management
            </h1>
            <p className="text-sm text-blue-600">Manage prospective students and track lead conversion</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="gap-2 hover:bg-blue-50 border-blue-200"
              onClick={handlePrint}
            >
              <FileText className="h-4 w-4" />
              Print All
            </Button>
            <Button 
              variant="outline"
              className="gap-2 hover:bg-green-50 border-green-200"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button 
              onClick={() => navigate('/marketing/manage')}
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Total Leads</h3>
                    <p className="text-3xl font-bold text-blue-600">{totalLeads}</p>
                  </div>
                  <div className="w-4 h-16 bg-gradient-to-t from-blue-500 to-blue-300 rounded-full"></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Active Leads</h3>
                    <p className="text-3xl font-bold text-green-600">{activeLeads}</p>
                  </div>
                  <div className="w-4 h-16 bg-gradient-to-t from-green-500 to-green-300 rounded-full"></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-white to-purple-50 p-6 rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Converted</h3>
                    <p className="text-3xl font-bold text-purple-600">{convertedLeads}</p>
                  </div>
                  <div className="w-4 h-16 bg-gradient-to-t from-purple-500 to-purple-300 rounded-full"></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-white to-orange-50 p-6 rounded-xl shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Conversion Rate</h3>
                    <p className="text-3xl font-bold text-orange-600">
                      {totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0}%
                    </p>
                  </div>
                  <div className="w-4 h-16 bg-gradient-to-t from-orange-500 to-orange-300 rounded-full"></div>
                </div>
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
            onPrint={handlePrintSelectedLeads}
          />
        </main>
      </div>

      {/* Enhanced Transfer to Student Modal */}
      {showTransferModal && selectedLead && (
        <EnhancedTransferModal
          lead={selectedLead}
          courses={courses}
          referrals={referrals}
          onClose={() => {
            setShowTransferModal(false);
            setSelectedLead(null);
          }}
          onTransfer={handleTransferToStudent}
        />
      )}
    </div>
  );
};

export default Marketing;
