
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Clock, Target } from "lucide-react";
import type { Student } from "@/hooks/useStudents";
import type { Lead } from "@/hooks/useLeads";

interface MarketingLeadOverviewProps {
  students: Student[];
  leads: Lead[];
  loading: boolean;
}

export const MarketingLeadOverview = ({ students, leads, loading }: MarketingLeadOverviewProps) => {
  // Calculate lead metrics
  const activeLeads = leads.filter(lead => lead.status === 'active').length;
  const transferredLeads = leads.filter(lead => lead.status === 'transferred').length;
  
  // Calculate conversion rate
  const conversionRate = leads.length > 0 ? Math.round((transferredLeads / leads.length) * 100) : 0;
  
  // Calculate students waiting for exam
  const studentsWaitingExam = students.filter(s => 
    s.status === 'Exam cycle' || s.status === 'Awaiting results'
  ).length;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const marketingStats = [
    {
      title: "Active Leads",
      value: activeLeads,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Currently pursuing"
    },
    {
      title: "Lead Conversion Rate",
      value: `${conversionRate}%`,
      icon: Target,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Leads to students"
    },
    {
      title: "Transferred Leads",
      value: transferredLeads,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Became students"
    },
    {
      title: "Waiting for Exam",
      value: studentsWaitingExam,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Exam cycle & results"
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-600" />
        Marketing Leads & Exam Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {marketingStats.map((stat) => (
          <Card 
            key={stat.title} 
            className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium ${stat.color} flex items-center gap-2`}>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800 mb-1">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              <p className="text-sm text-slate-500">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
