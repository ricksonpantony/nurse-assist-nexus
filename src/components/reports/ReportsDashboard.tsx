
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
  
  // Calculate unique countries count
  const uniqueCountries = new Set(students.filter(s => s.country).map(s => s.country)).size;
  
  // Calculate pass rate
  const passedStudents = students.filter(s => s.status === 'Pass').length;
  const failedStudents = students.filter(s => s.status === 'Fail').length;
  const totalCompletedStudents = passedStudents + failedStudents;
  const passRate = totalCompletedStudents > 0 ? Math.round((passedStudents / totalCompletedStudents) * 100) : 0;

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

  // Monthly enrollment data based on actual student join dates
  const monthlyData = [];
  const currentYear = new Date().getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  months.forEach((month, index) => {
    const monthStudents = students.filter(student => {
      if (!student.join_date) return false;
      const joinDate = new Date(student.join_date);
      return joinDate.getFullYear() === currentYear && joinDate.getMonth() === index;
    }).length;
    
    monthlyData.push({
      month,
      students: monthStudents,
    });
  });

  // Custom tooltip for enrollment chart
  const EnrollmentTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label} {currentYear}</p>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            Enrollments: <span className="font-medium text-blue-600">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

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

      {/* Total number of country students */}
      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-100">Geographic Reach – Country Count</CardTitle>
          <CreditCard className="h-5 w-5 text-purple-200" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{uniqueCountries}</div>
          <p className="text-xs text-purple-200 mt-1">Different countries</p>
        </CardContent>
      </Card>

      {/* Total course pass rate */}
      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-100">Overall Course Pass Rate</CardTitle>
          <TrendingUp className="h-5 w-5 text-orange-200" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{passRate}%</div>
          <p className="text-xs text-orange-200 mt-1">{passedStudents} passed, {failedStudents} failed</p>
        </CardContent>
      </Card>

      {/* Monthly Enrollment Chart */}
      <Card className="col-span-full lg:col-span-2 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Monthly Enrollment Trends ({currentYear})</CardTitle>
          <p className="text-sm text-gray-600">Based on student join dates</p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis 
                  dataKey="month" 
                  fontSize={12} 
                  stroke="#64748b"
                  tick={{ fill: '#64748b' }}
                />
                <YAxis 
                  fontSize={12} 
                  stroke="#64748b"
                  tick={{ fill: '#64748b' }}
                />
                <ChartTooltip content={<EnrollmentTooltip />} />
                <Bar 
                  dataKey="students" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                  className="hover:opacity-80 transition-all duration-200"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          {students.length === 0 && (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No enrollment data available</p>
              </div>
            </div>
          )}
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
