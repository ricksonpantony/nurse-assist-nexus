
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { BookOpen } from "lucide-react";
import type { Student } from "@/hooks/useStudents";
import type { Course } from "@/hooks/useCourses";

interface CourseDistributionChartProps {
  students: Student[];
  courses: Course[];
  loading: boolean;
}

const chartConfig = {
  students: {
    label: "Students",
    color: "hsl(var(--chart-1))",
  },
};

export const CourseDistributionChart = ({ students, courses, loading }: CourseDistributionChartProps) => {
  const courseData = courses.map((course, index) => ({
    name: course.title,
    value: students.filter(student => student.course_id === course.id).length,
    color: `hsl(${210 + (index * 30)}, 70%, ${50 + (index * 5)}%)`
  })).filter(item => item.value > 0);

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
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-slate-800 flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-50">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          Students by Course
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={courseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => 
                  value > 0 ? `${name}: ${value} (${(percent * 100).toFixed(0)}%)` : ''
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {courseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        {courseData.length === 0 && (
          <div className="flex items-center justify-center h-[300px] text-slate-500">
            No course enrollment data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};
