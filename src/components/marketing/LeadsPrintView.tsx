
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
    <div className="print-content hidden print:block">
      {/* Print Header */}
      <div className="print-header">
        <div className="print-title">Nurse Assist International (NAI)</div>
        <div className="print-subtitle">Selected Leads Report</div>
      </div>

      {/* Print Statistics Summary */}
      <div className="print-section print-major-section">
        <div className="print-section-title">Report Summary</div>
        <div className="print-grid-4">
          <div className="print-payment-box">
            <div className="print-payment-label">Total Selected Leads</div>
            <div className="print-payment-amount">{leads.length}</div>
          </div>
          <div className="print-payment-box">
            <div className="print-payment-label">Active Leads</div>
            <div className="print-payment-amount">
              {leads.filter(l => ['New', 'Contacted', 'Interested', 'Follow-up Pending', 'Waiting for Documents / Payment'].includes(l.lead_status || 'New')).length}
            </div>
          </div>
          <div className="print-payment-box">
            <div className="print-payment-label">Converted Leads</div>
            <div className="print-payment-amount">
              {leads.filter(l => l.lead_status === 'Converted to Student').length}
            </div>
          </div>
          <div className="print-payment-box">
            <div className="print-payment-label">Report Date</div>
            <div className="print-payment-amount">{format(new Date(), 'dd/MM/yyyy')}</div>
          </div>
        </div>
      </div>

      {/* Print Leads Table */}
      <div className="print-section">
        <div className="print-section-title">Lead Details</div>
        <table className="print-table">
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
                    <span className="print-badge">{lead.lead_status || 'New'}</span>
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
          <div key={lead.id} className="print-section print-major-section">
            <div className="print-section-title">Lead #{index + 1} - {lead.full_name} ({lead.lead_id || lead.id})</div>
            
            <div className="print-grid-3">
              <div className="print-field">
                <div className="print-field-label">Full Name</div>
                <div className="print-field-value">{lead.full_name}</div>
              </div>
              <div className="print-field">
                <div className="print-field-label">Email</div>
                <div className="print-field-value">{lead.email}</div>
              </div>
              <div className="print-field">
                <div className="print-field-label">Phone</div>
                <div className="print-field-value">{lead.phone}</div>
              </div>
              <div className="print-field">
                <div className="print-field-label">Country</div>
                <div className="print-field-value">{lead.country || 'Not specified'}</div>
              </div>
              <div className="print-field">
                <div className="print-field-label">Passport/ID</div>
                <div className="print-field-value">{lead.passport_id || 'Not provided'}</div>
              </div>
              <div className="print-field">
                <div className="print-field-label">Lead Status</div>
                <div className="print-field-value">{lead.lead_status || 'New'}</div>
              </div>
            </div>

            {lead.address && (
              <div className="print-field">
                <div className="print-field-label">Address</div>
                <div className="print-field-value">{lead.address}</div>
              </div>
            )}

            <div className="print-grid-3">
              <div className="print-field">
                <div className="print-field-label">Interested Course</div>
                <div className="print-field-value">{course ? course.title : 'Not specified'}</div>
              </div>
              {course && (
                <>
                  <div className="print-field">
                    <div className="print-field-label">Course Fee</div>
                    <div className="print-field-value">${course.fee}</div>
                  </div>
                  <div className="print-field">
                    <div className="print-field-label">Course Duration</div>
                    <div className="print-field-value">{course.period_months} months</div>
                  </div>
                </>
              )}
              {lead.expected_joining_date && (
                <div className="print-field">
                  <div className="print-field-label">Expected Joining Date</div>
                  <div className="print-field-value">{format(new Date(lead.expected_joining_date), 'dd/MM/yyyy')}</div>
                </div>
              )}
            </div>

            <div className="print-grid-3">
              <div className="print-field">
                <div className="print-field-label">Referral Source</div>
                <div className="print-field-value">{referral ? referral.full_name : 'Direct (No Referral)'}</div>
              </div>
              {referral && (
                <>
                  <div className="print-field">
                    <div className="print-field-label">Referral ID</div>
                    <div className="print-field-value">{referral.referral_id}</div>
                  </div>
                  <div className="print-field">
                    <div className="print-field-label">Referral Contact</div>
                    <div className="print-field-value">{referral.email}</div>
                  </div>
                </>
              )}
            </div>

            <div className="print-grid-2">
              <div className="print-field">
                <div className="print-field-label">Lead Created</div>
                <div className="print-field-value">{format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm')}</div>
              </div>
              <div className="print-field">
                <div className="print-field-label">Last Updated</div>
                <div className="print-field-value">{format(new Date(lead.updated_at), 'dd/MM/yyyy HH:mm')}</div>
              </div>
            </div>

            {lead.notes && (
              <div className="print-field">
                <div className="print-field-label">Notes</div>
                <div className="print-field-value">{lead.notes}</div>
              </div>
            )}
          </div>
        );
      })}

      {/* Print Report Generated Info */}
      <div className="print-section">
        <div className="print-field">
          <div className="print-field-label">Report Generated</div>
          <div className="print-field-value">{format(new Date(), 'dd/MM/yyyy HH:mm')}</div>
        </div>
      </div>
    </div>
  );
};
