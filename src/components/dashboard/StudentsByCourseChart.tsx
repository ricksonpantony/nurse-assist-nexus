
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudents } from '@/hooks/useStudents';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

const chartConfig = {
  enrollments: {
    label: "Enrollments",
    color: "hsl(var(--chart-1))",
  },
};

interface StudentsByCourseChartProps {
  students?: any[];
  courses?: any[];
  loading?: boolean;
}

export const StudentsByCourseChart = ({ students: propStudents, loading: propLoading }: StudentsByCourseChartProps) => {
  const { students: hookStudents } = useStudents();
  
  // Use props if provided, otherwise use hook data
  const students = propStudents || hookStudents;
  const loading = propLoading !== undefined ? propLoading : false;

  // Generate data for the last 12 months
  const generateLast12MonthsData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      
      const enrollments = students.filter(student => {
        if (!student.join_date) return false;
        const joinDate = new Date(student.join_date);
        return joinDate.getFullYear() === year && joinDate.getMonth() === date.getMonth();
      }).length;
      
      data.push({
        month: monthName,
        enrollments,
        fullDate: `${monthName} ${year}`,
      });
    }
    
    return data;
  };

  const monthlyData = generateLast12MonthsData();
  const maxEnrollments = Math.max(...monthlyData.map(d => d.enrollments));

  // Generate gradient colors based on enrollment values
  const getBarColor = (value: number, index: number) => {
    const intensity = maxEnrollments > 0 ? value / maxEnrollments : 0;
    const hue = 220 + (index * 15) % 120; // Dynamic hue rotation
    return `hsl(${hue}, ${70 + intensity * 30}%, ${50 + intensity * 20}%)`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gradient-to-br from-white to-blue-50 p-4 border border-blue-200 rounded-xl shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <p className="font-semibold text-gray-800">{data.fullDate}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
            <span className="text-sm text-gray-600">Enrollments:</span>
            <span className="font-bold text-blue-600 text-lg">{payload[0].value}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const totalEnrollments = monthlyData.reduce((sum, month) => sum + month.enrollments, 0);
  const averageEnrollments = totalEnrollments / 12;

  if (loading) {
    return (
      <Card className="animate-pulse bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02]">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/20 to-cyan-200/20 rounded-full translate-y-12 -translate-x-12" />
      
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Monthly Enrollment Trends
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">Last 12 months enrollment data</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{totalEnrollments}</div>
            <div className="text-xs text-gray-500">Total Enrollments</div>
            <div className="text-sm text-gray-600 mt-1">Avg: {averageEnrollments.toFixed(1)}/month</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={monthlyData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="url(#gridGradient)" 
                opacity={0.3}
              />
              <defs>
                <linearGradient id="gridGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                fontSize={12} 
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
              />
              <YAxis 
                fontSize={12} 
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
              />
              <ChartTooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="enrollments" 
                radius={[6, 6, 0, 0]}
                className="drop-shadow-md hover:drop-shadow-lg transition-all duration-300"
              >
                {monthlyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getBarColor(entry.enrollments, index)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {students.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">No enrollment data available</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
