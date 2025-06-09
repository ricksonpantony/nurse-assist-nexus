
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, User, Phone, Mail, MapPin, BookOpen, Calendar, FileText, UserCheck } from "lucide-react";
import { Lead } from "@/hooks/useLeads";
import { Course } from "@/hooks/useCourses";
import { format } from "date-fns";

interface LeadDetailsViewProps {
  lead: Lead;
  courses: Course[];
  referrals: any[];
  onClose: () => void;
}

export const LeadDetailsView = ({ lead, courses, referrals, onClose }: LeadDetailsViewProps) => {
  const course = courses.find(c => c.id === lead.interested_course_id);
  const referral = referrals.find(r => r.id === lead.referral_id);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-blue-900">Lead Details</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with Lead Name */}
          <div>
            <h2 className="text-2xl font-bold text-blue-900">{lead.full_name}</h2>
            <p className="text-blue-600">Lead ID: {lead.lead_id || lead.id}</p>
            <Badge variant="secondary" className="mt-2">
              Status: {lead.lead_status}
            </Badge>
          </div>

          {/* Lead Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
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
            <Card>
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
            <Card>
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
            <Card>
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
            <Card>
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
      </DialogContent>
    </Dialog>
  );
};
