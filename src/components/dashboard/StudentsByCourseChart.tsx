
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from "recharts";
import { GraduationCap } from "lucide-react";
import type { Student } from "@/hooks/useStudents";
import type { Course } from "@/hooks/useCourses";

interface StudentsByCourseChartProps {
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

// Generate attractive colors for each course
const generateCourseColors = (length: number) => {
  const colors = [
    "#8b5cf6", // Purple
    "#3b82f6", // Blue
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#06b6d4", // Cyan
    "#8b5a2b", // Brown
    "#db2777", // Pink
    "#6366f1", // Indigo
    "#14b8a6", // Teal
  ];
  
  return Array.from({ length }, (_, i) => colors[i % colors.length]);
};

// Custom label component to show values on bars
const CustomLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      fill="#374151"
      textAnchor="middle"
      fontSize="12"
      fontWeight="600"
    >
      {value}
    </text>
  );
};

export const StudentsByCourseChart = ({ students, courses, loading }: StudentsByCourseChartProps) => {
  const courseData = courses.map((course) => ({
    name: course.title.length > 20 ? `${course.title.substring(0, 20)}...` : course.title,
    fullName: course.title,
    students: students.filter(student => student.course_id === course.id).length,
    courseId: course.id,
  })).filter(item => item.students > 0);

  const colors = generateCourseColors(courseData.length);

  if (loading) {
    return (
      <Card className="animate-pulse bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.fullName}</p>
          <p className="text-sm text-gray-600">
            Students Enrolled: <span className="font-medium text-blue-600">{data.students}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Students Enrolled by Course
            </span>
            <p className="text-sm text-slate-500 font-normal mt-1">Active enrollment distribution</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={courseData} margin={{ top: 30, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
              <XAxis 
                dataKey="name" 
                fontSize={11} 
                stroke="#64748b" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis fontSize={12} stroke="#64748b" />
              <ChartTooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="students" 
                radius={[8, 8, 0, 0]}
                className="hover:opacity-80 transition-all duration-200 cursor-pointer"
              >
                <LabelList content={<CustomLabel />} />
                {courseData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[index]}
                    stroke={colors[index]}
                    strokeWidth={0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        {courseData.length === 0 && (
          <div className="flex items-center justify-center h-[350px] text-slate-500">
            <div className="text-center">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium">No course enrollment data available</p>
              <p className="text-sm">Students will appear here once they are enrolled in courses</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
