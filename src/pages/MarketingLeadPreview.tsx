import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, Edit, User, BookOpen, Users, Calendar, StickyNote, UserPlus } from "lucide-react";
import { useLeads, getLeadStatusColor } from "@/hooks/useLeads";
import { useCourses } from "@/hooks/useCourses";
import { useReferrals } from "@/hooks/useReferrals";
import { useStudents } from "@/hooks/useStudents";
import { EnhancedTransferModal } from "@/components/marketing/EnhancedTransferModal";
import { useToast } from "@/hooks/use-toast";

const MarketingLeadPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, loading, updateLead } = useLeads();
  const { courses } = useCourses();
  const { referrals } = useReferrals();
  const { addStudent } = useStudents();
  const { toast } = useToast();
  const [showTransferModal, setShowTransferModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-blue-600">Loading lead details...</div>
        </div>
      </div>
    );
  }

  const lead = leads.find(l => l.id === id);

  if (!lead) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-lg text-red-600 mb-4">Lead not found</div>
          <Button onClick={() => navigate('/marketing')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Marketing
          </Button>
        </div>
      </div>
    );
  };

  const course = courses.find(c => c.id === lead.interested_course_id);
  const referral = referrals.find(r => r.id === lead.referral_id);

  const handlePrint = () => {
    window.print();
  };

  const handleTransferToStudent = async (studentData: any) => {
    try {
      console.log('Transferring lead to student with data:', studentData);
      
      // Add the student
      await addStudent(studentData);
      
      // Update lead status to "Converted to Student"
      await updateLead(lead.id, {
        lead_status: 'Converted to Student'
      });

      toast({
        title: 'Success',
        description: `Lead ${lead.lead_id} successfully transferred to student account`,
      });

      setShowTransferModal(false);
      navigate('/marketing');
    } catch (error) {
      console.error('Error transferring lead to student:', error);
      toast({
        title: 'Error',
        description: 'Failed to transfer lead to student account',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="flex flex-col h-full">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-gradient-to-r from-white via-blue-50 to-white px-6 shadow-lg backdrop-blur-sm print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/marketing')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketing
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              Lead Preview
            </h1>
            <p className="text-sm text-blue-600">
              Viewing details for {lead.full_name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTransferModal(true)}
              className="gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100"
            >
              <UserPlus className="h-4 w-4" />
              Transfer to Student
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/marketing/manage/${lead.id}`)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Lead Account Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-blue-900">Lead Account</CardTitle>
                  <Badge className={`px-3 py-1 rounded-full text-sm font-medium border ${getLeadStatusColor(lead.lead_status)}`}>
                    {lead.lead_status}
                  </Badge>
                </div>
                <p className="text-blue-600">Complete lead information and tracking details</p>
              </CardHeader>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Full Name</p>
                    <p className="font-medium">{lead.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Lead ID</p>
                    <p className="font-medium text-blue-600">{lead.lead_id || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-medium">{lead.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="font-medium">{lead.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Country</p>
                    <p className="font-medium">{lead.country || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Passport ID</p>
                    <p className="font-medium">{lead.passport_id || 'Not provided'}</p>
                  </div>
                  {lead.address && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <p className="text-sm text-gray-600 mb-1">Address</p>
                      <p className="font-medium">{lead.address}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Course Interest */}
            {course && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <BookOpen className="h-5 w-5" />
                    Course Interest
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Interested Course</p>
                      <p className="font-medium">{course.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Course Fee</p>
                      <p className="font-medium">${course.fee}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Duration</p>
                      <p className="font-medium">{course.period_months} months</p>
                    </div>
                    {lead.expected_joining_date && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Expected Joining Date</p>
                        <p className="font-medium">{formatDate(lead.expected_joining_date)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Referral Information */}
            {referral && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Users className="h-5 w-5" />
                    Referral Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Referred By</p>
                      <p className="font-medium">{referral.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Referral ID</p>
                      <p className="font-medium text-blue-600">{referral.referral_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Referral Email</p>
                      <p className="font-medium">{referral.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Referral Phone</p>
                      <p className="font-medium">{referral.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Lead Created</p>
                    <p className="font-medium">{formatDate(lead.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                    <p className="font-medium">{formatDate(lead.updated_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {lead.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <StickyNote className="h-5 w-5" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <EnhancedTransferModal
          lead={lead}
          courses={courses}
          referrals={referrals}
          onClose={() => setShowTransferModal(false)}
          onTransfer={handleTransferToStudent}
        />
      )}
    </div>
  );
};

export default MarketingLeadPreview;
