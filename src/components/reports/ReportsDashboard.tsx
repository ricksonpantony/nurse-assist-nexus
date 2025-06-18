
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudents } from '@/hooks/useStudents';
import { useCourses } from '@/hooks/useCourses';
import { Users, GraduationCap, CreditCard, TrendingUp, Globe } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const chartConfig = {
  students: {
    label: "Students",
    color: "hsl(var(--chart-1))",
  },
  payments: {
    label: "Payments",
    color: "hsl(var(--chart-2))",
  },
  countries: {
    label: "Countries",
    color: "hsl(var(--chart-3))",
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

  // Country distribution data for bar chart with enhanced styling
  const countryData = students.reduce((acc, student) => {
    const country = student.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const countryChartData = Object.entries(countryData)
    .map(([country, count], index) => ({
      country: country.length > 12 ? country.substring(0, 12) + '...' : country,
      fullCountry: country,
      students: count,
      color: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
      ][index % 10],
    }))
    .sort((a, b) => b.students - a.students)
    .slice(0, 8); // Show top 8 countries for better visibility

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

  // Enhanced custom tooltip for country chart
  const CountryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalStudents > 0 ? ((data.students / totalStudents) * 100).toFixed(1) : '0';
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-4 h-4 rounded-full shadow-sm"
              style={{ backgroundColor: data.color }}
            />
            <p className="font-bold text-gray-800 text-lg">{data.fullCountry}</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Students:</span>
              <span className="font-bold text-lg text-blue-600">{data.students}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Percentage:</span>
              <span className="font-medium text-green-600">{percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Sample data fallback if no real data
  const sampleCountryData = [
    { country: 'USA', fullCountry: 'United States', students: 45, color: '#3B82F6' },
    { country: 'Canada', fullCountry: 'Canada', students: 32, color: '#10B981' },
    { country: 'UK', fullCountry: 'United Kingdom', students: 28, color: '#F59E0B' },
    { country: 'Australia', fullCountry: 'Australia', students: 22, color: '#EF4444' },
    { country: 'Germany', fullCountry: 'Germany', students: 18, color: '#8B5CF6' },
  ];

  const displayData = countryChartData.length > 0 ? countryChartData : sampleCountryData;

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
          <Globe className="h-5 w-5 text-purple-200" />
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

      {/* Enhanced Country Distribution Chart */}
      <Card className="col-span-full lg:col-span-2 shadow-lg bg-gradient-to-br from-slate-50 to-blue-50 border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">🌍 Students by Country</CardTitle>
              <p className="text-blue-100 text-sm">Top countries with enrolled students</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {displayData.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{displayData.length}</div>
                  <div className="text-sm text-blue-500">Countries Represented</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">
                    {displayData.reduce((sum, item) => sum + item.students, 0)}
                  </div>
                  <div className="text-sm text-green-500">Total Students</div>
                </div>
              </div>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={displayData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    layout="horizontal"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                    <XAxis 
                      type="number"
                      fontSize={12} 
                      stroke="#64748b"
                      tick={{ fill: '#64748b' }}
                    />
                    <YAxis 
                      type="category"
                      dataKey="country"
                      fontSize={11} 
                      stroke="#64748b"
                      tick={{ fill: '#64748b' }}
                      width={80}
                    />
                    <ChartTooltip content={<CountryTooltip />} />
                    <Bar 
                      dataKey="students" 
                      radius={[0, 6, 6, 0]}
                      className="hover:opacity-80 transition-all duration-300"
                    >
                      {displayData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          className="drop-shadow-sm"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-gray-500">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <Globe className="w-10 h-10 text-blue-500" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-600">No Country Data Available</p>
                  <p className="text-sm text-gray-500 mt-1">Start adding students to see country distribution</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
