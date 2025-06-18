
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudents } from '@/hooks/useStudents';
import { useCourses } from '@/hooks/useCourses';
import { Users, GraduationCap, CreditCard, TrendingUp, DollarSign } from 'lucide-react';
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

  // Payment status distribution - calculate payments due vs fully paid
  const studentsWithPaymentStatus = students.map(student => {
    const totalFee = Number(student.total_course_fee) || 0;
    const advancePayment = Number(student.advance_payment) || 0;
    const remainingAmount = totalFee - advancePayment;
    return {
      ...student,
      isFullyPaid: remainingAmount <= 0,
      remainingAmount: Math.max(remainingAmount, 0)
    };
  });

  const fullyPaidStudents = studentsWithPaymentStatus.filter(s => s.isFullyPaid).length;
  const paymentsDueStudents = studentsWithPaymentStatus.filter(s => !s.isFullyPaid).length;
  const totalRevenue = studentsWithPaymentStatus.reduce((sum, s) => sum + (Number(s.advance_payment) || 0), 0);
  const pendingRevenue = studentsWithPaymentStatus.reduce((sum, s) => sum + s.remainingAmount, 0);

  const paymentStatusData = [
    { 
      name: 'Fully Paid', 
      value: fullyPaidStudents, 
      color: '#22c55e',
      percentage: totalStudents > 0 ? Math.round((fullyPaidStudents / totalStudents) * 100) : 0
    },
    { 
      name: 'Payments Due', 
      value: paymentsDueStudents, 
      color: '#f59e0b',
      percentage: totalStudents > 0 ? Math.round((paymentsDueStudents / totalStudents) * 100) : 0
    },
  ].filter(item => item.value > 0);

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

  // Custom tooltip for payment status chart
  const PaymentTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <p className="font-semibold text-gray-800">{data.name}</p>
          </div>
          <p className="text-sm text-gray-600">
            Students: <span className="font-medium" style={{ color: data.color }}>{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium" style={{ color: data.color }}>{data.percentage}%</span>
          </p>
          {data.name === 'Fully Paid' && (
            <p className="text-sm text-green-600 mt-1">
              Revenue Collected: <span className="font-medium">${totalRevenue.toLocaleString()}</span>
            </p>
          )}
          {data.name === 'Payments Due' && (
            <p className="text-sm text-orange-600 mt-1">
              Pending Revenue: <span className="font-medium">${pendingRevenue.toLocaleString()}</span>
            </p>
          )}
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

      {/* Payment Status Distribution */}
      <Card className="col-span-full lg:col-span-2 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Payment Status Distribution
          </CardTitle>
          <p className="text-sm text-gray-600">Fully paid vs payments due breakdown</p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage, value }) => 
                    value > 0 ? `${name}: ${value} (${percentage}%)` : ''
                  }
                  outerRadius={90}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  className="outline-none focus:outline-none"
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke={entry.color}
                      strokeWidth={2}
                      className="hover:opacity-80 transition-all duration-200 cursor-pointer drop-shadow-sm"
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<PaymentTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          {paymentStatusData.length === 0 && (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <div className="text-center">
                <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No payment data available</p>
              </div>
            </div>
          )}
          {paymentStatusData.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{fullyPaidStudents}</div>
                <div className="text-sm text-green-700">Fully Paid Students</div>
                <div className="text-xs text-green-600 mt-1">${totalRevenue.toLocaleString()} collected</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">{paymentsDueStudents}</div>
                <div className="text-sm text-orange-700">Payments Due</div>
                <div className="text-xs text-orange-600 mt-1">${pendingRevenue.toLocaleString()} pending</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
