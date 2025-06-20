
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
    <div className="selected-leads-print-content hidden print:block">
      {/* Print Header */}
      <div className="selected-leads-print-header">
        <div className="selected-leads-print-title">Nurse Assist International (NAI)</div>
        <div className="selected-leads-print-subtitle">Marketing Lead Management Report</div>
        <div className="selected-leads-print-date">Generated on {format(new Date(), 'dd/MM/yyyy HH:mm')}</div>
      </div>

      {/* Print Leads Table */}
      <div style={{ marginBottom: '10pt' }}>
        <h3 style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '6pt', color: 'black' }}>Lead Details</h3>
        <table className="selected-leads-print-table">
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
                    <span className="selected-leads-print-badge">{lead.lead_status || 'New'}</span>
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

      {/* Print Footer */}
      <div className="selected-leads-print-footer">
        <div>📞 +61 470 320 397 | ✉ admin@nurseassistinternational.com | 🏢 Suite 104, Level 1, 25 Grene Street, Parramatta, 2150, Sydney</div>
      </div>
    </div>
  );
};
