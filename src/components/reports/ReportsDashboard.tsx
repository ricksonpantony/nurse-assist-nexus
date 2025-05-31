import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudents } from '@/hooks/useStudents';
import { useCourses } from '@/hooks/useCourses';
import { Users, GraduationCap, CreditCard, TrendingUp } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { useState } from 'react';

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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const chartVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
};

export const ReportsDashboard = () => {
  const { students } = useStudents();
  const { courses } = useCourses();
  const [hoveredCard, setHoveredCard] = useState(null);

  // Calculate dashboard metrics
  const totalStudents = students.length;
  const totalCourses = courses.length;
  const totalRevenue = students.reduce((sum, student) => sum + (student.advance_payment || 0), 0);
  const averageFee = courses.length > 0 ? Math.round(courses.reduce((sum, course) => sum + course.fee, 0) / courses.length) : 0;

  // Status distribution
  const statusData = [
    { name: 'Attended Online', value: students.filter(s => s.status === 'Attended Online').length, color: '#3b82f6' },
    { name: 'Attend sessions', value: students.filter(s => s.status === 'Attend sessions').length, color: '#10b981' },
    { name: 'Attended F2F', value: students.filter(s => s.status === 'Attended F2F').length, color: '#f59e0b' },
    { name: 'Exam cycle', value: students.filter(s => s.status === 'Exam cycle').length, color: '#ef4444' },
    { name: 'Awaiting results', value: students.filter(s => s.status === 'Awaiting results').length, color: '#8b5cf6' },
    { name: 'Pass', value: students.filter(s => s.status === 'Pass').length, color: '#22c55e' },
    { name: 'Fail', value: students.filter(s => s.status === 'Fail').length, color: '#ef4444' },
  ].filter(item => item.value > 0);

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
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-gray-800 mb-8"
      >
        Academic Dashboard
      </motion.h1>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          {
            title: 'Total Students',
            value: totalStudents,
            icon: Users,
            color: 'from-blue-600 to-blue-400',
            subtext: 'Active registrations',
          },
          {
            title: 'Active Courses',
            value: totalCourses,
            icon: GraduationCap,
            color: 'from-green-600 to-green-400',
            subtext: 'Available programs',
          },
          {
            title: 'Total Revenue',
            value: `$${totalRevenue.toLocaleString()}`,
            icon: CreditCard,
            color: 'from-purple-600 to-purple-400',
            subtext: 'Advance payments',
          },
          {
            title: 'Average Course Fee',
            value: `$${averageFee.toLocaleString()}`,
            icon: TrendingUp,
            color: 'from-orange-600 to-orange-400',
            subtext: 'Per course average',
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.2 }}
            onMouseEnter={() => setHoveredCard(metric.title)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <Card 
              className={`bg-gradient-to-br ${metric.color} text-white shadow-xl overflow-hidden
                transform transition-all duration-300 
                ${hoveredCard === metric.title ? 'scale-105 shadow-2xl' : ''}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/90">{metric.title}</CardTitle>
                <metric.icon className="h-5 w-5 text-white/80" />
              </CardHeader>
              <CardContent>
                <motion.div 
                  className="text-3xl font-bold"
                  animate={{ scale: hoveredCard === metric.title ? 1.1 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {metric.value}
                </motion.div>
                <p className="text-xs text-white/80 mt-1">{metric.subtext}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Enrollment Chart */}
        <motion.div variants={chartVariants} initial="hidden" animate="visible">
          <Card className="shadow-xl bg-white/90 backdrop-blur-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Monthly Enrollment Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="students" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Student Status Distribution */}
        <motion.div variants={chartVariants} initial="hidden" animate="visible">
          <Card className="shadow-xl bg-white/90 backdrop-blur-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Student Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      dataKey="value"
                      className="hover:opacity-80 transition-opacity"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};