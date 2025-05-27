
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, DollarSign, TrendingUp, Calendar, Star } from "lucide-react";

export const CourseStats = () => {
  const stats = [
    {
      title: "Total Courses",
      value: "24",
      change: "+3 this month",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
      cardBg: "bg-gradient-to-br from-blue-50 to-white",
    },
    {
      title: "Active Students",
      value: "1,247",
      change: "+128 this week",
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      cardBg: "bg-gradient-to-br from-emerald-50 to-white",
    },
    {
      title: "Course Revenue",
      value: "$142,850",
      change: "+15% from last month",
      icon: DollarSign,
      color: "text-amber-600",
      bgColor: "bg-gradient-to-br from-amber-500 to-amber-600",
      cardBg: "bg-gradient-to-br from-amber-50 to-white",
    },
    {
      title: "Completion Rate",
      value: "87%",
      change: "+5% improvement",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-gradient-to-br from-purple-500 to-purple-600",
      cardBg: "bg-gradient-to-br from-purple-50 to-white",
    },
    {
      title: "Upcoming Sessions",
      value: "12",
      change: "Next 7 days",
      icon: Calendar,
      color: "text-pink-600",
      bgColor: "bg-gradient-to-br from-pink-500 to-pink-600",
      cardBg: "bg-gradient-to-br from-pink-50 to-white",
    },
    {
      title: "Average Rating",
      value: "4.8",
      change: "Based on 1,205 reviews",
      icon: Star,
      color: "text-orange-600",
      bgColor: "bg-gradient-to-br from-orange-500 to-orange-600",
      cardBg: "bg-gradient-to-br from-orange-50 to-white",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <Card key={index} className={`${stat.cardBg} border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">
              {stat.title}
            </CardTitle>
            <div className={`p-3 rounded-xl ${stat.bgColor} shadow-lg`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{stat.value}</div>
            <p className="text-xs text-slate-600 mt-1">
              <span className="text-emerald-600 font-semibold">{stat.change}</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
