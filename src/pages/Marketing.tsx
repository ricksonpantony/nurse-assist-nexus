
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
import "@/styles/marketingLeadsPrint.css";

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
      {/* Print Content for Selected Leads */}
      {selectedLeadsForPrint.length > 0 && (
        <div className="marketing-leads-print-content">
          {/* Print Header */}
          <div className="marketing-leads-print-header">
            <div className="marketing-leads-print-title">Nurse Assist International (NAI)</div>
            <div className="marketing-leads-print-subtitle">Selected Leads Report</div>
            <div className="marketing-leads-print-date">Generated on: {format(new Date(), 'dd/MM/yyyy HH:mm')}</div>
          </div>

          {/* Print Statistics Summary */}
          <div className="marketing-leads-print-summary">
            <h3>Report Summary</h3>
            <div className="marketing-leads-print-stats">
              <div className="marketing-leads-print-stat-box">
                <div className="marketing-leads-print-stat-label">Total Selected Leads</div>
                <div className="marketing-leads-print-stat-value">{selectedLeadsForPrint.length}</div>
              </div>
              <div className="marketing-leads-print-stat-box">
                <div className="marketing-leads-print-stat-label">Active Leads</div>
                <div className="marketing-leads-print-stat-value">
                  {selectedLeadsForPrint.filter(l => ['New', 'Contacted', 'Interested', 'Follow-up Pending', 'Waiting for Documents / Payment'].includes(l.lead_status || 'New')).length}
                </div>
              </div>
              <div className="marketing-leads-print-stat-box">
                <div className="marketing-leads-print-stat-label">Converted Leads</div>
                <div className="marketing-leads-print-stat-value">
                  {selectedLeadsForPrint.filter(l => l.lead_status === 'Converted to Student').length}
                </div>
              </div>
              <div className="marketing-leads-print-stat-box">
                <div className="marketing-leads-print-stat-label">Report Date</div>
                <div className="marketing-leads-print-stat-value">{format(new Date(), 'dd/MM/yyyy')}</div>
              </div>
            </div>
          </div>

          {/* Print Leads Table */}
          <div className="marketing-leads-print-summary">
            <h3>Lead Details</h3>
            <table className="marketing-leads-print-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Lead ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Country</th>
                  <th>Course Interest</th>
                  <th>Status</th>
                  <th>Expected Date</th>
                  <th>Referral</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {selectedLeadsForPrint.map((lead, index) => {
                  const course = courses.find(c => c.id === lead.interested_course_id);
                  const referral = referrals.find(r => r.id === lead.referral_id);
                  return (
                    <tr key={lead.id}>
                      <td>{index + 1}</td>
                      <td>{lead.lead_id || lead.id}</td>
                      <td>{lead.full_name}</td>
                      <td>{lead.email}</td>
                      <td>{lead.phone}</td>
                      <td>{lead.country || 'Not specified'}</td>
                      <td>{course ? course.title : 'Not specified'}</td>
                      <td>
                        <span className="marketing-leads-print-badge">{lead.lead_status || 'New'}</span>
                      </td>
                      <td>
                        {lead.expected_joining_date ? format(new Date(lead.expected_joining_date), 'dd/MM/yyyy') : 'Not specified'}
                      </td>
                      <td>{referral ? referral.full_name : 'Direct'}</td>
                      <td>{format(new Date(lead.created_at), 'dd/MM/yyyy')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Print Content - Hidden on screen, visible when printing */}
      <div className="marketing-leads-print-content">
        {/* Print Header */}
        <div className="marketing-leads-print-header">
          <div className="marketing-leads-print-title">Nurse Assist International (NAI)</div>
          <div className="marketing-leads-print-subtitle">Marketing Lead Management Report</div>
          <div className="marketing-leads-print-date">Generated on: {format(new Date(), 'dd/MM/yyyy HH:mm')}</div>
        </div>

        {/* Print Statistics Summary */}
        <div className="marketing-leads-print-summary">
          <h3>Lead Statistics Summary</h3>
          <div className="marketing-leads-print-stats">
            <div className="marketing-leads-print-stat-box">
              <div className="marketing-leads-print-stat-label">Total Leads</div>
              <div className="marketing-leads-print-stat-value">{totalLeads}</div>
            </div>
            <div className="marketing-leads-print-stat-box">
              <div className="marketing-leads-print-stat-label">Active Leads</div>
              <div className="marketing-leads-print-stat-value">{activeLeads}</div>
            </div>
            <div className="marketing-leads-print-stat-box">
              <div className="marketing-leads-print-stat-label">Converted</div>
              <div className="marketing-leads-print-stat-value">{convertedLeads}</div>
            </div>
            <div className="marketing-leads-print-stat-box">
              <div className="marketing-leads-print-stat-label">Conversion Rate</div>
              <div className="marketing-leads-print-stat-value">
                {totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Print Leads Table */}
        <div className="marketing-leads-print-summary">
          <h3>Lead Details</h3>
          <table className="marketing-leads-print-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Lead ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Country</th>
                <th>Course Interest</th>
                <th>Status</th>
                <th>Expected Date</th>
                <th>Referral</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, index) => {
                const course = courses.find(c => c.id === lead.interested_course_id);
                const referral = referrals.find(r => r.id === lead.referral_id);
                return (
                  <tr key={lead.id}>
                    <td>{index + 1}</td>
                    <td>{lead.lead_id || lead.id}</td>
                    <td>{lead.full_name}</td>
                    <td>{lead.email}</td>
                    <td>{lead.phone}</td>
                    <td>{lead.country || 'Not specified'}</td>
                    <td>{course ? course.title : 'Not specified'}</td>
                    <td>
                      <span className="marketing-leads-print-badge">{lead.lead_status || 'New'}</span>
                    </td>
                    <td>
                      {lead.expected_joining_date ? format(new Date(lead.expected_joining_date), 'dd/MM/yyyy') : 'Not specified'}
                    </td>
                    <td>{referral ? referral.full_name : 'Direct'}</td>
                    <td>{format(new Date(lead.created_at), 'dd/MM/yyyy')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Print Lead Status Distribution */}
        <div className="marketing-leads-print-summary">
          <h3>Lead Status Distribution</h3>
          <div className="marketing-leads-print-stats">
            <div className="marketing-leads-print-stat-box">
              <div className="marketing-leads-print-stat-label">New Leads</div>
              <div className="marketing-leads-print-stat-value">{leads.filter(l => l.lead_status === 'New').length}</div>
            </div>
            <div className="marketing-leads-print-stat-box">
              <div className="marketing-leads-print-stat-label">In Progress</div>
              <div className="marketing-leads-print-stat-value">{leads.filter(l => l.lead_status === 'In Progress').length}</div>
            </div>
            <div className="marketing-leads-print-stat-box">
              <div className="marketing-leads-print-stat-label">Contacted</div>
              <div className="marketing-leads-print-stat-value">{leads.filter(l => l.lead_status === 'Contacted').length}</div>
            </div>
            <div className="marketing-leads-print-stat-box">
              <div className="marketing-leads-print-stat-label">Qualified</div>
              <div className="marketing-leads-print-stat-value">{leads.filter(l => l.lead_status === 'Qualified').length}</div>
            </div>
          </div>
          <div className="marketing-leads-print-stats">
            <div className="marketing-leads-print-stat-box">
              <div className="marketing-leads-print-stat-label">Converted</div>
              <div className="marketing-leads-print-stat-value">{leads.filter(l => l.lead_status === 'Converted to Student').length}</div>
            </div>
            <div className="marketing-leads-print-stat-box">
              <div className="marketing-leads-print-stat-label">Lost</div>
              <div className="marketing-leads-print-stat-value">{leads.filter(l => l.lead_status === 'Lost').length}</div>
            </div>
            <div className="marketing-leads-print-stat-box">
              <div className="marketing-leads-print-stat-label">Follow-up Pending</div>
              <div className="marketing-leads-print-stat-value">{leads.filter(l => l.lead_status === 'Follow-up Pending').length}</div>
            </div>
            <div className="marketing-leads-print-stat-box">
              <div className="marketing-leads-print-stat-label">Waiting Documents</div>
              <div className="marketing-leads-print-stat-value">{leads.filter(l => l.lead_status === 'Waiting for Documents / Payment').length}</div>
            </div>
          </div>
        </div>

        {/* Print Course Interest Analysis */}
        <div className="marketing-leads-print-summary">
          <h3>Course Interest Analysis</h3>
          <table className="marketing-leads-print-table">
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
