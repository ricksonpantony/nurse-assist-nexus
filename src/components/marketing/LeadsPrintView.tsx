
import { Lead } from "@/hooks/useLeads";
import { Course } from "@/hooks/useCourses";
import { format } from "date-fns";

interface LeadsPrintViewProps {
  leads: Lead[];
  courses: Course[];
  referrals: any[];
}

export const LeadsPrintView = ({ leads, courses, referrals }: LeadsPrintViewProps) => {
  const getCourse = (courseId: string) => {
    return courses.find(c => c.id === courseId);
  };

  const getReferral = (referralId: string) => {
    return referrals.find(r => r.id === referralId);
  };

  return (
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
            <div className="marketing-leads-print-stat-value">{leads.length}</div>
          </div>
          <div className="marketing-leads-print-stat-box">
            <div className="marketing-leads-print-stat-label">Active Leads</div>
            <div className="marketing-leads-print-stat-value">
              {leads.filter(l => ['New', 'Contacted', 'Interested', 'Follow-up Pending', 'Waiting for Documents / Payment'].includes(l.lead_status || 'New')).length}
            </div>
          </div>
          <div className="marketing-leads-print-stat-box">
            <div className="marketing-leads-print-stat-label">Converted Leads</div>
            <div className="marketing-leads-print-stat-value">
              {leads.filter(l => l.lead_status === 'Converted to Student').length}
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
            {leads.map((lead, index) => {
              const course = getCourse(lead.interested_course_id || "");
              const referral = getReferral(lead.referral_id || "");
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

      {/* Lead Details Section */}
      {leads.map((lead, index) => {
        const course = getCourse(lead.interested_course_id || "");
        const referral = getReferral(lead.referral_id || "");
        
        return (
          <div key={lead.id} className="marketing-leads-print-summary">
            <h3>Lead #{index + 1} - {lead.full_name} ({lead.lead_id || lead.id})</h3>
            
            <div className="marketing-leads-print-stats">
              <div className="marketing-leads-print-stat-box">
                <div className="marketing-leads-print-stat-label">Full Name</div>
                <div className="marketing-leads-print-stat-value">{lead.full_name}</div>
              </div>
              <div className="marketing-leads-print-stat-box">
                <div className="marketing-leads-print-stat-label">Email</div>
                <div className="marketing-leads-print-stat-value">{lead.email}</div>
              </div>
              <div className="marketing-leads-print-stat-box">
                <div className="marketing-leads-print-stat-label">Phone</div>
                <div className="marketing-leads-print-stat-value">{lead.phone}</div>
              </div>
              <div className="marketing-leads-print-stat-box">
                <div className="marketing-leads-print-stat-label">Country</div>
                <div className="marketing-leads-print-stat-value">{lead.country || 'Not specified'}</div>
              </div>
            </div>

            {lead.address && (
              <div className="marketing-leads-print-stats">
                <div className="marketing-leads-print-stat-box">
                  <div className="marketing-leads-print-stat-label">Address</div>
                  <div className="marketing-leads-print-stat-value">{lead.address}</div>
                </div>
              </div>
            )}

            <div className="marketing-leads-print-stats">
              <div className="marketing-leads-print-stat-box">
                <div className="marketing-leads-print-stat-label">Interested Course</div>
                <div className="marketing-leads-print-stat-value">{course ? course.title : 'Not specified'}</div>
              </div>
              {course && (
                <>
                  <div className="marketing-leads-print-stat-box">
                    <div className="marketing-leads-print-stat-label">Course Fee</div>
                    <div className="marketing-leads-print-stat-value">${course.fee}</div>
                  </div>
                  <div className="marketing-leads-print-stat-box">
                    <div className="marketing-leads-print-stat-label">Course Duration</div>
                    <div className="marketing-leads-print-stat-value">{course.period_months} months</div>
                  </div>
                </>
              )}
              {lead.expected_joining_date && (
                <div className="marketing-leads-print-stat-box">
                  <div className="marketing-leads-print-stat-label">Expected Joining Date</div>
                  <div className="marketing-leads-print-stat-value">{format(new Date(lead.expected_joining_date), 'dd/MM/yyyy')}</div>
                </div>
              )}
            </div>

            <div className="marketing-leads-print-stats">
              <div className="marketing-leads-print-stat-box">
                <div className="marketing-leads-print-stat-label">Referral Source</div>
                <div className="marketing-leads-print-stat-value">{referral ? referral.full_name : 'Direct (No Referral)'}</div>
              </div>
              {referral && (
                <>
                  <div className="marketing-leads-print-stat-box">
                    <div className="marketing-leads-print-stat-label">Referral ID</div>
                    <div className="marketing-leads-print-stat-value">{referral.referral_id}</div>
                  </div>
                  <div className="marketing-leads-print-stat-box">
                    <div className="marketing-leads-print-stat-label">Referral Contact</div>
                    <div className="marketing-leads-print-stat-value">{referral.email}</div>
                  </div>
                </>
              )}
            </div>

            <div className="marketing-leads-print-stats">
              <div className="marketing-leads-print-stat-box">
                <div className="marketing-leads-print-stat-label">Lead Created</div>
                <div className="marketing-leads-print-stat-value">{format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm')}</div>
              </div>
              <div className="marketing-leads-print-stat-box">
                <div className="marketing-leads-print-stat-label">Last Updated</div>
                <div className="marketing-leads-print-stat-value">{format(new Date(lead.updated_at), 'dd/MM/yyyy HH:mm')}</div>
              </div>
            </div>

            {lead.notes && (
              <div className="marketing-leads-print-stats">
                <div className="marketing-leads-print-stat-box">
                  <div className="marketing-leads-print-stat-label">Notes</div>
                  <div className="marketing-leads-print-stat-value">{lead.notes}</div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
