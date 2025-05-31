
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudents } from '@/hooks/useStudents';
import { useCourses } from '@/hooks/useCourses';
import { Users, GraduationCap, CreditCard, TrendingUp } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const chartConfig = {
  students: {
    label: "Students",
    color: "hsl(var(--chart-1))",
  },
  payments: {
    label: "Payments",
    color: "hsl(var(--chart-2))",
  },
};

export const ReportsDashboard = () => {
  const { students } = useStudents();
  const { courses } = useCourses();

  // Calculate dashboard metrics
  const totalStudents = students.length;
  const totalCourses = courses.length;
  const totalRevenue = students.reduce((sum, student) => sum + (student.advance_payment || 0), 0);

  // Status distribution - updated to use new status values
  const statusData = [
    { name: 'Attended Online', value: students.filter(s => s.status === 'Attended Online').length, color: '#3b82f6' },
    { name: 'Attend sessions', value: students.filter(s => s.status === 'Attend sessions').length, color: '#10b981' },
    { name: 'Attended F2F', value: students.filter(s => s.status === 'Attended F2F').length, color: '#f59e0b' },
    { name: 'Exam cycle', value: students.filter(s => s.status === 'Exam cycle').length, color: '#ef4444' },
    { name: 'Awaiting results', value: students.filter(s => s.status === 'Awaiting results').length, color: '#8b5cf6' },
    { name: 'Pass', value: students.filter(s => s.status === 'Pass').length, color: '#22c55e' },
    { name: 'Fail', value: students.filter(s => s.status === 'Fail').length, color: '#ef4444' },
  ];

  // Monthly enrollment data
  const monthlyData = [];
  const currentYear = new Date().getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  months.forEach((month, index) => {
    const monthStudents = students.filter(student => {
      const joinDate = new Date(student.join_date);
      return joinDate.getFullYear() === currentYear && joinDate.getMonth() === index;
    }).length;
    
    monthlyData.push({
      month,
      students: monthStudents,
    });
  });

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Total Students */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-100">Total Students</CardTitle>
          <Users className="h-5 w-5 text-blue-200" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalStudents}</div>
          <p className="text-xs text-blue-200 mt-1">Active registrations</p>
        </CardContent>
      </Card>

      {/* Total Courses */}
      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-100">Active Courses</CardTitle>
          <GraduationCap className="h-5 w-5 text-green-200" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalCourses}</div>
          <p className="text-xs text-green-200 mt-1">Available programs</p>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-100">Total Revenue</CardTitle>
          <CreditCard className="h-5 w-5 text-purple-200" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-purple-200 mt-1">Advance payments received</p>
        </CardContent>
      </Card>

      {/* Average Fee */}
      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-100">Average Course Fee</CardTitle>
          <TrendingUp className="h-5 w-5 text-orange-200" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            ${courses.length > 0 ? Math.round(courses.reduce((sum, course) => sum + course.fee, 0) / courses.length).toLocaleString() : '0'}
          </div>
          <p className="text-xs text-orange-200 mt-1">Per course average</p>
        </CardContent>
      </Card>

      {/* Monthly Enrollment Chart */}
      <Card className="col-span-full lg:col-span-2 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Monthly Enrollment Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Student Status Distribution */}
      <Card className="col-span-full lg:col-span-2 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Student Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
