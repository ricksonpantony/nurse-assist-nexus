
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
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

  const handlePrint = () => {
    window.print();
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
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <LeadDetailsView
              lead={lead}
              courses={courses}
              referrals={referrals}
              onClose={handleClose}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MarketingLeadPreview;
