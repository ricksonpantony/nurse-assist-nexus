
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Download } from "lucide-react";
import { LeadsTable } from "@/components/marketing/LeadsTable";
import { EnhancedTransferModal } from "@/components/marketing/EnhancedTransferModal";
import { useLeads, Lead } from "@/hooks/useLeads";
import { useCourses } from "@/hooks/useCourses";
import { useReferrals } from "@/hooks/useReferrals";
import { useStudents } from "@/hooks/useStudents";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const Marketing = () => {
  const { leads, loading, updateLead, deleteLead } = useLeads();
  const { courses } = useCourses();
  const { referrals } = useReferrals();
  const { addStudent } = useStudents();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Print Content - Hidden on screen, visible when printing */}
      <div className="print-content hidden print:block">
        {/* Print Header */}
        <div className="print-header">
          <div className="print-title">Nurse Assist International (NAI)</div>
          <div className="print-subtitle">Marketing Lead Management Report</div>
        </div>

        {/* Print Statistics Summary */}
        <div className="print-section print-major-section">
          <div className="print-section-title">Lead Statistics Summary</div>
          <div className="print-grid-4">
            <div className="print-payment-box">
              <div className="print-payment-label">Total Leads</div>
              <div className="print-payment-amount">{totalLeads}</div>
            </div>
            <div className="print-payment-box">
              <div className="print-payment-label">Active Leads</div>
              <div className="print-payment-amount">{activeLeads}</div>
            </div>
            <div className="print-payment-box">
              <div className="print-payment-label">Converted</div>
              <div className="print-payment-amount">{convertedLeads}</div>
            </div>
            <div className="print-payment-box">
              <div className="print-payment-label">Conversion Rate</div>
              <div className="print-payment-amount">
                {totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Print Leads Table */}
        <div className="print-section">
          <div className="print-section-title">Lead Details</div>
          <table className="print-table">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Country</th>
                <th>Course Interest</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const course = courses.find(c => c.id === lead.interested_course_id);
                return (
                  <tr key={lead.id}>
                    <td>{lead.lead_id || lead.id}</td>
                    <td>{lead.full_name}</td>
                    <td>{lead.email}</td>
                    <td>{lead.phone}</td>
                    <td>{lead.country}</td>
                    <td>{course ? course.title : 'Not specified'}</td>
                    <td>
                      <span className="print-badge">{lead.lead_status}</span>
                    </td>
                    <td>{format(new Date(lead.created_at), 'dd/MM/yyyy')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Print Lead Status Distribution */}
        <div className="print-section">
          <div className="print-section-title">Lead Status Distribution</div>
          <div className="print-grid-3">
            <div className="print-field">
              <div className="print-field-label">New Leads</div>
              <div className="print-field-value">{leads.filter(l => l.lead_status === 'New').length}</div>
            </div>
            <div className="print-field">
              <div className="print-field-label">In Progress</div>
              <div className="print-field-value">{leads.filter(l => l.lead_status === 'In Progress').length}</div>
            </div>
            <div className="print-field">
              <div className="print-field-label">Contacted</div>
              <div className="print-field-value">{leads.filter(l => l.lead_status === 'Contacted').length}</div>
            </div>
            <div className="print-field">
              <div className="print-field-label">Qualified</div>
              <div className="print-field-value">{leads.filter(l => l.lead_status === 'Qualified').length}</div>
            </div>
            <div className="print-field">
              <div className="print-field-label">Converted</div>
              <div className="print-field-value">{leads.filter(l => l.lead_status === 'Converted to Student').length}</div>
            </div>
            <div className="print-field">
              <div className="print-field-label">Lost</div>
              <div className="print-field-value">{leads.filter(l => l.lead_status === 'Lost').length}</div>
            </div>
          </div>
        </div>

        {/* Print Course Interest Analysis */}
        <div className="print-section">
          <div className="print-section-title">Course Interest Analysis</div>
          <table className="print-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Interested Leads</th>
                <th>Fee</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => {
                const interestedCount = leads.filter(l => l.interested_course_id === course.id).length;
                return (
                  <tr key={course.id}>
                    <td>{course.title}</td>
                    <td>{interestedCount}</td>
                    <td>${course.fee}</td>
                    <td>{course.period_months} months</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Print Report Generated Info */}
        <div className="print-section">
          <div className="print-field">
            <div className="print-field-label">Report Generated</div>
            <div className="print-field-value">{format(new Date(), 'dd/MM/yyyy HH:mm')}</div>
          </div>
        </div>
      </div>

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
              Print
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
