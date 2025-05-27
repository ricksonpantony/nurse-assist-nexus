
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, CreditCard, TrendingUp, Calendar, Bell, Target, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

const Index = () => {
  const stats = [
    {
      title: "Total Students",
      value: "1,247",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
      cardBg: "bg-gradient-to-br from-blue-50 to-white",
    },
    {
      title: "Fee Collected",
      value: "$142,850",
      change: "+8%",
      icon: CreditCard,
      color: "text-emerald-600",
      bgColor: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      cardBg: "bg-gradient-to-br from-emerald-50 to-white",
    },
    {
      title: "Outstanding Balance",
      value: "$23,420",
      change: "-5%",
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-gradient-to-br from-amber-500 to-amber-600",
      cardBg: "bg-gradient-to-br from-amber-50 to-white",
    },
    {
      title: "Active Courses",
      value: "24",
      change: "+2",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-gradient-to-br from-purple-500 to-purple-600",
      cardBg: "bg-gradient-to-br from-purple-50 to-white",
    },
  ];

  const monthlyRevenue = [
    { month: 'Jan', revenue: 85000, students: 980 },
    { month: 'Feb', revenue: 92000, students: 1050 },
    { month: 'Mar', revenue: 88000, students: 1020 },
    { month: 'Apr', revenue: 125000, students: 1180 },
    { month: 'May', revenue: 135000, students: 1220 },
    { month: 'Jun', revenue: 142850, students: 1247 },
  ];

  const courseDistribution = [
    { name: 'Advanced Nursing', value: 35, fill: '#3B82F6' },
    { name: 'Basic Care', value: 25, fill: '#10B981' },
    { name: 'Emergency Care', value: 20, fill: '#F59E0B' },
    { name: 'Pediatric Care', value: 15, fill: '#8B5CF6' },
    { name: 'Mental Health', value: 5, fill: '#EF4444' },
  ];

  const enrollmentTrend = [
    { month: 'Jan', enrollments: 120 },
    { month: 'Feb', enrollments: 145 },
    { month: 'Mar', enrollments: 132 },
    { month: 'Apr', enrollments: 168 },
    { month: 'May', enrollments: 185 },
    { month: 'Jun', enrollments: 205 },
  ];

  const recentActivities = [
    {
      student: "Sarah Johnson",
      action: "Payment received",
      amount: "$2,500",
      time: "2 hours ago",
      course: "Advanced Nursing"
    },
    {
      student: "Michael Chen",
      action: "Enrolled in course",
      amount: "",
      time: "4 hours ago",
      course: "Basic Care"
    },
    {
      student: "Emma Wilson",
      action: "Payment overdue",
      amount: "$1,800",
      time: "1 day ago",
      course: "Emergency Care"
    },
  ];

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "#3B82F6",
    },
    students: {
      label: "Students",
      color: "#10B981",
    },
    enrollments: {
      label: "Enrollments",
      color: "#8B5CF6",
    },
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-gradient-to-r from-white via-blue-50 to-white px-6 shadow-lg backdrop-blur-sm">
            <SidebarTrigger className="text-blue-600 hover:bg-blue-100 rounded-lg" />
            <div className="flex-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">Analytics Dashboard</h1>
              <p className="text-sm text-blue-600">Real-time insights and performance metrics</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 bg-white shadow-sm">
                <Calendar className="h-4 w-4" />
                Today
              </Button>
              <Button variant="ghost" size="sm" className="relative text-blue-600 hover:bg-blue-50">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-red-600 p-0 text-xs text-white shadow-lg">
                  3
                </Badge>
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                      <span className="text-emerald-600 font-semibold">{stat.change}</span> from last month
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Revenue & Students Chart */}
              <Card className="bg-gradient-to-br from-white to-blue-50 border-white/50 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue & Students Growth
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Monthly performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ChartContainer config={chartConfig} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyRevenue}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#6B7280" />
                        <YAxis stroke="#6B7280" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Course Distribution */}
              <Card className="bg-gradient-to-br from-white to-purple-50 border-white/50 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Course Distribution
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    Student enrollment by course type
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ChartContainer config={chartConfig} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={courseDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          stroke="#fff"
                          strokeWidth={2}
                        >
                          {courseDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Additional Charts and Activities */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Enrollment Trend */}
              <Card className="bg-gradient-to-br from-white to-emerald-50 border-white/50 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Monthly Enrollments
                  </CardTitle>
                  <CardDescription className="text-emerald-100">
                    New student enrollments
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ChartContainer config={chartConfig} className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={enrollmentTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#6B7280" />
                        <YAxis stroke="#6B7280" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                          type="monotone" 
                          dataKey="enrollments" 
                          stroke="#10B981" 
                          strokeWidth={3}
                          dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                          activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card className="bg-gradient-to-br from-white to-amber-50 border-white/50 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-t-lg">
                  <CardTitle className="text-white">Recent Activities</CardTitle>
                  <CardDescription className="text-amber-100">
                    Latest student activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-amber-50 rounded-xl border border-amber-100 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">{activity.student}</p>
                          <p className="text-sm text-amber-700">{activity.action}</p>
                          <p className="text-xs text-slate-600">{activity.course}</p>
                        </div>
                        <div className="text-right">
                          {activity.amount && (
                            <p className="font-semibold text-slate-800">{activity.amount}</p>
                          )}
                          <p className="text-xs text-slate-600">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gradient-to-br from-white to-indigo-50 border-white/50 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-t-lg">
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                  <CardDescription className="text-indigo-100">
                    Common tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-3">
                    <Button className="w-full justify-start gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200">
                      <Users className="h-4 w-4" />
                      Add New Student
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3 border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-white shadow-sm">
                      <CreditCard className="h-4 w-4" />
                      Record Payment
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3 border-purple-200 text-purple-700 hover:bg-purple-50 bg-white shadow-sm">
                      <BookOpen className="h-4 w-4" />
                      Create Course
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3 border-amber-200 text-amber-700 hover:bg-amber-50 bg-white shadow-sm">
                      <TrendingUp className="h-4 w-4" />
                      View Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
