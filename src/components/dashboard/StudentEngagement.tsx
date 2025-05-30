
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, RefreshCw } from "lucide-react";
import type { Student } from "@/hooks/useStudents";

interface StudentEngagementProps {
  students: Student[];
  loading: boolean;
}

export const StudentEngagement = ({ students, loading }: StudentEngagementProps) => {
  // Calculate engagement metrics
  const currentWeek = new Date();
  currentWeek.setDate(currentWeek.getDate() - 7);
  
  const newStudentsThisWeek = students.filter(student => {
    const joinDate = new Date(student.join_date);
    return joinDate >= currentWeek;
  }).length;

  const activeStudents = students.filter(s => 
    ['Attend sessions', 'Attended F2F', 'Exam cycle'].includes(s.status)
  ).length;

  const averageCourseDuration = 6; // months - this could be calculated from course data

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
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

  const engagementStats = [
    {
      title: "New Students This Week",
      value: newStudentsThisWeek,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Recent enrollments"
    },
    {
      title: "Active Students",
      value: activeStudents,
      icon: RefreshCw,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Currently attending"
    },
    {
      title: "Avg. Course Duration",
      value: `${averageCourseDuration} months`,
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Program length"
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        Student Engagement Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {engagementStats.map((stat) => (
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
