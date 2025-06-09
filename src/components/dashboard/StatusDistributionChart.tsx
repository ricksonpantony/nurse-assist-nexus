
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import type { Student } from "@/hooks/useStudents";

interface StatusDistributionChartProps {
  students: Student[];
  loading: boolean;
}

interface Course {
  id: string;
  title: string;
}

const chartConfig = {
  value: {
    label: "Students",
    color: "hsl(var(--chart-1))",
  },
};

export const StatusDistributionChart = ({ students, loading }: StatusDistributionChartProps) => {
  // Get unique courses from students
  const uniqueCourses = Array.from(
    new Map(
      students
        .filter(s => s.course_id)
        .map(s => [s.course_id, { id: s.course_id!, title: s.course_id! }])
    ).values()
  );

  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");

  // Filter students based on selected course
  const filteredStudents = selectedCourseId === "all" 
    ? students 
    : students.filter(s => s.course_id === selectedCourseId);

  const statusData = [
    { name: 'Attended Online', value: filteredStudents.filter(s => s.status === 'Attended Online').length, color: '#3b82f6' },
    { name: 'Attend sessions', value: filteredStudents.filter(s => s.status === 'Attend sessions').length, color: '#10b981' },
    { name: 'Attended F2F', value: filteredStudents.filter(s => s.status === 'Attended F2F').length, color: '#f59e0b' },
    { name: 'Exam cycle', value: filteredStudents.filter(s => s.status === 'Exam cycle').length, color: '#ef4444' },
    { name: 'Awaiting results', value: filteredStudents.filter(s => s.status === 'Awaiting results').length, color: '#8b5cf6' },
    { name: 'Pass', value: filteredStudents.filter(s => s.status === 'Pass').length, color: '#22c55e' },
    { name: 'Fail', value: filteredStudents.filter(s => s.status === 'Fail').length, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const total = statusData.reduce((sum, item) => sum + item.value, 0);

  // Custom label function to show percentages
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for very small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            Students: <span className="font-medium text-blue-600">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium text-green-600">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend component
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => {
          const percentage = total > 0 ? ((entry.payload.value / total) * 100).toFixed(0) : 0;
          return (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">
                {entry.value} {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="animate-pulse bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-800 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Student Status Distribution
              </span>
              <p className="text-sm text-slate-500 font-normal mt-1">
                {selectedCourseId === "all" 
                  ? `All courses • ${total} total students`
                  : `Course ${selectedCourseId} • ${total} students`
                }
              </p>
            </div>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-600" />
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {uniqueCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                stroke="white"
                strokeWidth={2}
              >
                {statusData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    className="hover:opacity-80 transition-all duration-200 cursor-pointer"
                  />
                ))}
              </Pie>
              <ChartTooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        {statusData.length === 0 && (
          <div className="flex items-center justify-center h-[400px] text-slate-500">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium">No student status data available</p>
              <p className="text-sm">
                {selectedCourseId === "all" 
                  ? "Status distribution will appear here once students are added"
                  : `No students found for course ${selectedCourseId}`
                }
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
