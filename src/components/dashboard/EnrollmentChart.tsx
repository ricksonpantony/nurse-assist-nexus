
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList } from "recharts";
import { Award, TrendingUp } from "lucide-react";
import type { Student } from "@/hooks/useStudents";

interface EnrollmentChartProps {
  students: Student[];
  loading: boolean;
}

const chartConfig = {
  pass: {
    label: "Pass",
    color: "#22c55e",
  },
  fail: {
    label: "Fail",
    color: "#ef4444",
  },
};

// Custom label component to show values on bars
const CustomLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  if (value === 0) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      fill="#374151"
      textAnchor="middle"
      fontSize="14"
      fontWeight="700"
    >
      {value}
    </text>
  );
};

export const EnrollmentChart = ({ students, loading }: EnrollmentChartProps) => {
  // Calculate all-time Pass vs Fail data
  const passCount = students.filter(student => student.status === 'Pass').length;
  const failCount = students.filter(student => student.status === 'Fail').length;
  
  const data = [
    {
      category: "Results",
      pass: passCount,
      fail: failCount,
    }
  ];

  const passRate = passCount + failCount > 0 ? ((passCount / (passCount + failCount)) * 100).toFixed(1) : 0;

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">Student Results</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-600 flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              {entry.dataKey === 'pass' ? 'Passed' : 'Failed'}: 
              <span className="font-medium ml-1" style={{ color: entry.color }}>
                {entry.value} students
              </span>
            </p>
          ))}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Pass Rate: <span className="font-medium text-green-600">{passRate}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50">
            <Award className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Pass vs Fail Comparison
            </span>
            <p className="text-sm text-slate-500 font-normal mt-1">All-time student results • {passRate}% pass rate</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 30, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
              <XAxis 
                dataKey="category" 
                fontSize={12} 
                stroke="#64748b"
                tick={false}
              />
              <YAxis fontSize={12} stroke="#64748b" />
              <ChartTooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="pass" 
                fill="#22c55e" 
                radius={[6, 6, 0, 0]}
                name="Pass"
                className="hover:opacity-80 transition-all duration-200"
              >
                <LabelList content={<CustomLabel />} />
              </Bar>
              <Bar 
                dataKey="fail" 
                fill="#ef4444" 
                radius={[6, 6, 0, 0]}
                name="Fail"
                className="hover:opacity-80 transition-all duration-200"
              >
                <LabelList content={<CustomLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {passCount + failCount === 0 && (
          <div className="flex items-center justify-center h-[300px] text-slate-500">
            <div className="text-center">
              <Award className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium">No exam results available</p>
              <p className="text-sm">Results will appear here once students complete their exams</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
