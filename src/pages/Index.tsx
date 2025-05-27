
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, GraduationCap, TrendingUp, Calendar, MapPin, Plus, CreditCard, UserPlus, BookPlus, Edit, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useStudents } from "@/hooks/useStudents";
import { useCourses } from "@/hooks/useCourses";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const chartConfig = {
  students: {
    label: "Students",
    color: "hsl(var(--chart-1))",
  },
  courses: {
    label: "Courses",
    color: "hsl(var(--chart-2))",
  },
};

const Index = () => {
  const { user } = useAuth();
  const { students } = useStudents();
  const { courses } = useCourses();

  // Calculate dashboard metrics
  const totalStudents = students.length;
  const totalCourses = courses.length;
  const totalRevenue = students.reduce((sum, student) => sum + (student.advance_payment || 0), 0);

  // Current month enrollment
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthEnrollments = students.filter(student => {
    const joinDate = new Date(student.join_date);
    return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
  }).length;

  // Students by course data
  const studentsByCourse = courses.map(course => ({
    name: course.title,
    students: students.filter(student => student.course_id === course.id).length,
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
  }));

  // Status distribution
  const statusData = [
    { name: 'Enrolled', value: students.filter(s => s.status === 'enrolled').length, color: '#3b82f6' },
    { name: 'Online', value: students.filter(s => s.status === 'online').length, color: '#10b981' },
    { name: 'Face-to-Face', value: students.filter(s => s.status === 'face-to-face').length, color: '#f59e0b' },
    { name: 'Awaiting Course', value: students.filter(s => s.status === 'awaiting-course').length, color: '#ef4444' },
  ];

  // Monthly enrollment trend (last 6 months)
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const monthStudents = students.filter(student => {
      const joinDate = new Date(student.join_date);
      return joinDate.getMonth() === date.getMonth() && joinDate.getFullYear() === date.getFullYear();
    }).length;
    
    monthlyTrend.push({
      month: monthName,
      students: monthStudents,
    });
  }

  const quickActions = [
    { label: "Add Student", icon: UserPlus, href: "/students", color: "bg-blue-500 hover:bg-blue-600" },
    { label: "Add Course", icon: BookPlus, href: "/courses", color: "bg-green-500 hover:bg-green-600" },
    { label: "Update Payment", icon: CreditCard, href: "/payments", color: "bg-purple-500 hover:bg-purple-600" },
    { label: "View Reports", icon: BarChart3, href: "/reports", color: "bg-orange-500 hover:bg-orange-600" },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* Welcome Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-2xl text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user?.user_metadata?.full_name || user?.email || 'Admin'}!
            </h1>
            <p className="text-xl text-blue-100 mb-4">
              You have full administrative access to manage courses, students, and training programs
            </p>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm py-1 px-3">
                <GraduationCap className="w-4 h-4 mr-1" />
                Administrator
              </Badge>
              <Badge variant="outline" className="border-white/30 text-white text-sm py-1 px-3">
                Full Access
              </Badge>
            </div>
          </div>
          <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStudents}</div>
            <p className="text-blue-100 text-sm">Active registrations</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center">
              <BookOpen className="w-6 h-6 mr-2" />
              Active Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCourses}</div>
            <p className="text-green-100 text-sm">Available programs</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center">
              <TrendingUp className="w-6 h-6 mr-2" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentMonthEnrollments}</div>
            <p className="text-purple-100 text-sm">New enrollments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center">
              <CreditCard className="w-6 h-6 mr-2" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-orange-100 text-sm">Advance payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <Plus className="w-6 h-6 mr-2 text-blue-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              asChild
              size="lg"
              className={`${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-16`}
            >
              <Link to={action.href} className="flex flex-col items-center gap-2">
                <action.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Students by Course */}
        <Card className="shadow-xl bg-white/90 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="text-gray-800 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Students by Course
            </CardTitle>
            <CardDescription>Distribution of students across different courses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={studentsByCourse}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="students"
                  >
                    {studentsByCourse.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Student Status Distribution */}
        <Card className="shadow-xl bg-white/90 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="text-gray-800 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
              Student Status
            </CardTitle>
            <CardDescription>Current status distribution of all students</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Enrollment Trend */}
      <Card className="shadow-xl bg-white/90 backdrop-blur-sm border-0 mb-8">
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Enrollment Trend (Last 6 Months)
          </CardTitle>
          <CardDescription>Monthly enrollment numbers over the past 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="students" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              <Calendar className="w-5 h-5 mr-2" />
              Schedule Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-gray-600">
              Organize class schedules, set course dates, and manage student enrollments efficiently.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <Users className="w-5 h-5 mr-2" />
              Student Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-gray-600">
              Monitor student progress, manage enrollments, and track payment statuses in real-time.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-700">
              <MapPin className="w-5 h-5 mr-2" />
              Multi-Location Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-gray-600">
              Manage students from different countries and handle international training programs.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
