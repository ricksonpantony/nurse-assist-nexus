
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LeadDetailsView } from "@/components/marketing/LeadDetailsView";
import { useLeads } from "@/hooks/useLeads";
import { useCourses } from "@/hooks/useCourses";
import { useReferrals } from "@/hooks/useReferrals";

const MarketingLeadPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, loading } = useLeads();
  const { courses } = useCourses();
  const { referrals } = useReferrals();

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
  }

  const handleClose = () => {
    navigate('/marketing');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="p-6">
        <Button 
          onClick={handleClose} 
          variant="outline" 
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketing
        </Button>
        
        <LeadDetailsView
          lead={lead}
          courses={courses}
          referrals={referrals}
          onClose={handleClose}
        />
      </div>
    </div>
  );
};

export default MarketingLeadPreview;
