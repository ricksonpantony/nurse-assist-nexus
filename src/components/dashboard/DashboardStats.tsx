
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Award, Calendar } from "lucide-react";
import { CountUpAnimation } from "./CountUpAnimation";

interface DashboardStatsProps {
  totalStudents: number;
  totalCourses: number;
  passedStudents: number;
  monthlyEnrollments: number;
  loading: boolean;
}

export const DashboardStats = ({ 
  totalStudents, 
  totalCourses, 
  passedStudents, 
  monthlyEnrollments, 
  loading 
}: DashboardStatsProps) => {
  const stats = [
    {
      title: "Total Students",
      value: totalStudents,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Active registrations"
    },
    {
      title: "Active Courses",
      value: totalCourses,
      icon: BookOpen,
      color: "from-indigo-500 to-indigo-600",
      textColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: "Available programs"
    },
    {
      title: "Passed Students",
      value: passedStudents,
      icon: Award,
      color: "from-emerald-500 to-emerald-600",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "All-Time Course Completers"
    },
    {
      title: "This Month",
      value: monthlyEnrollments,
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "New enrollments"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card 
          key={stat.title} 
          className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm"
        >
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium ${stat.textColor} flex items-center gap-2`}>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800 mb-1">
              <CountUpAnimation end={stat.value} duration={2000} delay={index * 200} />
            </div>
            <p className="text-sm text-slate-500">{stat.description}</p>
          </CardContent>
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 rounded-full -translate-y-6 translate-x-6`}></div>
        </Card>
      ))}
    </div>
  );
};
