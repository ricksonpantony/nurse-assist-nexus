
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, User, Phone, Mail, MapPin, BookOpen, Calendar, UserCheck } from "lucide-react";
import { useLeads, Lead } from "@/hooks/useLeads";
import { useCourses } from "@/hooks/useCourses";
import { useReferrals } from "@/hooks/useReferrals";
import { format } from "date-fns";

const MarketingPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads } = useLeads();
  const { courses } = useCourses();
  const { referrals } = useReferrals();
  
  const [lead, setLead] = useState<Lead | null>(null);

  useEffect(() => {
    if (id && leads.length > 0) {
      const foundLead = leads.find(l => l.id === id);
      setLead(foundLead || null);
    }
  }, [id, leads]);

  const handlePrint = () => {
    window.print();
  };

  if (!lead) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-blue-600">Lead not found...</div>
        </div>
      </div>
    );
  }

  const course = courses.find(c => c.id === lead.interested_course_id);
  const referral = referrals.find(r => r.id === lead.referral_id);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Print Content - Hidden on screen, visible when printing */}
      <div className="print-content hidden print:block">
        {/* Print Header */}
        <div className="print-header">
          <div className="print-title">Nurse Assist International (NAI)</div>
          <div className="print-subtitle">Lead Profile Report</div>
        </div>

        {/* Print Lead Information */}
        <div className="print-section print-major-section">
          <div className="print-section-title">Lead Information</div>
          <div className="print-grid-2">
            <div className="print-field">
              <div className="print-field-label">Lead ID</div>
              <div className="print-field-value">{lead.lead_id || lead.id}</div>
            </div>
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
              <div className="print-field-label">Status</div>
              <div className="print-field-value">{lead.lead_status}</div>
            </div>
          </div>
        </div>

        {/* Print Course Interest */}
        <div className="print-section">
          <div className="print-section-title">Course Interest</div>
          <div className="print-grid-3">
            <div className="print-field">
              <div className="print-field-label">Course</div>
              <div className="print-field-value">{course ? course.title : 'Not specified'}</div>
            </div>
            {course && (
              <>
                <div className="print-field">
                  <div className="print-field-label">Fee</div>
                  <div className="print-field-value">${course.fee}</div>
                </div>
                <div className="print-field">
                  <div className="print-field-label">Duration</div>
                  <div className="print-field-value">{course.period_months} months</div>
                </div>
              </>
            )}
            {lead.expected_joining_date && (
              <div className="print-field">
                <div className="print-field-label">Expected Joining</div>
                <div className="print-field-value">{format(new Date(lead.expected_joining_date), 'dd/MM/yyyy')}</div>
              </div>
            )}
          </div>
        </div>

        {/* Print Referral Information */}
        <div className="print-section">
          <div className="print-section-title">Referral Information</div>
          {referral ? (
            <div className="print-grid-2">
              <div className="print-field">
                <div className="print-field-label">Referred by</div>
                <div className="print-field-value">{referral.full_name}</div>
              </div>
              <div className="print-field">
                <div className="print-field-label">Referral ID</div>
                <div className="print-field-value">{referral.referral_id}</div>
              </div>
              <div className="print-field">
                <div className="print-field-label">Email</div>
                <div className="print-field-value">{referral.email}</div>
              </div>
              <div className="print-field">
                <div className="print-field-label">Phone</div>
                <div className="print-field-value">{referral.phone}</div>
              </div>
            </div>
          ) : (
            <div className="print-field">
              <div className="print-field-label">Source</div>
              <div className="print-field-value">Direct (No Referral)</div>
            </div>
          )}
        </div>

        {/* Print Additional Details */}
        <div className="print-section">
          <div className="print-section-title">Additional Details</div>
          <div className="print-grid-2">
            {lead.passport_id && (
              <div className="print-field">
                <div className="print-field-label">Passport/ID</div>
                <div className="print-field-value">{lead.passport_id}</div>
              </div>
            )}
            {lead.address && (
              <div className="print-field">
                <div className="print-field-label">Address</div>
                <div className="print-field-value">{lead.address}</div>
              </div>
            )}
            <div className="print-field">
              <div className="print-field-label">Created</div>
              <div className="print-field-value">{format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm')}</div>
            </div>
            <div className="print-field">
              <div className="print-field-label">Last Updated</div>
              <div className="print-field-value">{format(new Date(lead.updated_at), 'dd/MM/yyyy HH:mm')}</div>
            </div>
          </div>
        </div>

        {/* Print Notes */}
        {lead.notes && (
          <div className="print-section">
            <div className="print-section-title">Notes</div>
            <div className="print-field-value">{lead.notes}</div>
          </div>
        )}

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
          <Button 
            variant="ghost" 
            onClick={() => navigate('/marketing')}
            className="gap-2 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketing
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              Lead Preview - {lead.full_name}
            </h1>
            <p className="text-sm text-blue-600">Lead ID: {lead.lead_id || lead.id}</p>
          </div>
          <Button 
            variant="outline"
            className="gap-2 hover:bg-blue-50 border-blue-200"
            onClick={handlePrint}
          >
            <FileText className="h-4 w-4" />
            Print
          </Button>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header with Lead Name and Status */}
            <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-blue-900">{lead.full_name}</h2>
                  <p className="text-blue-600">Lead ID: {lead.lead_id || lead.id}</p>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {lead.lead_status}
                </Badge>
              </div>
            </div>

            {/* Lead Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card className="shadow-lg border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{lead.phone}</span>
                  </div>
                  {lead.passport_id && (
                    <div>
                      <span className="text-sm text-gray-500">Passport/ID: </span>
                      <span>{lead.passport_id}</span>
                    </div>
                  )}
                  {lead.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{lead.address}</span>
                    </div>
                  )}
                  {lead.country && (
                    <div>
                      <span className="text-sm text-gray-500">Country: </span>
                      <Badge variant="outline">{lead.country}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Course Interest */}
              <Card className="shadow-lg border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <BookOpen className="h-5 w-5" />
                    Course Interest
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Interested Course: </span>
                    <span className="font-medium">
                      {course ? course.title : 'Not specified'}
                    </span>
                  </div>
                  {course && (
                    <>
                      <div>
                        <span className="text-sm text-gray-500">Course Fee: </span>
                        <span>${course.fee}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Duration: </span>
                        <span>{course.period_months} months</span>
                      </div>
                    </>
                  )}
                  {lead.expected_joining_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        Expected joining: {format(new Date(lead.expected_joining_date), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Referral Information */}
              <Card className="shadow-lg border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <UserCheck className="h-5 w-5" />
                    Referral Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {referral ? (
                    <>
                      <div>
                        <span className="text-sm text-gray-500">Referred by: </span>
                        <span className="font-medium">{referral.full_name}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Referral ID: </span>
                        <Badge variant="outline">{referral.referral_id}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{referral.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{referral.phone}</span>
                      </div>
                    </>
                  ) : (
                    <div>
                      <span className="text-sm text-gray-500">Referral Source: </span>
                      <Badge variant="outline">Direct (No Referral)</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="shadow-lg border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Calendar className="h-5 w-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Lead created: </span>
                    <span>{format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Last updated: </span>
                    <span>{format(new Date(lead.updated_at), 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            {lead.notes && (
              <Card className="shadow-lg border-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <FileText className="h-5 w-5" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MarketingPreview;
